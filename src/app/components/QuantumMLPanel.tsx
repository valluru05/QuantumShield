import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { Cpu, RefreshCw, AlertTriangle } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { QuantumCircuitViz } from './QuantumCircuitViz';
import { QuantumStateViz } from './QuantumStateViz';
import { QuantumClusterViz } from './QuantumClusterViz';
import type { QuantumVizData } from '../types/quantum';

// ─── Shared style tokens ────────────────────────────────────────────────────
const CYAN   = '#00f5ff';
const PURPLE = '#8b5cf6';
const AMBER  = '#f59e0b';
const RED    = '#ef4444';
const GREEN  = '#22c55e';

const panelBg      = 'rgba(6,13,26,0.85)';
const borderColor  = 'rgba(0,245,255,0.12)';
const surfaceDark  = 'rgba(0,245,255,0.04)';
const surfaceMid   = 'rgba(0,245,255,0.08)';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getApiBase = (): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  return `http://${hostname}:3001`;
};

function generateSignalForType(attackType: string): number[] {
  const seed =
    attackType === 'jamming' ? 12345 : attackType === 'spoofing' ? 67890 : 11111;
  let state = seed;

  const seededRandom = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  const signal: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (attackType === 'jamming') {
      signal.push(seededRandom() * 2 - 1);
    } else if (attackType === 'spoofing') {
      signal.push(Math.sin(i * 0.3 + seededRandom() * 0.1));
    } else {
      signal.push(Math.sin(i * 0.2) * (0.8 + seededRandom() * 0.2));
    }
  }
  return signal;
}

// ─── HUD corner decorations ─────────────────────────────────────────────────
function HudCorner({ position }: { position: 'tl' | 'br' }) {
  const isTL = position === 'tl';
  return (
    <div
      style={{
        position: 'absolute',
        ...(isTL ? { top: 0, left: 0 } : { bottom: 0, right: 0 }),
        width: 20,
        height: 20,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: isTL ? 0 : 'auto',
          bottom: isTL ? 'auto' : 0,
          left: isTL ? 0 : 'auto',
          right: isTL ? 'auto' : 0,
          width: 14,
          height: 2,
          background: CYAN,
          boxShadow: `0 0 6px ${CYAN}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: isTL ? 0 : 'auto',
          bottom: isTL ? 'auto' : 0,
          left: isTL ? 0 : 'auto',
          right: isTL ? 'auto' : 0,
          width: 2,
          height: 14,
          background: CYAN,
          boxShadow: `0 0 6px ${CYAN}`,
        }}
      />
    </div>
  );
}

// ─── Animated metric bar ─────────────────────────────────────────────────────
function MetricBar({
  value,
  color,
  glowColor,
}: {
  value: number;
  color: string;
  glowColor: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: 4,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 9999,
        overflow: 'hidden',
        marginTop: 10,
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          height: '100%',
          borderRadius: 9999,
          background: color,
          boxShadow: `0 0 8px ${glowColor}, 0 0 16px ${glowColor}44`,
        }}
      />
    </div>
  );
}

// ─── Quantum spinner ─────────────────────────────────────────────────────────
function QuantumSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: `2px solid rgba(0,245,255,0.2)`,
          borderTopColor: CYAN,
          boxShadow: `0 0 8px ${CYAN}`,
        }}
      />
      <span style={{ color: CYAN, fontFamily: 'monospace', fontSize: 13, letterSpacing: 1 }}>
        COMPUTING…
      </span>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export function QuantumMLPanel() {
  const [vizData, setVizData] = useState<QuantumVizData | null>(null);
  const [clusterConfidence, setClusterConfidence] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visualizedAttackType, setVisualizedAttackType] = useState<string | null>(null);
  const { mlConfidence, mlThreatScore, attackType } = useSystem();

  const vizCache = useRef<Map<string, { vizData: QuantumVizData; confidence: number }>>(new Map());

  const handleShowQuantumViz = async (forceRefresh = false) => {
    const currentAttackType = attackType === 'none' ? 'normal' : attackType;

    if (!forceRefresh && vizCache.current.has(currentAttackType)) {
      const cached = vizCache.current.get(currentAttackType)!;
      setVizData(cached.vizData);
      setClusterConfidence(cached.confidence);
      setVisualizedAttackType(currentAttackType);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const API_BASE = getApiBase();
      const signal = generateSignalForType(currentAttackType);

      const response = await fetch(`${API_BASE}/api/quantum/infer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal,
          attack_type: currentAttackType,
          return_full_pipeline: true,
          visualization_only: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const stages = result.pipeline_stages;

      if (!stages?.encoding || !stages?.clustering || !stages?.quantum_walk) {
        throw new Error('Incomplete pipeline data received from server');
      }

      const enc   = stages.encoding;
      const clust = stages.clustering;
      const walk  = stages.quantum_walk;

      const stateVector: [number, number][] = enc.state_vector_real?.map(
        (r: number, i: number) => [r, enc.state_vector_imag?.[i] || 0] as [number, number]
      ) || [];

      const newVizData: QuantumVizData = {
        circuit_qasm:      enc.circuit_qasm || 'Circuit unavailable',
        state_vector:      stateVector,
        basis_labels:      enc.basis_labels || ['|00⟩', '|01⟩', '|10⟩', '|11⟩'],
        probabilities:     enc.probabilities || [],
        cluster_label:     clust.cluster_label || 'normal',
        kernel_scores:     clust.kernel_scores || {},
        quantum_walk_dist: walk.probability_dist || [],
      };

      const newConfidence = clust.confidence || 0;

      console.log('Clustering data:', {
        cluster_label: clust.cluster_label,
        kernel_scores: clust.kernel_scores,
        confidence:    newConfidence,
      });

      vizCache.current.set(currentAttackType, { vizData: newVizData, confidence: newConfidence });
      setVizData(newVizData);
      setClusterConfidence(newConfidence);
      setVisualizedAttackType(currentAttackType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to get quantum visualization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Attack type badge colours
  const attackBadgeStyle: React.CSSProperties =
    visualizedAttackType === 'jamming'
      ? { background: 'rgba(239,68,68,0.15)', color: RED,   border: `1px solid ${RED}44`   }
      : visualizedAttackType === 'spoofing'
      ? { background: 'rgba(245,158,11,0.15)', color: AMBER, border: `1px solid ${AMBER}44` }
      : { background: 'rgba(34,197,94,0.15)',  color: GREEN, border: `1px solid ${GREEN}44` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'relative',
        background: panelBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: 24,
        overflow: 'hidden',
      }}
    >
      {/* HUD corners */}
      <HudCorner position="tl" />
      <HudCorner position="br" />

      {/* Subtle top glow band */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${CYAN}66, transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Cpu style={{ width: 18, height: 18, color: CYAN, filter: `drop-shadow(0 0 6px ${CYAN})` }} />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 15,
              fontWeight: 700,
              color: CYAN,
              letterSpacing: 2,
              textShadow: `0 0 10px ${CYAN}88`,
            }}
          >
            QUANTUM ML PIPELINE
          </span>
          {/* LIVE badge */}
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            style={{
              fontSize: 9,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: 1.5,
              color: GREEN,
              background: 'rgba(34,197,94,0.12)',
              border: `1px solid ${GREEN}55`,
              borderRadius: 4,
              padding: '2px 6px',
            }}
          >
            LIVE
          </motion.span>
        </div>
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: 'rgba(0,245,255,0.45)',
            letterSpacing: 1,
          }}
        >
          REAL-TIME QUANTUM FEATURE ENCODING &amp; CLASSIFICATION
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Metric cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* ML Confidence */}
          <div
            style={{
              padding: 16,
              background: 'linear-gradient(135deg, rgba(0,245,255,0.07), rgba(0,100,255,0.05))',
              border: `1px solid rgba(0,245,255,0.18)`,
              borderRadius: 10,
              boxShadow: `inset 0 0 20px rgba(0,245,255,0.04)`,
            }}
          >
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(0,245,255,0.5)', letterSpacing: 1.5, marginBottom: 6 }}>
              ML CONFIDENCE
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                fontFamily: 'monospace',
                color: CYAN,
                textShadow: `0 0 12px ${CYAN}88`,
              }}
            >
              {mlConfidence != null ? mlConfidence.toFixed(1) : '0.0'}%
            </div>
            <MetricBar
              value={mlConfidence || 0}
              color={`linear-gradient(90deg, ${CYAN}, #0080ff)`}
              glowColor={CYAN}
            />
          </div>

          {/* Threat Score */}
          <div
            style={{
              padding: 16,
              background: 'linear-gradient(135deg, rgba(245,158,11,0.07), rgba(239,68,68,0.05))',
              border: `1px solid rgba(245,158,11,0.18)`,
              borderRadius: 10,
              boxShadow: `inset 0 0 20px rgba(245,158,11,0.04)`,
            }}
          >
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(245,158,11,0.5)', letterSpacing: 1.5, marginBottom: 6 }}>
              THREAT SCORE
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                fontFamily: 'monospace',
                color: mlThreatScore && mlThreatScore > 60 ? RED : AMBER,
                textShadow: `0 0 12px ${mlThreatScore && mlThreatScore > 60 ? RED : AMBER}88`,
              }}
            >
              {mlThreatScore != null ? mlThreatScore.toFixed(1) : '0.0'}%
            </div>
            <MetricBar
              value={mlThreatScore || 0}
              color={`linear-gradient(90deg, ${AMBER}, ${RED})`}
              glowColor={AMBER}
            />
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Main shimmer button */}
          <motion.button
            onClick={() => handleShowQuantumViz(false)}
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              padding: '10px 20px',
              borderRadius: 8,
              border: `1px solid ${CYAN}55`,
              background: isLoading
                ? 'rgba(0,245,255,0.05)'
                : 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(139,92,246,0.12))',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              color: isLoading ? 'rgba(0,245,255,0.5)' : CYAN,
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.5,
              boxShadow: isLoading ? 'none' : `0 0 20px rgba(0,245,255,0.15), inset 0 0 20px rgba(0,245,255,0.04)`,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {/* Shimmer overlay */}
            {!isLoading && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '40%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.18), transparent)',
                  pointerEvents: 'none',
                }}
              />
            )}
            {isLoading ? (
              <QuantumSpinner />
            ) : vizData ? (
              '▶ VIEW PIPELINE'
            ) : (
              '▶ SHOW QUANTUM PIPELINE'
            )}
          </motion.button>

          {/* Refresh button */}
          {vizData && (
            <Button
              onClick={() => handleShowQuantumViz(true)}
              disabled={isLoading}
              variant="outline"
              title="Refresh visualization"
              style={{
                padding: '10px 12px',
                border: `1px solid rgba(0,245,255,0.3)`,
                background: 'rgba(0,245,255,0.05)',
                color: CYAN,
                borderRadius: 8,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw
                style={{ width: 16, height: 16 }}
                className={isLoading ? 'animate-spin' : ''}
              />
            </Button>
          )}
        </div>

        {/* ── Error state ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              background: 'rgba(239,68,68,0.08)',
              border: `1px solid rgba(239,68,68,0.3)`,
              borderRadius: 8,
              boxShadow: `inset 0 0 16px rgba(239,68,68,0.06)`,
            }}
          >
            <AlertTriangle style={{ width: 14, height: 14, color: RED, flexShrink: 0, filter: `drop-shadow(0 0 4px ${RED})` }} />
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: RED, letterSpacing: 0.5 }}>
              {error}
            </span>
          </motion.div>
        )}

        {/* ── Visualization info badge ── */}
        {vizData && visualizedAttackType && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(0,245,255,0.4)' }}>
              PIPELINE FOR:
            </span>
            <span
              style={{
                ...attackBadgeStyle,
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: 1.5,
                padding: '2px 10px',
                borderRadius: 4,
              }}
            >
              {visualizedAttackType.toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(0,245,255,0.25)' }}>
              SIGNAL
            </span>
          </div>
        )}

        {/* ── Visualization tabs ── */}
        {vizData && (
          <Tabs defaultValue="circuit" className="w-full">
            <TabsList
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                background: 'rgba(0,245,255,0.04)',
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                padding: 3,
                gap: 3,
              }}
            >
              {(
                [
                  { value: 'circuit', label: 'CIRCUIT' },
                  { value: 'state',   label: 'STATE'   },
                  { value: 'cluster', label: 'CLUSTER' },
                  { value: 'walk',    label: 'WALK'    },
                ] as const
              ).map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 }}
                  className={[
                    'rounded-md transition-all duration-200',
                    'text-[rgba(0,245,255,0.45)]',
                    'data-[state=active]:text-[#00f5ff]',
                    'data-[state=active]:bg-[rgba(0,245,255,0.1)]',
                    'data-[state=active]:shadow-[0_0_12px_rgba(0,245,255,0.2)]',
                    'data-[state=active]:border',
                    'data-[state=active]:border-[rgba(0,245,255,0.25)]',
                    'hover:text-[rgba(0,245,255,0.75)]',
                  ].join(' ')}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="circuit" className="mt-4">
              <QuantumCircuitViz circuitQasm={vizData.circuit_qasm} nQubits={2} />
            </TabsContent>

            <TabsContent value="state" className="mt-4">
              <QuantumStateViz stateVector={vizData.state_vector} basisLabels={vizData.basis_labels} />
            </TabsContent>

            <TabsContent value="cluster" className="mt-4">
              <QuantumClusterViz
                clusterLabel={vizData.cluster_label}
                kernelScores={vizData.kernel_scores}
                confidence={clusterConfidence}
              />
            </TabsContent>

            <TabsContent value="walk" className="mt-4">
              <div
                style={{
                  background: surfaceDark,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <p
                  style={{
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 700,
                    color: CYAN,
                    letterSpacing: 1.5,
                    textShadow: `0 0 8px ${CYAN}66`,
                    marginBottom: 14,
                  }}
                >
                  QUANTUM WALK PROBABILITY DISTRIBUTION
                </p>
                {/* Bar chart */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: 3,
                    height: 120,
                  }}
                >
                  {vizData.quantum_walk_dist.slice(0, 16).map((prob, i) => {
                    const hue = Math.round(180 + (i / 15) * 100); // 180 → 280
                    const barColor = `hsl(${hue}, 90%, 60%)`;
                    const glowCol  = `hsl(${hue}, 90%, 60%)`;
                    return (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.4, ease: 'easeOut' }}
                        title={`f${i}: ${(prob * 100).toFixed(1)}%`}
                        style={{
                          flex: 1,
                          height: `${Math.max(8, prob * 100)}%`,
                          background: `linear-gradient(to top, ${barColor}, ${barColor}99)`,
                          borderRadius: '3px 3px 0 0',
                          boxShadow: `0 0 8px ${glowCol}77, 0 0 2px ${glowCol}`,
                          transformOrigin: 'bottom',
                          cursor: 'default',
                          transition: 'opacity 0.2s',
                          opacity: 0.85,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.85'; }}
                      />
                    );
                  })}
                </div>
                <p
                  style={{
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: 10,
                    color: 'rgba(0,245,255,0.35)',
                    letterSpacing: 1,
                    marginTop: 10,
                  }}
                >
                  PROBABILITY ACROSS 16 FREQUENCY BINS
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* ── Pipeline stages legend ── */}
        <div
          style={{
            background: surfaceMid,
            border: `1px solid ${borderColor}`,
            borderRadius: 10,
            padding: '14px 16px',
          }}
        >
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: 700,
              color: 'rgba(0,245,255,0.6)',
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            PIPELINE STAGES
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
            {(
              [
                { num: '1', label: 'Walk',    desc: 'Signal propagation model', color: CYAN   },
                { num: '2', label: 'Circuit', desc: '2-qubit encoding',         color: PURPLE },
                { num: '3', label: 'State',   desc: 'Hilbert space (4D)',        color: GREEN  },
                { num: '4', label: 'Cluster', desc: 'Quantum kernel match',      color: AMBER  },
              ] as const
            ).map(({ num, label, desc, color }) => (
              <div key={num} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 800,
                    color,
                    textShadow: `0 0 6px ${color}88`,
                    flexShrink: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {num}.
                </span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                  <strong style={{ color, fontWeight: 700 }}>{label}:</strong>{' '}
                  {desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
