import { Link } from 'react-router';
import { Shield, ArrowLeft, Brain, Lock, Zap, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { useSystem } from '../context/SystemContext';
import { CommunicationPanel } from '../components/CommunicationPanel';
import { SignalChart } from '../components/SignalChart';
import { DetectionPanel } from '../components/DetectionPanel';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { QuantumMLPanel } from '../components/QuantumMLPanel';
import { QSDCPanel } from '../components/QSDCPanel';
import { PQCPanel } from '../components/PQCPanel';
import { AIThreatIntelligence } from '../components/AIThreatIntelligence';

export function DefenderPage() {
  const {
    attackType,
    systemStatus,
    mlConfidence,
    mlResponseTimeMs,
    jammingAccuracy,
    modelAccuracy,
    modelF1,
    modelValidationAccuracy,
    activateSecureChannel,
  } = useSystem();

  const statusColor =
    systemStatus === 'normal' ? '#00ff88' :
    systemStatus === 'secure' ? '#00f5ff' :
    systemStatus === 'under-attack' || systemStatus === 'detected' ? '#ff2244' : '#ffaa00';

  const statusText =
    systemStatus === 'normal' ? 'DEFENSE NOMINAL' :
    systemStatus === 'under-attack' ? 'THREAT INCOMING' :
    systemStatus === 'processing' ? 'ANALYZING...' :
    systemStatus === 'detected' ? 'THREAT CLASSIFIED' :
    systemStatus === 'switching' ? 'CHANNEL SWITCHING' :
    systemStatus === 'secure' ? 'QUANTUM SECURED' : 'STANDBY';

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, #060d1a 0%, #020408 60%)' }}
    >
      {/* Top Nav Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(2,4,8,0.96)',
          borderBottom: '1px solid rgba(0,245,255,0.12)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 24px',
        }}
      >
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
          }}
        >
          <ArrowLeft size={11} />
          COMMAND CENTER
        </Link>
        <span style={{ color: '#1a2d45', fontFamily: 'monospace', fontSize: 10 }}>|</span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            color: '#00f5ff',
            fontWeight: 700,
          }}
        >
          DEFENSE CENTER
        </span>
        <div style={{ flex: 1 }} />
        <Link
          to="/attacker"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #ff224433',
            color: '#ff2244',
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            textDecoration: 'none',
          }}
        >
          <Zap size={11} />
          ATTACKER
        </Link>
        <Link
          to="/defender"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #00f5ff66',
            color: '#00f5ff',
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            textDecoration: 'none',
          }}
        >
          <Shield size={11} />
          DEFENDER
        </Link>
        <Link
          to="/quantum-lab"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #8b5cf633',
            color: '#8b5cf6',
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            textDecoration: 'none',
          }}
        >
          <Cpu size={11} />
          QUANTUM LAB
        </Link>
      </div>

      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ background: 'rgba(2,4,8,0.4)', borderColor: 'rgba(0,245,255,0.12)', backdropFilter: 'blur(4px)' }}
      >
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#3a5070' }}>
            <ArrowLeft size={14} />
            COMMAND CENTER
          </Link>
          <div className="flex items-center gap-3">
            <motion.div
              animate={systemStatus === 'secure' ? { boxShadow: ['0 0 10px rgba(0,245,255,0.3)', '0 0 25px rgba(0,245,255,0.7)', '0 0 10px rgba(0,245,255,0.3)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(0,245,255,0.1)',
                border: '1px solid rgba(0,245,255,0.3)',
              }}
            >
              <Shield size={18} style={{ color: '#00f5ff' }} />
            </motion.div>
            <div>
              <div className="text-sm font-black tracking-widest font-mono" style={{ color: '#00f5ff' }}>
                DEFENSE CENTER
              </div>
              <div className="text-[10px]" style={{ color: '#3a5070' }}>Quantum Shield Operations</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectionStatus />
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            animate={attackType !== 'none' ? {
              backgroundColor: ['rgba(255,34,68,0.05)', 'rgba(255,34,68,0.12)', 'rgba(255,34,68,0.05)']
            } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              background: `${statusColor}0a`,
              border: `1px solid ${statusColor}33`,
            }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ background: statusColor }}
            />
            <span className="text-xs font-bold font-mono tracking-widest" style={{ color: statusColor }}>
              {statusText}
            </span>
          </motion.div>
          <div className="text-xs font-mono" style={{ color: '#1a2d45' }}>
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6 space-y-5">
        {/* Top grid: signal + detection + AI */}
        <div className="grid grid-cols-12 gap-5">
          {/* Left: Communication + Signal */}
          <div className="col-span-5 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(0,245,255,0.1)' }}
            >
              <CommunicationPanel attackType={attackType} systemStatus={systemStatus} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <span className="text-[10px] font-mono tracking-widest" style={{ color: '#00f5ff' }}>
                  SIGNAL MONITOR — LIVE WAVEFORM
                </span>
                <div className="flex items-center gap-1.5">
                  <motion.div className="w-1.5 h-1.5 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                    style={{ background: systemStatus !== 'normal' ? '#ff2244' : '#00ff88' }}
                  />
                  <span className="text-[9px] font-mono" style={{ color: systemStatus !== 'normal' ? '#ff2244' : '#00ff88' }}>
                    {systemStatus !== 'normal' ? 'ANOMALY' : 'NOMINAL'}
                  </span>
                </div>
              </div>
              <SignalChart attackType={attackType} systemStatus={systemStatus} />
            </motion.div>
          </div>

          {/* Center: Detection Panel */}
          <div className="col-span-3">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <DetectionPanel
                attackType={attackType}
                systemStatus={systemStatus}
                mlConfidence={mlConfidence}
                mlResponseTimeMs={mlResponseTimeMs}
                jammingAccuracy={jammingAccuracy}
                modelAccuracy={modelAccuracy}
                modelF1={modelF1}
                modelValidationAccuracy={modelValidationAccuracy}
                onActivateSecure={activateSecureChannel}
              />
            </motion.div>
          </div>

          {/* Right: AI Threat Intelligence */}
          <div className="col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AIThreatIntelligence
                attackType={attackType}
                confidence={mlConfidence}
                systemStatus={systemStatus}
              />
            </motion.div>
          </div>
        </div>

        {/* Middle: QSDC + PQC panels */}
        <div className="grid grid-cols-12 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lock size={12} style={{ color: '#00f5ff' }} />
              <span className="text-[10px] font-mono tracking-widest" style={{ color: '#00f5ff' }}>
                QUANTUM SECURE CHANNEL
              </span>
            </div>
            <QSDCPanel isActive={systemStatus === 'secure'} systemStatus={systemStatus} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain size={12} style={{ color: '#8b5cf6' }} />
              <span className="text-[10px] font-mono tracking-widest" style={{ color: '#8b5cf6' }}>
                POST-QUANTUM CRYPTOGRAPHY
              </span>
            </div>
            <PQCPanel isActive />
          </motion.div>
        </div>

        {/* Bottom: Full Quantum ML Pipeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <QuantumMLPanel />
        </motion.div>
      </main>
    </div>
  );
}
