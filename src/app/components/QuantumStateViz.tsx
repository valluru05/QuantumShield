import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface QuantumStateVizProps {
  stateVector: number[][];
  basisLabels?: string[];
}

export function QuantumStateViz({
  stateVector,
  basisLabels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩']
}: QuantumStateVizProps) {
  // Calculate probabilities from state vector
  const probabilities = stateVector.map(([real, imag]) => {
    const magnitude = Math.sqrt(real * real + imag * imag);
    return magnitude * magnitude * 100;
  });

  // Prepare chart data
  const chartData = basisLabels.map((label, i) => ({
    basis: label,
    probability: probabilities[i],
    magnitude: Math.sqrt(probabilities[i] / 100).toFixed(3)
  }));

  // Calculate entanglement indicator
  const entropy = -chartData.reduce((sum, d) => {
    const p = d.probability / 100;
    return sum + (p > 0 ? p * Math.log(p) : 0);
  }, 0);

  const isEntangled = entropy > 0.5;

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-100">Quantum State Vector (2-Qubit)</h3>
        <div className="flex gap-2">
          {isEntangled && (
            <span className="text-xs px-2 py-1 bg-purple-500/30 text-purple-300 rounded border border-purple-500/50">
              ⚡ Entangled
            </span>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404856" />
          <XAxis dataKey="basis" tick={{ fill: '#9CA3AF' }} />
          <YAxis
            tick={{ fill: '#9CA3AF' }}
            label={{
              value: 'Probability (%)',
              angle: -90,
              position: 'insideLeft',
              fill: '#9CA3AF'
            }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
            formatter={(value) => `${(value as number).toFixed(1)}%`}
          />
          <Bar dataKey="probability" fill="#06B6D4" />
        </BarChart>
      </ResponsiveContainer>

      {/* State Vector Details */}
      <div className="border-t border-gray-700/50 pt-4">
        <h4 className="text-sm font-semibold mb-3 text-gray-200">Amplitudes</h4>
        <div className="grid grid-cols-2 gap-3">
          {stateVector.map((vec, i) => {
            const [real, imag] = vec;
            const magnitude = Math.sqrt(real * real + imag * imag);
            return (
              <div key={i} className="p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg font-mono text-sm">
                <div className="font-semibold text-cyan-400">
                  {basisLabels[i]}
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>Re: <span className="text-gray-200">{real.toFixed(3)}</span></div>
                  <div>Im: <span className="text-gray-200">{imag.toFixed(3)}</span></div>
                  <div className="text-cyan-400">|ψ|: {magnitude.toFixed(3)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-gray-700/30 border border-gray-600/50 p-3 rounded text-xs text-gray-300">
        <p className="font-semibold text-gray-200 mb-1">Interpretation:</p>
        <p>
          {isEntangled
            ? "⚡ The two qubits are entangled (correlated). Measuring one affects the other."
            : "⊙ The qubits are in a separable state. They can be measured independently."}
        </p>
      </div>
    </div>
  );
}
