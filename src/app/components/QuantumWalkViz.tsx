
import React, { useRef, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type AttackType = 'normal' | 'jamming' | 'spoofing';

interface QuantumWalkVizProps {
  probabilities: number[];
  attackType?: AttackType;
  isAnimating?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Color palettes per attack type
// ─────────────────────────────────────────────────────────────
interface Palette {
  nodeFill:   string;
  nodeGlow:   string;
  lineStroke: string;
  barFill:    string;
  pulse:      string;
  bg:         string;
  text:       string;
}

const PALETTES: Record<AttackType, Palette> = {
  normal: {
    nodeFill:   'rgba(0,230,255,',
    nodeGlow:   '0, 230, 255',
    lineStroke: 'rgba(0,230,255,0.25)',
    barFill:    'rgba(0,200,255,',
    pulse:      '0, 255, 255',
    bg:         'rgba(0,10,20,0.0)',
    text:       '#00e6ff',
  },
  jamming: {
    nodeFill:   'rgba(255,80,30,',
    nodeGlow:   '255, 100, 30',
    lineStroke: 'rgba(255,100,30,0.25)',
    barFill:    'rgba(255,120,0,',
    pulse:      '255, 60, 0',
    bg:         'rgba(20,5,0,0.0)',
    text:       '#ff6020',
  },
  spoofing: {
    nodeFill:   'rgba(180,0,255,',
    nodeGlow:   '180, 0, 255',
    lineStroke: 'rgba(160,0,240,0.25)',
    barFill:    'rgba(160,0,220,',
    pulse:      '200, 0, 255',
    bg:         'rgba(10,0,20,0.0)',
    text:       '#c000ff',
  },
};

// ─────────────────────────────────────────────────────────────
// Noise helpers
// ─────────────────────────────────────────────────────────────
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 43758.5453123;
  return x - Math.floor(x);
}

function lerpColor(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, t: number) {
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

// ─────────────────────────────────────────────────────────────
// Quantum walk simulation  (discrete-time coin walk)
// ─────────────────────────────────────────────────────────────
function simulateQuantumWalk(N: number, steps: number): number[] {
  // State: complex amplitudes for (position, spin)
  // spin: 0 = up (+), 1 = down (-)
  const re = new Float64Array(N * 2);
  const im = new Float64Array(N * 2);

  // start at center with spin-up
  const center = Math.floor(N / 2);
  re[center * 2] = 1.0;

  const HAD = 1 / Math.SQRT2;

  for (let s = 0; s < steps; s++) {
    const re2 = new Float64Array(N * 2);
    const im2 = new Float64Array(N * 2);

    for (let pos = 0; pos < N; pos++) {
      const up_re = re[pos * 2],     up_im = im[pos * 2];
      const dn_re = re[pos * 2 + 1], dn_im = im[pos * 2 + 1];

      // Hadamard coin
      const coinUp_re = HAD * (up_re + dn_re);
      const coinUp_im = HAD * (up_im + dn_im);
      const coinDn_re = HAD * (up_re - dn_re);
      const coinDn_im = HAD * (up_im - dn_im);

      // shift: spin-up moves right, spin-down moves left
      const right = Math.min(pos + 1, N - 1);
      const left  = Math.max(pos - 1, 0);

      re2[right * 2]     += coinUp_re;
      im2[right * 2]     += coinUp_im;
      re2[left  * 2 + 1] += coinDn_re;
      im2[left  * 2 + 1] += coinDn_im;
    }

    re.set(re2);
    im.set(im2);
  }

  // marginal probabilities
  const probs = new Array<number>(N);
  let total = 0;
  for (let pos = 0; pos < N; pos++) {
    const p =
      re[pos * 2] ** 2     + im[pos * 2] ** 2 +
      re[pos * 2 + 1] ** 2 + im[pos * 2 + 1] ** 2;
    probs[pos] = p;
    total += p;
  }
  if (total > 0) for (let i = 0; i < N; i++) probs[i] /= total;
  return probs;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export function QuantumWalkViz({
  probabilities,
  attackType = 'normal',
  isAnimating = false,
}: QuantumWalkVizProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const frameRef    = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const stepRef     = useRef<number>(0);      // walk step counter
  const probsRef    = useRef<number[]>(probabilities);
  const CANVAS_H    = 180;
  const TARGET_FPS  = 30;
  const FRAME_MS    = 1000 / TARGET_FPS;

  // update probabilities ref when prop changes
  useEffect(() => { probsRef.current = probabilities; }, [probabilities]);

  const draw = useCallback(
    (timestamp: number, canvas: HTMLCanvasElement) => {
      if (timestamp - lastTimeRef.current < FRAME_MS) {
        frameRef.current = requestAnimationFrame((t) => draw(t, canvas));
        return;
      }
      lastTimeRef.current = timestamp;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const pal = PALETTES[attackType];

      // ── clear ──
      ctx.clearRect(0, 0, W, H);

      // subtle bg gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, 'rgba(4,12,28,0.95)');
      bg.addColorStop(1, 'rgba(2,6,14,0.95)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── layout constants ──
      const probs   = probsRef.current;
      const N       = probs.length;
      if (N === 0) return;

      const MARGIN   = 20;
      const BAR_H    = 28;          // probability bar area height
      const NODE_AREA_H = H - BAR_H - 8;
      const nodeY    = NODE_AREA_H * 0.5 + 4;
      const step     = (W - MARGIN * 2) / Math.max(N - 1, 1);
      const maxProb  = Math.max(...probs, 0.001);

      // ── pulse wave offset (0..1) cycling at 1.5 Hz ──
      const pulsePhase = ((timestamp * 0.0015) % 1);

      // ── connection lines ──
      for (let i = 0; i < N - 1; i++) {
        const x1 = MARGIN + i * step;
        const x2 = MARGIN + (i + 1) * step;
        const avg = (probs[i] + probs[i + 1]) / 2 / maxProb;

        // glow line
        ctx.save();
        ctx.shadowColor = `rgb(${pal.nodeGlow})`;
        ctx.shadowBlur  = 6 * avg + 2;

        const grad = ctx.createLinearGradient(x1, nodeY, x2, nodeY);
        grad.addColorStop(0, `rgba(${pal.nodeGlow},${0.15 + avg * 0.4})`);
        grad.addColorStop(0.5, `rgba(${pal.nodeGlow},${0.35 + avg * 0.4})`);
        grad.addColorStop(1, `rgba(${pal.nodeGlow},${0.15 + avg * 0.4})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, nodeY);
        ctx.lineTo(x2, nodeY);
        ctx.stroke();
        ctx.restore();

        // ── pulse dot traveling along line ──
        const localPhase = ((pulsePhase - i / N + 1) % 1);
        if (localPhase < 1 / N) {
          const t  = (localPhase * N) % 1;
          const px = x1 + (x2 - x1) * t;
          ctx.save();
          ctx.shadowColor = `rgb(${pal.pulse})`;
          ctx.shadowBlur  = 14;
          ctx.fillStyle   = `rgba(${pal.pulse},0.9)`;
          ctx.beginPath();
          ctx.arc(px, nodeY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ── nodes ──
      for (let i = 0; i < N; i++) {
        const x    = MARGIN + i * step;
        const prob = probs[i];
        const norm = prob / maxProb;

        // node radius: 4..16
        const nodeR = 4 + norm * 12;

        // jamming: add noise jitter
        let jx = 0, jy = 0;
        if (attackType === 'jamming') {
          const t = timestamp * 0.001 + i;
          jx = (seededRand(t * 17 + i) - 0.5) * 3 * norm;
          jy = (seededRand(t * 31 + i) - 0.5) * 3 * norm;
        }

        // spoofing: slight Y-bias
        let biasY = 0;
        if (attackType === 'spoofing') {
          biasY = Math.sin(timestamp * 0.0008 + i * 0.7) * 4 * norm;
        }

        const nx = x + jx;
        const ny = nodeY + jy + biasY;

        // outer glow ring
        ctx.save();
        const outerGlow = ctx.createRadialGradient(nx, ny, nodeR * 0.5, nx, ny, nodeR * 2.5);
        outerGlow.addColorStop(0, `rgba(${pal.nodeGlow},${0.18 * norm})`);
        outerGlow.addColorStop(1, `rgba(${pal.nodeGlow},0)`);
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(nx, ny, nodeR * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // node body
        ctx.save();
        ctx.shadowColor = `rgb(${pal.nodeGlow})`;
        ctx.shadowBlur  = 8 + norm * 14;

        const nodeGrad = ctx.createRadialGradient(nx - nodeR * 0.3, ny - nodeR * 0.3, 0, nx, ny, nodeR);
        nodeGrad.addColorStop(0, `rgba(${pal.nodeGlow},${0.9})`);
        nodeGrad.addColorStop(0.6, `rgba(${pal.nodeGlow},${0.55 + norm * 0.35})`);
        nodeGrad.addColorStop(1,   `rgba(${pal.nodeGlow},${0.2})`);

        ctx.fillStyle = nodeGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
        ctx.fill();

        // inner highlight
        ctx.fillStyle = `rgba(255,255,255,${0.15 + norm * 0.2})`;
        ctx.beginPath();
        ctx.arc(nx - nodeR * 0.25, ny - nodeR * 0.25, nodeR * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // ── probability bar ──
        const barW   = Math.max(step * 0.55, 4);
        const barX   = x - barW / 2;
        const barTop = NODE_AREA_H + 6;
        const barMaxH = BAR_H - 4;
        const barH  = norm * barMaxH;

        // bar bg
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.beginPath();
        ctx.roundRect(barX, barTop, barW, barMaxH, 2);
        ctx.fill();

        // bar fill
        if (barH > 0.5) {
          const bGrad = ctx.createLinearGradient(barX, barTop + barMaxH - barH, barX, barTop + barMaxH);
          bGrad.addColorStop(0, `rgba(${pal.nodeGlow},0.9)`);
          bGrad.addColorStop(1, `rgba(${pal.nodeGlow},0.3)`);

          ctx.save();
          ctx.shadowColor = `rgb(${pal.nodeGlow})`;
          ctx.shadowBlur  = 4;
          ctx.fillStyle   = bGrad;
          ctx.beginPath();
          ctx.roundRect(barX, barTop + barMaxH - barH, barW, barH, 2);
          ctx.fill();
          ctx.restore();
        }

        // node index label
        if (N <= 20) {
          ctx.fillStyle = `rgba(${pal.nodeGlow},0.55)`;
          ctx.font      = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${i}`, x, barTop + barMaxH + 10);
        }
      }

      // ── attack type badge ──
      const badgeText =
        attackType === 'normal'   ? '● NOMINAL'  :
        attackType === 'jamming'  ? '⚠ JAMMING'  : '⊗ SPOOFING';

      ctx.font      = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = pal.text;
      ctx.shadowColor = `rgb(${pal.nodeGlow})`;
      ctx.shadowBlur  = 8;
      ctx.fillText(badgeText, W - 8, 14);
      ctx.shadowBlur  = 0;

      // ── FPS-limited rAF loop ──
      frameRef.current = requestAnimationFrame((t) => draw(t, canvas));
    },
    [attackType]
  );

  // ── auto-animation: quantum walk step update ───────────────
  useEffect(() => {
    if (!isAnimating) return;

    const N        = Math.max(probsRef.current.length, 8);
    let   interval: ReturnType<typeof setInterval>;

    const tick = () => {
      stepRef.current += 1;
      probsRef.current = simulateQuantumWalk(N, stepRef.current % 40 + 1);
    };

    interval = setInterval(tick, 80);
    return () => clearInterval(interval);
  }, [isAnimating]);

  // ── canvas resize observer + draw loop ────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // DPR-aware sizing
    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = CANVAS_H    * dpr;
      const ctx = canvas.getContext('2d');
      ctx?.scale(dpr, dpr);
    };

    setSize();

    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    // kick off render loop
    frameRef.current = requestAnimationFrame((t) => draw(t, canvas));

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [draw]);

  // re-run loop when attackType changes (draw dependency)
  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    const canvas = canvasRef.current;
    if (!canvas) return;
    frameRef.current = requestAnimationFrame((t) => draw(t, canvas));
    return () => cancelAnimationFrame(frameRef.current);
  }, [attackType, draw]);

  const pal = PALETTES[attackType];

  return (
    <div
      className="w-full rounded-xl overflow-hidden relative"
      style={{
        background: 'rgba(4,12,28,0.8)',
        backdropFilter: 'blur(12px)',
        border: `1px solid rgba(${pal.nodeGlow},0.2)`,
        boxShadow: `0 0 24px rgba(${pal.nodeGlow},0.06), 0 4px 24px rgba(0,0,0,0.4)`,
      }}
    >
      {/* header strip */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ borderBottom: `1px solid rgba(${pal.nodeGlow},0.12)` }}
      >
        <span
          className="text-[10px] font-mono font-bold tracking-widest uppercase"
          style={{ color: pal.text }}
        >
          Quantum Walk Visualization
        </span>
        {isAnimating && (
          <span
            className="text-[9px] font-mono flex items-center gap-1"
            style={{ color: pal.text }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: pal.text }}
            />
            LIVE
          </span>
        )}
      </div>

      {/* canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: CANVAS_H,
          display: 'block',
        }}
      />
    </div>
  );
}

