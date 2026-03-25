import { Shield, AlertCircle, CheckCircle, Cpu, Lock, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

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

export function DetectionPanel({ attackType, systemStatus, mlConfidence, mlResponseTimeMs, jammingAccuracy, modelAccuracy, modelF1, modelValidationAccuracy, onActivateSecure }: DetectionPanelProps) {
  const metricBarWidth = (value: number | null) => {
    if (value === null || Number.isNaN(value)) {
      return 0;
    }
    return Math.max(0, Math.min(100, value * 100));
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-300 mb-1">Attack Classification</h2>
        <p className="text-xs text-gray-500">Quantum ML threat detection & response</p>
      </div>

      <div className="space-y-4">
        {/* Detection Status */}
        <div className={`p-4 rounded-lg border-2 transition-all ${
          systemStatus === 'normal' 
            ? 'bg-green-500/10 border-green-500/50' 
            : systemStatus === 'secure'
            ? 'bg-cyan-500/10 border-cyan-500/50'
            : systemStatus === 'detected'
            ? 'bg-red-500/10 border-red-500/50 animate-pulse'
            : 'bg-red-500/10 border-red-500/50'
        }`}>
          <div className="flex items-center gap-3">
            {systemStatus === 'normal' && (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-bold text-green-500">Normal Signal ✅</p>
                  <p className="text-xs text-gray-400 mt-0.5">No threats detected</p>
                </div>
              </>
            )}
            {systemStatus === 'under-attack' && attackType === 'jamming' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </motion.div>
                <div>
                  <p className="font-bold text-red-500">Jamming Detected 🚨</p>
                  <p className="text-xs text-gray-400 mt-0.5">High interference levels</p>
                </div>
              </>
            )}
            {systemStatus === 'under-attack' && attackType === 'spoofing' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                </motion.div>
                <div>
                  <p className="font-bold text-yellow-500">Spoofing Detected ⚠️</p>
                  <p className="text-xs text-gray-400 mt-0.5">Signal manipulation attempt</p>
                </div>
              </>
            )}
            {systemStatus === 'detected' && attackType === 'jamming' && (
              <>
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-bold text-red-500">Jamming Confirmed 🚨</p>
                  <p className="text-xs text-gray-400 mt-0.5">Threat verified - Action required</p>
                </div>
              </>
            )}
            {systemStatus === 'detected' && attackType === 'spoofing' && (
              <>
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-bold text-yellow-500">Spoofing Confirmed ⚠️</p>
                  <p className="text-xs text-gray-400 mt-0.5">Threat verified - Action required</p>
                </div>
              </>
            )}
            {systemStatus === 'secure' && (
              <>
                <Lock className="w-6 h-6 text-cyan-500" />
                <div>
                  <p className="font-bold text-cyan-500">Secure Channel Active 🔐</p>
                  <p className="text-xs text-gray-400 mt-0.5">Quantum encryption enabled</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quantum ML Processing */}
        {(systemStatus === 'processing' || systemStatus === 'switching') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-purple-500/10 border border-purple-500/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Cpu className="w-6 h-6 text-purple-500" />
              </motion.div>
              <div className="flex-1">
                <p className="font-bold text-purple-500">
                  {systemStatus === 'processing' ? 'Quantum ML Processing...' : 'Switching to Secure Channel 🔐'}
                </p>
                <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
                  <motion.div
                    className="h-full bg-purple-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: systemStatus === 'processing' ? 2 : 1.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activate Secure Channel Button */}
        {systemStatus === 'detected' && (
          <motion.button
            onClick={onActivateSecure}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500 rounded-lg text-cyan-500 font-bold text-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="relative z-10 flex items-center justify-center gap-3">
              <Lock className="w-6 h-6" />
              <span>Activate Secure Channel</span>
            </div>
          </motion.button>
        )}

        {/* Quantum ML Metrics */}
        <div className="p-4 bg-gray-900/40 border border-gray-700/60 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <p className="text-xs font-semibold text-cyan-400">Quantum ML Metrics</p>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <span className="text-xs text-gray-400">Jamming Accuracy</span>
              <span className="text-xs font-bold text-red-400">
                {jammingAccuracy !== null ? `${jammingAccuracy.toFixed(1)}%` : '0.0%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, jammingAccuracy ?? 0))}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <span className="text-xs text-gray-400">Model Accuracy</span>
              <span className="text-xs font-bold text-cyan-400">
                {modelAccuracy !== null ? `${(modelAccuracy * 100).toFixed(2)}%` : '0.0%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${metricBarWidth(modelAccuracy)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] items-center gap-3 pt-1">
              <span className="text-xs text-gray-400">Model F1</span>
              <span className="text-xs font-bold text-cyan-400">
                {modelF1 !== null ? `${(modelF1 * 100).toFixed(2)}%` : '0.0%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${metricBarWidth(modelF1)}%` }}
                transition={{ duration: 0.5, delay: 0.05 }}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] items-center gap-3 pt-1">
              <span className="text-xs text-gray-400">Validation Accuracy</span>
              <span className="text-xs font-bold text-cyan-400">
                {modelValidationAccuracy !== null ? `${(modelValidationAccuracy * 100).toFixed(2)}%` : '0.0%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${metricBarWidth(modelValidationAccuracy)}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </div>
          </div>
        </div>

        {/* Threat Analysis Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-xs text-gray-500">Threat Level</span>
            <span className={`text-xs font-bold ${
              attackType === 'none' ? 'text-green-500' : attackType === 'jamming' ? 'text-red-500' : 'text-yellow-500'
            }`}>
              {attackType === 'none' ? 'NONE' : attackType === 'jamming' ? 'CRITICAL' : 'HIGH'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-xs text-gray-500">ML Confidence</span>
            <span className="text-xs font-bold text-cyan-500">
              {`${(mlConfidence ?? 0).toFixed(1)}%`}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-xs text-gray-500">Response Time</span>
            <span className="text-xs font-bold text-cyan-500">
              {`${Math.max(0, Math.round(mlResponseTimeMs ?? 0))}ms`}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-gray-500">Encryption</span>
            <span className="text-xs font-bold text-cyan-500">
              {systemStatus === 'secure' ? 'Post-Quantum AES-256' : 'Standard AES-256'}
            </span>
          </div>
        </div>

        {/* Defense Status */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs font-semibold text-gray-400 mb-3">Active Defense Layers</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-300">Signal Authentication</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-300">Anomaly Detection</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${systemStatus === 'secure' ? 'text-cyan-500' : 'text-gray-600'}`} />
              <span className="text-xs text-gray-300">Quantum Encryption</span>
              <div className={`ml-auto w-2 h-2 rounded-full ${systemStatus === 'secure' ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-300">Auto-Failover</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}