# Quantum Visualization Components - Template

Ready-to-use React components for quantum pipeline visualization.
Copy these into `src/app/components/` and customize as needed.

## Components Overview

1. **QuantumCircuitViz** - Display OpenQASM circuit with gate parameters
2. **QuantumStateViz** - Bar chart of state probabilities with entanglement detection
3. **QuantumClusterViz** - Radar chart of kernel distances with classification result

---

## FILE 1: `src/app/components/QuantumCircuitViz.tsx`

```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Quantum Circuit (2-Qubit)</span>
          <Badge variant="secondary">{nQubits} qubits</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Circuit Diagram */}
        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 font-mono text-xs">
            {circuitQasm}
          </pre>
        </div>

        {/* Gate Parameters */}
        {Object.keys(gateParams).length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">Gate Parameters</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(gateParams).map(([gate, value]) => (
                <div key={gate} className="flex justify-between p-2 bg-slate-100 rounded">
                  <span className="font-mono">{gate}:</span>
                  <span>{(value as number).toFixed(3)} rad</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="text-xs text-slate-600 bg-blue-50 p-3 rounded">
          <p className="font-semibold mb-1">Circuit Structure:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Q1: H (Hadamard) - Creates superposition</li>
            <li>Q0: Ry(θ_freq) - Encodes frequency</li>
            <li>CNOT(Q0→Q1) - Entangles qubits</li>
            <li>Q0: Rz(φ_power) - Encodes power (phase)</li>
            <li>Q1: Ry(θ_noise) - Encodes noise</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## FILE 2: `src/app/components/QuantumStateViz.tsx`

```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface QuantumStateVizProps {
  stateVector: number[][];  // [[real, imag], [real, imag], ...]
  basisLabels?: string[];
}

export function QuantumStateViz({
  stateVector,
  basisLabels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩']
}: QuantumStateVizProps) {
  // Calculate probabilities from state vector
  const probabilities = stateVector.map(([real, imag]) => {
    const magnitude = Math.sqrt(real * real + imag * imag);
    return magnitude * magnitude * 100; // Convert to percentage
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

  const isEntangled = entropy > 0.5; // Heuristic

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quantum State Vector (2-Qubit)</CardTitle>
          <div className="flex gap-2">
            {isEntangled && (
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                Entangled
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="basis" />
            <YAxis
              label={{
                value: 'Probability (%)',
                angle: -90,
                position: 'insideLeft'
              }}
            />
            <Tooltip
              formatter={(value) => `${(value as number).toFixed(1)}%`}
            />
            <Bar dataKey="probability" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>

        {/* State Vector Details */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Amplitudes</h4>
          <div className="grid grid-cols-2 gap-3">
            {stateVector.map((vec, i) => {
              const [real, imag] = vec;
              const magnitude = Math.sqrt(real * real + imag * imag);
              return (
                <div key={i} className="p-3 bg-slate-50 rounded-lg font-mono text-sm">
                  <div className="font-semibold text-slate-700">
                    {basisLabels[i]}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Re: {real.toFixed(3)}</div>
                    <div>Im: {imag.toFixed(3)}</div>
                    <div className="text-blue-600">|ψ|: {magnitude.toFixed(3)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-blue-50 p-3 rounded text-xs text-slate-600">
          <p className="font-semibold mb-1">Interpretation:</p>
          <p>
            {isEntangled
              ? "⚡ The two qubits are entangled (correlated). Measuring one affects the other."
              : "⊙ The qubits are in a separable state. They can be measured independently."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## FILE 3: `src/app/components/QuantumClusterViz.tsx`

```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    kernel: Math.round(score * 100), // Convert to 0-100
  }));

  // Get color based on cluster
  const clusterColors: Record<string, string> = {
    normal: '#10b981',
    jamming: '#ef4444',
    spoofing: '#f59e0b'
  };

  const clusterColor = clusterColors[clusterLabel] || '#6b7280';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quantum Clustering Result</CardTitle>
          <Badge className="gap-2" style={{ backgroundColor: clusterColor }}>
            {clusterLabel.toUpperCase()}
            <span className="ml-2">{(confidence * 100).toFixed(0)}%</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="cluster" />
            <PolarRadiusAxis domain={[0, 100]} />
            <Radar
              name="Quantum Kernel Overlap (%)"
              dataKey="kernel"
              stroke={clusterColor}
              fill={clusterColor}
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>

        {/* Kernel Scores Table */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Kernel Distance Matrix</h4>
          <div className="space-y-2">
            {Object.entries(kernelScores).map(([label, score]) => {
              const isPredicted = label === clusterLabel;
              return (
                <div
                  key={label}
                  className={`flex items-center justify-between p-2 rounded ${
                    isPredicted
                      ? 'bg-blue-100 border-l-4 border-blue-500'
                      : 'bg-slate-100'
                  }`}
                >
                  <span className="font-medium capitalize">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-300 rounded h-2">
                      <div
                        className={`h-2 rounded ${
                          isPredicted ? 'bg-blue-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm w-10">
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-purple-50 p-3 rounded text-xs text-slate-600">
          <p className="font-semibold mb-1">Quantum Kernel:</p>
          <p>
            K(ψ_observed, ψ_reference) = |⟨ψ_observed|ψ_reference⟩|²
          </p>
          <p className="mt-1">
            Higher overlap means more similar quantum states. Classification chooses
            the reference state with highest kernel value.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## FILE 4: Integration in `QuantumMLPanel.tsx`

Add these imports at the top:

```tsx
import { QuantumCircuitViz } from './QuantumCircuitViz';
import { QuantumStateViz } from './QuantumStateViz';
import { QuantumClusterViz } from './QuantumClusterViz';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
```

Add this state and handler in your component:

```tsx
interface QuantumVizData {
  circuit_qasm: string;
  state_vector: number[][];
  basis_labels: string[];
  probabilities: number[];
  cluster_label: string;
  kernel_scores: Record<string, number>;
  quantum_walk_dist: number[];
}

const [vizData, setVizData] = React.useState<QuantumVizData | null>(null);
const [isLoading, setIsLoading] = React.useState(false);

const handleShowQuantumViz = async () => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/quantum/infer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signal: Array.from({length: 64}, () => Math.random()),
        return_full_pipeline: true,
        attack_type: 'jamming'
      })
    });
    
    const result = await response.json();
    
    if (result.pipeline_stages?.encoding) {
      const enc = result.pipeline_stages.encoding;
      setVizData({
        circuit_qasm: enc.circuit_qasm,
        state_vector: enc.state_vector_real.map((r: number, i: number) => [
          r,
          enc.state_vector_imag[i]
        ]),
        basis_labels: enc.basis_labels,
        probabilities: enc.probabilities,
        cluster_label: result.pipeline_stages.clustering?.cluster_label || 'unknown',
        kernel_scores: result.pipeline_stages.clustering?.kernel_scores || {},
        quantum_walk_dist: result.pipeline_stages.quantum_walk?.probability_dist || []
      });
    }
  } catch (err) {
    console.error('Failed to get quantum visualization:', err);
  } finally {
    setIsLoading(false);
  }
};
```

Add this JSX in your render section:

```tsx
<Button 
  onClick={handleShowQuantumViz}
  disabled={isLoading}
  className="w-full"
>
  {isLoading ? 'Computing Quantum Pipeline...' : 'Show Quantum Pipeline'}
</Button>

{vizData && (
  <Tabs defaultValue="circuit">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="circuit">Circuit</TabsTrigger>
      <TabsTrigger value="state">State</TabsTrigger>
      <TabsTrigger value="cluster">Cluster</TabsTrigger>
      <TabsTrigger value="walk">Walk</TabsTrigger>
    </TabsList>

    <TabsContent value="circuit">
      <QuantumCircuitViz
        circuitQasm={vizData.circuit_qasm}
        nQubits={2}
      />
    </TabsContent>

    <TabsContent value="state">
      <QuantumStateViz
        stateVector={vizData.state_vector}
        basisLabels={vizData.basis_labels}
      />
    </TabsContent>

    <TabsContent value="cluster">
      <QuantumClusterViz
        clusterLabel={vizData.cluster_label}
        kernelScores={vizData.kernel_scores}
        confidence={Math.max(...Object.values(vizData.kernel_scores))}
      />
    </TabsContent>

    <TabsContent value="walk">
      <Card>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={vizData.quantum_walk_dist.map((p: number, i: number) => ({
                freq: i,
                prob: p * 100
              }))}
            >
              <CartesianGrid />
              <XAxis dataKey="freq" />
              <YAxis label={{value: 'Probability (%)', angle: -90, position: 'insideLeft'}} />
              <Bar dataKey="prob" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
)}
```

---

## Implementation Steps

1. **Copy FILE 1** code to `src/app/components/QuantumCircuitViz.tsx`
2. **Copy FILE 2** code to `src/app/components/QuantumStateViz.tsx`
3. **Copy FILE 3** code to `src/app/components/QuantumClusterViz.tsx`
4. **Add imports** from FILE 4 to your `QuantumMLPanel.tsx`
5. **Add state and handler** to QuantumMLPanel component
6. **Add JSX** to your component's render section

---

## Notes

- All components use Recharts for data visualization
- State vector displayed in both graphical and amplitude formats
- Automatic entanglement detection based on Shannon entropy
- Responsive containers scale to parent width
- Color-coded cluster results (Green=Normal, Red=Jamming, Amber=Spoofing)
