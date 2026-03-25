import { Link } from 'react-router';
import { Shield, ArrowLeft } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { CommunicationPanel } from '../components/CommunicationPanel';
import { SignalChart } from '../components/SignalChart';
import { DetectionPanel } from '../components/DetectionPanel';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { QuantumMLPanel } from '../components/QuantumMLPanel';

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
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Defender Console</h1>
                  <p className="text-xs text-gray-400">Defense Command & Control</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ConnectionStatus />
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className={`w-2 h-2 rounded-full ${systemStatus === 'normal' || systemStatus === 'secure' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium">Defense Active</span>
              </div>
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Top Section - 3 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Communication & Signal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Communication Panel */}
              <CommunicationPanel 
                attackType={attackType} 
                systemStatus={systemStatus}
              />

              {/* Signal Visualization */}
              <SignalChart 
                attackType={attackType}
                systemStatus={systemStatus}
              />
            </div>

            {/* Right Column - Detection & Response */}
            <div className="space-y-6">
              {/* Detection Panel */}
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
            </div>
          </div>

          {/* Bottom Section - Full Width Quantum ML Panel */}
          <QuantumMLPanel />
        </div>
      </main>
    </div>
  );
}
