import { Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface AttackControlsProps {
  onAttack: (type: 'jamming' | 'spoofing') => void;
  disabled: boolean;
}

export function AttackControls({ onAttack, disabled }: AttackControlsProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-300 mb-1">Attack Simulation</h2>
        <p className="text-xs text-gray-500">Test defense mechanisms against electronic warfare</p>
      </div>

      <div className="space-y-4">
        {/* Jamming Attack Button */}
        <motion.button
          onClick={() => onAttack('jamming')}
          disabled={disabled}
          className="w-full group relative overflow-hidden rounded-lg border-2 border-red-500/50 bg-red-500/10 p-6 transition-all hover:bg-red-500/20 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-base font-bold text-red-500 mb-1">Jamming Attack</h3>
              <p className="text-xs text-gray-400">High-power interference signal injection</p>
            </div>
          </div>
          
          {!disabled && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.button>

        {/* Spoofing Attack Button */}
        <motion.button
          onClick={() => onAttack('spoofing')}
          disabled={disabled}
          className="w-full group relative overflow-hidden rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 p-6 transition-all hover:bg-yellow-500/20 hover:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-base font-bold text-yellow-500 mb-1">Spoofing Attack</h3>
              <p className="text-xs text-gray-400">GPS/Signal manipulation and deception</p>
            </div>
          </div>

          {!disabled && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
                delay: 1
              }}
            />
          )}
        </motion.button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-500 text-xs">i</span>
          </div>
          <div className="text-xs text-gray-400 leading-relaxed">
            <p className="font-semibold text-blue-400 mb-1">Defense Testing Mode</p>
            <p>Simulates real-world electronic warfare scenarios. The system will automatically detect and respond to threats using Quantum ML algorithms.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
