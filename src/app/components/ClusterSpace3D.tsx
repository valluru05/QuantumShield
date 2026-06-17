
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useAnimationFrame } from 'motion/react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClusterPoint {
  x: number; // -1 to 1 (scene space)
  y: number;
  z: number;
  size: number; // px
}

interface ClusterSpaceProps {
  clusterData?: {
    normal: number[][];
    jamming: number[][];
    spoofing: number[][];
  };
  activeCluster?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CLUSTER_STYLES = {
  normal: {
    color: '#22d3ee',        // cyan-400
    glow: '0 0 12px #22d3ee, 0 0 24px #22d3ee55',
    glowStrong: '0 0 16px #22d3ee, 0 0 40px #22d3ee88, 0 0 70px #22d3ee44',
    label: 'NORMAL',
    centroidBorder: '#22d3ee',
  },
  jamming: {
    color: '#f87171',        // red-400
    glow: '0 0 12px #f87171, 0 0 24px #f8717155',
    glowStrong: '0 0 16px #f87171, 0 0 40px #f8717188, 0 0 70px #f8717144',
    label: 'JAMMING',
    centroidBorder: '#f87171',
  },
  spoofing: {
    color: '#c084fc',        // purple-400
    glow: '0 0 12px #c084fc, 0 0 24px #c084fc55',
    glowStrong: '0 0 16px #c084fc, 0 0 40px #c084fc88, 0 0 70px #c084fc44',
    label: 'SPOOFING',
    centroidBorder: '#c084fc',
  },
} as const;

type ClusterKey = keyof typeof CLUSTER_STYLES;

// ─── Random Synthetic Data Generator ─────────────────────────────────────────

function randomAround(center: number, spread: number): number {
  return center + (Math.random() - 0.5) * 2 * spread;
}

function generateSyntheticCluster(
  cx: number,
  cy: number,
  cz: number,
  spread: number,
  count: number,
): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < count; i++) {
    pts.push([
      randomAround(cx, spread),
      randomAround(cy, spread),
      randomAround(cz, spread),
    ]);
  }
  return pts;
}

// ─── 3D → 2D Projection Helper ────────────────────────────────────────────────

const SCENE_W = 100; // virtual scene units (percentage)
const SCENE_H = 100;
const PERSPECTIVE = 300; // px – higher = less distortion

function project(
  x: number,  // -1..1
  y: number,
  z: number,
  rotY: number, // radians
  containerW: number,
  containerH: number,
): { px: number; py: number; scale: number } {
  // Rotate around Y axis
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const rx = x * cosY + z * sinY;
  const ry = y;
  const rz = -x * sinY + z * cosY;

  // Simple perspective division
  const depth = rz + 2; // shift so depth > 0
  const scale = PERSPECTIVE / (PERSPECTIVE + depth * 60);

  // Map to container pixels (origin at center)
  const px = containerW / 2 + rx * (containerW * 0.35) * scale;
  const py = containerH / 2 - ry * (containerH * 0.38) * scale;

  return { px, py, scale };
}

// ─── Centroid helper ──────────────────────────────────────────────────────────

function centroid(pts: number[][]): [number, number, number] {
  if (pts.length === 0) return [0, 0, 0];
  const sum = pts.reduce(
    (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
    [0, 0, 0],
  );
  return [sum[0] / pts.length, sum[1] / pts.length, sum[2] / pts.length];
}

// ─── Axis endpoint pairs (scene coords) ──────────────────────────────────────

const AXES: { from: [number, number, number]; to: [number, number, number]; label: string }[] = [
  { from: [-0.8, 0, 0], to: [0.8, 0, 0], label: 'X' },
  { from: [0, -0.8, 0], to: [0, 0.8, 0], label: 'Y' },
  { from: [0, 0, -0.8], to: [0, 0, 0.8], label: 'Z' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ClusterSpace3D({ clusterData, activeCluster }: ClusterSpaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 600, h: 280 });
  const rotYRef = useRef(0);
  const [rotY, setRotY] = useState(0);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    obs.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => obs.disconnect();
  }, []);

  // Slow Y-axis rotation (12 second cycle)
  useAnimationFrame((t) => {
    const angle = (t / 12000) * Math.PI * 2;
    rotYRef.current = angle;
    setRotY(angle);
  });

  // Resolve or generate cluster data
  const resolvedData = useMemo(() => {
    if (clusterData) return clusterData;
    return {
      normal: generateSyntheticCluster(-0.45, 0.15, -0.2, 0.28, 18),
      jamming: generateSyntheticCluster(0.4, -0.2, 0.3, 0.22, 16),
      spoofing: generateSyntheticCluster(0.05, 0.45, -0.45, 0.24, 17),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build sorted points (back-to-front for painter's algo)
  const allPoints = useMemo(() => {
    const pts: {
      x: number; y: number; z: number;
      cluster: ClusterKey;
      rawSize: number;
    }[] = [];

    (Object.keys(CLUSTER_STYLES) as ClusterKey[]).forEach((key) => {
      const rawPts = resolvedData[key];
      rawPts.forEach((p) => {
        const z = p[2] ?? 0;
        pts.push({
          x: p[0] ?? 0,
          y: p[1] ?? 0,
          z,
          cluster: key,
          rawSize: 3 + Math.random() * 7, // 3-10px
        });
      });
    });
    return pts;
  }, [resolvedData]);

  // Compute sorted indices based on current rotY (back-to-front)
  const sorted = useMemo(() => {
    return [...allPoints]
      .map((pt, i) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const rz = -pt.x * sinY + pt.z * cosY;
        return { ...pt, rz, idx: i };
      })
      .sort((a, b) => a.rz - b.rz);
  }, [allPoints, rotY]);

  // Centroids
  const centroids = useMemo(() => {
    const result: Record<ClusterKey, [number, number, number]> = {
      normal: centroid(resolvedData.normal),
      jamming: centroid(resolvedData.jamming),
      spoofing: centroid(resolvedData.spoofing),
    };
    return result;
  }, [resolvedData]);

  const W = dims.w;
  const H = dims.h;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Title bar */}
      <div className="flex items-center justify-between px-1">
        <span
          className="text-xs font-mono font-bold tracking-widest"
          style={{ color: '#22d3ee', textShadow: '0 0 8px #22d3ee' }}
        >
          CLUSTER SPACE 3D
        </span>
        <div className="flex items-center gap-3">
          {(Object.keys(CLUSTER_STYLES) as ClusterKey[]).map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: CLUSTER_STYLES[k].color,
                  boxShadow: CLUSTER_STYLES[k].glow,
                }}
              />
              <span className="text-[10px] font-mono text-gray-400">
                {CLUSTER_STYLES[k].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl border border-white/10"
        style={{
          height: 280,
          background:
            'radial-gradient(ellipse at 50% 50%, #0d1520 0%, #060a10 100%)',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${W} ${H}`}
          style={{ overflow: 'visible' }}
        >
          {/* Grid floor – subtle dots at projected corners */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((gx) =>
            [-0.8, -0.4, 0, 0.4, 0.8].map((gz) => {
              const { px, py, scale } = project(gx, -0.8, gz, rotY, W, H);
              return (
                <circle
                  key={`g-${gx}-${gz}`}
                  cx={px}
                  cy={py}
                  r={1 * scale}
                  fill="#ffffff"
                  opacity={0.06}
                />
              );
            }),
          )}

          {/* Axes */}
          {AXES.map((ax) => {
            const from = project(ax.from[0], ax.from[1], ax.from[2], rotY, W, H);
            const to = project(ax.to[0], ax.to[1], ax.to[2], rotY, W, H);
            return (
              <g key={ax.label}>
                <line
                  x1={from.px}
                  y1={from.py}
                  x2={to.px}
                  y2={to.py}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                />
                <text
                  x={to.px + 6}
                  y={to.py + 4}
                  fontSize={9}
                  fill="rgba(255,255,255,0.35)"
                  fontFamily="monospace"
                >
                  {ax.label}
                </text>
              </g>
            );
          })}

          {/* Cluster lines from centroid to dots (subtle) */}
          {sorted.map((pt, i) => {
            const cen = centroids[pt.cluster];
            const { px: px1, py: py1 } = project(pt.x, pt.y, pt.z, rotY, W, H);
            const { px: px2, py: py2 } = project(cen[0], cen[1], cen[2], rotY, W, H);
            const style = CLUSTER_STYLES[pt.cluster];
            return (
              <line
                key={`l-${i}`}
                x1={px1}
                y1={py1}
                x2={px2}
                y2={py2}
                stroke={style.color}
                strokeWidth={0.5}
                opacity={0.1}
              />
            );
          })}

          {/* Data points (painter's algo – back-to-front) */}
          {sorted.map((pt, i) => {
            const { px, py, scale } = project(pt.x, pt.y, pt.z, rotY, W, H);
            const style = CLUSTER_STYLES[pt.cluster];
            const isActive = activeCluster === pt.cluster;
            const dotRadius = (pt.rawSize / 2) * scale;
            const opacity = 0.45 + 0.55 * ((scale - 0.7) / 0.4); // fade with depth

            return (
              <g key={`pt-${i}`}>
                {/* Glow halo for active cluster */}
                {isActive && (
                  <circle
                    cx={px}
                    cy={py}
                    r={dotRadius * 2.8}
                    fill={style.color}
                    opacity={0.08}
                  />
                )}
                <circle
                  cx={px}
                  cy={py}
                  r={dotRadius}
                  fill={style.color}
                  opacity={Math.min(1, Math.max(0.2, opacity))}
                  style={{
                    filter: `drop-shadow(0 0 ${isActive ? 5 : 3}px ${style.color})`,
                  }}
                />
              </g>
            );
          })}

          {/* Centroid markers (hollow circles) */}
          {(Object.keys(CLUSTER_STYLES) as ClusterKey[]).map((key) => {
            const cen = centroids[key];
            const { px, py, scale } = project(cen[0], cen[1], cen[2], rotY, W, H);
            const style = CLUSTER_STYLES[key];
            const isActive = activeCluster === key;
            const r = 8 * scale;

            return (
              <g key={`cen-${key}`}>
                {/* Outer pulse ring for active */}
                {isActive && (
                  <motion.circle
                    cx={px}
                    cy={py}
                    r={r * 2}
                    fill="none"
                    stroke={style.color}
                    strokeWidth={1}
                    animate={{ r: [r * 1.8, r * 3, r * 1.8], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                {/* Main centroid hollow circle */}
                <circle
                  cx={px}
                  cy={py}
                  r={r}
                  fill="none"
                  stroke={style.color}
                  strokeWidth={1.5}
                  opacity={0.9}
                  style={{
                    filter: `drop-shadow(0 0 6px ${style.color})`,
                  }}
                />
                {/* Cross-hair lines */}
                <line x1={px - r * 0.5} y1={py} x2={px + r * 0.5} y2={py}
                  stroke={style.color} strokeWidth={1} opacity={0.7} />
                <line x1={px} y1={py - r * 0.5} x2={px} y2={py + r * 0.5}
                  stroke={style.color} strokeWidth={1} opacity={0.7} />
                {/* Label */}
                <text
                  x={px}
                  y={py - r - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fill={style.color}
                  fontFamily="monospace"
                  fontWeight="bold"
                  style={{ filter: `drop-shadow(0 0 4px ${style.color})` }}
                >
                  {style.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Corner decoration */}
        <div className="absolute top-2 right-3 text-[9px] font-mono text-white/20 select-none">
          ψ-SPACE
        </div>
        <div className="absolute bottom-2 left-3 text-[9px] font-mono text-white/20 select-none">
          ROT: {((rotY / (Math.PI * 2)) * 360).toFixed(0)}°
        </div>
      </div>
    </div>
  );
}

export default ClusterSpace3D;
