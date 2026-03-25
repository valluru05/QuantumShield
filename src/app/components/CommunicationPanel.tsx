import { Radio, Shield } from 'lucide-react';
import { motion } from 'motion/react';

type AttackType = 'none' | 'jamming' | 'spoofing';
type SystemStatus = 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure';

interface CommunicationPanelProps {
  attackType: AttackType;
  systemStatus: SystemStatus;
}

export function CommunicationPanel({ attackType, systemStatus }: CommunicationPanelProps) {
  const getStatusColor = () => {
    if (systemStatus === 'normal') return '#00ff41';
    if (systemStatus === 'secure') return '#00d4ff';
    if (systemStatus === 'under-attack' || systemStatus === 'detected') return '#ff0040';
    return '#ffd700';
  };

  const getStatusText = () => {
    if (systemStatus === 'normal') return 'Normal Communication';
    if (systemStatus === 'under-attack') return attackType === 'jamming' ? 'Jamming Attack Detected' : 'Spoofing Attack Detected';
    if (systemStatus === 'processing') return 'Analyzing Threat...';
    if (systemStatus === 'detected') return 'Attack Confirmed - Awaiting Response';
    if (systemStatus === 'switching') return 'Switching to Secure Channel...';
    if (systemStatus === 'secure') return 'Secure Quantum Channel Active';
    return 'Normal Communication';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-300">Communication Status</h2>
        <span className="text-xs text-gray-500 font-mono">SECURE_LINK_v2.1</span>
      </div>

      {/* Communication Visualization */}
      <div className="relative h-48 flex items-center justify-between px-8">
        {/* Drone */}
        <motion.div 
          className="flex flex-col items-center gap-3"
          animate={{ 
            y: systemStatus === 'under-attack' ? [0, -5, 0] : 0 
          }}
          transition={{ 
            duration: 0.5, 
            repeat: systemStatus === 'under-attack' ? Infinity : 0,
            repeatType: 'reverse'
          }}
        >
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
              systemStatus === 'normal' || systemStatus === 'secure' 
                ? 'bg-green-500/10 border-green-500' 
                : 'bg-red-500/10 border-red-500'
            }`}>
              <Radio className="w-10 h-10" style={{ color: getStatusColor() }} />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
              style={{ backgroundColor: getStatusColor() }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">UAV Drone</p>
            <p className="text-xs text-gray-500">Field Unit Alpha</p>
          </div>
        </motion.div>

        {/* Signal Line */}
        <div className="flex-1 flex items-center justify-center relative">
          <svg className="w-full h-24" viewBox="0 0 400 100" preserveAspectRatio="none">
            <motion.path
              d={
                systemStatus === 'under-attack' && attackType === 'jamming'
                  ? "M 0 50 Q 50 20, 100 50 T 200 50 T 300 50 T 400 50"
                  : systemStatus === 'under-attack' && attackType === 'spoofing'
                  ? "M 0 50 Q 50 70, 100 50 T 200 50 T 300 50 T 400 50"
                  : "M 0 50 L 400 50"
              }
              fill="none"
              stroke={getStatusColor()}
              strokeWidth="2"
              strokeDasharray={systemStatus === 'under-attack' ? '5,5' : '0'}
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: 1,
                opacity: systemStatus === 'under-attack' ? [1, 0.3, 1] : 1
              }}
              transition={{ 
                pathLength: { duration: 1.5, ease: 'easeInOut' },
                opacity: { duration: 0.5, repeat: systemStatus === 'under-attack' ? Infinity : 0 }
              }}
            />
            
            {/* Animated signal particles */}
            {systemStatus !== 'under-attack' && (
              <>
                <motion.circle
                  cx="0"
                  cy="50"
                  r="3"
                  fill={getStatusColor()}
                  animate={{ cx: [0, 400] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.circle
                  cx="0"
                  cy="50"
                  r="3"
                  fill={getStatusColor()}
                  animate={{ cx: [0, 400] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1 }}
                />
              </>
            )}
          </svg>
          
          {/* Status label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900/90 border rounded text-xs font-mono whitespace-nowrap" 
               style={{ borderColor: getStatusColor(), color: getStatusColor() }}>
            {getStatusText()}
          </div>
        </div>

        {/* Command Center */}
        <motion.div 
          className="flex flex-col items-center gap-3"
          animate={{ 
            scale: systemStatus === 'secure' ? [1, 1.05, 1] : 1
          }}
          transition={{ 
            duration: 1, 
            repeat: systemStatus === 'secure' ? Infinity : 0
          }}
        >
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
              systemStatus === 'secure' 
                ? 'bg-cyan-500/10 border-cyan-500' 
                : 'bg-blue-500/10 border-blue-500'
            }`}>
              <Shield className="w-10 h-10" style={{ color: systemStatus === 'secure' ? '#00d4ff' : '#4a90e2' }} />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Command Center</p>
            <p className="text-xs text-gray-500">Base Station Omega</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}