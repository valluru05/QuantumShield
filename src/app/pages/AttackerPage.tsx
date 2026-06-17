import { useState } from 'react';
import { Link } from 'react-router';
import { Zap, AlertTriangle, ArrowLeft, Activity, Radio, Target, ChevronRight, Shield, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSystem } from '../context/SystemContext';
import { SignalChart } from '../components/SignalChart';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { QuantumWalkViz } from '../components/QuantumWalkViz';

const ATTACK_CONFIGS = [
  {
    type: 'jamming' as const,
    label: 'JAMMING ATTACK',
    sub: 'High-power interference burst',
    icon: Zap,
    color: '#ff2244',
    border: 'rgba(255,34,68,0.3)',
    bg: 'rgba(255,34,68,0.06)',
    description: 'Floods target frequency band with broadband noise, disrupting communication.',
    params: [
      { label: 'POWER', value: '87 dBm' },
      { label: 'FREQ', value: '2.4 GHz' },
      { label: 'TYPE', value: 'Broadband' },
    ],
  },
  {
    type: 'spoofing' as const,
    label: 'SPOOFING ATTACK',
    sub: 'Signal identity manipulation',
    icon: AlertTriangle,
    color: '#ffaa00',
    border: 'rgba(255,170,0,0.3)',
    bg: 'rgba(255,170,0,0.06)',
    description: 'Impersonates legitimate signal source with forged authentication headers.',
    params: [
      { label: 'TARGET', value: 'UAV_ALPHA' },
      { label: 'METHOD', value: 'GPS Spoof' },
      { label: 'DELAY', value: '12 ms' },
    ],
  },
];

function AttackMeter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono">
        <span style={{ color: '#3a5070' }}>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
          style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
        />
      </div>
    </div>
  );
}

export function AttackerPage() {
  const { attackType, systemStatus, isProcessing, launchAttack } = useSystem();
  const [activeAttack, setActiveAttack] = useState<'jamming' | 'spoofing' | null>(null);
  const [walkProbs] = useState<number[]>(() => Array(16).fill(0).map(() => Math.random()));

  const handleAttack = (type: 'jamming' | 'spoofing') => {
    setActiveAttack(type);
    launchAttack(type);
  };

  const getStatusBadge = () => {
    if (systemStatus === 'normal') return { text: 'STANDING BY', color: '#3a5070' };
    if (systemStatus === 'under-attack') return { text: 'ATTACK ACTIVE', color: '#ff2244' };
    if (systemStatus === 'processing') return { text: 'DEFENDER ANALYZING', color: '#ffaa00' };
    if (systemStatus === 'detected') return { text: 'ATTACK DETECTED', color: '#ffaa00' };
    if (systemStatus === 'switching') return { text: 'CHANNEL SWITCHING', color: '#8b5cf6' };
    if (systemStatus === 'secure') return { text: 'NEUTRALIZED', color: '#00f5ff' };
    return { text: 'READY', color: '#3a5070' };
  };

  const badge = getStatusBadge();
  const attackEffectiveness = systemStatus === 'secure' ? 0 : systemStatus === 'detected' ? 35 : attackType !== 'none' ? 87 : 0;

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'radial-gradient(ellipse at 70% 30%, #1a0608 0%, #020408 60%)' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(2,4,8,0.96)',
          borderBottom: '1px solid rgba(0,245,255,0.12)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Top row: back + title + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #3a507033',
              color: '#3a5070',
              fontFamily: 'monospace',
              fontSize: 10,
              letterSpacing: '0.1em',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={11} />
            HOME
          </Link>
          <span style={{ color: '#1a2d45', fontFamily: 'monospace', fontSize: 10 }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,34,68,0.12)',
                border: '1px solid rgba(255,34,68,0.3)',
                flexShrink: 0,
              }}
            >
              <Zap size={14} style={{ color: '#ff2244' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#ff2244' }}>
                ATTACK SIMULATOR
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#3a5070', letterSpacing: '0.05em' }}>Electronic Warfare Operations</div>
            </div>
          </div>
          <ConnectionStatus />
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            animate={attackType !== 'none' ? { backgroundColor: ['rgba(255,34,68,0.05)', 'rgba(255,34,68,0.12)', 'rgba(255,34,68,0.05)'] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              background: `${badge.color}0a`,
              border: `1px solid ${badge.color}33`,
              flexShrink: 0,
            }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ background: badge.color }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: badge.color }}>
              {badge.text}
            </span>
          </motion.div>
        </div>
        {/* Bottom row: page nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', overflowX: 'auto' }}>
          <Link to="/attacker" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, border: '1px solid #ff224466', color: '#ff2244', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textDecoration: 'none', flexShrink: 0 }}>
            <Zap size={10} /> ATTACKER
          </Link>
          <Link to="/defender" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, border: '1px solid #00f5ff33', color: '#00f5ff', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textDecoration: 'none', flexShrink: 0 }}>
            <Shield size={10} /> DEFENDER
          </Link>
          <Link to="/quantum-lab" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, border: '1px solid #8b5cf633', color: '#8b5cf6', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textDecoration: 'none', flexShrink: 0 }}>
            <Cpu size={10} /> QUANTUM LAB
          </Link>
        </div>
      </div>



      <main className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
        {/* LEFT: Attack Arsenal */}
        <div className="col-span-1 md:col-span-4 space-y-4">
          {/* Attack buttons */}
          {ATTACK_CONFIGS.map((atk) => {
            const Icon = atk.icon;
            const isActive = attackType === atk.type;
            return (
              <motion.div
                key={atk.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: atk.type === 'jamming' ? 0.1 : 0.2 }}
              >
                <motion.button
                  onClick={() => !isProcessing && handleAttack(atk.type)}
                  disabled={isProcessing}
                  whileHover={!isProcessing ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                  className="w-full relative overflow-hidden rounded-xl p-5 text-left group"
                  style={{
                    background: isActive ? `${atk.color}12` : atk.bg,
                    border: `1.5px solid ${isActive ? atk.color + '66' : atk.border}`,
                    boxShadow: isActive ? `0 0 20px ${atk.color}22` : 'none',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing && !isActive ? 0.5 : 1,
                  }}
                >
                  {/* Animated shimmer */}
                  {!isProcessing && (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${atk.color}18, transparent)`,
                        backgroundSize: '200% 100%',
                      }}
                      animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    />
                  )}

                  {/* Active threat pulse */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      animate={{ boxShadow: [`0 0 0 0 ${atk.color}44`, `0 0 0 8px ${atk.color}00`] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${atk.color}15`,
                          border: `1.5px solid ${atk.color}55`,
                          boxShadow: isActive ? `0 0 15px ${atk.color}44` : 'none',
                        }}
                      >
                        <Icon size={22} style={{ color: atk.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-black font-mono tracking-wider" style={{ color: atk.color }}>
                          {atk.label}
                        </div>
                        <div className="text-[10px]" style={{ color: '#3a5070' }}>{atk.sub}</div>
                      </div>
                      {isActive && (
                        <div className="ml-auto text-[10px] font-mono px-2 py-1 rounded" style={{ background: `${atk.color}15`, color: atk.color }}>
                          ACTIVE
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] mb-3" style={{ color: '#7a95b8' }}>{atk.description}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {atk.params.map(({ label, value }) => (
                        <div key={label} className="p-1.5 rounded" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${atk.color}11` }}>
                          <div className="text-[9px] font-mono" style={{ color: '#1a2d45' }}>{label}</div>
                          <div className="text-[11px] font-bold font-mono" style={{ color: atk.color }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end mt-3 text-[10px] font-mono" style={{ color: `${atk.color}88` }}>
                      LAUNCH <ChevronRight size={10} />
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}

          {/* Operation Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-[10px] font-mono tracking-widest flex items-center gap-2" style={{ color: '#ff2244' }}>
              <Target size={10} />
              OPERATION STATUS
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'ACTIVE ATTACK', value: attackType === 'none' ? 'NONE' : attackType.toUpperCase(), color: attackType !== 'none' ? '#ff2244' : '#3a5070' },
                { label: 'TARGET', value: 'UAV_ALPHA ↔ CMD_OMEGA', color: '#7a95b8' },
                { label: 'DEFENSE RESPONSE', value: systemStatus.toUpperCase(), color: badge.color },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-[10px] font-mono" style={{ color: '#3a5070' }}>{label}</span>
                  <span className="text-[11px] font-bold font-mono" style={{ color }}>{value}</span>
                </div>
              ))}
              <AttackMeter label="EFFECTIVENESS" value={attackEffectiveness} color={attackEffectiveness > 60 ? '#ff2244' : '#ffaa00'} />
              <AttackMeter label="SIGNAL DISRUPTION" value={attackType !== 'none' ? 73 : 0} color="#ff2244" />
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Visualization */}
        <div className="col-span-1 md:col-span-8 space-y-5">
          {/* Target comm link status */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-5"
            style={{
              background: 'rgba(6,13,26,0.85)',
              border: `1px solid ${attackType !== 'none' ? 'rgba(255,34,68,0.3)' : systemStatus === 'secure' ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: attackType !== 'none' ? '0 0 20px rgba(255,34,68,0.08)' : systemStatus === 'secure' ? '0 0 20px rgba(0,245,255,0.08)' : 'none',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio size={14} style={{ color: '#3a5070' }} />
                <span className="text-xs font-mono tracking-widest" style={{ color: '#7a95b8' }}>
                  TARGET COMMUNICATION LINK
                </span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: '#3a5070' }}>UAV_ALPHA ↔ CMD_OMEGA</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={systemStatus}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-lg border"
                style={{
                  background: attackType !== 'none' ? 'rgba(255,34,68,0.06)' : systemStatus === 'secure' ? 'rgba(0,245,255,0.06)' : 'rgba(0,255,136,0.04)',
                  borderColor: attackType !== 'none' ? 'rgba(255,34,68,0.2)' : systemStatus === 'secure' ? 'rgba(0,245,255,0.2)' : 'rgba(0,255,136,0.15)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-lg font-mono" style={{
                      color: attackType !== 'none' ? '#ff2244' : systemStatus === 'secure' ? '#00f5ff' : '#00ff88',
                      textShadow: `0 0 15px ${attackType !== 'none' ? 'rgba(255,34,68,0.5)' : systemStatus === 'secure' ? 'rgba(0,245,255,0.5)' : 'rgba(0,255,136,0.5)'}`,
                    }}>
                      {attackType !== 'none' ? '⚡ SIGNAL COMPROMISED' : systemStatus === 'secure' ? '🔒 QUANTUM ENCRYPTED' : '● CHANNEL ACTIVE'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#3a5070' }}>
                      {attackType !== 'none' ? `${attackType.toUpperCase()} attack disrupting communication channel` : systemStatus === 'secure' ? 'Target activated quantum-secure communication' : 'Target using standard AES-256 encryption'}
                    </p>
                  </div>
                  <Activity size={28} style={{ color: attackType !== 'none' ? '#ff2244' : systemStatus === 'secure' ? '#00f5ff' : '#00ff88' }} />
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Signal Chart */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <span className="text-[10px] font-mono tracking-widest" style={{ color: '#3a5070' }}>SIGNAL MONITOR — LIVE WAVEFORM</span>
              <div className="flex items-center gap-2">
                <motion.div className="w-1.5 h-1.5 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ background: '#ff2244' }} />
                <span className="text-[9px] font-mono" style={{ color: '#ff2244' }}>RECORDING</span>
              </div>
            </div>
            <SignalChart attackType={attackType} systemStatus={systemStatus} />
          </div>

          {/* Quantum walk attack propagation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-5 space-y-3"
            style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(255,34,68,0.1)' }}
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono tracking-widest" style={{ color: '#ff2244' }}>
                QUANTUM WALK ATTACK PROPAGATION
              </div>
              <span className="text-[9px] font-mono" style={{ color: '#3a5070' }}>
                {attackType !== 'none' ? `${attackType.toUpperCase()} PATTERN` : 'IDLE'}
              </span>
            </div>
            <QuantumWalkViz
              probabilities={walkProbs}
              attackType={attackType === 'none' ? 'normal' : attackType}
              isAnimating={attackType !== 'none'}
            />
            <div className="text-[10px] font-mono" style={{ color: '#3a5070' }}>
              {attackType === 'jamming'
                ? 'High-entropy noise disrupts quantum walk probability distribution across all positions'
                : attackType === 'spoofing'
                ? 'Biased quantum walk mimics legitimate signal patterns with spoofed phase relationships'
                : 'Nominal Hadamard coin walk — no attack propagation detected'}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
