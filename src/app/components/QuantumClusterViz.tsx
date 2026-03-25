import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface QuantumClusterVizProps {
  clusterLabel: string;
  kernelScores: Record<string, number>;
  confidence?: number;
}

export function QuantumClusterViz({
  clusterLabel,
  kernelScores,
  confidence = 0.85
}: QuantumClusterVizProps) {
  // Prepare radar chart data
  const radarData = Object.entries(kernelScores).map(([label, score]) => ({
    cluster: label.charAt(0).toUpperCase() + label.slice(1),
    kernel: Math.round(score * 100)
  }));

  // Get color based on cluster
  const clusterColors: Record<string, string> = {
    normal: '#10b981',
    jamming: '#ef4444',
    spoofing: '#f59e0b'
  };

  const clusterColor = clusterColors[clusterLabel] || '#6b7280';

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-100">Quantum Clustering Result</h3>
        <span className="text-xs px-3 py-1 rounded border font-semibold text-white" style={{ backgroundColor: clusterColor, borderColor: clusterColor + '50' }}>
          {clusterLabel.toUpperCase()}
          <span className="ml-2 opacity-75">{(confidence * 100).toFixed(0)}%</span>
        </span>
      </div>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#404856" />
          <PolarAngleAxis dataKey="cluster" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
          <Radar
            name="Quantum Kernel Overlap (%)"
            dataKey="kernel"
            stroke={clusterColor}
            fill={clusterColor}
            fillOpacity={0.6}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Kernel Scores Table */}
      <div className="border-t border-gray-700/50 pt-4">
        <h4 className="text-sm font-semibold mb-3 text-gray-200">Kernel Distance Matrix</h4>
        <div className="space-y-2">
          {Object.entries(kernelScores).map(([label, score]) => {
            const isPredicted = label === clusterLabel;
            return (
              <div
                key={label}
                className={`flex items-center justify-between p-2 rounded ${
                  isPredicted
                    ? 'bg-cyan-600/20 border border-cyan-500/30'
                    : 'bg-gray-700/30 border border-gray-600/30'
                }`}
              >
                <span className={`font-medium capitalize ${isPredicted ? 'text-cyan-400' : 'text-gray-300'}`}>{label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded h-2">
                    <div
                      className={`h-2 rounded ${
                        isPredicted ? 'bg-cyan-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm w-10 text-gray-300">
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-700/30 border border-gray-600/50 p-3 rounded text-xs text-gray-300">
        <p className="font-semibold mb-1 text-gray-200">Quantum Kernel:</p>
        <p className="text-gray-400">
          K(ψ_observed, ψ_reference) = |⟨ψ_observed|ψ_reference⟩|²
        </p>
        <p className="mt-1 text-gray-400">
          Higher overlap means more similar quantum states. Classification chooses
          the reference state with highest kernel value.
        </p>
      </div>
    </div>
  );
}
