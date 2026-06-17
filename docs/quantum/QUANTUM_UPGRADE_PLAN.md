# QuantumShield++ Upgrade: Complete Quantum Integration Plan

**Version:** 1.0  
**Date:** March 2026  
**Status:** Ready for Implementation (1-2 days)

---

## Executive Summary

This document outlines a complete upgrade to transform QuantumShield from a classical ML demo into a **genuine quantum ML system** using:
- Quantum walk-based signal propagation modeling
- Quantum gate-based feature encoding (2-qubit circuits)
- Quantum clustering in Hilbert space
- Real 2-qubit QSVM classifier

**Technology Stack:**
- Backend: Qiskit ML (quantum simulator)
- Framework: Qiskit, NumPy (Python)
- Integration: Node.js REST endpoints calling Python quantum module
- Frontend: React + D3.js for quantum circuit/probability visualization
- No real quantum hardware required (IBM Quantum Simulator)

---

# PART I: QUANTUM CONCEPTS EXPLAINED

---

## 1. QUANTUM WALK-BASED ATTACK MODELING

### 1.1 Simple Explanation (for presentation)

**What is a Quantum Walk?**
- Classical: A ball rolling on a 1D line (left/right steps)
- Quantum: A particle that exists in superposition (multiple states at once)

**Why useful for signal propagation?**
- Real signals spread through space/time via wave propagation
- Quantum walks naturally model this spreading
- Jamming = random walk (noise spreads randomly)
- Spoofing = biased walk (signal spreads in chosen direction)

**Analogy:**
```
Normal Signal:    ▁▂▃▄▅▆▇█▆▅▄▃▂▁  (focused peak)
Jamming:         ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃  (white noise, flat everywhere)
Spoofing:        ▁▂▃▄▅▆█▇▆▅▄▃▂▁  (looks normal, but shifted)
```

### 1.2 Technical Explanation (2 levels deeper)

**Mathematical Foundation:**
A 1D quantum walk on a line is defined by:
- Coin operator: C = σ_x (flips qubit state)
- Shift operator: S (moves based on state)
- Evolution: U = S(C ⊗ I_position)

**For signal propagation:**
- Initial state: |ψ⟩ = 1/√2 (|0⟩ + |1⟩) ⊗ |position_0⟩
- After n steps: measurement gives probability distribution

**Example 1D Walk:**
```
Step 0:     |ψ⟩ at position 0
                ↓
Step 1:     |ψ⟩ at positions {-1, +1}
                ↓
Step 2:     |ψ⟩ at positions {-2, 0, +2}
                ↓
Step n:     Probability distribution P(x) over positions
```

**For our system:**
- Frequency encoded as position
- Amplitude encoded as superposition coefficient
- Time evolution simulates signal propagation
- Jamming: adds random phase noise (destroys coherence)
- Spoofing: applies phase bias (shifts probability)

### 1.3 How It Fits into QuantumShield Pipeline

```
Raw Signal (time-domain)
         ↓
     [Quantum Walk]  ← NEW: Encode signal as quantum state
         ↓
Quantum state with probability distribution
         ↓
     [Quantum Encoding]  ← NEW: Map to 2-qubit circuit
         ↓
Feature vector in Hilbert space
         ↓
     [Quantum Clustering]  ← NEW: Classify in quantum space
         ↓
Cluster label + distance
         ↓
     [QSVM]  ← NEW: Final classification
         ↓
Attack Type (jamming/spoofing) + Confidence
```

**Input/Output:**
- **Input:** Time-domain signal [amplitude values]
- **Process:** 
  1. FFT → frequency components
  2. Quantum walk simulation (4-8 steps)
  3. Measure probability distribution
  4. Extract features from distribution
- **Output:** Probability vector [P(freq_i) for i in 0..15]

**Benefits:**
- Captures multi-path signal propagation
- Distinguishes jamming (uniform dist) from spoofing (biased dist)
- Naturally models wave interference

---

## 2. QUANTUM GATE-BASED FEATURE ENCODING

### 2.1 Simple Explanation

**What are quantum gates?**
- Classical gates (AND, OR, NOT) operate on bits
- Quantum gates operate on qubits (use matrices)
- Common gates: H (Hadamard), Ry (Y-rotation), Rz (Z-rotation), CNOT (entangle)

**Our encoding strategy:**
```
Signal Feature → Quantum Gate Parameter
─────────────────────────────────────
Frequency     → Ry angle (rotation magnitude)
Power         → Rz angle (phase shift)
Noise Level   → Hadamard (superposition breadth)
Entanglement  → CNOT (qubit-to-qubit coupling)
```

**Why?**
- Rotations in Bloch sphere naturally map continuous values
- Creates non-linear feature space
- 2-qubit entanglement captures feature correlations
- Quantum advantage for certain ML tasks

### 2.2 Technical Explanation

**Bloch Sphere Representation:**
A single qubit state: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩
- θ (theta): latitude (Ry parameter)
- φ (phi): longitude (Rz parameter)

**Circuit Structure (2-qubit):**
```
Qubit 0: ──Ry(θ_freq)──CNOT──Rz(φ_power)──
              │          ├────┤
Qubit 1: ──H()──────────⊕────Ry(θ_noise)──
```

**Parameter Mapping (normalized to [0, π]):**
```
θ_freq = (frequency / max_frequency) × π
φ_power = (power / max_power) × π
θ_noise = (noise_level / max_noise) × π
```

**Entanglement effect:**
- CNOT creates correlation: if Q0 is |1⟩, Q1 flips
- Captures feature interactions
- Makes state non-separable (quantum advantage)

**2-Qubit State:**
|ψ⟩ = a|00⟩ + b|01⟩ + c|10⟩ + d|11⟩ with |a|² + |b|² + |c|² + |d|² = 1

### 2.3 How It Fits into Pipeline

```
Quantum Walk Output: [P(f_0), P(f_1), ..., P(f_15)]
                              ↓
     [Feature Extraction]
                              ↓
     freq_avg, power_avg, noise_std  (3 scalar features)
                              ↓
     [Quantum Gate Encoding]  ← STEP 2
     ├─ Ry(θ_freq) on Q0
     ├─ H() on Q1
     ├─ CNOT(Q0 → Q1)
     └─ Rz(φ_power), Ry(θ_noise)
                              ↓
     |ψ_encoded⟩ = quantum state in Hilbert space
```

**Input/Output:**
- **Input:** 3 classical features (freq, power, noise)
- **Process:** Apply quantum circuit with parameterized gates
- **Output:** 2-qubit quantum state vector (4 amplitudes)

**Benefits:**
- Non-linear dimensionality reduction (3D → 4D quantum)
- Feature interaction via entanglement
- Basis for quantum clustering & QSVM

---

## 3. QUANTUM CLUSTERING IN HILBERT SPACE

### 3.1 Simple Explanation

**Classical clustering (k-means):**
- Compute Euclidean distance in feature space
- Assign to nearest cluster center
- Update centers iteratively

**Quantum clustering:**
- Compute overlap (inner product) in Hilbert space
- Two quantum states are "close" if their amplitudes align
- Uses quantum kernel: K(ψ_i, ψ_j) = |⟨ψ_i|ψ_j⟩|²

**Why quantum?**
- Captures correlations that classical distance misses
- Exploits 2^n dimensional space (even for 2 qubits → 4D)
- Naturally separates jamming from spoofing

### 3.2 Technical Explanation

**Quantum Feature Map:**
Taking encoded quantum state |ψ_i⟩ for each signal, we compute pairwise kernel:

K_ij = |⟨ψ_i|ψ_j⟩|²

This is the **quantum kernel matrix** (n × n for n samples).

**Example with 2 qubits:**
```
|ψ_normal⟩  = 0.7|00⟩ + 0.5|11⟩     (mostly ground state)
|ψ_jamming⟩ = 0.5|00⟩ + 0.5|01⟩ + 0.5|10⟩ + 0.5|11⟩  (uniform)
|ψ_spoofing⟩ = 0.6|00⟩ + 0.4|01⟩ + 0.3|11⟩  (biased)

Kernel overlap:
K(normal, normal) = 1.0 (same state)
K(normal, jamming) = |0.7×0.5 + 0.5×0.5|² ≈ 0.36
K(normal, spoofing) = |0.7×0.6 + 0.5×0.3|² ≈ 0.40
K(jamming, spoofing) = ... smaller
```

**Clustering Algorithm (simplified):**
1. Compute kernel matrix K for all input states
2. Apply classical kernel k-means (with quantum K)
3. Assign clusters based on kernel distance
4. Output: cluster label ∈ {normal, jamming, spoofing}

**Why Hilbert space?**
- 2 qubits → 4D Hilbert space (2^2)
- Classical 3 features → 3D space (limited)
- Our quantum encoding naturally uses the full 4D space
- Maximizes separation between attack types

### 3.3 How It Fits into Pipeline

```
2-Qubit Quantum State |ψ_encoded⟩
                       ↓
          [Quantum Clustering]
          ├─ Compute kernel with reference states
          │  - |ψ_normal⟩
          │  - |ψ_jamming⟩
          │  - |ψ_spoofing⟩
          ├─ Compute K_ij = |⟨ψ_i|ψ_j⟩|²
          ├─ Find closest cluster
          └─ Output: cluster label
                       ↓
          Cluster: 'normal' or 'jamming' or 'spoofing'
                       ↓
          (Feed to QSVM for final confidence)
```

**Input/Output:**
- **Input:** 2-qubit state vector (4 amplitudes) + reference states
- **Process:** Compute quantum kernel distances to 3 reference clusters
- **Output:** Cluster label + kernel distance scores

**Benefits:**
- First stage classification using quantum geometry
- Reduces search space for QSVM
- Shows quantum advantage: separates correlated features

---

## 4. QSVM (2-QUBIT QUANTUM SUPPORT VECTOR MACHINE)

### 4.1 Simple Explanation

**Classical SVM:**
- Finds best hyperplane separating two classes
- Uses kernel trick to handle non-linearity
- Prediction: sign(w·φ(x) + b)

**Quantum SVM (QSVM):**
- Uses quantum feature map instead of classical φ(x)
- Kernel computed using quantum circuit overlap
- Ultra-powerful: implicit access to exponentially large feature space
- Even 2 qubits → effective 4D feature space (hard classically)

**Why for attack detection?**
- Jamming ↔ Normal separation: quantum states have different coherence
- Spoofing ↔ Normal separation: quantum states have different phase
- QSVM naturally captures these quantum geometric differences

### 4.2 Technical Explanation

**Quantum Feature Map (already embedded in our 2-qubit encoding):**
x ∈ ℝ³ → |ψ(x)⟩ ∈ C⁴ (via Ry, Rz, H, CNOT gates)

**Quantum Kernel:**
```
K(x_i, x_j) = |⟨ψ(x_i)|ψ(x_j)⟩|²
```
This kernel is computed by:
1. Prepare state |ψ(x_i)⟩
2. Apply inverse of feature map for x_j: |ψ(x_j)⟩†
3. Measure probability of returning to |00⟩
4. This measurement gives K(x_i, x_j)

**Training:**
1. Collect training samples: {(x_1, y_1), ..., (x_n, y_n)}
   - x_i: signal features
   - y_i: label (0=normal/spoofing, 1=jamming) [binary for SVM]
2. Compute kernel matrix: K_ij = K(x_i, x_j)
3. Solve dual SVM problem:
   ```
   maximize: Σ α_i - 0.5 Σ α_i α_j y_i y_j K_ij
   subject: 0 ≤ α_i ≤ C, Σ α_i y_i = 0
   ```
4. Store support vectors + coefficients

**Prediction:**
```
f(x) = Σ α_i y_i K(x_i, x) + b
confidence = sigmoid(f(x))
```

**Why 2 qubits?**
- 4 basis states (|00⟩, |01⟩, |10⟩, |11⟩)
- Realistic on quantum simulators (no noise)
- Easily extensible to 3-4 qubits
- Sufficient for proof-of-concept

### 4.3 How It Fits into Pipeline

```
Quantum Clustering Output: cluster label + scores
                               ↓
                    [QSVM Training Phase]
                    ├─ Use training dataset
                    ├─ Compute quantum kernel matrix
                    ├─ Train binary classifier
                    └─ Store support vectors
                               ↓
                    [QSVM Prediction]
                    ├─ Input new signal features
                    ├─ Encode to quantum state
                    ├─ Compute kernel vs support vectors
                    ├─ Evaluate SVM decision function
                    └─ Output: {jamming, spoofing, normal} + confidence
```

**Input/Output:**
- **Input:** 3 classical features (freq, power, noise)
- **Process:** 
  1. Quantum feature map to |ψ⟩
  2. Compute kernels with support vectors
  3. Evaluate SVM decision function
- **Output:** Prediction + confidence score

**Benefits:**
- True ML model trained on data (not rule-based)
- Quantum kernel provides decision boundary
- Confidence measures model certainty

---

# PART II: SYSTEM ARCHITECTURE

---

## Complete Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    QUANTUM SHIELD++ PIPELINE                │
└─────────────────────────────────────────────────────────────┘

STEP 1: Signal Input
   ↓
Raw signal (time-domain samples)
   ↓

STEP 2: Quantum Walk Propagation
   ├─ FFT decomposition
   ├─ Create quantum walk state
   ├─ Evolve for 8 steps
   └─ Measure probability distribution
   ↓
Probability distribution P(x) over frequency spectrum
   ↓

STEP 3: Feature Extraction
   ├─ freq_peak: argmax(P(x))
   ├─ power_sum: sum(P(x))
   └─ noise_std: std(P(x))
   ↓
Feature vector: [freq_peak, power_sum, noise_std]
   ↓

STEP 4: Quantum Gate Encoding
   ├─ Normalize features to [0, π]
   ├─ Apply Ry(θ_freq) on Q0
   ├─ Apply H on Q1
   ├─ CNOT(Q0 → Q1)
   ├─ Apply Rz(φ_power) on Q0
   └─ Apply Ry(θ_noise) on Q1
   ↓
2-qubit quantum state |ψ_encoded⟩
   ↓

STEP 5: Quantum Clustering
   ├─ Define reference states:
   │  - |ψ_normal⟩
   │  - |ψ_jamming⟩
   │  - |ψ_spoofing⟩
   ├─ Compute quantum kernel: K(|ψ⟩, |ψ_ref⟩)
   ├─ Find closest cluster
   └─ Output cluster label + scores
   ↓
Cluster label: {normal, jamming, spoofing}
   ↓

STEP 6: QSVM Classification
   ├─ Evaluate decision function f(x)
   ├─ Sum over support vectors
   └─ Apply sigmoid for confidence
   ↓
Final prediction: {jamming, spoofing, normal}
Final confidence: [0, 1]
   ↓

STEP 7: Adaptive Defense (PQC/QSDC)
   └─ If detected: activate secure channel
```

## Data Flow Diagram

```
GUI Input (Simulate Attack)
         │
         ↓
Node.js Backend
  ├─ /api/quantum/walk
  ├─ /api/quantum/encode
  ├─ /api/quantum/cluster
  ├─ /api/quantum/qsvm/train
  └─ /api/quantum/qsvm/predict
         │
         ↓ (spawn Python process)
Python Quantum Module
  ├─ quantum_walk.py
  ├─ quantum_gates.py
  ├─ quantum_clustering.py
  └─ quantum_qsvm.py
         │
         ↓ (execute with Qiskit simulator)
         │
IBM Quantum Simulator
  (in-memory, no real hardware)
         │
         ↓ (return JSON results)
         │
Node.js Response
         │
         ↓
WebSocket Broadcast
         │
         ↓
React UI Update
  ├─ Circuit diagram
  ├─ State vector
  ├─ Probability histogram
  ├─ Cluster visualization
  └─ Confidence meter
```

---

# PART III: IMPLEMENTATION PLAN

---

## File Structure

```
project-root/
├── quantum/
│   ├── __init__.py
│   ├── qsvm_model.json (existing)
│   ├── quantum_ml_trainer.py (existing - keep existing code)
│   │
│   ├── quantum_walk.py          (NEW)
│   ├── quantum_gates.py         (NEW)
│   ├── quantum_clustering.py    (NEW)
│   ├── quantum_qsvm_v2.py       (NEW - improved 2-qubit version)
│   ├── quantum_pipeline.py      (NEW - orchestrator)
│   ├── utils/
│   │   ├── signal_processor.py  (NEW)
│   │   ├── visualization.py     (NEW - for server-side exports)
│   │   └── constants.py         (NEW)
│   └── models/
│       ├── qsvm_reference_states.json  (NEW - pre-computed)
│       └── qsvm_trained.pkl            (NEW - trained model)
│
├── server.ts (UPDATED)
│   └─ New endpoints: /api/quantum/*
│
└── src/app/
    └── components/
        ├── QuantumCircuitViz.tsx        (NEW)
        ├── QuantumStateViz.tsx          (NEW)
        ├── QuantumClusterViz.tsx        (NEW)
        └── QuantumMLPanel.tsx (UPDATED)
```

---

## Implementation Phases

### PHASE 1: Quantum Walk Module (2-3 hours)

**File:** `quantum/quantum_walk.py`

**Responsibilities:**
- Create quantum walk on position space
- Encode signal as superposition
- Simulate attack propagation
- Extract probability distribution

**Key Functions:**
```python
def create_quantum_walk(signal_samples: List[float], n_steps: int = 8):
    """
    Create 1D quantum walk representing signal propagation
    Input: signal_samples (time-domain signal)
    Output: probability distribution over positions
    """
    pass

def simulate_jamming_walk(base_walk: np.ndarray):
    """Add random phase noise to simulate jamming"""
    pass

def simulate_spoofing_walk(base_walk: np.ndarray, bias: float):
    """Add phase bias to simulate spoofing"""
    pass

def extract_walk_features(prob_dist: np.ndarray):
    """Extract features from probability distribution"""
    # Returns: freq_peak, power_sum, noise_std
    pass
```

**Dependencies:**
- `qiskit.circuit`, `qiskit.primitives`
- `numpy`, `scipy.fft`

---

### PHASE 2: Quantum Gate Encoding (2-3 hours)

**File:** `quantum/quantum_gates.py`

**Responsibilities:**
- Build parameterized 2-qubit circuit
- Map classical features to gate angles
- Prepare quantum state in Hilbert space

**Key Functions:**
```python
def build_feature_encoding_circuit(
    freq_normalized: float,
    power_normalized: float,
    noise_normalized: float
):
    """
    Build 2-qubit circuit encoding features:
    - Ry(freq) on Q0
    - H on Q1
    - CNOT(Q0→Q1)
    - Rz(power) on Q0
    - Ry(noise) on Q1
    """
    pass

def get_quantum_state_vector(circuit: QuantumCircuit):
    """Get statevector from circuit"""
    pass

def visualize_circuit_as_string(circuit: QuantumCircuit) -> str:
    """Return circuit diagram as string/SVG"""
    pass
```

**Dependencies:**
- `qiskit.circuit`, `qiskit.quantum_info`

---

### PHASE 3: Quantum Clustering (3-4 hours)

**File:** `quantum/quantum_clustering.py`

**Responsibilities:**
- Compute quantum kernel matrix
- Cluster using kernel distances
- Provide cluster labels + scores

**Key Functions:**
```python
def generate_reference_states():
    """Pre-compute reference states for:
    - Normal signal (low noise, focused)
    - Jamming (high noise, broad)
    - Spoofing (biased, asymmetric)"""
    pass

def compute_quantum_kernel(statevec1: np.ndarray, statevec2: np.ndarray):
    """
    Compute K(ψ1, ψ2) = |⟨ψ1|ψ2⟩|²
    """
    pass

def quantum_clustering_predict(
    encoded_state: np.ndarray,
    reference_states: Dict[str, np.ndarray]
):
    """
    Find closest reference state using quantum kernel
    Return: (cluster_label, kernel_scores_dict)
    """
    pass

def save_reference_states(filepath: str):
    """Save pre-computed reference states to JSON"""
    pass

def load_reference_states(filepath: str):
    """Load pre-computed reference states"""
    pass
```

**Algorithm:**
```python
def quantum_clustering_predict(state_vec, ref_states):
    scores = {}
    for label, ref_vec in ref_states.items():
        kernel_val = abs(np.dot(np.conj(state_vec), ref_vec))**2
        scores[label] = kernel_val
    cluster = max(scores, key=scores.get)
    return cluster, scores
```

---

### PHASE 4: QSVM (2-Qubit) (4-5 hours)

**File:** `quantum/quantum_qsvm_v2.py`

**Responsibilities:**
- Train quantum SVM on dataset
- Use 2-qubit feature map
- Make predictions with confidence

**Key Functions:**
```python
class QuantumSVM:
    def __init__(self):
        self.support_vectors = []
        self.coefficients = []
        self.bias = 0
        self.reference_states = {}
    
    def fit(self, X_train: np.ndarray, y_train: np.ndarray):
        """
        Train SVM:
        1. Encode each sample to quantum state via feature map
        2. Compute kernel matrix
        3. Solve SVM dual problem
        4. Store support vectors
        """
        pass
    
    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict and return:
        - predictions: labels {0, 1}
        - confidence: [0, 1] scores
        """
        pass
    
    def _quantum_feature_map(self, x: np.ndarray):
        """Convert feature vector to 2-qubit state"""
        pass
    
    def _compute_kernel_matrix(self, X: np.ndarray):
        """Compute full kernel matrix"""
        pass
    
    def save(self, filepath: str):
        """Pickle model"""
        pass
    
    def load(self, filepath: str):
        """Unpickle model"""
        pass
```

**Training Algorithm:**
```python
def fit(self, X, y):
    # 1. Feature map each sample
    quantum_states = []
    for x in X:
        state = self._quantum_feature_map(x)  # Shape: (4,) for 2 qubits
        quantum_states.append(state)
    
    # 2. Compute kernel matrix
    n_samples = len(X)
    K = np.zeros((n_samples, n_samples))
    for i in range(n_samples):
        for j in range(n_samples):
            K[i, j] = abs(np.dot(np.conj(quantum_states[i]), quantum_states[j]))**2
    
    # 3. Solve classical SVM dual with quantum kernel
    from sklearn.svm import SVC
    svm = SVC(kernel='precomputed')
    svm.fit(K, y)
    
    # 4. Store support vectors + coefficients
    self.support_vectors = X[svm.support_]
    self.coefficients = svm.dual_coef_[0]
    self.bias = svm.intercept_[0]
```

---

### PHASE 5: Pipeline Orchestrator (1-2 hours)

**File:** `quantum/quantum_pipeline.py`

**Responsibilities:**
- Chain all 4 quantum modules
- Handle signal input/output
- Provide unified inference interface

**Key Functions:**
```python
class QuantumDefensePipeline:
    def __init__(self):
        self.walk_module = QuantumWalk()
        self.encoding_module = QuantumGateEncoding()
        self.clustering_module = QuantumClustering()
        self.qsvm_module = QuantumSVM()
        self.is_trained = False
    
    def process_signal(self, signal: np.ndarray) -> Dict:
        """
        Full inference pipeline:
        signal → walk → encoding → clustering → qsvm → output
        
        Returns: {
            'attack_type': 'jamming'|'spoofing'|'normal',
            'confidence': 0.95,
            'quantum_walk_dist': [...],
            'encoded_state': [...],
            'cluster_label': 'jamming',
            'cluster_scores': {'jamming': 0.8, ...},
            'qsvm_score': 0.85,
            'metadata': {...}
        }
        """
        pass
    
    def train_qsvm(self, X_train: np.ndarray, y_train: np.ndarray):
        """Train the QSVM component"""
        pass
    
    def export_visualization_data(self) -> Dict:
        """Export circuit diagrams, state vectors for UI"""
        pass
    
    def save_models(self, filepath: str):
        pass
    
    def load_models(self, filepath: str):
        pass
```

**Implementation:**
```python
def process_signal(self, signal):
    # Step 1: Quantum Walk
    walk_prob_dist = self.walk_module.create_walk(signal)
    
    # Step 2: Extract features
    features = self.walk_module.extract_walk_features(walk_prob_dist)
    
    # Step 3: Quantum Encoding
    normalized_features = self._normalize(features)
    circuit, state_vec = self.encoding_module.encode(normalized_features)
    
    # Step 4: Quantum Clustering
    cluster_label, cluster_scores = self.clustering_module.predict(state_vec)
    
    # Step 5: QSVM
    if self.is_trained:
        prediction, confidence = self.qsvm_module.predict(features)
    else:
        prediction, confidence = cluster_label, max(cluster_scores.values())
    
    return {
        'attack_type': prediction,
        'confidence': confidence,
        'walk_dist': walk_prob_dist,
        'encoded_state': state_vec,
        'cluster': cluster_label,
        'cluster_scores': cluster_scores,
    }
```

---

### PHASE 6: Signal Processing Utils (1-2 hours)

**File:** `quantum/utils/signal_processor.py`

**Responsibilities:**
- Convert time-domain to frequency domain
- Normalize/denormalize features
- Create synthetic training signals

**Key Functions:**
```python
def signal_to_frequency(signal: np.ndarray) -> np.ndarray:
    """FFT decomposition"""
    pass

def create_training_dataset():
    """
    Generate synthetic training data:
    - 50 samples: normal signals
    - 50 samples: jamming (random noise)
    - 50 samples: spoofing (biased noise)
    """
    pass

def normalize_features(features: np.ndarray, 
                       feature_ranges: Dict) -> np.ndarray:
    """Normalize to [0, π] for quantum gates"""
    pass
```

---

## Python Dependencies

**Add to requirements.txt:**
```
qiskit==0.46.0
qiskit-machine-learning==0.7.1
qiskit-aer==0.13.1
numpy==1.24.3
scipy==1.11.2
scikit-learn==1.3.0
pandas==2.0.3
matplotlib==3.8.0
```

---

# PART IV: BACKEND INTEGRATION

---

## New REST Endpoints

Add these to `server.ts`:

```typescript
// Quantum Walk Endpoint
POST /api/quantum/walk
{
  "signal": [0.1, 0.2, ..., 0.05],
  "attack_type": "jamming"|"spoofing"|"normal"
}
Response: {
  "probability_dist": [0.1, 0.05, ...],
  "peak_frequency": 5,
  "total_power": 1.0
}

// Quantum Encoding Endpoint
POST /api/quantum/encode
{
  "features": [frequency, power, noise]
}
Response: {
  "circuit": "OPENQASM 2.0; ...",
  "state_vector": [a, b, c, d],
  "state_vector_names": ["|00>", "|01>", "|10>", "|11>"]
}

// Quantum Clustering Endpoint
POST /api/quantum/cluster
{
  "state_vector": [a, b, c, d]
}
Response: {
  "cluster_label": "jamming",
  "kernel_scores": {
    "normal": 0.2,
    "jamming": 0.8,
    "spoofing": 0.15
  }
}

// QSVM Training Endpoint
POST /api/quantum/qsvm/train
{
  "training_data": {X_train: [...], y_train: [...]},
  "auto": true
}
Response: {
  "success": true,
  "n_samples": 150,
  "n_support_vectors": 42,
  "timestamp": "2026-03-25T10:30:00Z"
}

// QSVM Prediction Endpoint
POST /api/quantum/qsvm/predict
{
  "features": [frequency, power, noise],
  "return_visualization": true
}
Response: {
  "prediction": "jamming"|"spoofing"|"normal",
  "confidence": 0.92,
  "qsvm_decision_value": 0.75,
  "quantum_visualization": {
    "circuit": "...",
    "state_vector": [a, b, c, d],
    "probability_histogram": [0.5, 0.3, 0.15, 0.05],
    "cluster_label": "jamming"
  }
}

// Full Pipeline Inference Endpoint
POST /api/quantum/infer
{
  "signal": [0.1, 0.2, ..., 0.05],
  "return_full_pipeline": true
}
Response: {
  "final_result": "jamming",
  "confidence": 0.88,
  "pipeline_stages": {
    "quantum_walk": {...},
    "encoding": {...},
    "clustering": {...},
    "qsvm": {...}
  },
  "metadata": {
    "execution_time_ms": 450,
    "n_qubits": 2,
    "simulator": "qasm_simulator"
  }
}
```

---

## Node.js Integration Code

**In server.ts (pseudo-code):**

```typescript
async function handleQuantumInference(req: IncomingMessage, res: ServerResponse) {
  const body = JSON.parse(await getBody(req));
  const { signal, return_full_pipeline } = body;

  const pythonResult = await spawn('python3', [
    'quantum/quantum_pipeline.py',
    '--mode', 'infer',
    '--signal', JSON.stringify(signal),
    '--full_pipeline', return_full_pipeline ? 'true' : 'false'
  ]);

  const result = parseJsonOutput(pythonResult.stdout);

  // Broadcast via WebSocket
  broadcastToClients({
    type: 'QUANTUM_INFERENCE_COMPLETE',
    quantumData: result,
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}
```

---

# PART V: FRONTEND VISUALIZATION

---

## New React Components

### 1. Quantum Circuit Visualization
**File:** `src/app/components/QuantumCircuitViz.tsx`

```typescript
interface QuantumCircuitVizProps {
  circuitQasm: string;
  n_qubits: number;
  gate_params: Record<string, number>;
}

export function QuantumCircuitViz({ circuitQasm, n_qubits, gate_params }: QuantumCircuitVizProps) {
  return (
    <Card>
      <CardContent>
        <h3>Quantum Circuit (2-Qubit Feature Map)</h3>
        <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
          {circuitQasm}
        </pre>
        <div style={{marginTop: '10px'}}>
          <strong>Gate Parameters:</strong>
          <ul>
            {Object.entries(gate_params).map(([gate, value]) => (
              <li key={gate}>{gate}: {value.toFixed(3)} rad ({(value * 180 / Math.PI).toFixed(1)}°)</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Quantum State Visualization
**File:** `src/app/components/QuantumStateViz.tsx`

```typescript
interface QuantumStateVizProps {
  state_vector: Complex[];
  basis_labels: string[];
}

export function QuantumStateViz({ state_vector, basis_labels }: QuantumStateVizProps) {
  // Plot probability distribution as bars
  // +  State vector as Bloch sphere (if single qubit mode)
  // +  Basis state labels |00>, |01>, |10>, |11>
  
  const probabilities = state_vector.map(amp => Math.abs(amp)**2);
  const data = basis_labels.map((label, i) => ({
    basis: label,
    probability: probabilities[i] * 100,
  }));

  return (
    <Card>
      <CardContent>
        <h3>Quantum State (2-Qubit)</h3>
        <BarChart data={data}>
          <XAxis dataKey="basis" />
          <YAxis label={{value: 'P(%)', angle: -90, position: 'insideLeft'}} />
          <Bar dataKey="probability" fill="#8884d8" name="Probability" />
        </BarChart>
        <div style={{marginTop: '10px', fontSize: '12px'}}>
          <strong>Amplitudes:</strong>
          {state_vector.map((amp, i) => (
            <div key={i}>{basis_labels[i]}: {amp.toFixed(3)}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. Quantum Clustering Visualization
**File:** `src/app/components/QuantumClusterViz.tsx`

```typescript
interface QuantumClusterVizProps {
  cluster_label: string;
  cluster_scores: Record<string, number>;
  current_state: number[];
  reference_states: Record<string, number[]>;
}

export function QuantumClusterViz({
  cluster_label,
  cluster_scores,
  current_state,
  reference_states
}: QuantumClusterVizProps) {
  // Shows:
  // 1. Cluster label badge
  // 2. Radar chart with kernel scores to reference states
  // 3. 3D plot (if reducing to 3D using PCA)

  return (
    <Card>
      <CardContent>
        <h3>Quantum Cluster Classification</h3>
        <Badge className="text-lg">{cluster_label}</Badge>
        
        <div style={{marginTop: '15px'}}>
          <strong>Quantum Kernel Distances:</strong>
          <RadarChart
            width={300}
            height={300}
            data={Object.entries(cluster_scores).map(([label, score]) => ({
              cluster: label,
              kernel_overlap: score * 100
            }))}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="cluster" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Kernel Overlap (%)" dataKey="kernel_overlap" stroke="#82ca9d" fill="#82ca9d" />
          </RadarChart>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. Updated QuantumMLPanel
**File:** `src/app/components/QuantumMLPanel.tsx` (ADD to existing)

```typescript
interface QuantumVisualizationData {
  circuit_qasm: string;
  state_vector: Complex[];
  basis_labels: string[];
  gate_params: Record<string, number>;
  cluster_label: string;
  cluster_scores: Record<string, number>;
  quantum_walk_dist: number[];
}

export function QuantumMLPanel() {
  const [vizData, setVizData] = useState<QuantumVisualizationData | null>(null);
  const { launchAttack } = useSystem();

  const handleFullPipelineShow = async () => {
    const response = await fetch('/api/quantum/infer?return_full_pipeline=true', {
      method: 'POST',
      body: JSON.stringify({ signal: [...] }),
    });
    const result = await response.json();
    setVizData(result.quantum_visualization);
  };

  return (
    <div className="space-y-4">
      {/* Tabs for each quantum stage */}
      <Tabs defaultValue="circuit">
        <TabsList>
          <TabsTrigger value="circuit">Circuit</TabsTrigger>
          <TabsTrigger value="state">State</TabsTrigger>
          <TabsTrigger value="clustering">Clustering</TabsTrigger>
          <TabsTrigger value="walk">Quantum Walk</TabsTrigger>
        </TabsList>
        
        <TabsContent value="circuit">
          {vizData && <QuantumCircuitViz {...vizData} />}
        </TabsContent>
        
        <TabsContent value="state">
          {vizData && <QuantumStateViz state_vector={vizData.state_vector} basis_labels={vizData.basis_labels} />}
        </TabsContent>
        
        <TabsContent value="clustering">
          {vizData && <QuantumClusterViz cluster_label={vizData.cluster_label} cluster_scores={vizData.cluster_scores} />}
        </TabsContent>

        <TabsContent value="walk">
          {vizData && (
            <Card>
              <CardContent>
                <LineChart data={vizData.quantum_walk_dist.map((v, i) => ({x: i, prob: v * 100}))}>
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Line type="monotone" dataKey="prob" stroke="#ffc658" />
                </LineChart>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Button onClick={handleFullPipelineShow}>Show Quantum Pipeline</Button>
    </div>
  );
}
```

---

# PART VI: DEMO STRATEGY

---

## 30-Second VivaDemonstration

### Setup
- Pre-train QSVM on 150 synthetic samples (100 normal, 35 jamming, 15 spoofing)
- Have reference states pre-computed and cached
- Run on local simulator (no network latency)

### Demo Sequence

**[0-5 seconds] Explain System**
```
"This is QuantumShield++: A quantum-based attack detection system.
We use 2 quantum bits to encode signal features in Hilbert space."
```

**[5-15 seconds] Launch Detection**
- Click "Attacker" → Select "Jamming"
- System flow:
  1. Signal → Quantum Walk → Probability distribution
  2. Features → 2-Qubit Circuit → Quantum State
  3. State → Quantum Clustering → Cluster label
  4. Full pipeline → QSVM → Final prediction + confidence

**[15-25 seconds] Show Visualizations**
- **Tab 1 (Circuit):** Show 2-qubit circuit with Ry, H, CNOT, Rz gates
  - Point out: "Each gate is parameterized by signal features"
- **Tab 2 (State):** Show probability histogram
  - Point out: "Jamming = uniform (broad), Normal = focused (sharp)"
- **Tab 3 (Clustering):** Show quantum kernel scores
  - Point out: "Highest overlap with 'jamming' reference state"

**[25-30 seconds] Show Prediction**
```
Display:
  Attack Type: JAMMING (confidence 0.94)
  Quantum Kernel Overlap: 0.89 with jamming reference
  Processing Time: 340ms
  Qubits Used: 2
  Simulator: IBM Aer Simulator
```

---

## Full Hackathon Demo (10 minutes)

### Part A: System Overview (2 min)
- Show architecture diagram
- Explain 4 quantum components
- Point out simulator (not real quantum)

### Part B: Quantum Walk Demo (2 min)
- Show normal signal vs jamming signal
- Run Quantum Walk simulation
- Show probability distributions
  ```
  Normal:  ▁ ▂ ▃ █ ▃ ▂ ▁  (focused)
  Jamming: ▃ ▃ ▃ ▃ ▃ ▃ ▃  (flat)
  ```

### Part C: 2-Qubit Encoding Demo (2 min)
- Select signal type
- Show 2-qubit circuit:
  ```
  q[0]: ──Ry(θ_freq)──●──Rz(φ_power)──
                       │
  q[1]: ──H()─────────⊕──Ry(θ_noise)──
  ```
- Show state vector: `[a, b, c, d]`
- Explain Bloch sphere representation

### Part D: Clustering & QSVM (3 min)
- Show quantum kernel matrix
- Display clustering result
- Show QSVM decision boundary
- Compare with classical ML (chart)

### Part E: Interactive Test (1 min)
- Let audience select attack type
- System processes in real-time
- Show final prediction with confidence

---

## Interactive Dashboard Flow

**Homepage:**
```
┌─────────────────────────────────┐
│   QuantumShield++ Dashboard     │
├─────────────────────────────────┤
│ [Attacker] [Defender] [Spectate]│
└─────────────────────────────────┘
```

**Attacker Page (after clicking):**
```
┌──────────────────────────────────────────┐
│ ATTACK CONTROLS                          │
├──────────────────────────────────────────┤
│ Attack Type: [Jamming] [Spoofing]       │
│ Launch [Attack Button]                   │
├──────────────────────────────────────────┤
│ QUANTUM VISUALIZATION (NEW)              │
│ ┌─────────────────────────────────────┐ │
│ │ Tabs: [Circuit] [State] [Cluster]  │ │
│ │                                     │ │
│ │ [2-Qubit Circuit Diagram]          │ │
│ │ ┌──────────────────────────┐       │ │
│ │ │ q[0]──Ry(1.23)──●──Rz   │       │ │
│ │ │                  │       │       │ │
│ │ │ q[1]──H────────⊕──Ry    │       │ │
│ │ └──────────────────────────┘       │ │
│ │                                     │ │
│ │ State Vector: |00>: 0.707          │ │
│ │              |01>: 0.105           │ │
│ │              |10>: 0.081           │ │
│ │              |11>: 0.595           │ │
│ │                                     │ │
│ │ [Probability Bar Chart]            │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ PREDICTION RESULT                        │
│ Attack: JAMMING  | Confidence: 0.94    │
│ Quantum Kernel: 0.89                    │
├──────────────────────────────────────────┤
```

**Defender Page (after clicking):**
```
┌──────────────────────────────────────────┐
│ DETECTION STATUS                         │
├──────────────────────────────────────────┤
│ Status: UNDER ATTACK (Jamming)          │
│ ML Confidence: 0.94                      │
│ Quantum State: Entangled                │
├──────────────────────────────────────────┤
│ CLUSTERING RESULT                        │
│ ┌──────────────────────────────────────┐│
│ │       Quantum Kernel Scores          ││
│ │       Jamming    ████████░░ 0.89    ││
│ │       Spoofing   ██░░░░░░░░ 0.18    ││
│ │       Normal     ███░░░░░░░ 0.28    ││
│ └──────────────────────────────────────┘│
├──────────────────────────────────────────┤
│ [Activate Defense] button                │
└──────────────────────────────────────────┘
```

---

## Expected Performance Metrics

```
Quantum Walk Simulation:        ~50ms
2-Qubit Circuit Construction:   ~20ms
Quantum State Vector Compute:   ~15ms
Kernel Computation (3 refs):    ~25ms
QSVM Prediction:                ~40ms
─────────────────────────────────
Total End-to-End:               ~150ms
```

With visualization data formatting:
```
Total (with data export):       ~200-300ms
```

---

# PART VII: IMPLEMENTATION CHECKLIST

---

## Code Files to Create

- [ ] `quantum/quantum_walk.py` (250 lines)
- [ ] `quantum/quantum_gates.py` (200 lines)
- [ ] `quantum/quantum_clustering.py` (300 lines)
- [ ] `quantum/quantum_qsvm_v2.py` (400 lines)
- [ ] `quantum/quantum_pipeline.py` (300 lines)
- [ ] `quantum/utils/signal_processor.py` (150 lines)
- [ ] `quantum/utils/constants.py` (50 lines)
- [ ] `src/app/components/QuantumCircuitViz.tsx` (100 lines)
- [ ] `src/app/components/QuantumStateViz.tsx` (120 lines)
- [ ] `src/app/components/QuantumClusterViz.tsx` (150 lines)

## Code Files to Modify

- [ ] `server.ts` (add 6 new endpoints)
- [ ] `src/app/components/QuantumMLPanel.tsx` (add visualization tabs)

## Pre-computed Data Files

- [ ] `quantum/models/qsvm_reference_states.json` (auto-generated)
- [ ] `quantum/models/qsvm_trained.pkl` (auto-generated during training)

## Dependencies to Install

- [ ] `pip install qiskit==0.46.0`
- [ ] `pip install qiskit-machine-learning==0.7.1`
- [ ] `npm install recharts d3` (for frontend viz)

---

# PART VIII: QUICK START GUIDE

---

## Implementation Timeline (1-2 Days)

**Day 1 Morning (3 hours):**
- Create Python quantum modules 1-5
- Write unit tests

**Day 1 Afternoon (3 hours):**
- Integrate with Node.js backend
- Test API endpoints

**Day 2 Morning (2 hours):**
- Create React visualization components
- Integrate with frontend

**Day 2 Afternoon (1 hour):**
- Run end-to-end demo
- Polish and debug

---

## First Step: Run Validation

```bash
# 1. Create quantum modules
cd quantum/
python -m quantum_walk  # Test quantum walk
python -m quantum_gates  # Test 2-qubit encoding

# 2. Generate training data
python quantum/utils/signal_processor.py --generate_training_data

# 3. Train QSVM
python quantum/quantum_qsvm_v2.py --train

# 4. Test pipeline
python quantum/quantum_pipeline.py --test_signal jamming

# 5. Start app
npm run dev:all
```

---

## Next Steps

1. **Proceed to implementation** → Scroll to Part IX (coming below)
2. **Ask for specific code** → I'll provide complete files
3. **Vector Quantum Gates & Training** → Ready to code 
4. **Integration testing** → Ready to debug

---

**End of Planning Document**

---

### Questions for Implementation?

1. Should I provide full working code files now?
2. Do you want me to start with the backend or frontend?
3. Need help with specific quantum concepts?

