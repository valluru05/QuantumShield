import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Key, Radio, Shield, Zap } from 'lucide-react';

interface QSDCPanelProps {
  isActive?: boolean;
  systemStatus?: string;
}

const PHASES = [
  { id: 'init', label: 'Quantum Channel Init', icon: Radio, color: '#00f5ff', duration: 800 },
  { id: 'keygen', label: 'Quantum Key Generation', icon: Key, color: '#8b5cf6', duration: 700 },
  { id: 'exchange', label: 'Photon Key Exchange', icon: Zap, color: '#ffaa00', duration: 900 },
  { id: 'verify', label: 'Eavesdrop Verification', icon: Shield, color: '#00ff88', duration: 600 },
  { id: 'secure', label: 'Secure Channel Active', icon: Lock, color: '#00f5ff', duration: 0 },
];

interface Packet {
  id: number;
  x: number;
  phase: number;
  color: string;
}

export function QSDCPanel({ isActive = false, systemStatus = 'normal' }: QSDCPanelProps) {
  const [activePhase, setActivePhase] = useState(-1);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [keyBits, setKeyBits] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const activate = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setActivePhase(0);
    setKeyBits('');
    setPackets([]);

    let phase = 0;
    const advance = () => {
      if (phase >= PHASES.length - 1) {
        setIsRunning(false);
        return;
      }
      phase++;
      setActivePhase(phase);
      if (PHASES[phase].duration > 0) setTimeout(advance, PHASES[phase].duration);
    };
    setTimeout(advance, PHASES[0].duration);
  }, []);

  // Auto-activate when systemStatus becomes 'secure'
  useEffect(() => {
    if (systemStatus === 'secure' || isActive) {
      activate();
    }
  }, [activate, systemStatus, isActive]);

  // Animated key bits
  useEffect(() => {
    if (activePhase < 2 || activePhase >= 4) return;
    const interval = setInterval(() => {
      setKeyBits((prev) => {
        const bit = Math.random() > 0.5 ? '1' : '0';
        return (prev + bit).slice(-64);
      });
    }, 60);
    return () => clearInterval(interval);
  }, [activePhase]);

  // Animated tunnel packets
  useEffect(() => {
    if (activePhase < 4) return;
    const interval = setInterval(() => {
      setPackets((prev) => {
        const newPacket: Packet = {
          id: Date.now(),
          x: 0,
          phase: 0,
          color: ['#00f5ff', '#8b5cf6', '#00ff88'][Math.floor(Math.random() * 3)],
        };
        return [...prev.slice(-8), newPacket];
      });
    }, 400);
    return () => clearInterval(interval);
  }, [activePhase]);

  const encStrength = activePhase >= 4 ? 256 : activePhase >= 3 ? 128 : activePhase >= 2 ? 64 : 0;
  const isSecure = activePhase >= 4;

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{
        background: 'rgba(6,13,26,0.85)',
        border: `1px solid ${isSecure ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isSecure ? '0 0 20px rgba(0,245,255,0.1)' : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)' }}
          >
            {isSecure ? (
              <Lock size={16} style={{ color: '#00f5ff' }} />
            ) : (
              <Unlock size={16} style={{ color: '#7a95b8' }} />
            )}
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest font-mono" style={{ color: '#00f5ff' }}>
              QSDC
            </div>
            <div className="text-[10px]" style={{ color: '#3a5070' }}>
              Quantum Secure Direct Communication
            </div>
          </div>
        </div>
        <motion.div
          animate={isSecure ? { scale: [1, 1.05, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-2 py-1 rounded text-[10px] font-mono font-bold"
          style={{
            background: isSecure ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.04)',
            color: isSecure ? '#00f5ff' : '#3a5070',
            border: `1px solid ${isSecure ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          {isSecure ? '🔒 SECURE' : activePhase >= 0 ? '⟳ HANDSHAKING' : '○ STANDBY'}
        </motion.div>
      </div>

      {/* Protocol Phases */}
      <div className="space-y-2">
        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const done = activePhase > i;
          const active = activePhase === i;
          return (
            <motion.div
              key={phase.id}
              className="flex items-center gap-3 p-2 rounded-lg"
              animate={active ? { backgroundColor: ['rgba(0,245,255,0.03)', 'rgba(0,245,255,0.07)', 'rgba(0,245,255,0.03)'] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                background: active ? 'rgba(0,245,255,0.05)' : done ? 'rgba(0,255,136,0.03)' : 'transparent',
                border: `1px solid ${active ? phase.color + '33' : done ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)'}`,
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: done ? 'rgba(0,255,136,0.15)' : active ? `${phase.color}22` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${done ? '#00ff88' : active ? phase.color : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <Icon size={12} style={{ color: done ? '#00ff88' : active ? phase.color : '#3a5070' }} />
              </div>
              <span
                className="text-xs font-mono flex-1"
                style={{ color: done ? '#00ff88' : active ? phase.color : '#3a5070' }}
              >
                {phase.label}
              </span>
              {done && <span className="text-[10px]" style={{ color: '#00ff88' }}>✓</span>}
              {active && (
                <motion.div
                  className="w-3 h-3 rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ background: phase.color }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quantum Key Stream */}
      {keyBits.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono" style={{ color: '#3a5070' }}>QUANTUM KEY STREAM</div>
          <div
            className="font-mono text-[10px] break-all tracking-widest p-2 rounded"
            style={{
              background: 'rgba(0,0,0,0.4)',
              color: '#8b5cf6',
              border: '1px solid rgba(139,92,246,0.15)',
              letterSpacing: '0.15em',
            }}
          >
            {keyBits.match(/.{1,8}/g)?.join(' ') || keyBits}
          </div>
        </div>
      )}

      {/* Secure Tunnel Visualization */}
      {isSecure && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono" style={{ color: '#3a5070' }}>ENCRYPTED TUNNEL</div>
          <div
            className="relative h-10 rounded overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.1)' }}
          >
            {/* Tunnel walls */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, #00f5ff11, #00f5ff44, #00f5ff11)' }} />
            </div>
            <AnimatePresence>
              {packets.map((pkt) => (
                <motion.div
                  key={pkt.id}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  initial={{ left: '0%', opacity: 0 }}
                  animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'linear' }}
                  style={{
                    background: pkt.color,
                    boxShadow: `0 0 8px ${pkt.color}`,
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'ENCRYPTION', value: `${encStrength}-bit`, color: '#00f5ff' },
          { label: 'PROTOCOL', value: 'BB84', color: '#8b5cf6' },
          { label: 'STATUS', value: isSecure ? 'ACTIVE' : activePhase >= 0 ? 'INIT' : 'OFF', color: isSecure ? '#00ff88' : '#ffaa00' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-[9px] font-mono mb-1" style={{ color: '#3a5070' }}>{label}</div>
            <div className="text-xs font-bold font-mono" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Activate Button */}
      {!isRunning && activePhase < 4 && (
        <motion.button
          onClick={activate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 rounded-lg text-xs font-bold font-mono tracking-widest"
          style={{
            background: 'linear-gradient(135deg, rgba(0,245,255,0.1), rgba(139,92,246,0.1))',
            border: '1px solid rgba(0,245,255,0.3)',
            color: '#00f5ff',
          }}
        >
          INITIATE QSDC PROTOCOL
        </motion.button>
      )}
    </div>
  );
}
