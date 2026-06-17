import React from 'react';

interface QuantumCircuitVizProps {
  circuitQasm: string;
  nQubits: number;
  gateParams?: Record<string, number>;
}

// Gate component with IBM-style coloring
function Gate({
  name,
  color,
  x,
  y,
  width = 48,
  height = 36,
  param,
  isControl = false,
  isTarget = false
}: {
  name: string;
  color: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  param?: string;
  isControl?: boolean;
  isTarget?: boolean;
}) {
  if (isControl) {
    // Control dot for CNOT
    return (
      <circle
        cx={x + width / 2}
        cy={y + height / 2}
        r={6}
        fill="#06B6D4"
        stroke="#0891B2"
        strokeWidth={2}
      />
    );
  }

  if (isTarget) {
    // Target (XOR) symbol for CNOT
    return (
      <g>
        <circle
          cx={x + width / 2}
          cy={y + height / 2}
          r={14}
          fill="none"
          stroke="#06B6D4"
          strokeWidth={2}
        />
        <line
          x1={x + width / 2}
          y1={y + height / 2 - 14}
          x2={x + width / 2}
          y2={y + height / 2 + 14}
          stroke="#06B6D4"
          strokeWidth={2}
        />
        <line
          x1={x + width / 2 - 14}
          y1={y + height / 2}
          x2={x + width / 2 + 14}
          y2={y + height / 2}
          stroke="#06B6D4"
          strokeWidth={2}
        />
      </g>
    );
  }

  return (
    <g>
      {/* Gate box */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={color}
        stroke={color}
        strokeWidth={1}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      />
      {/* Gate label */}
      <text
        x={x + width / 2}
        y={y + (param ? height / 2 - 4 : height / 2 + 1)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={param ? 11 : 13}
        fontWeight="bold"
        fontFamily="monospace"
      >
        {name}
      </text>
      {/* Parameter (if exists) */}
      {param && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={9}
          fontFamily="monospace"
        >
          {param}
        </text>
      )}
    </g>
  );
}

export function QuantumCircuitViz({
  circuitQasm,
  nQubits,
  gateParams = {}
}: QuantumCircuitVizProps) {
  // Circuit layout constants
  const QUBIT_SPACING = 60;
  const START_Y = 40;
  const START_X = 80;
  const GATE_WIDTH = 48;
  const GATE_HEIGHT = 36;
  const GATE_SPACING = 64;
  const SVG_WIDTH = 520;
  const SVG_HEIGHT = 180;

  // Qubit line Y positions
  const q0Y = START_Y;
  const q1Y = START_Y + QUBIT_SPACING;

  // Gate X positions (columns)
  const col1 = START_X;
  const col2 = START_X + GATE_SPACING;
  const col3 = START_X + GATE_SPACING * 2;
  const col4 = START_X + GATE_SPACING * 3;
  const col5 = START_X + GATE_SPACING * 4;

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-100">Quantum Circuit</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 font-mono">
            {nQubits} qubits
          </span>
          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 font-mono">
            5 gates
          </span>
        </div>
      </div>

      {/* Visual Circuit Diagram */}
      <div className="bg-[#1a1f2e] rounded-lg p-4 overflow-x-auto border border-gray-700/50">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto"
        >
          {/* Background grid pattern */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a3040" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />

          {/* Qubit labels */}
          <text x={20} y={q0Y + GATE_HEIGHT / 2 + 2} fill="#9CA3AF" fontSize={14} fontFamily="monospace" fontWeight="bold">
            q[0]
          </text>
          <text x={20} y={q1Y + GATE_HEIGHT / 2 + 2} fill="#9CA3AF" fontSize={14} fontFamily="monospace" fontWeight="bold">
            q[1]
          </text>

          {/* Qubit wire lines */}
          <line
            x1={START_X - 10}
            y1={q0Y + GATE_HEIGHT / 2}
            x2={SVG_WIDTH - 20}
            y2={q0Y + GATE_HEIGHT / 2}
            stroke="#4B5563"
            strokeWidth={2}
          />
          <line
            x1={START_X - 10}
            y1={q1Y + GATE_HEIGHT / 2}
            x2={SVG_WIDTH - 20}
            y2={q1Y + GATE_HEIGHT / 2}
            stroke="#4B5563"
            strokeWidth={2}
          />

          {/* Column 1: H on q[1] */}
          <Gate name="H" color="#8B5CF6" x={col1} y={q1Y} />

          {/* Column 2: Ry on q[0] */}
          <Gate name="Ry" color="#F59E0B" x={col2} y={q0Y} param="θ₁" />

          {/* Column 3: CNOT (CX) - q[0] control, q[1] target */}
          {/* Vertical connection line */}
          <line
            x1={col3 + GATE_WIDTH / 2}
            y1={q0Y + GATE_HEIGHT / 2}
            x2={col3 + GATE_WIDTH / 2}
            y2={q1Y + GATE_HEIGHT / 2}
            stroke="#06B6D4"
            strokeWidth={2}
          />
          {/* Control dot on q[0] */}
          <Gate name="" color="" x={col3} y={q0Y} isControl />
          {/* Target (XOR) on q[1] */}
          <Gate name="" color="" x={col3} y={q1Y} isTarget />

          {/* Column 4: Rz on q[0] */}
          <Gate name="Rz" color="#10B981" x={col4} y={q0Y} param="φ" />

          {/* Column 5: Ry on q[1] */}
          <Gate name="Ry" color="#F59E0B" x={col5} y={q1Y} param="θ₂" />

          {/* Output measurement symbols */}
          <g transform={`translate(${SVG_WIDTH - 45}, ${q0Y})`}>
            <rect x={0} y={0} width={30} height={36} rx={4} fill="#374151" stroke="#4B5563" strokeWidth={1} />
            <path d="M 8 22 Q 15 8 22 22" stroke="#9CA3AF" strokeWidth={1.5} fill="none" />
            <line x1={15} y1={14} x2={15} y2={24} stroke="#9CA3AF" strokeWidth={1.5} />
          </g>
          <g transform={`translate(${SVG_WIDTH - 45}, ${q1Y})`}>
            <rect x={0} y={0} width={30} height={36} rx={4} fill="#374151" stroke="#4B5563" strokeWidth={1} />
            <path d="M 8 22 Q 15 8 22 22" stroke="#9CA3AF" strokeWidth={1.5} fill="none" />
            <line x1={15} y1={14} x2={15} y2={24} stroke="#9CA3AF" strokeWidth={1.5} />
          </g>
        </svg>
      </div>

      {/* Gate Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-5 rounded bg-[#8B5CF6]"></div>
          <span className="text-gray-400">H - Hadamard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-5 rounded bg-[#F59E0B]"></div>
          <span className="text-gray-400">Ry - Y-Rotation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-5 rounded bg-[#10B981]"></div>
          <span className="text-gray-400">Rz - Z-Rotation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#06B6D4]"></div>
          <span className="text-gray-400">CNOT</span>
        </div>
      </div>

      {/* OpenQASM Code Panel */}
      <div className="bg-gray-900/70 rounded-lg border border-gray-700/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border-b border-gray-700/50">
          <span className="text-xs font-semibold text-gray-400">OpenQASM 2.0</span>
          <button
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            onClick={() => navigator.clipboard.writeText(circuitQasm)}
          >
            Copy
          </button>
        </div>
        <pre className="p-3 text-xs font-mono text-cyan-400 overflow-x-auto">
          <code>{circuitQasm}</code>
        </pre>
      </div>

      {/* Circuit Flow Description */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg p-4">
        <p className="text-xs font-semibold text-cyan-400 mb-2">Signal Encoding Flow:</p>
        <div className="flex items-center gap-2 text-xs text-gray-300 flex-wrap">
          <span className="px-2 py-1 bg-gray-800/50 rounded">|00⟩</span>
          <span className="text-gray-500">→</span>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">H(q1)</span>
          <span className="text-gray-500">→</span>
          <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">Ry(freq)</span>
          <span className="text-gray-500">→</span>
          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">CNOT</span>
          <span className="text-gray-500">→</span>
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">Rz(power)</span>
          <span className="text-gray-500">→</span>
          <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">Ry(noise)</span>
          <span className="text-gray-500">→</span>
          <span className="px-2 py-1 bg-gray-800/50 rounded">|ψ⟩</span>
        </div>
      </div>
    </div>
  );
}
