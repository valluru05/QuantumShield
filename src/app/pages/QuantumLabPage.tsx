import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Cpu, Activity, GitBranch, Layers, ZapOff, ChevronRight
} from 'lucide-react';
import { BlochSphere } from '../components/BlochSphere';
import { QuantumWalkViz } from '../components/QuantumWalkViz';
import { useSystem } from '../context/SystemContext';

const GATES = ['H', 'X', 'Y', 'Z', 'RX', 'RY', 'RZ', 'CNOT', 'CZ', 'SWAP'];
const GATE_COLORS: Record<string, string> = {
  H: '#00f5ff', X: '#ff2244', Y: '#ffaa00', Z: '#00ff88',
  RX: '#8b5cf6', RY: '#8b5cf6', RZ: '#8b5cf6',
  CNOT: '#00f5ff', CZ: '#00f5ff', SWAP: '#ffaa00',
};

interface CircuitGate {
  gate: string;
  qubit: number;
  col: number;
}

function generateQASM(gates: CircuitGate[]): string {
  const lines = ['OPENQASM 2.0;', 'include "qelib1.inc";', 'qreg q[2];', 'creg c[2];', ''];
  gates.forEach((g) => {
    const q = `q[${g.qubit}]`;
    switch (g.gate) {
      case 'H': lines.push(`h ${q};`); break;
      case 'X': lines.push(`x ${q};`); break;
      case 'Y': lines.push(`y ${q};`); break;
      case 'Z': lines.push(`z ${q};`); break;
      case 'RX': lines.push(`rx(pi/4) ${q};`); break;
      case 'RY': lines.push(`ry(pi/4) ${q};`); break;
      case 'RZ': lines.push(`rz(pi/4) ${q};`); break;
      case 'CNOT': lines.push(`cx q[0],q[1];`); break;
      case 'CZ': lines.push(`cz q[0],q[1];`); break;
      case 'SWAP': lines.push(`swap q[0],q[1];`); break;
      default: break;
    }
  });
  lines.push('measure q -> c;');
  return lines.join('\n');
}

const TABS = [
  { id: 'walk', label: 'Quantum Walk', icon: Activity },
  { id: 'bloch', label: 'Bloch Sphere', icon: Cpu },
  { id: 'circuit', label: 'Circuit Editor', icon: GitBranch },
  { id: 'cluster', label: 'Cluster Space', icon: Layers },
];

// Simple cluster 3D CSS visualization
function ClusterSpace({ attackType }: { attackType: string }) {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setAngle((a) => (a + 0.5) % 360), 40);
    return () => clearInterval(id);
  }, []);

  const clusters = [
    { label: 'NORMAL', color: '#00f5ff', points: Array.from({ length: 18 }, () => ({ x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 60, z: (Math.random() - 0.5) * 60 })) },
    { label: 'JAMMING', color: '#ff2244', points: Array.from({ length: 18 }, () => ({ x: (Math.random() - 0.5) * 60 + 90, y: (Math.random() - 0.5) * 60 - 60, z: (Math.random() - 0.5) * 60 + 30 })) },
    { label: 'SPOOFING', color: '#8b5cf6', points: Array.from({ length: 18 }, () => ({ x: (Math.random() - 0.5) * 60 - 70, y: (Math.random() - 0.5) * 60 + 50, z: (Math.random() - 0.5) * 60 - 40 })) },
  ];

  const rad = (angle * Math.PI) / 180;
  const project = (x: number, y: number, z: number) => {
    const x2 = x * Math.cos(rad) - z * Math.sin(rad);
    const z2 = x * Math.sin(rad) + z * Math.cos(rad);
    const scale = 300 / (300 + z2);
    return { sx: x2 * scale + 180, sy: y * scale + 130, scale };
  };

  const allPoints: { sx: number; sy: number; scale: number; color: string; active: boolean }[] = [];
  clusters.forEach((c) => {
    const isActive = c.label.toLowerCase() === attackType || attackType === 'none';
    c.points.forEach((pt) => {
      const p = project(pt.x, pt.y, pt.z);
      allPoints.push({ ...p, color: c.color, active: isActive });
    });
  });
  allPoints.sort((a, b) => a.scale - b.scale);

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-mono tracking-widest" style={{ color: '#00f5ff' }}>
        QUANTUM CLUSTER SPACE — 3D VISUALIZATION
      </div>
      <div className="rounded-xl overflow-hidden relative" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,245,255,0.1)', height: 280 }}>
        <svg width="100%" height="280" viewBox="0 0 360 280">
          {/* Axis lines */}
          {[
            { x1: 180, y1: 130, x2: 240, y2: 130 },
            { x1: 180, y1: 130, x2: 180, y2: 70 },
            { x1: 180, y1: 130, x2: 130, y2: 160 },
          ].map((line, i) => (
            <line key={i} {...line} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4,4" />
          ))}

          {allPoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.sx}
              cy={pt.sy}
              r={pt.scale * 4}
              fill={pt.color}
              opacity={pt.active ? pt.scale * 0.8 : 0.15}
              style={{ filter: pt.active ? `drop-shadow(0 0 4px ${pt.color})` : 'none' }}
            />
          ))}

          {/* Cluster labels */}
          {clusters.map((c) => {
            const cp = project(
              c.label === 'NORMAL' ? 0 : c.label === 'JAMMING' ? 90 : -70,
              c.label === 'NORMAL' ? 0 : c.label === 'JAMMING' ? -60 : 50,
              0
            );
            return (
              <text key={c.label} x={cp.sx} y={cp.sy - 14} textAnchor="middle" fill={c.color} fontSize="9" fontFamily="monospace" opacity={0.8}>
                {c.label}
              </text>
            );
          })}
        </svg>
        <div className="absolute bottom-2 right-3 text-[9px] font-mono" style={{ color: '#1a2d45' }}>
          Rotating • {Math.round(angle)}°
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-4 text-[10px] font-mono">
        {clusters.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            <span style={{ color: '#7a95b8' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Circuit editor component
function CircuitEditor() {
  const [circuit, setCircuit] = useState<CircuitGate[]>([
    { gate: 'H', qubit: 0, col: 0 },
    { gate: 'CNOT', qubit: 0, col: 1 },
    { gate: 'RY', qubit: 1, col: 2 },
  ]);
  const [showQASM, setShowQASM] = useState(false);
  const [dragGate, setDragGate] = useState<string | null>(null);

  const addGate = (gate: string, qubit: number) => {
    const maxCol = circuit.length > 0 ? Math.max(...circuit.map((g) => g.col)) + 1 : 0;
    setCircuit((prev) => [...prev, { gate, qubit, col: maxCol }]);
  };

  const removeGate = (i: number) => setCircuit((prev) => prev.filter((_, idx) => idx !== i));
  const clearCircuit = () => setCircuit([]);

  const maxCols = circuit.length > 0 ? Math.max(...circuit.map((g) => g.col)) + 1 : 6;

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono tracking-widest" style={{ color: '#00f5ff' }}>QUANTUM CIRCUIT EDITOR</div>

      {/* Gate palette */}
      <div className="flex flex-wrap gap-2">
        {GATES.map((gate) => (
          <motion.button
            key={gate}
            onClick={() => addGate(gate, 0)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 rounded text-xs font-bold font-mono"
            style={{
              background: `${GATE_COLORS[gate]}15`,
              border: `1px solid ${GATE_COLORS[gate]}44`,
              color: GATE_COLORS[gate],
            }}
          >
            {gate}
          </motion.button>
        ))}
        <motion.button
          onClick={clearCircuit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1.5 rounded text-xs font-bold font-mono"
          style={{ background: 'rgba(255,34,68,0.1)', border: '1px solid rgba(255,34,68,0.3)', color: '#ff2244' }}
        >
          CLEAR
        </motion.button>
      </div>

      {/* Circuit canvas */}
      <div
        className="rounded-xl p-4 overflow-x-auto"
        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,245,255,0.1)', minHeight: 140 }}
      >
        <div className="relative" style={{ minWidth: Math.max(400, maxCols * 64 + 80) }}>
          {/* Qubit wires */}
          {[0, 1].map((q) => (
            <div key={q} className="flex items-center gap-0" style={{ height: 52 }}>
              <div className="text-xs font-mono w-12 flex-shrink-0" style={{ color: '#3a5070' }}>
                |q{q}⟩ ─
              </div>
              <div className="flex-1 relative" style={{ height: 2, background: 'rgba(0,245,255,0.15)' }}>
                {circuit.filter((g) => g.qubit === q).map((g, i) => {
                  const left = g.col * 64 + 8;
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-5 w-12 h-10 rounded flex items-center justify-center cursor-pointer"
                      style={{
                        left,
                        background: `${GATE_COLORS[g.gate]}20`,
                        border: `1.5px solid ${GATE_COLORS[g.gate]}66`,
                      }}
                      onClick={() => removeGate(circuit.indexOf(g))}
                      title="Click to remove"
                    >
                      <span className="text-[11px] font-bold font-mono" style={{ color: GATE_COLORS[g.gate] }}>
                        {g.gate}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <div className="text-xs font-mono w-8 flex-shrink-0" style={{ color: '#3a5070' }}>
                ─ ⌷
              </div>
            </div>
          ))}
          <div className="text-[9px] font-mono mt-2" style={{ color: '#1a2d45' }}>
            Click gate to remove • Click palette to add
          </div>
        </div>
      </div>

      {/* QASM viewer */}
      <div>
        <button
          onClick={() => setShowQASM((v) => !v)}
          className="text-[10px] font-mono flex items-center gap-1"
          style={{ color: '#8b5cf6' }}
        >
          <ChevronRight size={10} style={{ transform: showQASM ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          {showQASM ? 'HIDE' : 'SHOW'} OPENQASM
        </button>
        <AnimatePresence>
          {showQASM && (
            <motion.pre
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 p-3 rounded-lg overflow-auto text-[11px] font-mono"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6', maxHeight: 200 }}
            >
              {generateQASM(circuit)}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function QuantumLabPage() {
  const { attackType } = useSystem();
  const [activeTab, setActiveTab] = useState('walk');
  const [theta, setTheta] = useState(Math.PI / 4);
  const [phi, setPhi] = useState(Math.PI / 3);
  const [walkProbs, setWalkProbs] = useState<number[]>(() => Array(16).fill(0).map(() => Math.random()));

  // Animate walk probs
  useEffect(() => {
    const id = setInterval(() => {
      setWalkProbs((prev) => {
        const next = prev.map((v, i) => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.15)));
        const sum = next.reduce((a, b) => a + b, 0);
        return next.map((v) => v / sum);
      });
    }, 200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: 'radial-gradient(ellipse at 30% 20%, #0a0d1a 0%, #020408 60%)' }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between border-b sticky top-0 z-20"
        style={{ background: 'rgba(2,4,8,0.92)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-xs font-mono" style={{ color: '#3a5070' }}>
            <ArrowLeft size={14} />
            COMMAND CENTER
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <Cpu size={16} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider font-mono" style={{ color: '#8b5cf6' }}>
                QUANTUM LAB
              </div>
              <div className="text-[10px]" style={{ color: '#3a5070' }}>Interactive Quantum Visualization</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono font-bold transition-all"
                style={{
                  background: activeTab === tab.id ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: activeTab === tab.id ? '#8b5cf6' : '#3a5070',
                  border: activeTab === tab.id ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ===== QUANTUM WALK TAB ===== */}
            {activeTab === 'walk' && (
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-8">
                    <div
                      className="rounded-xl p-5 space-y-4"
                      style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(0,245,255,0.12)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold font-mono" style={{ color: '#00f5ff' }}>QUANTUM WALK ENGINE</div>
                          <div className="text-[10px]" style={{ color: '#3a5070' }}>Discrete-time Hadamard coin quantum walk • 16 positions • 8 steps</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.div className="w-2 h-2 rounded-full bg-green-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                          <span className="text-[10px] font-mono" style={{ color: '#00ff88' }}>LIVE</span>
                        </div>
                      </div>
                      <QuantumWalkViz
                        probabilities={walkProbs}
                        attackType={attackType === 'none' ? 'normal' : attackType}
                        isAnimating
                      />
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        {[
                          { label: 'COIN OPERATOR', value: 'Hadamard', color: '#00f5ff' },
                          { label: 'GRAPH TYPE', value: 'Linear Chain', color: '#8b5cf6' },
                          { label: 'INTERFERENCE', value: attackType !== 'none' ? 'ACTIVE' : 'NONE', color: attackType !== 'none' ? '#ff2244' : '#00ff88' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="text-[9px] font-mono mb-0.5" style={{ color: '#3a5070' }}>{label}</div>
                            <div className="text-xs font-bold font-mono" style={{ color }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div
                      className="rounded-xl p-5 space-y-4"
                      style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(0,245,255,0.12)' }}
                    >
                      <div className="text-xs font-bold font-mono" style={{ color: '#00f5ff' }}>PROBABILITY DISTRIBUTION</div>
                      <div className="space-y-1">
                        {walkProbs.slice(0, 8).map((p, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[9px] font-mono w-6" style={{ color: '#3a5070' }}>x{i}</span>
                            <div className="flex-1 h-3 rounded overflow-hidden" style={{ background: 'rgba(0,245,255,0.05)' }}>
                              <motion.div
                                className="h-full rounded"
                                animate={{ width: `${p * 100}%` }}
                                transition={{ duration: 0.15 }}
                                style={{ background: `hsl(${180 + i * 20}, 100%, 55%)`, boxShadow: `0 0 4px hsl(${180 + i * 20}, 100%, 55%)` }}
                              />
                            </div>
                            <span className="text-[9px] font-mono w-8" style={{ color: '#3a5070' }}>{(p * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 rounded text-[10px] font-mono" style={{ background: 'rgba(0,0,0,0.3)', color: '#3a5070' }}>
                        Quantum superposition enables simultaneous exploration of all paths — unlike classical random walks.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== BLOCH SPHERE TAB ===== */}
            {activeTab === 'bloch' && (
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-5 flex justify-center">
                  <BlochSphere theta={theta} phi={phi} label="q₀" />
                </div>
                <div className="col-span-7 space-y-5">
                  <div
                    className="rounded-xl p-5 space-y-4"
                    style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(139,92,246,0.15)' }}
                  >
                    <div className="text-xs font-bold font-mono" style={{ color: '#8b5cf6' }}>QUBIT STATE CONTROL</div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span style={{ color: '#7a95b8' }}>θ (Polar)</span>
                          <span style={{ color: '#00f5ff' }}>{((theta / Math.PI) * 180).toFixed(1)}°</span>
                        </div>
                        <input
                          type="range" min={0} max={Math.PI} step={0.01} value={theta}
                          onChange={(e) => setTheta(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span style={{ color: '#7a95b8' }}>φ (Azimuthal)</span>
                          <span style={{ color: '#8b5cf6' }}>{((phi / Math.PI) * 180).toFixed(1)}°</span>
                        </div>
                        <input
                          type="range" min={0} max={2 * Math.PI} step={0.01} value={phi}
                          onChange={(e) => setPhi(parseFloat(e.target.value))}
                          className="w-full accent-purple-400"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '|0⟩', theta: 0, phi: 0, color: '#00f5ff' },
                        { label: '|1⟩', theta: Math.PI, phi: 0, color: '#ff2244' },
                        { label: '|+⟩', theta: Math.PI/2, phi: 0, color: '#00ff88' },
                        { label: '|i⟩', theta: Math.PI/2, phi: Math.PI/2, color: '#8b5cf6' },
                      ].map(({ label, theta: t, phi: p, color }) => (
                        <motion.button
                          key={label}
                          onClick={() => { setTheta(t); setPhi(p); }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="py-2 rounded text-xs font-bold font-mono"
                          style={{ background: `${color}11`, border: `1px solid ${color}33`, color }}
                        >
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-5"
                    style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(139,92,246,0.1)' }}
                  >
                    <div className="text-xs font-bold font-mono mb-3" style={{ color: '#8b5cf6' }}>STATE VECTOR</div>
                    <div className="font-mono text-xs space-y-1">
                      <div style={{ color: '#00f5ff' }}>
                        α = cos(θ/2) = {Math.cos(theta / 2).toFixed(4)}
                      </div>
                      <div style={{ color: '#8b5cf6' }}>
                        β = e^(iφ) sin(θ/2) = {Math.sin(theta / 2).toFixed(4)}e^(i{phi.toFixed(2)})
                      </div>
                      <div style={{ color: '#3a5070' }} className="mt-2">
                        |ψ⟩ = {Math.cos(theta / 2).toFixed(3)}|0⟩ + {Math.sin(theta / 2).toFixed(3)}e^(i{phi.toFixed(2)})|1⟩
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== CIRCUIT EDITOR TAB ===== */}
            {activeTab === 'circuit' && (
              <div
                className="rounded-xl p-6"
                style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(0,245,255,0.12)' }}
              >
                <CircuitEditor />
              </div>
            )}

            {/* ===== CLUSTER SPACE TAB ===== */}
            {activeTab === 'cluster' && (
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-8">
                  <div
                    className="rounded-xl p-5"
                    style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(0,245,255,0.12)' }}
                  >
                    <ClusterSpace attackType={attackType} />
                  </div>
                </div>
                <div className="col-span-4 space-y-4">
                  <div
                    className="rounded-xl p-5 space-y-3"
                    style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(0,245,255,0.12)' }}
                  >
                    <div className="text-xs font-bold font-mono" style={{ color: '#00f5ff' }}>CLUSTER METRICS</div>
                    {[
                      { label: 'NORMAL Cluster', similarity: 0.94, color: '#00f5ff' },
                      { label: 'JAMMING Cluster', similarity: attackType === 'jamming' ? 0.87 : 0.12, color: '#ff2244' },
                      { label: 'SPOOFING Cluster', similarity: attackType === 'spoofing' ? 0.82 : 0.09, color: '#8b5cf6' },
                    ].map(({ label, similarity, color }) => (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span style={{ color: '#7a95b8' }}>{label}</span>
                          <span className="font-mono" style={{ color }}>{(similarity * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            animate={{ width: `${similarity * 100}%` }}
                            transition={{ duration: 1 }}
                            style={{ background: color, opacity: 0.8 }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="p-2 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.3)', color: '#3a5070' }}>
                      Quantum kernel: fidelity-based similarity |⟨ψ_ref|ψ_input⟩|²
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-5"
                    style={{ background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(0,245,255,0.08)' }}
                  >
                    <div className="text-xs font-bold font-mono mb-2" style={{ color: '#00f5ff' }}>KERNEL HEATMAP</div>
                    <div className="grid grid-cols-3 gap-1">
                      {['normal','jamming','spoofing'].flatMap((a) =>
                        ['normal','jamming','spoofing'].map((b) => {
                          const val = a === b ? 0.9 : Math.random() * 0.2;
                          return (
                            <motion.div
                              key={`${a}-${b}`}
                              className="h-8 rounded flex items-center justify-center"
                              animate={{ opacity: [0.6, 1, 0.6] }}
                              transition={{ duration: 2 + Math.random(), repeat: Infinity }}
                              style={{
                                background: `rgba(0,245,255,${val})`,
                                border: '1px solid rgba(0,245,255,0.1)',
                              }}
                            >
                              <span className="text-[9px] font-mono" style={{ color: val > 0.5 ? '#020408' : '#00f5ff' }}>
                                {val.toFixed(2)}
                              </span>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                    <div className="flex justify-between text-[9px] font-mono mt-1" style={{ color: '#1a2d45' }}>
                      <span>N</span><span>J</span><span>S</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
