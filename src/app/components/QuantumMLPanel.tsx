import { useState, useRef } from 'react';
import { Button } from './ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { Cpu, RefreshCw } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { QuantumCircuitViz } from './QuantumCircuitViz';
import { QuantumStateViz } from './QuantumStateViz';
import { QuantumClusterViz } from './QuantumClusterViz';
import type { QuantumVizData } from '../types/quantum';

// Get dynamic API base URL
const getApiBase = (): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  return `http://${hostname}:3001`;
};

// Generate deterministic signal based on attack type (seeded pseudo-random)
function generateSignalForType(attackType: string): number[] {
  const seed = attackType === 'jamming' ? 12345 : attackType === 'spoofing' ? 67890 : 11111;
  let state = seed;

  const seededRandom = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  const signal: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (attackType === 'jamming') {
      // Noisy signal
      signal.push(seededRandom() * 2 - 1);
    } else if (attackType === 'spoofing') {
      // Shifted frequency signal
      signal.push(Math.sin(i * 0.3 + seededRandom() * 0.1));
    } else {
      // Normal clean signal
      signal.push(Math.sin(i * 0.2) * (0.8 + seededRandom() * 0.2));
    }
  }
  return signal;
}

export function QuantumMLPanel() {
  const [vizData, setVizData] = useState<QuantumVizData | null>(null);
  const [clusterConfidence, setClusterConfidence] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visualizedAttackType, setVisualizedAttackType] = useState<string | null>(null);
  const { mlConfidence, mlThreatScore, attackType } = useSystem();

  // Cache visualization data per attack type
  const vizCache = useRef<Map<string, { vizData: QuantumVizData; confidence: number }>>(new Map());

  const handleShowQuantumViz = async (forceRefresh = false) => {
    // Determine attack type for visualization
    const currentAttackType = attackType === 'none' ? 'normal' : attackType;

    // Check cache first (unless force refresh)
    if (!forceRefresh && vizCache.current.has(currentAttackType)) {
      const cached = vizCache.current.get(currentAttackType)!;
      setVizData(cached.vizData);
      setClusterConfidence(cached.confidence);
      setVisualizedAttackType(currentAttackType);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const API_BASE = getApiBase();

      // Generate deterministic signal based on attack type
      const signal = generateSignalForType(currentAttackType);

      const response = await fetch(`${API_BASE}/api/quantum/infer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal,
          attack_type: currentAttackType,
          return_full_pipeline: true,
          visualization_only: true  // CRITICAL: Prevents state changes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Extract visualization data from response
      const stages = result.pipeline_stages;

      if (!stages?.encoding || !stages?.clustering || !stages?.quantum_walk) {
        throw new Error('Incomplete pipeline data received from server');
      }

      const enc = stages.encoding;
      const clust = stages.clustering;
      const walk = stages.quantum_walk;

      // Convert state vector from separate real/imag arrays to tuples
      const stateVector: [number, number][] = enc.state_vector_real?.map(
        (r: number, i: number) => [r, enc.state_vector_imag?.[i] || 0] as [number, number]
      ) || [];

      const newVizData: QuantumVizData = {
        circuit_qasm: enc.circuit_qasm || 'Circuit unavailable',
        state_vector: stateVector,
        basis_labels: enc.basis_labels || ['|00⟩', '|01⟩', '|10⟩', '|11⟩'],
        probabilities: enc.probabilities || [],
        cluster_label: clust.cluster_label || 'normal',
        kernel_scores: clust.kernel_scores || {},
        quantum_walk_dist: walk.probability_dist || []
      };

      const newConfidence = clust.confidence || 0;

      // Debug logging
      console.log('Clustering data:', {
        cluster_label: clust.cluster_label,
        kernel_scores: clust.kernel_scores,
        confidence: newConfidence
      });

      // Cache the result
      vizCache.current.set(currentAttackType, {
        vizData: newVizData,
        confidence: newConfidence
      });

      setVizData(newVizData);
      setClusterConfidence(newConfidence);
      setVisualizedAttackType(currentAttackType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to get quantum visualization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold text-gray-300">Quantum ML Pipeline</h2>
        </div>
        <p className="text-xs text-gray-500">Real-time quantum feature encoding & classification</p>
      </div>

      <div className="space-y-4">
        {/* Current Metrics from Attack Detection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
            <div className="text-xs text-gray-400 mb-1">ML Confidence</div>
            <div className="text-2xl font-bold text-cyan-400">
              {mlConfidence != null ? mlConfidence.toFixed(1) : '0.0'}%
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-1 mt-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${mlConfidence || 0}%` }}
              />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
            <div className="text-xs text-gray-400 mb-1">Threat Score</div>
            <div className="text-2xl font-bold text-amber-400">
              {mlThreatScore != null ? mlThreatScore.toFixed(1) : '0.0'}%
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-1 mt-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${mlThreatScore || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleShowQuantumViz(false)}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-2"
          >
            {isLoading ? '⚙️ Computing...' : vizData ? '▶ View Pipeline' : '▶ Show Quantum Pipeline'}
          </Button>
          {vizData && (
            <Button
              onClick={() => handleShowQuantumViz(true)}
              disabled={isLoading}
              variant="outline"
              className="px-3 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              title="Refresh visualization"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm">
            {error}
          </div>
        )}

        {/* Visualization Info */}
        {vizData && visualizedAttackType && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Showing pipeline for:</span>
            <span className={`px-2 py-0.5 rounded font-medium ${
              visualizedAttackType === 'jamming' ? 'bg-red-500/20 text-red-400' :
              visualizedAttackType === 'spoofing' ? 'bg-amber-500/20 text-amber-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {visualizedAttackType.toUpperCase()}
            </span>
            <span className="text-gray-600">signal type</span>
          </div>
        )}

        {/* Visualization Tabs */}
        {vizData && (
          <Tabs defaultValue="circuit" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700/50">
              <TabsTrigger value="circuit" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-cyan-600/20 data-[state=active]:border-cyan-500/30">Circuit</TabsTrigger>
              <TabsTrigger value="state" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-cyan-600/20 data-[state=active]:border-cyan-500/30">State</TabsTrigger>
              <TabsTrigger value="cluster" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-cyan-600/20 data-[state=active]:border-cyan-500/30">Cluster</TabsTrigger>
              <TabsTrigger value="walk" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-cyan-600/20 data-[state=active]:border-cyan-500/30">Walk</TabsTrigger>
            </TabsList>

            <TabsContent value="circuit" className="mt-4">
              <QuantumCircuitViz
                circuitQasm={vizData.circuit_qasm}
                nQubits={2}
              />
            </TabsContent>

            <TabsContent value="state" className="mt-4">
              <QuantumStateViz
                stateVector={vizData.state_vector}
                basisLabels={vizData.basis_labels}
              />
            </TabsContent>

            <TabsContent value="cluster" className="mt-4">
              <QuantumClusterViz
                clusterLabel={vizData.cluster_label}
                kernelScores={vizData.kernel_scores}
                confidence={clusterConfidence}
              />
            </TabsContent>

            <TabsContent value="walk" className="mt-4">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-300 font-medium">Quantum Walk Probability Distribution</p>
                  <div className="flex justify-center gap-1 h-32">
                    {vizData.quantum_walk_dist.slice(0, 16).map((prob, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${Math.max(8, prob * 100)}%` }}
                        title={`f${i}: ${(prob * 100).toFixed(1)}%`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Probability across 16 frequency bins
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Explanation */}
        <div className="text-xs text-gray-400 bg-gray-800/30 border border-gray-700/50 p-3 rounded">
          <p className="font-semibold text-gray-300 mb-2">Pipeline Stages:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">1.</span>
              <span><strong>Walk:</strong> Signal propagation model</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">2.</span>
              <span><strong>Circuit:</strong> 2-qubit encoding</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">3.</span>
              <span><strong>State:</strong> Hilbert space (4D)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">4.</span>
              <span><strong>Cluster:</strong> Quantum kernel match</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
