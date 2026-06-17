import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Zap, Activity, Cpu, Wifi, Lock, Radio,
  ChevronRight, Globe, AlertTriangle, CheckCircle, Eye
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { ThreatRadar } from '../components/ThreatRadar';
import { BootSequence } from '../components/BootSequence';

const PARTICLE_COUNT = 60;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

const COLORS = ['#00f5ff', '#8b5cf6', '#00ff88', '#ff2244'];

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: (Math.random() - 0.5) * 0.02,
    vy: (Math.random() - 0.5) * 0.02,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

function SystemMetric({
  label, value, unit, color, max = 100
}: {
  label: string; value: number; unit?: string; color: string; max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono tracking-widest" style={{ color: '#3a5070' }}>{label}</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>
          {typeof value === 'number' ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}88`,
          }}
        />
      </div>
    </div>
  );
}

const NAV_TILES = [
  {
    to: '/attacker',
    label: 'ATTACK SIMULATOR',
    sub: 'Electronic Warfare Console',
    icon: Zap,
    color: '#ff2244',
    border: 'rgba(255,34,68,0.25)',
    bg: 'rgba(255,34,68,0.05)',
  },
  {
    to: '/defender',
    label: 'DEFENSE CENTER',
    sub: 'Quantum Shield Operations',
    icon: Shield,
    color: '#00f5ff',
    border: 'rgba(0,245,255,0.25)',
    bg: 'rgba(0,245,255,0.05)',
  },
  {
    to: '/quantum-lab',
    label: 'QUANTUM LAB',
    sub: 'Interactive Visualization',
    icon: Cpu,
    color: '#8b5cf6',
    border: 'rgba(139,92,246,0.25)',
    bg: 'rgba(139,92,246,0.05)',
  },
];

export function CommandCenterPage() {
  const { attackType, systemStatus, mlConfidence, isConnected, modelAccuracy } = useSystem();
  const [bootDone, setBootDone] = useState(false); // always show boot on load, skip via button
  const [particles, setParticles] = useState<Particle[]>(generateParticles);
  const [time, setTime] = useState(new Date());
  const rafRef = useRef<number>(0);
  const particleRef = useRef<Particle[]>(particles);

  // Auto-skip boot if already seen this session
  useEffect(() => {
    if (sessionStorage.getItem('qs_boot') === '1') {
      setBootDone(true);
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem('qs_boot', '1');
    setBootDone(true);
  };

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Particle animation
  useEffect(() => {
    let frameCount = 0;
    const tick = () => {
      particleRef.current = particleRef.current.map((p) => {
        let nx = p.x + p.vx;
        let ny = p.y + p.vy;
        if (nx < 0 || nx > 100) { nx = p.x; p.vx = -p.vx; }
        if (ny < 0 || ny > 100) { ny = p.y; p.vy = -p.vy; }
        return { ...p, x: nx, y: ny };
      });
      frameCount++;
      if (frameCount % 6 === 0) { // ~10fps instead of 60fps
        setParticles([...particleRef.current]);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const threatLevel = attackType !== 'none' ? (mlConfidence ?? 80) : 5;
  const statusText =
    systemStatus === 'normal' ? 'ALL SYSTEMS NOMINAL' :
    systemStatus === 'under-attack' ? 'THREAT DETECTED' :
    systemStatus === 'processing' ? 'ANALYZING THREAT' :
    systemStatus === 'detected' ? 'ATTACK CLASSIFIED' :
    systemStatus === 'switching' ? 'SWITCHING CHANNELS' :
    systemStatus === 'secure' ? 'SECURE CHANNEL ACTIVE' : 'STANDBY';

  const statusColor =
    systemStatus === 'normal' ? '#00ff88' :
    systemStatus === 'secure' ? '#00f5ff' :
    systemStatus === 'under-attack' || systemStatus === 'detected' ? '#ff2244' : '#ffaa00';

  // Generate synthetic threat data for radar
  const radarThreats = attackType !== 'none' ? [
    { id: 'th1', angle: attackType === 'jamming' ? 45 : 130, distance: 0.6, type: attackType as 'jamming' | 'spoofing' },
    { id: 'th2', angle: attackType === 'jamming' ? 220 : 310, distance: 0.4, type: attackType as 'jamming' | 'spoofing' },
  ] : [];

  return (
    <>
      {!bootDone && (
        <div style={{ position: 'relative' }}>
          <BootSequence onComplete={handleBootComplete} />
          {/* Skip button */}
          <button
            onClick={handleBootComplete}
            style={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 99999,
              background: 'rgba(0,245,255,0.1)',
              border: '1px solid rgba(0,245,255,0.4)',
              color: '#00f5ff',
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: '0.15em',
              padding: '8px 18px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            SKIP ▶
          </button>
        </div>
      )}

      <AnimatePresence>
        {bootDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen text-white relative overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 20% 50%, #060d1a 0%, #020408 60%)' }}
          >
            {/* Particle field */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    opacity: p.opacity,
                    boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                    transition: 'left 0.1s, top 0.1s',
                  }}
                />
              ))}
            </div>

            {/* Scan line overlay */}
            <div
              className="fixed inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,245,255,0.008) 2px,rgba(0,245,255,0.008) 4px)',
                zIndex: 1,
              }}
            />

            {/* Main content */}
            <div className="relative z-10">
              {/* Top bar */}
              <header
                className="px-6 py-3 flex items-center justify-between border-b"
                style={{
                  background: 'rgba(2,4,8,0.9)',
                  borderColor: 'rgba(0,245,255,0.1)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ boxShadow: ['0 0 10px rgba(0,245,255,0.3)', '0 0 25px rgba(0,245,255,0.6)', '0 0 10px rgba(0,245,255,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(0,245,255,0.4)' }}
                  >
                    <Shield size={18} style={{ color: '#00f5ff' }} />
                  </motion.div>
                  <div>
                    <div className="text-sm font-black tracking-[0.2em] font-mono" style={{ color: '#00f5ff' }}>
                      QUANTUMSHIELD<span style={{ color: '#8b5cf6' }}>++</span>
                    </div>
                    <div className="text-[9px] tracking-widest font-mono" style={{ color: '#3a5070' }}>
                      QUANTUM CYBER DEFENSE PLATFORM
                    </div>
                  </div>
                </div>

                {/* Center — status */}
                <motion.div
                  animate={attackType !== 'none' ? { backgroundColor: ['rgba(255,34,68,0.05)', 'rgba(255,34,68,0.12)', 'rgba(255,34,68,0.05)'] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg"
                  style={{
                    background: `${statusColor}0a`,
                    border: `1px solid ${statusColor}33`,
                  }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
                  />
                  <span className="text-xs font-bold font-mono tracking-widest" style={{ color: statusColor }}>
                    {statusText}
                  </span>
                </motion.div>

                {/* Right — time + connection */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Wifi size={14} style={{ color: isConnected ? '#00ff88' : '#ff2244' }} />
                    <span className="text-[10px] font-mono" style={{ color: isConnected ? '#00ff88' : '#ff2244' }}>
                      {isConnected ? 'WS LIVE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="text-sm font-mono" style={{ color: '#3a5070' }}>
                    {time.toLocaleTimeString('en-US', { hour12: false })}
                  </div>
                </div>
              </header>

              {/* Main grid */}
              <main className="p-6 grid grid-cols-12 gap-5" style={{ minHeight: 'calc(100vh - 57px)' }}>
                {/* LEFT COL — Threat Radar + System Health */}
                <div className="col-span-3 space-y-5">
                  {/* Radar */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl p-4 relative"
                    style={{
                      background: 'rgba(6,13,26,0.85)',
                      border: '1px solid rgba(0,245,255,0.12)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {/* HUD corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 rounded-tl-lg" style={{ borderColor: 'rgba(0,245,255,0.5)' }} />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 rounded-br-lg" style={{ borderColor: 'rgba(0,245,255,0.5)' }} />

                    <div className="text-[10px] font-mono tracking-widest mb-3 flex items-center gap-2" style={{ color: '#00f5ff' }}>
                      <Radio size={10} />
                      THREAT RADAR
                    </div>
                    <div className="flex justify-center">
                      <ThreatRadar threats={radarThreats} size={220} />
                    </div>
                    <div className="mt-3 flex justify-center gap-5 text-[9px] font-mono">
                      {[
                        { label: 'Jamming',  color: '#ff2244' },
                        { label: 'Spoofing', color: '#ffaa00' },
                        { label: 'Normal',   color: '#00ff88' },
                      ].map(({ label, color }) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
                          <span style={{ color: '#7a95b8' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* System health */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-xl p-4 space-y-3"
                    style={{
                      background: 'rgba(6,13,26,0.85)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="text-[10px] font-mono tracking-widest flex items-center gap-2" style={{ color: '#00f5ff' }}>
                      <Activity size={10} />
                      SYSTEM HEALTH
                    </div>
                    <SystemMetric label="QSVM ACCURACY" value={modelAccuracy ? modelAccuracy * 100 : 94.2} unit="%" color="#00f5ff" />
                    <SystemMetric label="THREAT LEVEL" value={threatLevel} unit="%" color={threatLevel > 50 ? '#ff2244' : '#00ff88'} />
                    <SystemMetric label="QW ENGINE" value={98.5} unit="%" color="#8b5cf6" />
                    <SystemMetric label="CLUSTER ENGINE" value={96.8} unit="%" color="#ffaa00" />
                    <SystemMetric label="WS LATENCY" value={8} unit="ms" color="#00ff88" max={100} />
                  </motion.div>
                </div>

                {/* CENTER COL — Main Status */}
                <div className="col-span-6 space-y-5">
                  {/* Hero status */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-xl p-6 relative overflow-hidden"
                    style={{
                      background: 'rgba(6,13,26,0.85)',
                      border: `1px solid ${statusColor}33`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {/* Background glow */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        background: `radial-gradient(ellipse at 50% 0%, ${statusColor}, transparent 70%)`,
                      }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: '#3a5070' }}>
                            GLOBAL DEFENSE STATUS
                          </div>
                          <motion.div
                            key={statusText}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-black tracking-wider"
                            style={{ color: statusColor, textShadow: `0 0 20px ${statusColor}88` }}
                          >
                            {statusText}
                          </motion.div>
                        </div>
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            background: `${statusColor}11`,
                            border: `2px solid ${statusColor}55`,
                            boxShadow: `0 0 20px ${statusColor}33`,
                          }}
                        >
                          {attackType !== 'none' ? (
                            <AlertTriangle size={28} style={{ color: statusColor }} />
                          ) : systemStatus === 'secure' ? (
                            <Lock size={28} style={{ color: statusColor }} />
                          ) : (
                            <CheckCircle size={28} style={{ color: statusColor }} />
                          )}
                        </div>
                      </div>

                      {/* Attack type indicator */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'ATTACK TYPE', value: attackType === 'none' ? 'NONE DETECTED' : attackType.toUpperCase(), color: attackType !== 'none' ? '#ff2244' : '#00ff88' },
                          { label: 'ML CONFIDENCE', value: mlConfidence ? `${Math.round(mlConfidence)}%` : 'N/A', color: '#00f5ff' },
                          { label: 'DEFENSE MODE', value: systemStatus === 'secure' ? 'QUANTUM' : 'ACTIVE', color: '#8b5cf6' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="text-[9px] font-mono mb-1" style={{ color: '#3a5070' }}>{label}</div>
                            <div className="text-sm font-bold font-mono" style={{ color }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Navigation tiles */}
                  <div className="grid grid-cols-3 gap-4">
                    {NAV_TILES.map((tile, i) => {
                      const Icon = tile.icon;
                      return (
                        <motion.div
                          key={tile.to}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <Link to={tile.to}>
                            <motion.div
                              whileHover={{ scale: 1.03, y: -3 }}
                              whileTap={{ scale: 0.97 }}
                              className="relative p-5 rounded-xl overflow-hidden cursor-pointer group"
                              style={{
                                background: tile.bg,
                                border: `1px solid ${tile.border}`,
                                backdropFilter: 'blur(10px)',
                              }}
                            >
                              {/* Shimmer */}
                              <motion.div
                                className="absolute inset-0"
                                style={{
                                  background: `linear-gradient(90deg, transparent, ${tile.color}15, transparent)`,
                                  backgroundSize: '200% 100%',
                                }}
                                animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: i * 1 }}
                              />

                              <div className="relative z-10">
                                <div
                                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                                  style={{ background: `${tile.color}15`, border: `1px solid ${tile.color}44` }}
                                >
                                  <Icon size={22} style={{ color: tile.color }} />
                                </div>
                                <div className="text-xs font-bold font-mono tracking-wider" style={{ color: tile.color }}>
                                  {tile.label}
                                </div>
                                <div className="text-[10px] mt-1" style={{ color: '#3a5070' }}>
                                  {tile.sub}
                                </div>
                                <div className="flex items-center gap-1 mt-3 text-[10px] font-mono" style={{ color: tile.color + 'aa' }}>
                                  ENTER <ChevronRight size={10} />
                                </div>
                              </div>
                            </motion.div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Live event log */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(6,13,26,0.85)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="text-[10px] font-mono tracking-widest mb-3 flex items-center gap-2" style={{ color: '#00f5ff' }}>
                      <Eye size={10} />
                      LIVE EVENT LOG
                    </div>
                    <div className="space-y-1.5 font-mono text-[10px]" style={{ color: '#3a5070' }}>
                      {[
                        { time: new Date(Date.now() - 3000).toLocaleTimeString('en-US', { hour12: false }), msg: 'Quantum Walk engine running — 16 positions, 8 steps', color: '#00f5ff' },
                        { time: new Date(Date.now() - 8000).toLocaleTimeString('en-US', { hour12: false }), msg: `System status: ${systemStatus.toUpperCase()}`, color: statusColor },
                        { time: new Date(Date.now() - 15000).toLocaleTimeString('en-US', { hour12: false }), msg: 'QSVM model loaded — accuracy 94.2%', color: '#8b5cf6' },
                        { time: new Date(Date.now() - 30000).toLocaleTimeString('en-US', { hour12: false }), msg: 'WebSocket connection established', color: '#00ff88' },
                        { time: new Date(Date.now() - 60000).toLocaleTimeString('en-US', { hour12: false }), msg: 'QuantumShield++ initialized — all modules nominal', color: '#00f5ff' },
                      ].map((event, i) => (
                        <div key={i} className="flex gap-3">
                          <span style={{ color: '#1a2d45' }}>[{event.time}]</span>
                          <span style={{ color: event.color + 'cc' }}>{event.msg}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* RIGHT COL — Quantum engine status */}
                <div className="col-span-3 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-xl p-4 space-y-3"
                    style={{
                      background: 'rgba(6,13,26,0.85)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="text-[10px] font-mono tracking-widest flex items-center gap-2" style={{ color: '#8b5cf6' }}>
                      <Cpu size={10} />
                      QUANTUM ENGINE STATUS
                    </div>
                    {[
                      { label: 'Quantum Walk', status: 'ONLINE', color: '#00f5ff' },
                      { label: 'Gate Encoding', status: 'ONLINE', color: '#00f5ff' },
                      { label: 'Q-Clustering', status: 'ONLINE', color: '#00ff88' },
                      { label: '2-Qubit QSVM', status: 'TRAINED', color: '#00ff88' },
                      { label: 'QSDC Protocol', status: systemStatus === 'secure' ? 'ACTIVE' : 'STANDBY', color: systemStatus === 'secure' ? '#00f5ff' : '#3a5070' },
                      { label: 'PQC Layer', status: 'ACTIVE', color: '#8b5cf6' },
                      { label: 'AI Threat Intel', status: 'ACTIVE', color: '#ffaa00' },
                    ].map(({ label, status, color }, i) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <span className="text-[11px]" style={{ color: '#7a95b8' }}>{label}</span>
                        <div className="flex items-center gap-1.5">
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full"
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.22 }}
                            style={{ background: color }}
                          />
                          <span className="text-[10px] font-mono" style={{ color }}>{status}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  {/* AI Status */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl p-4 space-y-3"
                    style={{
                      background: 'rgba(6,13,26,0.85)',
                      border: '1px solid rgba(255,170,0,0.15)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="text-[10px] font-mono tracking-widest flex items-center gap-2" style={{ color: '#ffaa00' }}>
                      <Globe size={10} />
                      AI THREAT FORECAST
                    </div>
                    <div className="space-y-2">
                      {[
                        { threat: 'Jamming Attack', probability: 23, color: '#ff2244' },
                        { threat: 'Spoofing Attempt', probability: 15, color: '#ffaa00' },
                        { threat: 'Hybrid Attack', probability: 8, color: '#8b5cf6' },
                      ].map(({ threat, probability, color }) => (
                        <div key={threat} className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span style={{ color: '#7a95b8' }}>{threat}</span>
                            <span className="font-mono" style={{ color }}>{probability}%</span>
                          </div>
                          <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <motion.div
                              className="h-full rounded-full"
                              animate={{ width: `${probability}%` }}
                              transition={{ duration: 1.5, ease: 'easeOut' }}
                              style={{ background: color, opacity: 0.7 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] font-mono p-2 rounded" style={{ background: 'rgba(255,170,0,0.06)', color: '#ffaa00aa', border: '1px solid rgba(255,170,0,0.1)' }}>
                      ⚡ AI: Low threat probability. Maintain standard protocols.
                    </div>
                  </motion.div>
                </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FIXED BOTTOM NAV BAR — always visible ── */}
      {bootDone && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'rgba(2,4,8,0.95)',
            borderTop: '1px solid rgba(0,245,255,0.15)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '10px 24px',
          }}
        >
          <span style={{ color: '#1a3050', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', marginRight: 8 }}>
            NAVIGATE →
          </span>

          {/* Attacker Dashboard */}
          <Link to="/attacker">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 8,
                background: 'rgba(255,34,68,0.08)',
                border: '1px solid rgba(255,34,68,0.35)',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(255,34,68,0.15)',
              }}
            >
              <Zap size={14} style={{ color: '#ff2244' }} />
              <span style={{ color: '#ff2244', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
                ATTACKER DASHBOARD
              </span>
            </motion.div>
          </Link>

          {/* Defender Dashboard */}
          <Link to="/defender">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 8,
                background: 'rgba(0,245,255,0.08)',
                border: '1px solid rgba(0,245,255,0.35)',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(0,245,255,0.15)',
              }}
            >
              <Shield size={14} style={{ color: '#00f5ff' }} />
              <span style={{ color: '#00f5ff', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
                DEFENDER DASHBOARD
              </span>
            </motion.div>
          </Link>

          {/* Quantum Lab */}
          <Link to="/quantum-lab">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 8,
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.35)',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(139,92,246,0.15)',
              }}
            >
              <Cpu size={14} style={{ color: '#8b5cf6' }} />
              <span style={{ color: '#8b5cf6', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
                QUANTUM LAB
              </span>
            </motion.div>
          </Link>
        </div>
      )}
    </>
  );
}
