import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface QuantumStateVizProps {
  stateVector: number[][];
  basisLabels?: string[];
}

// Color palette for basis states
const BASIS_COLORS = ['#06B6D4', '#8B5CF6', '#F59E0B', '#10B981'];

export function QuantumStateViz({
  stateVector,
  basisLabels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩']
}: QuantumStateVizProps) {
  // Calculate probabilities and phases from state vector
  const stateData = stateVector.map(([real, imag], i) => {
    const magnitude = Math.sqrt(real * real + imag * imag);
    const probability = magnitude * magnitude * 100;
    const phase = Math.atan2(imag, real) * (180 / Math.PI);
    return {
      basis: basisLabels[i],
      probability,
      magnitude,
      phase,
      real,
      imag,
      color: BASIS_COLORS[i]
    };
  });

  // Calculate entanglement indicator (von Neumann entropy)
  const entropy = -stateData.reduce((sum, d) => {
    const p = d.probability / 100;
    return sum + (p > 1e-10 ? p * Math.log2(p) : 0);
  }, 0);

  const isEntangled = entropy > 0.5;
  const maxProb = Math.max(...stateData.map(d => d.probability));

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-100">Statevector</h3>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 font-mono">
            4 amplitudes
          </span>
          {isEntangled && (
            <span className="text-xs px-2 py-1 bg-purple-500/30 text-purple-300 rounded border border-purple-500/50">
              Entangled
            </span>
          )}
        </div>
      </div>

      {/* Main Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart (Probabilities) */}
        <div className="bg-[#1a1f2e] rounded-lg p-4 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-3 font-semibold">Probability Distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stateData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" />
              <XAxis
                dataKey="basis"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                axisLine={{ stroke: '#4B5563' }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Probability']}
              />
              <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                {stateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bloch/Q-Sphere Inspired Visual */}
        <div className="bg-[#1a1f2e] rounded-lg p-4 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-3 font-semibold">State Amplitudes</p>
          <div className="relative flex items-center justify-center h-[180px]">
            {/* Circular visualization */}
            <svg width="180" height="180" viewBox="0 0 180 180" className="overflow-visible">
              {/* Background circles */}
              <circle cx="90" cy="90" r="70" fill="none" stroke="#2a3040" strokeWidth="1" />
              <circle cx="90" cy="90" r="50" fill="none" stroke="#2a3040" strokeWidth="1" strokeDasharray="4" />
              <circle cx="90" cy="90" r="30" fill="none" stroke="#2a3040" strokeWidth="1" strokeDasharray="2" />

              {/* Axis lines */}
              <line x1="20" y1="90" x2="160" y2="90" stroke="#3a4050" strokeWidth="1" />
              <line x1="90" y1="20" x2="90" y2="160" stroke="#3a4050" strokeWidth="1" />

              {/* State amplitude vectors */}
              {stateData.map((state, i) => {
                const angle = (i * 90 - 45) * (Math.PI / 180); // Position at corners
                const radius = 70 * state.magnitude;
                const x = 90 + radius * Math.cos(angle);
                const y = 90 - radius * Math.sin(angle);

                // Label position (outside)
                const labelRadius = 80;
                const labelX = 90 + labelRadius * Math.cos(angle);
                const labelY = 90 - labelRadius * Math.sin(angle);

                return (
                  <g key={i}>
                    {/* Vector line */}
                    <line
                      x1="90"
                      y1="90"
                      x2={x}
                      y2={y}
                      stroke={state.color}
                      strokeWidth="2"
                      opacity={0.8}
                    />
                    {/* Dot at end */}
                    <circle
                      cx={x}
                      cy={y}
                      r={Math.max(4, 8 * state.magnitude)}
                      fill={state.color}
                      stroke="white"
                      strokeWidth="1"
                      style={{ filter: `drop-shadow(0 0 4px ${state.color})` }}
                    />
                    {/* Label */}
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#9CA3AF"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {state.basis}
                    </text>
                  </g>
                );
              })}

              {/* Center point */}
              <circle cx="90" cy="90" r="3" fill="#6B7280" />
            </svg>
          </div>
        </div>
      </div>

      {/* Amplitude Details Grid */}
      <div className="grid grid-cols-4 gap-2">
        {stateData.map((state, i) => (
          <div
            key={i}
            className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center"
            style={{ borderLeftColor: state.color, borderLeftWidth: '3px' }}
          >
            <div className="text-sm font-mono font-bold text-white mb-1">
              {state.basis}
            </div>
            <div className="text-lg font-bold" style={{ color: state.color }}>
              {state.probability.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1">
              |ψ| = {state.magnitude.toFixed(3)}
            </div>
          </div>
        ))}
      </div>

      {/* Complex Amplitudes Table */}
      <div className="bg-gray-900/70 rounded-lg border border-gray-700/50 overflow-hidden">
        <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700/50">
          <span className="text-xs font-semibold text-gray-400">Complex Amplitudes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="px-3 py-2 text-left text-gray-400 font-semibold">Basis</th>
                <th className="px-3 py-2 text-right text-gray-400 font-semibold">Real</th>
                <th className="px-3 py-2 text-right text-gray-400 font-semibold">Imag</th>
                <th className="px-3 py-2 text-right text-gray-400 font-semibold">Phase</th>
                <th className="px-3 py-2 text-right text-gray-400 font-semibold">Prob</th>
              </tr>
            </thead>
            <tbody>
              {stateData.map((state, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-3 py-2">
                    <span className="font-mono font-bold" style={{ color: state.color }}>
                      {state.basis}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-gray-300">
                    {state.real >= 0 ? '+' : ''}{state.real.toFixed(4)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-gray-300">
                    {state.imag >= 0 ? '+' : ''}{state.imag.toFixed(4)}i
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-gray-400">
                    {state.phase.toFixed(1)}°
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-cyan-400">
                    {state.probability.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-3">
        <p className="text-xs text-gray-300">
          <span className="font-semibold text-purple-400">Quantum State: </span>
          |ψ⟩ = {stateData.map((s, i) => (
            <span key={i}>
              <span style={{ color: s.color }}>{s.magnitude.toFixed(2)}</span>
              <span className="text-gray-500">{s.basis}</span>
              {i < stateData.length - 1 && <span className="text-gray-600"> + </span>}
            </span>
          ))}
        </p>
        {isEntangled && (
          <p className="text-xs text-purple-400 mt-1">
            Qubits are entangled (S = {entropy.toFixed(2)} bits). Measuring one affects the other.
          </p>
        )}
      </div>
    </div>
  );
}
