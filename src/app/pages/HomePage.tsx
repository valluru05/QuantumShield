import { Link } from 'react-router';
import { Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e] text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-3xl font-bold">Q</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">QuantumShield</h1>
          </div>
          <p className="text-xl text-gray-400">Defense-Tech Communication System</p>
          <p className="text-sm text-gray-500 mt-2">Electronic Warfare Simulation & Defense Platform</p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Attacker Role */}
          <Link to="/attacker">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-8 rounded-xl border-2 border-red-500/50 bg-gradient-to-br from-red-500/10 to-red-900/10 backdrop-blur-sm cursor-pointer group overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-red-500 mb-3 text-center">Attacker</h2>
                <p className="text-gray-400 text-center mb-6">
                  Launch electronic warfare attacks and test defense mechanisms
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    Simulate jamming attacks
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    Execute spoofing operations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    Monitor attack effectiveness
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    View signal interference
                  </li>
                </ul>
                <div className="mt-6 text-center">
                  <span className="text-red-500 font-semibold group-hover:underline">
                    Enter Attacker Console →
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Defender Role */}
          <Link to="/defender">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-8 rounded-xl border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-900/10 backdrop-blur-sm cursor-pointer group overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 1.5,
                }}
              />
              
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-cyan-500" />
                </div>
                <h2 className="text-2xl font-bold text-cyan-500 mb-3 text-center">Defender</h2>
                <p className="text-gray-400 text-center mb-6">
                  Detect threats and activate quantum-secured communication
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                    Real-time threat detection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                    Quantum ML analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                    Activate secure channels
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                    Monitor defense systems
                  </li>
                </ul>
                <div className="mt-6 text-center">
                  <span className="text-cyan-500 font-semibold group-hover:underline">
                    Enter Defense Console →
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Info */}
        <div className="mt-12 text-center">
          <div className="inline-block p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-gray-400">
              <span className="text-blue-400 font-semibold">Demo Mode:</span> Open two browser windows to simulate attacker and defender simultaneously
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
