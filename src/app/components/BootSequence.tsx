import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
}

const LOG_LINES = [
  { prefix: '[INIT]', text: ' Quantum Core initializing...', delay: 200 },
  { prefix: '[BOOT]', text: ' Loading quantum walk engine...', delay: 700 },
  { prefix: '[BOOT]', text: ' Calibrating QSVM classifier...', delay: 1200 },
  { prefix: '[BOOT]', text: ' Establishing secure channels...', delay: 1700 },
  { prefix: '[OK]',   text: ' All systems nominal', delay: 2200 },
];

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホABCDEF0123456789';

export function BootSequence({ onComplete }: BootSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [typedText, setTypedText] = useState<Record<number, string>>({});
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  // ── Matrix rain ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 13;
    let columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () =>
      Math.floor(Math.random() * -50)
    );

    let lastTime = 0;
    const interval = 45; // ms between frames

    const draw = (timestamp: number) => {
      if (timestamp - lastTime < interval) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTime = timestamp;

      ctx.fillStyle = 'rgba(2, 4, 8, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      columns = Math.floor(canvas.width / fontSize);

      for (let i = 0; i < drops.length; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head char bright
        if (drops[i] > 0) {
          ctx.fillStyle = '#00ff88';
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 8;
          ctx.fillText(char, x, y);
          ctx.shadowBlur = 0;
        }

        // Trailing chars dimmer green
        ctx.fillStyle = 'rgba(0, 200, 80, 0.55)';
        ctx.fillText(char, x, y - fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── Progress bar ──────────────────────────────────────────────────────────
  useEffect(() => {
    const startTime = performance.now();
    const duration = 2500;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Typing effect for log lines ───────────────────────────────────────────
  const typeLineAsync = useCallback(
    (index: number, fullText: string) => {
      let charIndex = 0;
      const speed = 28; // ms per char
      const iv = setInterval(() => {
        charIndex++;
        setTypedText((prev) => ({ ...prev, [index]: fullText.slice(0, charIndex) }));
        if (charIndex >= fullText.length) clearInterval(iv);
      }, speed);
    },
    []
  );

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOG_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
        typeLineAsync(i, line.prefix + line.text);
      }, line.delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [typeLineAsync]);

  // ── Sequence complete → fade out → onComplete ─────────────────────────────
  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 3000);

    // onComplete fires after fade (600ms after exiting=true)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3700);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const prefixColor = (prefix: string) => {
    if (prefix === '[OK]') return 'text-emerald-400';
    if (prefix === '[INIT]') return 'text-cyan-300';
    return 'text-cyan-500';
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#020408' }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
    >
      {/* Matrix rain canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.35 }}
      />

      {/* Radial vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(2,4,8,0.85) 100%)',
        }}
      />

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-lg px-8">

        {/* Logo */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.7, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl"
            style={{
              background: 'rgba(0,255,255,0.07)',
              border: '1px solid rgba(0,255,255,0.3)',
              boxShadow: '0 0 30px rgba(0,255,255,0.25), inset 0 0 20px rgba(0,255,255,0.05)',
            }}
          >
            <Shield
              size={44}
              style={{
                color: '#00ffff',
                filter: 'drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 25px #00ffff88)',
              }}
            />
            {/* Ping ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ border: '1px solid rgba(0,255,255,0.5)' }}
              animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          </div>

          <div className="text-center">
            <h1
              className="text-4xl font-black tracking-[0.25em] uppercase"
              style={{
                color: '#00ffff',
                textShadow:
                  '0 0 10px #00ffff, 0 0 30px #00ffff88, 0 0 60px #00ffff44',
                fontFamily: 'monospace',
              }}
            >
              QUANTUMSHIELD++
            </h1>
            <p
              className="text-xs tracking-[0.5em] uppercase mt-1"
              style={{ color: 'rgba(0,255,255,0.5)' }}
            >
              Quantum Cyber Defense Platform
            </p>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-full h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(0,255,255,0.6), transparent)',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />

        {/* Log terminal */}
        <motion.div
          className="w-full rounded-lg p-4 font-mono text-xs leading-6"
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(0,255,255,0.12)',
            minHeight: '140px',
            backdropFilter: 'blur(8px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {LOG_LINES.map((line, i) =>
            visibleLines.includes(i) ? (
              <div key={i} className="flex">
                <span className={`${prefixColor(line.prefix)} font-bold mr-0`}>
                  {line.prefix === '[OK]'
                    ? '[OK]'
                    : line.prefix === '[INIT]'
                    ? '[INIT]'
                    : '[BOOT]'}
                </span>
                <span className="text-gray-300">
                  {(typedText[i] ?? '').slice(line.prefix.length)}
                </span>
                {(typedText[i] ?? '').length < (line.prefix + line.text).length && (
                  <span
                    className="inline-block w-1.5 h-4 ml-0.5 bg-cyan-400"
                    style={{ animation: 'pulse 0.7s step-end infinite' }}
                  />
                )}
              </div>
            ) : null
          )}
        </motion.div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs mb-1.5 font-mono">
            <span style={{ color: 'rgba(0,255,255,0.5)' }}>SYSTEM BOOT</span>
            <span style={{ color: 'rgba(0,255,255,0.8)' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{
              background: 'rgba(0,255,255,0.08)',
              border: '1px solid rgba(0,255,255,0.15)',
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  'linear-gradient(90deg, #0088aa, #00ffff)',
                boxShadow: '0 0 12px #00ffff, 0 0 25px #00ffff66',
              }}
              transition={{ duration: 0.05 }}
            />
          </div>
          {/* Glow streak */}
          <motion.div
            className="h-0.5 mt-0.5 rounded-full"
            style={{
              width: `${progress}%`,
              background: 'rgba(0,255,255,0.3)',
              filter: 'blur(4px)',
            }}
          />
        </div>

        {/* Status */}
        <motion.div
          className="text-xs font-mono tracking-widest"
          style={{ color: 'rgba(0,255,255,0.35)' }}
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {progress < 100
            ? '▶ INITIALIZING SUBSYSTEMS...'
            : '✓ BOOT SEQUENCE COMPLETE'}
        </motion.div>
      </div>

      {/* Corner decorations */}
      {(['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'] as const).map(
        (pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-6 h-6`}
            style={{
              borderTop: i < 2 ? '1px solid rgba(0,255,255,0.4)' : 'none',
              borderBottom: i >= 2 ? '1px solid rgba(0,255,255,0.4)' : 'none',
              borderLeft: i % 2 === 0 ? '1px solid rgba(0,255,255,0.4)' : 'none',
              borderRight: i % 2 !== 0 ? '1px solid rgba(0,255,255,0.4)' : 'none',
            }}
          />
        )
      )}
    </motion.div>
  );
}
