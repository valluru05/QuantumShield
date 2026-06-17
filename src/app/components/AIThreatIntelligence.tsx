
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import {
  Brain,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Radio,
  Fingerprint,
  Signal,
  ShieldOff,
  Activity,
  Zap,
  Eye,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIThreatIntelligenceProps {
  attackType: string;
  confidence: number | null;
  systemStatus: string;
}

interface ForecastPoint {
  t: string;
  level: number;
}

interface AttackEvent {
  id: number;
  label: string;
  color: string;
  ts: string;
}

// ─── Recommendations config ───────────────────────────────────────────────────

type Rec = { icon: React.ReactNode; title: string; desc: string; priority: 'HIGH' | 'MED' | 'LOW' };

function getRecommendations(attackType: string): Rec[] {
  switch (attackType) {
    case 'jamming':
      return [
        {
          icon: <Radio className="w-4 h-4" />,
          title: 'Frequency Hopping',
          desc: 'Activate FHSS protocol — pseudo-randomly switch across 79 channels at 1600 hops/sec to evade broadband jamming.',
          priority: 'HIGH',
        },
        {
          icon: <Zap className="w-4 h-4" />,
          title: 'Adaptive Power Boost',
          desc: 'Increase transmission power by +6 dB to overcome noise floor elevation detected in current spectrum.',
          priority: 'HIGH',
        },
        {
          icon: <Signal className="w-4 h-4" />,
          title: 'DSSS Fallback',
          desc: 'Switch to Direct Sequence Spread Spectrum as a secondary anti-jamming countermeasure with processing gain of 10 dB.',
          priority: 'MED',
        },
      ];
    case 'spoofing':
      return [
        {
          icon: <ShieldAlert className="w-4 h-4" />,
          title: 'Multi-Layer Authentication',
          desc: 'Enforce cryptographic receiver-autonomous integrity monitoring (RAIM) and cross-validate satellite ephemeris data.',
          priority: 'HIGH',
        },
        {
          icon: <Fingerprint className="w-4 h-4" />,
          title: 'RF Signal Fingerprinting',
          desc: 'Analyze hardware-specific RF emissions — classify transmitter by rise-time jitter and carrier frequency offset signature.',
          priority: 'HIGH',
        },
        {
          icon: <Eye className="w-4 h-4" />,
          title: 'Channel Verification',
          desc: 'Cross-reference signal timing with known constellation geometry. Deviation > 2.5 μs flags spoofed trajectory.',
          priority: 'MED',
        },
      ];
    default:
      return [
        {
          icon: <ShieldCheck className="w-4 h-4" />,
          title: 'Maintain Current Posture',
          desc: 'All signal parameters within nominal bounds. Continue standard AES-256 encrypted channel operations.',
          priority: 'LOW',
        },
        {
          icon: <Activity className="w-4 h-4" />,
          title: 'Routine Diagnostics',
          desc: 'Schedule periodic RF spectrum sweep and SNR baseline calibration every 5-minute interval.',
          priority: 'LOW',
        },
        {
          icon: <ShieldOff className="w-4 h-4" />,
          title: 'Passive Monitoring',
          desc: 'Quantum ML classifier in standby mode — anomaly detection threshold set at 3σ above baseline.',
          priority: 'LOW',
        },
      ];
  }
}

// ─── Explainability text ──────────────────────────────────────────────────────

function getExplainText(attackType: string, confidence: number | null): string {
  const pct = confidence !== null ? `${confidence.toFixed(1)}%` : 'N/A';
  switch (attackType) {
    case 'jamming':
      return `Quantum kernel K(ψ,φ) similarity to jamming centroid: ${pct}. High spectral entropy (>0.87) and SNR degradation (>15 dB) triggered classification. Feature weights: noise-floor Δ=0.62, burst-density=0.28, phase-coherence=0.10.`;
    case 'spoofing':
      return `Signal fingerprint mismatch score: ${pct}. Doppler shift inconsistency detected (Δf=+340 Hz vs predicted). Feature weights: timing-bias=0.55, freq-anomaly=0.31, multi-path-ratio=0.14.`;
    default:
      return `All quantum kernel similarity scores within normal cluster bounds. Highest inter-cluster distance maintained at 0.92. Confidence baseline: ${pct}. No anomalous feature activations detected.`;
  }
}

// ─── Threat level derived from attackType + confidence ────────────────────────

function getThreatLevel(attackType: string, confidence: number | null): number {
  const c = confidence ?? 0;
  if (attackType === 'jamming') return Math.min(100, 60 + c * 0.4);
  if (attackType === 'spoofing') return Math.min(100, 45 + c * 0.4);
  return Math.min(30, c * 0.3);
}

// ─── Forecast data generator ──────────────────────────────────────────────────

function generateForecast(attackType: string, confidence: number | null): ForecastPoint[] {
  const base = getThreatLevel(attackType, confidence);
  const labels = ['now', '+1m', '+2m', '+3m', '+4m', '+5m'];
  return labels.map((t, i) => {
    const trend =
      attackType === 'jamming'
        ? base + i * 2 + (Math.random() - 0.5) * 8
        : attackType === 'spoofing'
        ? base - i * 1.5 + (Math.random() - 0.5) * 6
        : base + (Math.random() - 0.5) * 5;
    return { t, level: Math.max(0, Math.min(100, trend)) };
  });
}

// ─── Attack event history ─────────────────────────────────────────────────────

function generateHistory(attackType: string): AttackEvent[] {
  const pool: AttackEvent[] = [
    { id: 1, label: 'Normal', color: '#22d3ee', ts: '11:12' },
    { id: 2, label: 'Spoofing', color: '#c084fc', ts: '11:14' },
    { id: 3, label: 'Normal', color: '#22d3ee', ts: '11:15' },
    { id: 4, label: 'Jamming', color: '#f87171', ts: '11:16' },
    { id: 5, label: attackType === 'jamming' ? 'Jamming' : attackType === 'spoofing' ? 'Spoofing' : 'Normal',
      color: attackType === 'jamming' ? '#f87171' : attackType === 'spoofing' ? '#c084fc' : '#22d3ee',
      ts: '11:17' },
  ];
  return pool;
}

// ─── SVG Circular Progress Arc ───────────────────────────────────────────────

function CircularGauge({ value, color }: { value: number; color: string }) {
  const r = 48;
  const cx = 60;
  const cy = 60;
  const circumference = Math.PI * r; // half circle (180°)
  const offset = circumference - (value / 100) * circumference;

  // Map value to color if not overriding
  const gaugeColor =
    value > 70 ? '#f87171' : value > 40 ? '#fbbf24' : '#22d3ee';
  const activeColor = color || gaugeColor;

  return (
    <svg width={120} height={75} viewBox="0 0 120 75">
      {/* Background track (half circle) */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Animated fill arc */}
      <motion.path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={activeColor}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 8px ${activeColor})` }}
      />
      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const angle = (tick / 100) * Math.PI; // 0 to π
        const tx = cx - r * Math.cos(angle);
        const ty = cy - r * Math.sin(angle);
        const tx2 = cx - (r - 6) * Math.cos(angle);
        const ty2 = cy - (r - 6) * Math.sin(angle);
        return (
          <line
            key={tick}
            x1={tx}
            y1={ty}
            x2={tx2}
            y2={ty2}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1.5}
          />
        );
      })}
      {/* Value text */}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fontSize={18}
        fontWeight="bold"
        fontFamily="monospace"
        fill={activeColor}
        style={{ filter: `drop-shadow(0 0 6px ${activeColor})` }}
      >
        {Math.round(value)}
      </text>
      <text
        x={cx}
        y={cy + 13}
        textAnchor="middle"
        fontSize={8}
        fontFamily="monospace"
        fill="rgba(255,255,255,0.35)"
      >
        THREAT LVL
      </text>
      {/* Min / Max labels */}
      <text x={cx - r - 2} y={cy + 14} fontSize={8} fill="rgba(255,255,255,0.3)" textAnchor="middle">0</text>
      <text x={cx + r + 2} y={cy + 14} fontSize={8} fill="rgba(255,255,255,0.3)" textAnchor="middle">100</text>
    </svg>
  );
}

// ─── Custom recharts tooltip ──────────────────────────────────────────────────

function ForecastTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black/80 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-cyan-300">
      <span className="text-gray-400">{label} → </span>
      {payload[0]?.value?.toFixed(1)}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ systemStatus, attackType }: { systemStatus: string; attackType: string }) {
  const isAnalyzing = systemStatus === 'processing';
  const isThreat = ['under-attack', 'detected'].includes(systemStatus) && attackType !== 'none' && attackType !== 'normal';
  const isAllClear = !isAnalyzing && !isThreat;

  if (isAnalyzing) {
    return (
      <motion.div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono font-bold"
        style={{
          backgroundColor: '#7c3aed22',
          borderColor: '#7c3aed',
          color: '#a78bfa',
          boxShadow: '0 0 10px #7c3aed55',
        }}
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        <Loader2 className="w-3 h-3 animate-spin" />
        ANALYZING
      </motion.div>
    );
  }

  if (isThreat) {
    return (
      <motion.div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono font-bold"
        style={{
          backgroundColor: '#dc262622',
          borderColor: '#f87171',
          color: '#f87171',
          boxShadow: '0 0 12px #f8717166',
        }}
        animate={{ opacity: [1, 0.7, 1], scale: [1, 1.02, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <ShieldAlert className="w-3 h-3" />
        THREAT DETECTED
      </motion.div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono font-bold"
      style={{
        backgroundColor: '#05966922',
        borderColor: '#22d3ee',
        color: '#22d3ee',
        boxShadow: '0 0 10px #22d3ee44',
      }}
    >
      <ShieldCheck className="w-3 h-3" />
      ALL CLEAR
    </div>
  );
}

// ─── Priority pill ────────────────────────────────────────────────────────────

function PriorityPill({ priority }: { priority: 'HIGH' | 'MED' | 'LOW' }) {
  const cfg = {
    HIGH: { bg: '#f8717122', border: '#f87171', text: '#f87171' },
    MED: { bg: '#fbbf2422', border: '#fbbf24', text: '#fbbf24' },
    LOW: { bg: '#22d3ee22', border: '#22d3ee', text: '#22d3ee' },
  }[priority];
  return (
    <span
      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}
    >
      {priority}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIThreatIntelligence({
  attackType,
  confidence,
  systemStatus,
}: AIThreatIntelligenceProps) {
  const threatLevel = getThreatLevel(attackType, confidence);
  const recommendations = getRecommendations(attackType);
  const explainText = getExplainText(attackType, confidence);
  const history = useMemo(() => generateHistory(attackType), [attackType]);

  // Regenerate forecast on input changes
  const [forecast, setForecast] = useState<ForecastPoint[]>(() =>
    generateForecast(attackType, confidence),
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setForecast(generateForecast(attackType, confidence));
    // Live-update forecast every 4 seconds
    timerRef.current = setInterval(() => {
      setForecast(generateForecast(attackType, confidence));
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attackType, confidence]);

  const gaugeColor =
    threatLevel > 70 ? '#f87171' : threatLevel > 40 ? '#fbbf24' : '#22d3ee';

  return (
    <div
      className="w-full rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(13,20,35,0.97) 0%, rgba(8,14,26,0.97) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 40px rgba(34,211,238,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-white/8"
        style={{
          background: 'linear-gradient(90deg, rgba(34,211,238,0.06) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(34,211,238,0.12)',
              border: '1px solid rgba(34,211,238,0.3)',
              boxShadow: '0 0 12px rgba(34,211,238,0.2)',
            }}
          >
            <Brain className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2
              className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-400"
              style={{ textShadow: '0 0 10px rgba(34,211,238,0.6)' }}
            >
              AI THREAT INTELLIGENCE
            </h2>
            <p className="text-[9px] text-gray-500 font-mono tracking-wider">
              QUANTUM ML · REAL-TIME ANALYSIS
            </p>
          </div>
        </div>
        <StatusBadge systemStatus={systemStatus} attackType={attackType} />
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="p-4 space-y-4">

        {/* ── Row 1: Gauge + Attack Evolution ─────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Circular Gauge */}
          <div
            className="rounded-xl p-3 flex flex-col items-center justify-center gap-1 border border-white/8"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <p className="text-[9px] font-mono text-gray-500 tracking-widest mb-0.5">
              THREAT GAUGE
            </p>
            <CircularGauge value={threatLevel} color={gaugeColor} />
            <div
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-0.5"
              style={{
                color: gaugeColor,
                background: `${gaugeColor}18`,
                border: `1px solid ${gaugeColor}44`,
              }}
            >
              {attackType === 'jamming' ? 'CRITICAL' : attackType === 'spoofing' ? 'HIGH' : 'NOMINAL'}
            </div>
          </div>

          {/* Attack Evolution Timeline */}
          <div
            className="rounded-xl p-3 border border-white/8"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <p className="text-[9px] font-mono text-gray-500 tracking-widest mb-3">
              ATTACK EVOLUTION
            </p>
            <div className="relative flex flex-col gap-0">
              {/* Connecting vertical line */}
              <div
                className="absolute left-[7px] top-[8px]"
                style={{
                  width: 1,
                  height: `calc(100% - 16px)`,
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                }}
              />
              {history.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  className="flex items-center gap-2.5 relative"
                  style={{ paddingBottom: i < history.length - 1 ? 8 : 0 }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  {/* Event dot */}
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 relative z-10"
                    style={{
                      backgroundColor: ev.color,
                      boxShadow: `0 0 8px ${ev.color}`,
                      border: '2px solid rgba(0,0,0,0.5)',
                    }}
                  >
                    {i === history.length - 1 && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: ev.color }}
                        animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-semibold" style={{ color: ev.color }}>
                      {ev.label}
                    </span>
                    <span className="text-[9px] text-gray-600 font-mono ml-1.5">{ev.ts}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Threat Forecast Chart ────────────────────────────────────────── */}
        <div
          className="rounded-xl p-3 border border-white/8"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-mono text-gray-500 tracking-widest">
              THREAT FORECAST · NEXT 5 MIN
            </p>
            <motion.div
              className="flex items-center gap-1 text-[9px] font-mono"
              style={{ color: '#22d3ee' }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              LIVE
            </motion.div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={forecast} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gaugeColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={gaugeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                tick={{ fontSize: 8, fill: '#4b5563', fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 8, fill: '#4b5563', fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 50, 100]}
              />
              <Tooltip content={<ForecastTooltip />} />
              {/* Danger zone reference */}
              <ReferenceLine y={70} stroke="#f87171" strokeDasharray="3 3" strokeWidth={0.8} strokeOpacity={0.4} />
              <Area
                type="monotone"
                dataKey="level"
                stroke={gaugeColor}
                strokeWidth={2}
                fill="url(#forecastGrad)"
                dot={false}
                animationDuration={600}
                style={{ filter: `drop-shadow(0 0 4px ${gaugeColor})` }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Adaptive Recommendations ─────────────────────────────────────── */}
        <div
          className="rounded-xl p-3 border border-white/8"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <p className="text-[9px] font-mono text-gray-500 tracking-widest mb-2.5">
            ADAPTIVE RECOMMENDATIONS
          </p>
          <div className="space-y-2.5">
            <AnimatePresence mode="wait">
              {recommendations.map((rec, i) => (
                <motion.div
                  key={`${attackType}-${i}`}
                  className="flex gap-2.5 p-2.5 rounded-lg border border-white/6"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ delay: i * 0.07, duration: 0.25 }}
                >
                  {/* Icon */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(34,211,238,0.1)',
                      border: '1px solid rgba(34,211,238,0.2)',
                      color: '#22d3ee',
                    }}
                  >
                    {rec.icon}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono font-semibold text-gray-200">
                        {rec.title}
                      </span>
                      <PriorityPill priority={rec.priority} />
                    </div>
                    <p className="text-[9px] text-gray-500 leading-relaxed">{rec.desc}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Explainability ───────────────────────────────────────────────── */}
        <div
          className="rounded-xl p-3 border"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(34,211,238,0.04) 100%)',
            borderColor: 'rgba(124,58,237,0.2)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Brain className="w-3 h-3 text-purple-400" />
            <p className="text-[9px] font-mono font-bold text-purple-400 tracking-widest">
              AI EXPLAINABILITY
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={attackType}
              className="text-[9px] text-gray-500 leading-relaxed font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {explainText}
            </motion.p>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default AIThreatIntelligence;
