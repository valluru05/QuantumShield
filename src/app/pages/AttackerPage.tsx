import { Link } from 'react-router';
import { Zap, AlertTriangle, ArrowLeft, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { useSystem } from '../context/SystemContext';
import { SignalChart } from '../components/SignalChart';
import { ConnectionStatus } from '../components/ConnectionStatus';

export function AttackerPage() {
  const { attackType, systemStatus, isProcessing, launchAttack } = useSystem();

  const getAttackStatus = () => {
    if (systemStatus === 'normal') return 'Standing by...';
    if (systemStatus === 'under-attack') return 'Attack in progress...';
    if (systemStatus === 'processing') return 'Defender analyzing...';
    if (systemStatus === 'detected') return 'Attack detected by defender!';
    if (systemStatus === 'switching') return 'Defender switching channels...';
    if (systemStatus === 'secure') return 'Attack mitigated - Secure channel active';
    return 'Ready';
  };

  const getStatusColor = () => {
    if (systemStatus === 'normal') return 'text-gray-400';
    if (systemStatus === 'under-attack') return 'text-red-500';
    if (systemStatus === 'detected') return 'text-yellow-500';
    if (systemStatus === 'secure') return 'text-cyan-500';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e] text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Attacker Console</h1>
                  <p className="text-xs text-gray-400">Electronic Warfare Operations</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ConnectionStatus />
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className={`w-2 h-2 rounded-full ${systemStatus === 'under-attack' ? 'bg-red-500' : 'bg-gray-500'} animate-pulse`}></div>
                <span className="text-sm font-medium">Attack Mode</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Attack Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Attack Arsenal */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-300 mb-1">Attack Arsenal</h2>
                <p className="text-xs text-gray-500">Launch electronic warfare operations</p>
              </div>

              <div className="space-y-4">
                {/* Jamming Attack Button */}
                <motion.button
                  onClick={() => launchAttack('jamming')}
                  disabled={isProcessing}
                  className="w-full group relative overflow-hidden rounded-lg border-2 border-red-500/50 bg-red-500/10 p-6 transition-all hover:bg-red-500/20 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-base font-bold text-red-500 mb-1">Jamming Attack</h3>
                      <p className="text-xs text-gray-400">High-power interference</p>
                    </div>
                  </div>
                  
                  {!isProcessing && (
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
                  onClick={() => launchAttack('spoofing')}
                  disabled={isProcessing}
                  className="w-full group relative overflow-hidden rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 p-6 transition-all hover:bg-yellow-500/20 hover:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-base font-bold text-yellow-500 mb-1">Spoofing Attack</h3>
                      <p className="text-xs text-gray-400">Signal manipulation</p>
                    </div>
                  </div>

                  {!isProcessing && (
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
            </div>

            {/* Attack Status */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-300 mb-1">Operation Status</h2>
                <p className="text-xs text-gray-500">Current attack state</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`text-xs font-bold ${getStatusColor()}`}>
                    {getAttackStatus()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-xs text-gray-500">Active Attack</span>
                  <span className="text-xs font-bold text-gray-300">
                    {attackType === 'none' ? 'None' : attackType === 'jamming' ? 'Jamming' : 'Spoofing'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-xs text-gray-500">Target</span>
                  <span className="text-xs font-bold text-gray-300">
                    Drone-Command Link
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Effectiveness</span>
                  <span className="text-xs font-bold text-red-500">
                    {systemStatus === 'secure' ? '0%' : attackType !== 'none' ? '87%' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Signal Monitoring */}
          <div className="lg:col-span-2 space-y-6">
            {/* Target Communication */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-300">Target Communication Link</h2>
                <span className="text-xs text-gray-500 font-mono">UAV_ALPHA ↔ CMD_OMEGA</span>
              </div>

              <div className={`p-4 rounded-lg border-2 mb-6 ${
                systemStatus === 'secure' 
                  ? 'bg-cyan-500/10 border-cyan-500/50' 
                  : attackType !== 'none'
                  ? 'bg-red-500/10 border-red-500/50'
                  : 'bg-green-500/10 border-green-500/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${
                      systemStatus === 'secure' 
                        ? 'text-cyan-500' 
                        : attackType !== 'none'
                        ? 'text-red-500'
                        : 'text-green-500'
                    }`}>
                      {systemStatus === 'secure' ? 'ENCRYPTED CHANNEL' : attackType !== 'none' ? 'COMPROMISED' : 'VULNERABLE'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {systemStatus === 'secure' 
                        ? 'Target has activated quantum defense' 
                        : attackType !== 'none'
                        ? 'Attack is affecting target communication'
                        : 'Target is using standard encryption'}
                    </p>
                  </div>
                  <Activity className={`w-8 h-8 ${
                    systemStatus === 'secure' 
                      ? 'text-cyan-500' 
                      : attackType !== 'none'
                      ? 'text-red-500'
                      : 'text-green-500'
                  }`} />
                </div>
              </div>
            </div>

            {/* Signal Visualization */}
            <SignalChart 
              attackType={attackType}
              systemStatus={systemStatus}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
