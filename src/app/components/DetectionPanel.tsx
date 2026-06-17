
import { Shield, AlertCircle, AlertTriangle, CheckCircle, Cpu, Lock, BarChart3, Activity, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AttackType = 'none' | 'jamming' | 'spoofing';
type SystemStatus = 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure';

interface DetectionPanelProps {
  attackType: AttackType;
  systemStatus: SystemStatus;
  mlConfidence: number | null;
  mlResponseTimeMs: number | null;
  jammingAccuracy: number | null;
  modelAccuracy: number | null;
  modelF1: number | null;
  modelValidationAccuracy: number | null;
  onActivateSecure: () => void;
}

/* ── helpers ────────────────────────────────────────────────── */
const metricBarWidth = (value: number | null): number => {
  if (value === null || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value * 100));
};

/* tiny sub-components */
function HUDCorner({ pos }: { pos: 'tl' | 'br' }) {
  const base = 'absolute w-5 h-5 pointer-events-none';
  const tl = 'top-0 left-0 border-t-2 border-l-2 rounded-tl-sm';
  const br = 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm';
  return (
    <span
      className={`${base} ${pos === 'tl' ? tl : br}`}
      style={{ borderColor: '#00f5ff', opacity: 0.7 }}
    />
  );
}

function PulsingDot({ active, color }: { active: boolean; color: string }) {
  return (
    <span className="relative flex items-center justify-center w-3 h-3 ml-auto shrink-0">
      {active && (
        <motion.span
          className="absolute inline-flex w-full h-full rounded-full opacity-60"
          style={{ backgroundColor: color }}
          animate={{ scale: [1, 2], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <span
        className="relative inline-flex rounded-full w-2 h-2"
        style={{ backgroundColor: active ? color : '#374151' }}
      />
    </span>
  );
}

interface MetricBarProps {
  label: string;
  value: string;
  width: number;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  delay?: number;
}
function MetricBar({ label, value, width, gradientFrom, gradientTo, glowColor, delay = 0 }: MetricBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">{label}</span>
        <span className="text-[10px] font-mono font-bold" style={{ color: glowColor, textShadow: `0 0 8px ${glowColor}` }}>
          {value}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
            boxShadow: `0 0 8px ${glowColor}, 0 0 16px ${glowColor}55`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* ── main component ─────────────────────────────────────────── */
export function DetectionPanel({
  attackType,
  systemStatus,
  mlConfidence,
  mlResponseTimeMs,
  jammingAccuracy,
  modelAccuracy,
  modelF1,
  modelValidationAccuracy,
  onActivateSecure,
}: DetectionPanelProps) {
  /* ── status card config ── */
  const statusConfig = ({
    normal: {
      bg: 'rgba(0,255,128,0.06)',
      border: 'rgba(0,255,128,0.35)',
      glow: '0 0 18px rgba(0,255,128,0.18)',
      color: '#00ff80',
    },
    'under-attack': {
      bg: 'rgba(255,40,40,0.08)',
      border: 'rgba(255,40,40,0.5)',
      glow: '0 0 20px rgba(255,40,40,0.22)',
      color: '#ff2828',
    },
    detected: {
      bg: 'rgba(255,40,40,0.08)',
      border: 'rgba(255,40,40,0.5)',
      glow: '0 0 20px rgba(255,40,40,0.22)',
      color: '#ff2828',
    },
    processing: {
      bg: 'rgba(160,32,255,0.08)',
      border: 'rgba(160,32,255,0.45)',
      glow: '0 0 18px rgba(160,32,255,0.2)',
      color: '#a020ff',
    },
    switching: {
      bg: 'rgba(255,160,0,0.08)',
      border: 'rgba(255,160,0,0.45)',
      glow: '0 0 18px rgba(255,160,0,0.2)',
      color: '#ffa000',
    },
    secure: {
      bg: 'rgba(0,245,255,0.07)',
      border: 'rgba(0,245,255,0.4)',
      glow: '0 0 18px rgba(0,245,255,0.22)',
      color: '#00f5ff',
    },
  } as Record<string, { bg: string; border: string; glow: string; color: string }>)[systemStatus] ?? {
    bg: 'rgba(6,13,26,0.85)',
    border: 'rgba(0,245,255,0.12)',
    glow: 'none',
    color: '#00f5ff',
  };

  const isAttacking = systemStatus === 'under-attack' || systemStatus === 'detected';
  const isBusy = systemStatus === 'processing' || systemStatus === 'switching';

  /* kernel score mini-bars */
  const kernelScores: { label: string; color: string; active: boolean }[] = [
    { label: 'NORMAL', color: '#00ff80', active: attackType === 'none' },
    { label: 'JAMMING', color: '#ff3b3b', active: attackType === 'jamming' },
    { label: 'SPOOFING', color: '#ffa000', active: attackType === 'spoofing' },
  ];

  /* defense layers */
  const defenseLayers = [
    { label: 'Signal Authentication', active: true, color: '#00ff80' },
    { label: 'Anomaly Detection', active: true, color: '#00ff80' },
    { label: 'Quantum Encryption', active: systemStatus === 'secure', color: '#00f5ff' },
    { label: 'Auto-Failover', active: true, color: '#00ff80' },
  ];

  return (
    <div
      className="relative rounded-xl p-5 overflow-hidden"
      style={{
        background: 'rgba(6,13,26,0.85)',
        border: '1px solid rgba(0,245,255,0.12)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 0 40px rgba(0,245,255,0.05), inset 0 0 60px rgba(0,245,255,0.02)',
      }}
    >
      {/* HUD corner brackets */}
      <HUDCorner pos="tl" />
      <HUDCorner pos="br" />

      {/* subtle scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.012) 2px, rgba(0,245,255,0.012) 4px)',
        }}
      />

      {/* ── HEADER ────────────────────────────────────── */}
      <div className="relative flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-md shrink-0"
          style={{
            background: 'rgba(0,245,255,0.1)',
            border: '1px solid rgba(0,245,255,0.3)',
            boxShadow: '0 0 12px rgba(0,245,255,0.2)',
          }}
        >
          <Shield className="w-4 h-4" style={{ color: '#00f5ff' }} />
        </div>
        <div>
          <h2
            className="text-sm font-mono font-bold tracking-[0.2em] uppercase"
            style={{ color: '#00f5ff', textShadow: '0 0 12px rgba(0,245,255,0.6)' }}
          >
            Attack Classification
          </h2>
          <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase mt-0.5">
            Quantum ML Threat Detection &amp; Response
          </p>
        </div>
        {/* live indicator */}
        <motion.div
          className="ml-auto flex items-center gap-1.5"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff]" style={{ boxShadow: '0 0 6px #00f5ff' }} />
          <span className="text-[9px] font-mono tracking-widest text-[#00f5ff] opacity-70">LIVE</span>
        </motion.div>
      </div>

      <div className="relative space-y-4">

        {/* ── DETECTION STATUS CARD ──────────────────── */}
        <motion.div
          animate={isAttacking ? { boxShadow: [statusConfig.glow, '0 0 4px transparent', statusConfig.glow] } : {}}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="p-4 rounded-lg"
          style={{
            background: statusConfig.bg,
            border: `1px solid ${statusConfig.border}`,
            boxShadow: statusConfig.glow,
          }}
        >
          <div className="flex items-center gap-3">
            {/* normal */}
            {systemStatus === 'normal' && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-6 h-6" style={{ color: '#00ff80', filter: 'drop-shadow(0 0 6px #00ff80)' }} />
                </motion.div>
                <div>
                  <p className="font-mono font-bold text-sm tracking-widest" style={{ color: '#00ff80', textShadow: '0 0 8px #00ff80' }}>
                    ALL CLEAR ✅
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider">No threats detected</p>
                </div>
              </>
            )}

            {/* under-attack jamming */}
            {systemStatus === 'under-attack' && attackType === 'jamming' && (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <AlertTriangle className="w-6 h-6" style={{ color: '#ff3b3b', filter: 'drop-shadow(0 0 8px #ff3b3b)' }} />
                </motion.div>
                <div>
                  <p className="font-mono font-bold text-sm tracking-widest" style={{ color: '#ff3b3b', textShadow: '0 0 8px #ff3b3b' }}>
                    THREAT DETECTED 🚨
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider">
                    Jamming — High interference levels
                  </p>
                </div>
              </>
            )}

            {/* under-attack spoofing */}
            {systemStatus === 'under-attack' && attackType === 'spoofing' && (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <AlertTriangle className="w-6 h-6" style={{ color: '#ffa000', filter: 'drop-shadow(0 0 8px #ffa000)' }} />
                </motion.div>
                <div>
                  <p className="font-mono font-bold text-sm tracking-widest" style={{ color: '#ffa000', textShadow: '0 0 8px #ffa000' }}>
                    THREAT DETECTED ⚠️
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider">
                    Spoofing — Signal manipulation attempt
                  </p>
                </div>
              </>
            )}

            {/* detected jamming */}
            {systemStatus === 'detected' && attackType === 'jamming' && (
              <>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                  <AlertCircle className="w-6 h-6" style={{ color: '#ff3b3b', filter: 'drop-shadow(0 0 10px #ff3b3b)' }} />
                </motion.div>
                <div>
                  <p className="font-mono font-bold text-sm tracking-widest" style={{ color: '#ff3b3b', textShadow: '0 0 8px #ff3b3b' }}>
                    JAMMING CONFIRMED 🚨
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider">
                    Threat verified — Action required
                  </p>
                </div>
              </>
            )}

            {/* detected spoofing */}
            {systemStatus === 'detected' && attackType === 'spoofing' && (
              <>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                  <AlertCircle className="w-6 h-6" style={{ color: '#ffa000', filter: 'drop-shadow(0 0 10px #ffa000)' }} />
                </motion.div>
                <div>
                  <p className="font-mono font-bold text-sm tracking-widest" style={{ color: '#ffa000', textShadow: '0 0 8px #ffa000' }}>
                    SPOOFING CONFIRMED ⚠️
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider">
                    Threat verified — Action required
                  </p>
                </div>
              </>
            )}

            {/* secure */}
            {systemStatus === 'secure' && (
              <>
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
                  <Lock className="w-6 h-6" style={{ color: '#00f5ff', filter: 'drop-shadow(0 0 8px #00f5ff)' }} />
                </motion.div>
                <div>
                  <p className="font-mono font-bold text-sm tracking-widest" style={{ color: '#00f5ff', textShadow: '0 0 10px #00f5ff' }}>
                    QUANTUM SECURED 🔐
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider">Quantum encryption enabled</p>
                </div>
              </>
            )}
            {/* processing */}
            {systemStatus === 'processing' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Cpu
                    className="w-6 h-6"
                    style={{
                      color: '#a020ff',
                      filter: 'drop-shadow(0 0 6px #a020ff)',
                    }}
                  />
                </motion.div>
                <div className="flex-1">
                  <p
                    className="font-mono font-bold text-sm tracking-widest"
                    style={{
                      color: '#a020ff',
                      textShadow: '0 0 8px #a020ff',
                    }}
                  >
                    ANALYZING THREAT
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider">Quantum ML processing...</p>
                  <div
                    className="mt-2 w-full rounded-full h-1.5 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg,#a020ff,#e040fb)',
                        boxShadow: '0 0 8px #a020ff, 0 0 16px #a020ff55',
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* switching */}
            {systemStatus === 'switching' && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Radio
                    className="w-6 h-6"
                    style={{
                      color: '#ffa000',
                      filter: 'drop-shadow(0 0 6px #ffa000)',
                    }}
                  />
                </motion.div>
                <div className="flex-1">
                  <p
                    className="font-mono font-bold text-sm tracking-widest"
                    style={{
                      color: '#ffa000',
                      textShadow: '0 0 8px #ffa000',
                    }}
                  >
                    CHANNEL SWITCHING
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider">Establishing QSDC protocol...</p>
                  <div
                    className="mt-2 w-full rounded-full h-1.5 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg,#ffa000,#ffcc00)',
                        boxShadow: '0 0 8px #ffa000, 0 0 16px #ffa00055',
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* ── ACTIVATE SECURE CHANNEL BUTTON ────────── */}
        <AnimatePresence>
          {systemStatus === 'detected' && (
            <motion.button
              key="secure-btn"
              onClick={onActivateSecure}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.97 }}
              className="w-full p-4 rounded-lg font-mono font-bold text-sm tracking-[0.2em] uppercase relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(0,245,255,0.12) 0%, rgba(0,120,200,0.12) 100%)',
                border: '1.5px solid rgba(0,245,255,0.6)',
                color: '#00f5ff',
                textShadow: '0 0 12px rgba(0,245,255,0.8)',
                boxShadow: '0 0 20px rgba(0,245,255,0.15), inset 0 0 20px rgba(0,245,255,0.04)',
              }}
            >
              {/* shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(0,245,255,0.25) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Lock className="w-5 h-5" />
                <span>Activate Quantum Secure Channel</span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── QUANTUM ML METRICS ────────────────────── */}
        <div
          className="p-4 rounded-lg space-y-3"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,245,255,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4" style={{ color: '#00f5ff', filter: 'drop-shadow(0 0 4px #00f5ff)' }} />
            <p className="text-[10px] font-mono font-bold tracking-[0.22em] uppercase" style={{ color: '#00f5ff' }}>
              Quantum ML Metrics
            </p>
          </div>

          <MetricBar
            label="Jamming Accuracy"
            value={jammingAccuracy !== null ? `${jammingAccuracy.toFixed(1)}%` : '0.0%'}
            width={Math.max(0, Math.min(100, jammingAccuracy ?? 0))}
            gradientFrom="#ff3b3b"
            gradientTo="#ff7043"
            glowColor="#ff3b3b"
            delay={0}
          />
          <MetricBar
            label="Model Accuracy"
            value={modelAccuracy !== null ? `${(modelAccuracy * 100).toFixed(2)}%` : '0.0%'}
            width={metricBarWidth(modelAccuracy)}
            gradientFrom="#00f5ff"
            gradientTo="#0080ff"
            glowColor="#00f5ff"
            delay={0.08}
          />
          <MetricBar
            label="Model F1"
            value={modelF1 !== null ? `${(modelF1 * 100).toFixed(2)}%` : '0.0%'}
            width={metricBarWidth(modelF1)}
            gradientFrom="#00e676"
            gradientTo="#00f5ff"
            glowColor="#00e676"
            delay={0.16}
          />
          <MetricBar
            label="Validation Accuracy"
            value={modelValidationAccuracy !== null ? `${(modelValidationAccuracy * 100).toFixed(2)}%` : '0.0%'}
            width={metricBarWidth(modelValidationAccuracy)}
            gradientFrom="#b040ff"
            gradientTo="#7c3aed"
            glowColor="#b040ff"
            delay={0.24}
          />
        </div>

        {/* ── THREAT ANALYSIS DETAILS ───────────────── */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          {[
            {
              label: 'Threat Level',
              value:
                attackType === 'none' ? 'NONE' : attackType === 'jamming' ? 'CRITICAL' : 'HIGH',
              color:
                attackType === 'none' ? '#00ff80' : attackType === 'jamming' ? '#ff3b3b' : '#ffa000',
            },
            {
              label: 'ML Confidence',
              value: `${(mlConfidence ?? 0).toFixed(1)}%`,
              color: '#00f5ff',
            },
            {
              label: 'Response Time',
              value: `${Math.max(0, Math.round(mlResponseTimeMs ?? 0))}ms`,
              color: '#00f5ff',
            },
            {
              label: 'Encryption',
              value: systemStatus === 'secure' ? 'Post-Quantum AES-256' : 'Standard AES-256',
              color: systemStatus === 'secure' ? '#00f5ff' : '#6b7280',
            },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-2.5"
              style={{
                background: i % 2 === 0 ? 'rgba(0,245,255,0.025)' : 'transparent',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(0,245,255,0.06)' : undefined,
              }}
            >
              <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">{row.label}</span>
              <span
                className="text-[10px] font-mono font-bold"
                style={{ color: row.color, textShadow: `0 0 8px ${row.color}88` }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── DEFENSE LAYERS ────────────────────────── */}
        <div
          className="p-4 rounded-lg"
          style={{ borderTop: '1px solid rgba(0,245,255,0.08)' }}
        >
          <p className="text-[10px] font-mono font-bold tracking-[0.22em] uppercase text-gray-400 mb-3">
            Active Defense Layers
          </p>
          <div className="space-y-2.5">
            {defenseLayers.map((layer) => (
              <div key={layer.label} className="flex items-center gap-2.5">
                <Shield
                  className="w-4 h-4 shrink-0"
                  style={{
                    color: layer.active ? layer.color : '#374151',
                    filter: layer.active ? `drop-shadow(0 0 4px ${layer.color})` : undefined,
                  }}
                />
                <span className="text-[11px] font-mono text-gray-300 tracking-wide">{layer.label}</span>
                <PulsingDot active={layer.active} color={layer.color} />
              </div>
            ))}
          </div>
        </div>

        {/* ── QUANTUM KERNEL SCORES ─────────────────── */}
        <div
          className="p-4 rounded-lg"
          style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(0,245,255,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4" style={{ color: '#00f5ff', filter: 'drop-shadow(0 0 4px #00f5ff)' }} />
            <p className="text-[10px] font-mono font-bold tracking-[0.22em] uppercase" style={{ color: '#00f5ff' }}>
              Quantum Kernel Scores
            </p>
          </div>
          <div className="space-y-2.5">
            {kernelScores.map(({ label, color, active }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: color, boxShadow: active ? `0 0 6px ${color}` : undefined }}
                      animate={active ? { opacity: [1, 0.3, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">{label}</span>
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: active ? color : '#4b5563', textShadow: active ? `0 0 6px ${color}` : undefined }}
                  >
                    {active ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: active
                        ? `linear-gradient(90deg, ${color}99, ${color})`
                        : 'rgba(255,255,255,0.08)',
                      boxShadow: active ? `0 0 8px ${color}` : undefined,
                    }}
                    animate={{ width: active ? '100%' : '12%' }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}