
import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export type ThreatType = 'jamming' | 'spoofing' | 'normal';

export interface Threat {
  id: string;
  angle: number;      // degrees, 0 = top (north), clockwise
  distance: number;   // 0–1, fraction of radar radius
  type: ThreatType;
}

interface ThreatRadarProps {
  threats: Threat[];
  size?: number;
}

// Colour map per threat type
const THREAT_COLORS: Record<ThreatType, { fill: string; glow: string; label: string }> = {
  jamming:  { fill: '#ff3a3a', glow: '#ff000088', label: 'JAM' },
  spoofing: { fill: '#ffd700', glow: '#ffcc0088', label: 'SPF' },
  normal:   { fill: '#39ff7a', glow: '#00ff5588', label: 'NRM' },
};

const RINGS = [0.25, 0.5, 0.75, 1];
const AXIS_LABELS = [
  { angle: 0,   label: '0°'   },
  { angle: 90,  label: '90°'  },
  { angle: 180, label: '180°' },
  { angle: 270, label: '270°' },
];

/** Convert polar (angle in degrees clockwise from north, distance 0-1) to SVG xy */
function polarToXY(angleDeg: number, distance: number, radius: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * distance * Math.cos(rad),
    y: cy + radius * distance * Math.sin(rad),
  };
}

/** Build an SVG arc path for the sweep trail (conic-ish) */
function sweepPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
}

export function ThreatRadar({ threats, size = 280 }: ThreatRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 14; // leave room for labels

  // Unique gradient ID per instance (avoid collisions)
  const sweepGradId = useMemo(() => `sweep-grad-${Math.random().toString(36).slice(2)}`, []);
  const bgGradId    = useMemo(() => `bg-grad-${Math.random().toString(36).slice(2)}`, []);

  return (
    <div
      className="relative select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: '0 0 24px rgba(0,255,255,0.18), 0 0 48px rgba(0,255,255,0.08)',
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          {/* Radial background gradient */}
          <radialGradient id={bgGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0a2233" />
            <stop offset="70%"  stopColor="#040d14" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>

          {/* Sweep arm gradient (trail fan) */}
          <radialGradient id={sweepGradId} cx="0%" cy="0%" r="100%">
            <stop offset="0%"   stopColor="#00ffff" stopOpacity="0.55" />
            <stop offset="60%"  stopColor="#00ffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0"    />
          </radialGradient>

          {/* Clip to circle */}
          <clipPath id="radar-clip">
            <circle cx={cx} cy={cy} r={outerR} />
          </clipPath>

          {/* Threat glow filters */}
          <filter id="glow-red" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-yellow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-green" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="arm-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Background circle ── */}
        <circle cx={cx} cy={cy} r={outerR} fill={`url(#${bgGradId})`} stroke="rgba(0,255,255,0.15)" strokeWidth="1" />

        {/* ── Grid: concentric rings ── */}
        {RINGS.map((fraction, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={outerR * fraction}
            fill="none"
            stroke={fraction === 1 ? 'rgba(0,255,255,0.25)' : 'rgba(0,255,255,0.1)'}
            strokeWidth={fraction === 1 ? 1 : 0.75}
            strokeDasharray={fraction === 1 ? 'none' : '3 5'}
          />
        ))}

        {/* ── Grid: cross hairs ── */}
        <line x1={cx} y1={cy - outerR} x2={cx} y2={cy + outerR} stroke="rgba(0,255,255,0.1)" strokeWidth="0.75" />
        <line x1={cx - outerR} y1={cy} x2={cx + outerR} y2={cy} stroke="rgba(0,255,255,0.1)" strokeWidth="0.75" />
        {/* Diagonal lines */}
        {[45, 135].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={cx - outerR * Math.cos(rad)}
              y1={cy - outerR * Math.sin(rad)}
              x2={cx + outerR * Math.cos(rad)}
              y2={cy + outerR * Math.sin(rad)}
              stroke="rgba(0,255,255,0.05)"
              strokeWidth="0.75"
            />
          );
        })}

        {/* ── Axis labels ── */}
        {AXIS_LABELS.map(({ angle, label }) => {
          const pad = 10;
          const pos = polarToXY(angle, 1, outerR + pad, cx, cy);
          const anchor =
            angle === 0 || angle === 180
              ? 'middle'
              : angle === 90
              ? 'start'
              : 'end';
          return (
            <text
              key={label}
              x={pos.x}
              y={pos.y + (angle === 0 ? -2 : angle === 180 ? 8 : 4)}
              textAnchor={anchor}
              fill="rgba(0,255,255,0.45)"
              fontSize="9"
              fontFamily="monospace"
            >
              {label}
            </text>
          );
        })}

        {/* ── Sweep arm + trail (rotates) ── */}
        <g clipPath="url(#radar-clip)">
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {/* Trail fan — 60° behind the arm */}
            <path
              d={sweepPath(cx, cy, outerR, -60, 0)}
              fill={`url(#${sweepGradId})`}
              opacity="0.7"
            />

            {/* Main sweep arm */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - outerR}
              stroke="#00ffff"
              strokeWidth="1.5"
              filter="url(#arm-glow)"
              strokeLinecap="round"
            />
          </motion.g>
        </g>

        {/* ── Center crosshair ── */}
        <line x1={cx - 7} y1={cy} x2={cx + 7} y2={cy} stroke="#00ffff" strokeWidth="1" opacity="0.7" />
        <line x1={cx} y1={cy - 7} x2={cx} y2={cy + 7} stroke="#00ffff" strokeWidth="1" opacity="0.7" />
        <circle cx={cx} cy={cy} r="2.5" fill="#00ffff" opacity="0.85" />

        {/* ── Threat dots ── */}
        {threats.map((threat) => {
          const clamped = Math.max(0, Math.min(1, threat.distance));
          const pos = polarToXY(threat.angle, clamped, outerR, cx, cy);
          const color = THREAT_COLORS[threat.type];
          const filterId =
            threat.type === 'jamming'
              ? 'glow-red'
              : threat.type === 'spoofing'
              ? 'glow-yellow'
              : 'glow-green';

          return (
            <motion.g
              key={threat.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
            >
              {/* Outer pulsing ring */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={9}
                fill="none"
                stroke={color.fill}
                strokeWidth="1"
                opacity={0.6}
                animate={{ r: [7, 13], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />

              {/* Middle ring */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={5}
                fill="none"
                stroke={color.fill}
                strokeWidth="1"
                opacity={0.5}
                animate={{ r: [4, 9], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              />

              {/* Core dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={4}
                fill={color.fill}
                filter={`url(#${filterId})`}
              />

              {/* White center */}
              <circle cx={pos.x} cy={pos.y} r={1.5} fill="white" opacity={0.9} />
            </motion.g>
          );
        })}
      </svg>


    </div>
  );
}

