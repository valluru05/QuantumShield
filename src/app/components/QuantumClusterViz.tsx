import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';

interface QuantumClusterVizProps {
  clusterLabel: string;
  kernelScores: Record<string, number>;
  confidence?: number;
}

// Cluster colors
const CLUSTER_CONFIG: Record<string, { color: string; bgColor: string; icon: string }> = {
  normal: { color: '#10B981', bgColor: '#10B98120', icon: '✓' },
  jamming: { color: '#EF4444', bgColor: '#EF444420', icon: '⚡' },
  spoofing: { color: '#F59E0B', bgColor: '#F59E0B20', icon: '⚠' }
};

export function QuantumClusterViz({
  clusterLabel,
  kernelScores,
  confidence = 0  // Default to 0 if not provided
}: QuantumClusterVizProps) {
  // If confidence is 0 or not provided, use the kernel score of the predicted cluster
  const actualConfidence = confidence > 0 ? confidence : (kernelScores[clusterLabel] || 0);
  // Prepare radar chart data
  const radarData = Object.entries(kernelScores).map(([label, score]) => ({
    cluster: label.charAt(0).toUpperCase() + label.slice(1),
    kernel: Math.round(score * 100),
    fullMark: 100
  }));

  const config = CLUSTER_CONFIG[clusterLabel] || { color: '#6B7280', bgColor: '#6B728020', icon: '?' };
  const sortedScores = Object.entries(kernelScores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-100">Quantum Kernel Clustering</h3>
        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 font-mono">
          3 clusters
        </span>
      </div>

      {/* Classification Result Banner */}
      <div
        className="rounded-lg p-4 border-2 flex items-center justify-between"
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.color + '60'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: config.color + '30' }}
          >
            {config.icon}
          </div>
          <div>
            <p className="text-sm text-gray-400">Classification Result</p>
            <p className="text-xl font-bold uppercase" style={{ color: config.color }}>
              {clusterLabel}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Confidence</p>
          <p className="text-2xl font-bold" style={{ color: config.color }}>
            {(actualConfidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Main Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="bg-[#1a1f2e] rounded-lg p-4 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-2 font-semibold">Kernel Similarity Radar</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#2a3040" />
              <PolarAngleAxis
                dataKey="cluster"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={{ stroke: '#4B5563' }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fill: '#6B7280', fontSize: 9 }}
                axisLine={{ stroke: '#3a4050' }}
                tickCount={5}
              />
              <Radar
                name="Kernel Score"
                dataKey="kernel"
                stroke={config.color}
                fill={config.color}
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Kernel Distance Visualization */}
        <div className="bg-[#1a1f2e] rounded-lg p-4 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-3 font-semibold">Quantum State Overlap</p>
          <div className="space-y-3">
            {sortedScores.map(([label, score], index) => {
              const isPredicted = label === clusterLabel;
              const labelConfig = CLUSTER_CONFIG[label] || { color: '#6B7280' };
              const barWidth = Math.max(5, score * 100);

              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isPredicted && (
                        <span className="text-xs text-cyan-400">▶</span>
                      )}
                      <span
                        className={`text-sm font-medium capitalize ${
                          isPredicted ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    <span
                      className="text-sm font-mono font-bold"
                      style={{ color: isPredicted ? config.color : '#6B7280' }}
                    >
                      {(score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: isPredicted ? config.color : '#4B5563',
                        boxShadow: isPredicted ? `0 0 10px ${config.color}50` : 'none'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kernel Matrix Visualization */}
      <div className="bg-gray-900/70 rounded-lg border border-gray-700/50 overflow-hidden">
        <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Quantum Kernel Matrix</span>
          <span className="text-xs text-gray-500 font-mono">K(ψ,φ) = |⟨ψ|φ⟩|²</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {/* Header row */}
            <div></div>
            {Object.keys(kernelScores).map((label) => (
              <div
                key={`h-${label}`}
                className="font-semibold text-gray-400 capitalize py-2"
              >
                {label}
              </div>
            ))}

            {/* Data row */}
            <div className="font-semibold text-cyan-400 py-2 text-left">Input</div>
            {Object.entries(kernelScores).map(([label, score]) => {
              const isPredicted = label === clusterLabel;
              const intensity = Math.round(score * 255);
              const bgColor = isPredicted
                ? `rgba(${config.color === '#EF4444' ? '239,68,68' : config.color === '#10B981' ? '16,185,129' : '245,158,11'},${score * 0.5})`
                : `rgba(107,114,128,${score * 0.3})`;

              return (
                <div
                  key={label}
                  className={`py-2 rounded font-mono font-bold ${
                    isPredicted ? 'border border-white/20' : ''
                  }`}
                  style={{ backgroundColor: bgColor, color: isPredicted ? 'white' : '#9CA3AF' }}
                >
                  {(score * 100).toFixed(0)}%
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-3">
        <p className="text-xs font-semibold text-purple-400 mb-1">How Quantum Clustering Works:</p>
        <p className="text-xs text-gray-400">
          The input signal's quantum state |ψ⟩ is compared to reference states using the quantum kernel
          K(ψ₁,ψ₂) = |⟨ψ₁|ψ₂⟩|². The highest kernel value indicates the most similar cluster.
          {clusterLabel === 'normal' && ' The signal matches normal communication patterns.'}
          {clusterLabel === 'jamming' && ' High noise entropy detected - possible interference attack.'}
          {clusterLabel === 'spoofing' && ' Frequency anomaly detected - possible signal manipulation.'}
        </p>
      </div>
    </div>
  );
}
