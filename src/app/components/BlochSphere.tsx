
import React, { useId } from 'react';
import { motion, useSpring } from 'motion/react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface BlochSphereProps {
  theta?: number; // polar angle  [0, π]  — 0 = |0⟩, π = |1⟩
  phi?: number;   // azimuthal    [0, 2π]
  label?: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const SIZE = 240;         // total component size
const R    = 88;          // sphere radius (px)
const CX   = SIZE / 2;   // center x
const CY   = SIZE / 2;   // center y

// ─────────────────────────────────────────────────────────────
// Helpers – project a 3-D point onto 2-D given a global Y-axis
// rotation `ry` (in radians) applied FIRST, then a fixed
// slight X-tilt for a "natural" perspective feel.
// ─────────────────────────────────────────────────────────────
function project(
  x3: number,
  y3: number,
  z3: number,
  ry: number
): { x: number; y: number; scale: number } {
  // rotate around Y
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x1   = x3 * cosY + z3 * sinY;
  const z1   = -x3 * sinY + z3 * cosY;

  // fixed ~25° X-tilt
  const tilt  = Math.PI / 7;
  const cosX  = Math.cos(tilt);
  const sinX  = Math.sin(tilt);
  const y1    = y3 * cosX - z1 * sinX;
  const z2    = y3 * sinX + z1 * cosX;

  // perspective divide
  const fov   = 500;
  const scale = fov / (fov + z2 + R * 1.2);

  return {
    x: CX + x1 * scale,
    y: CY - y1 * scale,
    scale,
  };
}

// ─────────────────────────────────────────────────────────────
// Sub-component: latitude ellipse (constant polar angle)
// ─────────────────────────────────────────────────────────────
function LatitudeCircle({
  polar,
  ry,
  color,
  opacity,
}: {
  polar: number;
  ry: number;
  color: string;
  opacity: number;
}) {
  const STEPS = 64;
  const points: string[] = [];

  for (let i = 0; i <= STEPS; i++) {
    const az = (i / STEPS) * 2 * Math.PI;
    const x3 = R * Math.sin(polar) * Math.cos(az);
    const y3 = R * Math.cos(polar);
    const z3 = R * Math.sin(polar) * Math.sin(az);
    const p  = project(x3, y3, z3, ry);
    points.push(`${p.x},${p.y}`);
  }

  return (
    <polyline
      points={points.join(' ')}
      fill="none"
      stroke={color}
      strokeWidth="0.6"
      strokeOpacity={opacity}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: longitude arc (constant azimuthal angle)
// ─────────────────────────────────────────────────────────────
function LongitudeArc({
  azimuthal,
  ry,
  color,
  opacity,
}: {
  azimuthal: number;
  ry: number;
  color: string;
  opacity: number;
}) {
  const STEPS = 64;
  const points: string[] = [];

  for (let i = 0; i <= STEPS; i++) {
    const polar = (i / STEPS) * Math.PI;
    const x3    = R * Math.sin(polar) * Math.cos(azimuthal);
    const y3    = R * Math.cos(polar);
    const z3    = R * Math.sin(polar) * Math.sin(azimuthal);
    const p     = project(x3, y3, z3, ry);
    points.push(`${p.x},${p.y}`);
  }

  return (
    <polyline
      points={points.join(' ')}
      fill="none"
      stroke={color}
      strokeWidth="0.6"
      strokeOpacity={opacity}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: axis line + label
// ─────────────────────────────────────────────────────────────
function Axis({
  dir,
  label,
  color,
  ry,
}: {
  dir: [number, number, number];
  label: string;
  color: string;
  ry: number;
}) {
  const origin = project(0, 0, 0, ry);
  const tip    = project(dir[0] * R * 1.2, dir[1] * R * 1.2, dir[2] * R * 1.2, ry);
  const neg    = project(-dir[0] * R * 0.5, -dir[1] * R * 0.5, -dir[2] * R * 0.5, ry);

  return (
    <>
      {/* dashed negative half */}
      <line
        x1={origin.x} y1={origin.y}
        x2={neg.x}    y2={neg.y}
        stroke={color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3"
      />
      {/* solid positive half */}
      <line
        x1={origin.x} y1={origin.y}
        x2={tip.x}    y2={tip.y}
        stroke={color} strokeWidth="1.4" strokeOpacity="0.9"
      />
      {/* arrowhead */}
      <circle cx={tip.x} cy={tip.y} r="2.5" fill={color} opacity="0.9" />
      {/* label */}
      <text
        x={tip.x + (tip.x - origin.x) * 0.12}
        y={tip.y + (tip.y - origin.y) * 0.12 + 1}
        fill={color}
        fontSize="10"
        fontWeight="700"
        fontFamily="monospace"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {label}
      </text>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: state vector arrow
// ─────────────────────────────────────────────────────────────
function StateVector({
  theta,
  phi,
  ry,
  filterId,
}: {
  theta: number;
  phi: number;
  ry: number;
  filterId: string;
}) {
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const x3   = R * sinT * Math.cos(phi);
  const y3   = R * cosT;
  const z3   = R * sinT * Math.sin(phi);

  const origin = project(0, 0, 0, ry);
  const tip    = project(x3, y3, z3, ry);

  // arrowhead direction vector
  const dx = tip.x - origin.x;
  const dy = tip.y - origin.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx  = dx / len;
  const ny  = dy / len;

  const headLen = 8;
  const headW   = 4;

  const px1 = tip.x - nx * headLen - ny * headW;
  const py1 = tip.y - ny * headLen + nx * headW;
  const px2 = tip.x - nx * headLen + ny * headW;
  const py2 = tip.y - ny * headLen - nx * headW;

  return (
    <>
      {/* shaft */}
      <line
        x1={origin.x} y1={origin.y}
        x2={tip.x}    y2={tip.y}
        stroke="#f0f" strokeWidth="2.2"
        strokeOpacity="0.95"
        filter={`url(#${filterId})`}
      />
      {/* arrowhead */}
      <polygon
        points={`${tip.x},${tip.y} ${px1},${py1} ${px2},${py2}`}
        fill="#f0f"
        opacity="0.95"
        filter={`url(#${filterId})`}
      />
      {/* tip dot on sphere surface */}
      <circle
        cx={tip.x} cy={tip.y} r="4"
        fill="#f0f" opacity="0.9"
        filter={`url(#${filterId})`}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
export function BlochSphere({
  theta = Math.PI / 4,
  phi   = Math.PI / 4,
  label = 'Qubit State',
}: BlochSphereProps) {
  const uid = useId().replace(/:/g, '');

  // ── smooth spring transitions for theta / phi ──────────────
  const springConfig = { stiffness: 60, damping: 15 };
  const smoothTheta  = useSpring(theta, springConfig);
  const smoothPhi    = useSpring(phi,   springConfig);

  React.useEffect(() => { smoothTheta.set(theta); }, [theta, smoothTheta]);
  React.useEffect(() => { smoothPhi.set(phi);     }, [phi,   smoothPhi]);

  // ── live θ / φ for SVG rendering ──────────────────────────
  const [liveTheta, setLiveTheta] = React.useState(theta);
  const [livePhi,   setLivePhi]   = React.useState(phi);

  React.useEffect(
    () => smoothTheta.on('change', setLiveTheta),
    [smoothTheta]
  );
  React.useEffect(
    () => smoothPhi.on('change', setLivePhi),
    [smoothPhi]
  );

  // ── slow sphere rotation (CSS animation via motion) ────────
  const [ry, setRy] = React.useState(0);
  const rafRef       = React.useRef<number>(0);
  const startRef     = React.useRef<number | null>(null);
  const PERIOD_MS    = 8000;

  React.useEffect(() => {
    const animate = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      setRy(((elapsed % PERIOD_MS) / PERIOD_MS) * 2 * Math.PI);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── latitude / longitude grid lines ───────────────────────
  const latitudes   = [Math.PI / 6, Math.PI / 3, Math.PI / 2, (2 * Math.PI) / 3, (5 * Math.PI) / 6];
  const longitudes  = Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3);

  const thetaDeg = ((liveTheta * 180) / Math.PI).toFixed(1);
  const phiDeg   = ((livePhi   * 180) / Math.PI).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* glassmorphism card */}
      <div
        className="relative rounded-2xl p-3 flex flex-col items-center gap-2"
        style={{
          width: SIZE + 24,
          background: 'rgba(8, 20, 40, 0.72)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 255, 255, 0.18)',
          boxShadow: '0 0 32px rgba(0,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* label */}
        {label && (
          <p className="text-[11px] font-mono font-semibold tracking-widest text-cyan-400 uppercase opacity-80 self-start">
            {label}
          </p>
        )}

        {/* SVG sphere */}
        <svg width={SIZE} height={SIZE} style={{ overflow: 'visible' }}>
          <defs>
            {/* radial gradient for the sphere body */}
            <radialGradient id={`${uid}-sphere-grad`} cx="38%" cy="35%" r="60%">
              <stop offset="0%"   stopColor="#0a2233" stopOpacity="1" />
              <stop offset="70%"  stopColor="#040e1a" stopOpacity="1" />
              <stop offset="100%" stopColor="#000a12" stopOpacity="1" />
            </radialGradient>

            {/* glow filters */}
            <filter id={`${uid}-glow-cyan`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`${uid}-glow-magenta`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* clip to sphere boundary */}
            <clipPath id={`${uid}-sphere-clip`}>
              <ellipse cx={CX} cy={CY} rx={R + 2} ry={R + 2} />
            </clipPath>
          </defs>

          {/* ── sphere body ── */}
          <ellipse
            cx={CX} cy={CY} rx={R} ry={R}
            fill={`url(#${uid}-sphere-grad)`}
            stroke="rgba(0,255,255,0.25)"
            strokeWidth="1"
            filter={`url(#${uid}-glow-cyan)`}
          />

          {/* ── grid lines (clipped to sphere) ── */}
          <g clipPath={`url(#${uid}-sphere-clip)`}>
            {latitudes.map((lat, i) => (
              <LatitudeCircle
                key={`lat-${i}`}
                polar={lat}
                ry={ry}
                color="#00ffff"
                opacity={lat === Math.PI / 2 ? 0.35 : 0.14}
              />
            ))}
            {longitudes.map((lon, i) => (
              <LongitudeArc
                key={`lon-${i}`}
                azimuthal={lon}
                ry={ry}
                color="#00ffff"
                opacity={0.14}
              />
            ))}
          </g>

          {/* ── sphere rim highlight ── */}
          <ellipse
            cx={CX} cy={CY} rx={R} ry={R}
            fill="none"
            stroke="rgba(0,255,255,0.3)"
            strokeWidth="1.5"
          />

          {/* ── axes ── */}
          <Axis dir={[1, 0, 0]} label="X" color="#ff4d4d" ry={ry} />
          <Axis dir={[0, 1, 0]} label="Z" color="#00e5ff" ry={ry} />
          <Axis dir={[0, 0, 1]} label="Y" color="#00ff88" ry={ry} />

          {/* ── pole labels ── */}
          {(() => {
            const top = project(0,  R * 1.28, 0, ry);
            const bot = project(0, -R * 1.28, 0, ry);
            return (
              <>
                <text
                  x={top.x} y={top.y}
                  fill="#00e5ff" fontSize="11" fontFamily="monospace"
                  fontWeight="700" textAnchor="middle" dominantBaseline="middle"
                  opacity="0.9"
                >
                  |0⟩
                </text>
                <text
                  x={bot.x} y={bot.y}
                  fill="#00e5ff" fontSize="11" fontFamily="monospace"
                  fontWeight="700" textAnchor="middle" dominantBaseline="middle"
                  opacity="0.9"
                >
                  |1⟩
                </text>
              </>
            );
          })()}

          {/* ── state vector ── */}
          <StateVector theta={liveTheta} phi={livePhi} ry={ry} filterId={`${uid}-glow-magenta`} />

          {/* ── equatorial circle guide (faint dashed) ── */}
          {(() => {
            // project equatorial circle as a guide ellipse (approximate)
            const right = project(R, 0, 0, ry);
            const top_  = project(0, 0, R, ry);
            const rx_   = Math.abs(right.x - CX);
            const ry_   = Math.abs(top_.y  - CY);
            return (
              <ellipse
                cx={CX} cy={CY} rx={rx_} ry={ry_}
                fill="none"
                stroke="rgba(0,255,255,0.22)"
                strokeWidth="0.8"
                strokeDasharray="4 3"
              />
            );
          })()}
        </svg>

        {/* ── angle display ── */}
        <div className="flex gap-4 text-[11px] font-mono">
          <div className="flex flex-col items-center">
            <span className="text-cyan-500 opacity-60 tracking-widest">θ (THETA)</span>
            <motion.span
              className="text-cyan-200 font-bold text-sm"
              key={thetaDeg}
            >
              {thetaDeg}°
            </motion.span>
          </div>
          <div className="w-px bg-cyan-900 opacity-40" />
          <div className="flex flex-col items-center">
            <span className="text-cyan-500 opacity-60 tracking-widest">φ (PHI)</span>
            <motion.span
              className="text-cyan-200 font-bold text-sm"
              key={phiDeg}
            >
              {phiDeg}°
            </motion.span>
          </div>
        </div>

        {/* ── legend ── */}
        <div className="flex gap-3 text-[10px] font-mono opacity-70 flex-wrap justify-center">
          {[
            { color: '#ff4d4d', name: 'X' },
            { color: '#00ff88', name: 'Y' },
            { color: '#00e5ff', name: 'Z' },
            { color: '#ff00ff', name: '|ψ⟩' },
          ].map(({ color, name }) => (
            <span key={name} className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span style={{ color }}>{name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

