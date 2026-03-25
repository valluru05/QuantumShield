import React from 'react';

interface QuantumCircuitVizProps {
  circuitQasm: string;
  nQubits: number;
  gateParams?: Record<string, number>;
}

export function QuantumCircuitViz({
  circuitQasm,
  nQubits,
  gateParams = {}
}: QuantumCircuitVizProps) {
  return (
    <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-100">Quantum Circuit (2-Qubit)</h3>
        <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 font-mono">{nQubits} qubits</span>
      </div>

      {/* Circuit Diagram */}
      <div className="bg-gray-900/50 rounded-lg p-4 overflow-x-auto border border-gray-700/30">
        <pre className="text-cyan-400 font-mono text-xs whitespace-pre-wrap break-words text-gray-300">
          {circuitQasm}
        </pre>
      </div>

      {/* Gate Parameters */}
      {Object.keys(gateParams).length > 0 && (
        <div className="border-t border-gray-700/50 pt-4">
          <h4 className="text-sm font-semibold mb-2 text-gray-200">Gate Parameters</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(gateParams).map(([gate, value]) => (
              <div key={gate} className="flex justify-between p-2 bg-gray-700/50 border border-gray-600/50 rounded text-gray-300">
                <span className="font-mono text-cyan-400">{gate}:</span>
                <span className="text-gray-200">{(value as number).toFixed(3)} rad</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="text-xs text-gray-400 bg-gray-700/30 border border-gray-600/50 p-3 rounded">
        <p className="font-semibold mb-1 text-gray-300">Circuit Structure:</p>
        <ul className="list-disc ml-4 space-y-1 text-gray-300">
          <li>Q1: H (Hadamard) - Creates superposition</li>
          <li>Q0: Ry(θ_freq) - Encodes frequency</li>
          <li>CNOT(Q0→Q1) - Entangles qubits</li>
          <li>Q0: Rz(φ_power) - Encodes power (phase)</li>
          <li>Q1: Ry(θ_noise) - Encodes noise</li>
        </ul>
      </div>
    </div>
  );
}
