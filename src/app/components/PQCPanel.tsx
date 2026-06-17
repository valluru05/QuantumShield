import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Key, Lock, AlertTriangle, Cpu } from 'lucide-react';

interface PQCPanelProps {
  isActive?: boolean;
}

const ALGORITHMS = [
  {
    name: 'CRYSTALS-Kyber',
    type: 'KEM',
    secLevel: 'AES-256 equivalent',
    nistLevel: 3,
    color: '#00f5ff',
    description: 'Key Encapsulation Mechanism',
  },
  {
    name: 'CRYSTALS-Dilithium',
    type: 'DSA',
    secLevel: 'AES-192 equivalent',
    nistLevel: 3,
    color: '#8b5cf6',
    description: 'Digital Signature Algorithm',
  },
  {
    name: 'FALCON',
    type: 'DSA',
    secLevel: 'AES-128 equivalent',
    nistLevel: 5,
    color: '#ffaa00',
    description: 'Fast Fourier Lattice Signature',
  },
];

// Lattice visualization node
interface LatticeNode {
  x: number;
  y: number;
  id: number;
}

function generateLattice(rows: number, cols: number, w: number, h: number): LatticeNode[] {
  const nodes: LatticeNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({
        id: r * cols + c,
        x: (c / (cols - 1)) * w,
        y: (r / (rows - 1)) * h,
      });
    }
  }
  return nodes;
}

export function PQCPanel({ isActive = true }: PQCPanelProps) {
  const [selectedAlgo, setSelectedAlgo] = useState(0);
  const [keyGenProgress, setKeyGenProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyGenComplete, setKeyGenComplete] = useState(false);
  const [attackResistance, setAttackResistance] = useState(98.7);
  const [latticeNodes] = useState(() => generateLattice(6, 8, 240, 100));

  const algo = ALGORITHMS[selectedAlgo];

  const runKeyGen = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setKeyGenProgress(0);
    setKeyGenComplete(false);

    const start = Date.now();
    const duration = 1500;
    const tick = () => {
      const p = Math.min(100, ((Date.now() - start) / duration) * 100);
      setKeyGenProgress(p);
      if (p < 100) {
        requestAnimationFrame(tick);
      } else {
        setIsGenerating(false);
        setKeyGenComplete(true);
        setAttackResistance(97 + Math.random() * 2.5);
      }
    };
    requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (isActive) {
      setTimeout(runKeyGen, 500);
    }
  }, [isActive]);

  const latticeEdges: [LatticeNode, LatticeNode][] = [];
  const cols = 8;
  latticeNodes.forEach((node, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    if (col < cols - 1) latticeEdges.push([node, latticeNodes[i + 1]]);
    if (row < 5) latticeEdges.push([node, latticeNodes[i + cols]]);
    if (col < cols - 1 && row < 5) latticeEdges.push([node, latticeNodes[i + cols + 1]]);
  });

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{
        background: 'rgba(6,13,26,0.85)',
        border: '1px solid rgba(139,92,246,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <ShieldCheck size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest font-mono" style={{ color: '#8b5cf6' }}>
              POST-QUANTUM CRYPTOGRAPHY
            </div>
            <div className="text-[10px]" style={{ color: '#3a5070' }}>
              NIST PQC Standardized Algorithms
            </div>
          </div>
        </div>
        <div
          className="px-2 py-1 rounded text-[10px] font-mono font-bold"
          style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}
        >
          QUANTUM-SAFE
        </div>
      </div>

      {/* Algorithm Selector */}
      <div className="grid grid-cols-3 gap-2">
        {ALGORITHMS.map((a, i) => (
          <motion.button
            key={a.name}
            onClick={() => setSelectedAlgo(i)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="p-2 rounded-lg text-left"
            style={{
              background: selectedAlgo === i ? `${a.color}11` : 'rgba(0,0,0,0.3)',
              border: `1px solid ${selectedAlgo === i ? a.color + '44' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <div className="text-[10px] font-bold font-mono" style={{ color: selectedAlgo === i ? a.color : '#7a95b8' }}>
              {a.name.split('-')[1] || a.name}
            </div>
            <div className="text-[9px]" style={{ color: '#3a5070' }}>{a.type}</div>
          </motion.button>
        ))}
      </div>

      {/* Selected algorithm details */}
      <div
        className="p-3 rounded-lg space-y-2"
        style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${algo.color}22` }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold" style={{ color: algo.color }}>{algo.name}</span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded"
            style={{ background: `${algo.color}11`, color: algo.color, border: `1px solid ${algo.color}33` }}
          >
            NIST Level {algo.nistLevel}
          </span>
        </div>
        <div className="text-xs" style={{ color: '#7a95b8' }}>{algo.description}</div>
        <div className="flex items-center gap-2">
          <Lock size={12} style={{ color: '#3a5070' }} />
          <span className="text-[11px] font-mono" style={{ color: '#7a95b8' }}>{algo.secLevel}</span>
        </div>
      </div>

      {/* Lattice Visualization */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono" style={{ color: '#3a5070' }}>LATTICE STRUCTURE (Hard Problem Basis)</div>
        <div
          className="rounded overflow-hidden relative"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(139,92,246,0.1)', height: 110 }}
        >
          <svg width="100%" height="110" viewBox="0 0 260 110">
            {/* Lattice edges */}
            {latticeEdges.map(([a, b], i) => (
              <motion.line
                key={i}
                x1={a.x + 10} y1={a.y + 5}
                x2={b.x + 10} y2={b.y + 5}
                stroke="rgba(139,92,246,0.15)"
                strokeWidth={0.5}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2 + (i % 5) * 0.3, repeat: Infinity, delay: i * 0.05 }}
              />
            ))}
            {/* Lattice nodes */}
            {latticeNodes.map((node) => (
              <motion.circle
                key={node.id}
                cx={node.x + 10}
                cy={node.y + 5}
                r={2}
                fill="rgba(139,92,246,0.6)"
                animate={{ r: [1.5, 2.5, 1.5], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: node.id * 0.03 }}
              />
            ))}
          </svg>
          <div
            className="absolute top-2 right-2 text-[9px] font-mono"
            style={{ color: 'rgba(139,92,246,0.5)' }}
          >
            LATTICE BASIS
          </div>
        </div>
      </div>

      {/* Key Generation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono" style={{ color: '#3a5070' }}>KEY GENERATION</div>
          {keyGenComplete && (
            <span className="text-[10px] font-mono" style={{ color: '#00ff88' }}>✓ COMPLETE</span>
          )}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(139,92,246,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${keyGenProgress}%`,
              background: `linear-gradient(90deg, #8b5cf6, ${algo.color})`,
              boxShadow: `0 0 8px ${algo.color}88`,
            }}
            transition={{ duration: 0.05 }}
          />
        </div>
        <motion.button
          onClick={runKeyGen}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isGenerating}
          className="w-full py-1.5 rounded text-[11px] font-bold font-mono tracking-widest flex items-center justify-center gap-2"
          style={{
            background: isGenerating ? 'rgba(139,92,246,0.05)' : 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#8b5cf6',
            opacity: isGenerating ? 0.6 : 1,
          }}
        >
          <Key size={12} />
          {isGenerating ? 'GENERATING...' : 'GENERATE NEW KEY PAIR'}
        </motion.button>
      </div>

      {/* Resistance Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono flex items-center gap-1" style={{ color: '#3a5070' }}>
            <Cpu size={10} />
            QUANTUM ATTACK RESISTANCE
          </div>
          <span className="text-sm font-bold font-mono" style={{ color: '#00ff88' }}>
            {attackResistance.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,255,136,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${attackResistance}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              background: 'linear-gradient(90deg, #00ff88, #00f5ff)',
              boxShadow: '0 0 8px rgba(0,255,136,0.5)',
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono" style={{ color: '#3a5070' }}>
          <span>VULNERABLE</span>
          <span className="flex items-center gap-1">
            <AlertTriangle size={9} />
            Shor's Algorithm Resistant
          </span>
          <span>QUANTUM-SAFE</span>
        </div>
      </div>
    </div>
  );
}
