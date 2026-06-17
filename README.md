# ⚛️ QuantumShield++
### Advanced Quantum Cyber Defense Platform

> A production-grade, full-stack quantum cybersecurity simulation platform featuring real-time attack detection, quantum machine learning classification, post-quantum cryptography, and interactive quantum algorithm visualizations — built with React, Node.js, and Python Qiskit.

---

## 🖥️ Live Demo Preview

```
  ██████  ██    ██  █████  ███    ██ ████████ ██    ██ ███    ███ 
 ██    ██ ██    ██ ██   ██ ████   ██    ██    ██    ██ ████  ████ 
 ██    ██ ██    ██ ███████ ██ ██  ██    ██    ██    ██ ██ ████ ██ 
 ██ ▄▄ ██ ██    ██ ██   ██ ██  ██ ██    ██    ██    ██ ██  ██  ██ 
  ██████   ██████  ██   ██ ██   ████    ██     ██████  ██      ██ 
     ▀▀                                                            
  ███████ ██   ██ ██ ███████ ██      ██████  ++                   
  ██      ██   ██ ██ ██      ██      ██   ██                      
  ███████ ███████ ██ █████   ██      ██   ██                      
       ██ ██   ██ ██ ██      ██      ██   ██                      
  ███████ ██   ██ ██ ███████ ███████ ██████                       
```

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Architecture](#-architecture)
4. [Tech Stack](#-tech-stack)
5. [Project Structure](#-project-structure)
6. [Pages & Routes](#-pages--routes)
7. [Quantum Modules (Python)](#-quantum-modules-python)
8. [Frontend Components](#-frontend-components)
9. [Backend API & WebSocket](#-backend-api--websocket)
10. [State Management](#-state-management)
11. [Quantum Algorithms Explained](#-quantum-algorithms-explained)
12. [Installation & Setup](#-installation--setup)
13. [Running the Platform](#-running-the-platform)
14. [API Reference](#-api-reference)
15. [Attack Simulation Flow](#-attack-simulation-flow)
16. [Security & Cryptography](#-security--cryptography)
17. [UI Design System](#-ui-design-system)
18. [Performance Notes](#-performance-notes)
19. [Known Limitations](#-known-limitations)
20. [Future Roadmap](#-future-roadmap)

---

## 🌐 Overview

**QuantumShield++** is a futuristic cyber defense platform that demonstrates how quantum computing algorithms can be applied to real-world signal security problems. It simulates a live electronic warfare environment where an **Attacker** can launch jamming or spoofing attacks on a communication channel, and a **Defender** uses a quantum machine learning pipeline to detect, classify, and neutralize those attacks in real time.

The platform bridges cutting-edge quantum computing theory with practical cybersecurity applications by combining:

- **Quantum Walk** — for signal propagation analysis
- **Quantum Gate Encoding** — for feature embedding in Hilbert space
- **Quantum Clustering** — for unsupervised anomaly grouping
- **Quantum SVM (QSVM)** — for supervised attack classification
- **BB84 Quantum Key Distribution (QSDC)** — for provably secure communication
- **Post-Quantum Cryptography (PQC)** — CRYSTALS-Kyber, CRYSTALS-Dilithium, FALCON

All quantum computations are implemented in **pure NumPy** (hardware-free simulation), with optional **Qiskit** integration for circuit-level simulation.

---

## ✨ Key Features

### 🎯 Real-Time Attack Detection
- Launch **Jamming** or **Spoofing** attacks from the Attacker Dashboard
- Defender detects and classifies attacks via quantum ML pipeline in real time
- System transitions through states: `normal → under-attack → processing → detected → switching → secure`
- All state changes are broadcast to all connected clients via WebSocket

### 🤖 Quantum ML Pipeline (4-Stage)
| Stage | Module | Algorithm |
|-------|--------|-----------|
| 1 | Quantum Walk | Discrete-time Hadamard coin walk (16 positions, 8 steps) |
| 2 | Quantum Gate Encoding | 2-qubit RY/CNOT/RZ parameterized circuit |
| 3 | Quantum Clustering | Fidelity-based quantum kernel similarity |
| 4 | QSVM | Quantum kernel SVM with sklearn fallback |

### 🔐 Cryptographic Layers
- **QSDC Panel**: BB84 quantum key distribution simulation (512 qubits, QBER monitoring)
- **PQC Panel**: CRYSTALS-Kyber-768, CRYSTALS-Dilithium-3 key exchange and signature ceremonies
- Visual display of key fingerprints, quantum bit error rates, lattice hardness metrics

### 📊 Live Visualizations
- **ThreatRadar** — animated SVG radar with rotating sweep arm, threat dots by angle/distance
- **QuantumWalkViz** — canvas-based probability distribution animation (30 FPS)
- **BlochSphere** — 3D CSS qubit state visualization with theta/phi controls
- **ClusterSpace3D** — rotating 3D scatter plot of quantum clusters
- **SignalChart** — recharts waveform display with jamming/spoofing noise overlays
- **AIThreatIntelligence** — SVG circular threat gauge + recharts forecast + attack history timeline

### 🎬 Cinematic Boot Sequence
- 3-second canvas matrix-rain boot animation on first app load
- Sequential typed log messages, neon cyan progress bar
- Smooth fade-out before main app renders

### 🌐 Multi-Client Sync
- WebSocket server broadcasts all state changes to every connected browser
- Any client launching an attack is visible on all Defender dashboards simultaneously

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BROWSER CLIENTS                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐  │
│  │  Command Center  │  │  Attack Simulator│  │  Defense Center        │  │
│  │  /              │  │  /attacker        │  │  /defender             │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────────┬────────────┘  │
│           └────────────────────┼────────────────────────┘              │
│                                │ WebSocket (ws://localhost:3001)        │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                      NODE.JS BACKEND (server.ts)                         │
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐    │
│  │  WebSocket       │  │  HTTP REST API   │  │  State Broadcaster   │    │
│  │  Server (ws)     │  │  (http module)   │  │  (globalState)       │    │
│  │                  │  │                  │  │                      │    │
│  │  PING/PONG       │  │  POST /api/      │  │  → All WS clients    │    │
│  │  MODE_CHANGE     │  │  quantum/infer   │  │                      │    │
│  │  ATTACK_LAUNCHED │  │  quantum/train   │  │                      │    │
│  │  STATE_UPDATE    │  │  qsdc/simulate   │  │                      │    │
│  │                  │  │  pqc/simulate    │  │                      │    │
│  │                  │  │  quantum/walk    │  │                      │    │
│  └─────────────────┘  └────────┬─────────┘  └──────────────────────┘    │
│                                │ child_process.spawn('python3', ...)     │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                        PYTHON QUANTUM ENGINE                             │
│                          (/quantum/*.py)                                  │
│                                                                          │
│  ┌──────────────┐ ┌─────────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │quantum_walk  │ │quantum_gates    │ │quantum_      │ │quantum_     │  │
│  │.py           │ │.py              │ │clustering.py │ │qsvm_v2.py   │  │
│  │              │ │                 │ │              │ │             │  │
│  │QuantumWalk   │ │QuantumGate      │ │QuantumCluster│ │QuantumSVM   │  │
│  │Hadamard coin │ │Encoding         │ │fidelity kern │ │2-qubit feat │  │
│  │n_steps=8     │ │2-qubit circuit  │ │3 centroids   │ │map + SVC    │  │
│  └──────────────┘ └─────────────────┘ └──────────────┘ └─────────────┘  │
│                                                                          │
│  ┌──────────────┐ ┌─────────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │quantum_      │ │quantum_pqc.py   │ │quantum_      │ │quantum_ml_  │  │
│  │pipeline.py   │ │                 │ │qsdc.py       │ │trainer.py   │  │
│  │              │ │KyberKEM         │ │              │ │             │  │
│  │Orchestrates  │ │DilithiumDSA     │ │BB84Protocol  │ │QSVM trainer │  │
│  │all 4 stages  │ │PQCSystem        │ │QSDCSystem    │ │(legacy API) │  │
│  └──────────────┘ └─────────────────┘ └──────────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | — | Type safety |
| Vite | 6.3.5 | Build tool & dev server |
| TailwindCSS | 4.1.12 | Utility CSS (v4) |
| Motion (Framer) | 12.23.24 | Animations (`motion/react`) |
| React Router | 7.13.0 | SPA routing |
| Recharts | 2.15.2 | Signal & forecast charts |
| Lucide React | 0.487.0 | Icons |
| Radix UI | various | Accessible UI primitives |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | — | Runtime |
| TypeScript (tsx) | 4.7.0 | Server TypeScript execution |
| ws | 8.16.0 | WebSocket server |
| http (built-in) | — | REST API server |
| child_process (built-in) | — | Python process spawning |
| concurrently | 8.2.2 | Run frontend + backend simultaneously |

### Python / Quantum
| Library | Purpose |
|---------|---------|
| NumPy | All quantum state vector math |
| Qiskit | Optional quantum circuit simulation (QuantumCircuit, ClassicalRegister) |
| scikit-learn | SVC for QSVM training, make_blobs for dataset generation |
| Python 3.9+ | Runtime (Python 3.10+ recommended) |

---

## 📁 Project Structure

```
AAQC2/
├── index.html                    # Vite HTML entry point
├── package.json                  # Node dependencies & scripts
├── vite.config.ts                # Vite configuration
├── postcss.config.mjs            # PostCSS (Tailwind v4)
├── server.ts                     # Node.js WebSocket + HTTP backend
│
├── src/
│   ├── main.tsx                  # React entry point
│   └── app/
│       ├── App.tsx               # Root component (RouterProvider + SystemProvider)
│       ├── routes.tsx            # React Router route definitions
│       │
│       ├── context/
│       │   └── SystemContext.tsx # Global state (WebSocket + all ML data)
│       │
│       ├── pages/
│       │   ├── CommandCenterPage.tsx   # Main HUD (/)
│       │   ├── AttackerPage.tsx        # Attack Simulator (/attacker)
│       │   ├── DefenderPage.tsx        # Defense Center (/defender)
│       │   └── QuantumLabPage.tsx      # Quantum Lab (/quantum-lab)
│       │
│       ├── components/
│       │   ├── BootSequence.tsx        # 3-second cinematic boot animation
│       │   ├── ThreatRadar.tsx         # Animated SVG radar component
│       │   ├── BlochSphere.tsx         # 3D CSS Bloch sphere visualization
│       │   ├── QuantumWalkViz.tsx      # Canvas quantum walk animation
│       │   ├── ClusterSpace3D.tsx      # 3D rotating cluster visualization
│       │   ├── AIThreatIntelligence.tsx# AI threat panel with forecast
│       │   ├── DetectionPanel.tsx      # Attack classification HUD
│       │   ├── QuantumMLPanel.tsx      # 4-stage ML pipeline display
│       │   ├── QSDCPanel.tsx           # BB84 quantum key distribution panel
│       │   ├── PQCPanel.tsx            # Post-quantum cryptography panel
│       │   ├── SignalChart.tsx         # Real-time waveform chart
│       │   ├── CommunicationPanel.tsx  # Channel status display
│       │   ├── AttackControls.tsx      # Attack type selector
│       │   ├── ConnectionStatus.tsx    # WebSocket connection indicator
│       │   ├── QuantumCircuitViz.tsx   # Circuit diagram SVG renderer
│       │   ├── QuantumClusterViz.tsx   # 2D cluster scatter plot
│       │   ├── QuantumStateViz.tsx     # Quantum state bar charts
│       │   └── ui/                     # Radix UI component wrappers
│       │
│       └── types/                      # TypeScript type definitions
│
└── quantum/
    ├── quantum_walk.py               # Discrete-time quantum walk engine
    ├── quantum_gates.py              # 2-qubit gate encoding circuits
    ├── quantum_clustering.py         # Quantum kernel clustering
    ├── quantum_qsvm_v2.py            # Quantum SVM classifier
    ├── quantum_pipeline.py           # 4-stage pipeline orchestrator
    ├── quantum_qsdc.py               # BB84 QSDC protocol simulation
    ├── quantum_pqc.py                # PQC (Kyber + Dilithium) simulation
    ├── quantum_ml_trainer.py         # Legacy QSVM trainer (backward compat)
    ├── qsvm_model.json               # Persisted QSVM model state
    ├── quantum_pipeline_model.json   # Pipeline model state
    └── utils/
        └── signal_processor.py       # Signal feature extraction utilities
```

---

## 📄 Pages & Routes

### `/` — Command Center
The main HUD overview page. This is your mission control.

- **Particle Canvas**: 60 animated floating particles (neon cyan, purple, red, green) on a dark background
- **ThreatRadar**: Live animated radar showing threats by angle/distance with rotating sweep arm
- **Navigation Tiles**: Large glowing cards linking to Attacker, Defender, and Quantum Lab
- **System Metrics Panel**: Live CPU/Memory/Signal Integrity/Quantum Uptime bars
- **Global Status Bar**: Current attack type, system status, and ML confidence
- **BootSequence**: 3-second cinematic animation on first load (matrix rain + typed logs)

### `/attacker` — Attack Simulator
Electronic warfare console for simulating attacks.

- **Attack Type Cards**: Choose between **JAMMING** (broadband noise, 87 dBm, 2.4 GHz) or **SPOOFING** (GPS spoof, 12ms delay)
- **LAUNCH ATTACK Button**: Sends `ATTACK_LAUNCHED` via WebSocket to all clients
- **Attack Effectiveness Meter**: Live animated bar showing current attack strength
- **Attack Parameter Display**: Power, frequency, target, method metadata
- **QuantumWalkViz**: Live canvas animation showing quantum walk probability distribution
- **Attack Status Badge**: STANDING BY / ATTACK ACTIVE / DEFENDER ANALYZING / NEUTRALIZED

### `/defender` — Defense Center
The main defender dashboard for monitoring and responding to attacks.

- **DetectionPanel**: Real-time attack classification HUD with:
  - Animated status indicator (green/red/amber/cyan based on system state)
  - "ACTIVATE QUANTUM SECURE CHANNEL" button (appears when attack detected)
  - ML Metrics: Jamming Accuracy, Model Accuracy, Model F1, Validation Accuracy
  - Quantum Kernel Scores: normal/jamming/spoofing probability bars
- **QuantumMLPanel**: 4-stage pipeline visualization with tabs for each stage
- **QSDCPanel**: BB84 quantum key distribution simulation panel
- **PQCPanel**: Post-quantum cryptography key exchange ceremony display
- **SignalChart**: Real-time waveform with attack noise overlay
- **CommunicationPanel**: Channel health and communication metadata
- **AIThreatIntelligence**: AI recommendations, threat forecast, attack history timeline

### `/quantum-lab` — Quantum Lab
Interactive educational quantum visualization sandbox.

| Tab | Description |
|-----|-------------|
| **Quantum Walk** | Live QuantumWalkViz with probability distribution histogram. Shows coin operator (Hadamard), graph type (Linear Chain), interference status |
| **Bloch Sphere** | Interactive 3D Bloch sphere. Drag theta (θ) and phi (φ) sliders to rotate qubit state. Preset buttons: \|0⟩, \|1⟩, \|+⟩, \|i⟩. Live state vector equation display |
| **Circuit Editor** | Drag-and-drop quantum circuit editor. Add H, X, Y, Z, RX, RY, RZ, CNOT, CZ, SWAP gates to 2-qubit wires. Generates and displays OpenQASM 2.0 code |
| **Cluster Space** | 3D rotating scatter plot (CSS perspective projection) of Normal/Jamming/Spoofing clusters. Quantum kernel heatmap (3×3 similarity matrix) |

---

## 🔬 Quantum Modules (Python)

### `quantum_walk.py` — Discrete-Time Quantum Walk
```
Class: QuantumWalk(n_steps=8, n_positions=16)
```
Implements a **1D discrete-time quantum walk** using the Hadamard coin operator.

**Theory**: A quantum walker in superposition of positions evolves via:
- **Coin operator**: Hadamard gate `H = 1/√2 [[1,1],[1,-1]]` applied to spin DOF
- **Shift operator**: Conditional position shift based on spin state
- After `n_steps`, measurement gives probability distribution `P(x)` over 16 positions

**Key Methods**:
| Method | Description |
|--------|-------------|
| `create_initial_state(signal)` | Maps signal samples → quantum superposition state |
| `evolve_step(state)` | Applies one coin+shift step |
| `run(signal)` | Full walk: returns walk_data dict with `probabilities`, `entropy`, `spread` |
| `get_frame_data(signal, step)` | Single frame for animation |
| `export_animation_frames(signal)` | All frames for UI walk visualization |
| `compute_von_neumann_entropy(prob_dist)` | Shannon/von Neumann entropy in bits |
| `detect_attack_signature(prob_dist)` | Returns `jamming_score`, `spoofing_score`, `normal_score` |

**Attack Signatures**:
- **Normal**: Uniform-ish distribution, moderate entropy
- **Jamming**: High entropy (flattened distribution), high spread
- **Spoofing**: Sharp peak at biased position, low entropy

---

### `quantum_gates.py` — Quantum Gate Encoding
```
Class: QuantumGateEncoding(use_qiskit=False)
```
Encodes classical signal features into a **2-qubit quantum state** using parameterized gates.

**Circuit Architecture**:
```
Q0: ─ Ry(θ₁) ─ ● ─ Rz(φ) ─────────
                │
Q1: ─ H ──────── X ─ Ry(θ₂) ──────
```
- `θ₁ = normalize(feature[0])` — Amplitude encoding
- `φ = normalize(feature[1])` — Phase encoding  
- `θ₂ = normalize(feature[2])` — Entanglement angle

**Output**: 4-dimensional complex state vector `|ψ⟩ ∈ ℂ⁴`

---

### `quantum_clustering.py` — Quantum Kernel Clustering
```
Class: QuantumClustering()
```
Unsupervised classification using **quantum fidelity** as the similarity metric.

**Kernel**: `K(x_i, x_j) = |⟨ψ(x_i)|ψ(x_j)⟩|²`

- Pre-computes reference quantum states for Normal, Jamming, Spoofing classes
- Assigns new signal to cluster with highest fidelity score
- Outputs cluster 3D coordinates for visualization
- Quantum kernel heatmap shows inter-class similarity

---

### `quantum_qsvm_v2.py` — Quantum Support Vector Machine
```
Class: QuantumSVM()
```
**2-qubit Quantum SVM** using quantum kernel trick.

**Training**:
1. Map all training samples to 2-qubit states via `_quantum_feature_map(x)`
2. Compute full `N×N` quantum kernel matrix `K[i,j] = |⟨ψᵢ|ψⱼ⟩|²`
3. Train `sklearn.svm.SVC(kernel='precomputed')` on this kernel matrix
4. Extract support vectors `αᵢ`, decision bias `b`

**Inference**:
- Decision function: `f(x) = Σ αᵢ · yᵢ · K(svᵢ, x) + b`
- Confidence: `sigmoid(f(x))`
- Falls back to simple threshold classifier if scikit-learn unavailable

**Model Persistence**: Saves/loads via pickle. Summary exported as JSON.

---

### `quantum_pipeline.py` — 4-Stage Pipeline Orchestrator
```
Class: QuantumDefensePipeline(debug=False)
```
Chains all 4 modules into a unified inference and training interface.

**Inference Flow** (`infer(signal_raw)`):
1. `SignalProcessor` extracts features (entropy, peaks, variance, spectral)
2. `QuantumWalk.run(signal)` → walk probability distribution
3. `QuantumGateEncoding.encode(features)` → 2-qubit state `|ψ⟩`
4. `QuantumClustering.classify(state)` → cluster assignment + similarity scores
5. `QuantumSVM.predict_single(features)` → final label + confidence (if trained)
6. **Ensemble vote**: Combine walk, cluster, QSVM → `final_result`

**Training** (`train()`):
- Generates synthetic dataset (Normal: 30, Jamming: 30, Spoofing: 30 samples)
- Trains QSVM on quantum kernel matrix
- Persists model to `quantum_pipeline_model.json`

**Output JSON** (per inference):
```json
{
  "final_result": "jamming",
  "confidence": 0.92,
  "attack_detected": true,
  "stage_results": {
    "walk": { "probabilities": [...], "entropy": 3.2 },
    "encoding": { "state_vector": [...], "fidelity": 0.85 },
    "clustering": { "cluster": "jamming", "similarity": 0.91 },
    "qsvm": { "prediction": 1, "confidence": 0.92 }
  }
}
```

---

### `quantum_qsdc.py` — Quantum Secure Direct Communication
```
Classes: BB84Protocol, QuantumChannel, QSDCSystem
```
Simulates the **BB84 Quantum Key Distribution** protocol end-to-end.

**BB84 Protocol Steps**:
1. Alice prepares `n_qubits` (default 512) random bits in random bases (Z or X)
2. Bob measures in random bases
3. **Sifting**: Keep only bits where Alice and Bob chose the same basis (~50% retained)
4. **QBER Estimation**: Sample 25% of sifted key to compute Quantum Bit Error Rate
5. **Security Check**: QBER < 11% → channel is secure (BB84 security threshold)
6. **Privacy Amplification**: Shorten key to remove information leaked to eavesdropper
7. Final key established, session ID generated (`QS-<timestamp>`)

**Channel Models**:
| Channel | Attenuation | Use Case |
|---------|------------|---------|
| Fiber | 0.2 dB/km | Short-range secure links |
| Free Space | 0 dB/km | Line-of-sight |
| Satellite | 0.05 dB/km effective | Long-distance |

**Eavesdrop Detection**: Simulating attack sets noise to 15% → QBER exceeds 11% → `eavesdrop_detected: true`

---

### `quantum_pqc.py` — Post-Quantum Cryptography
```
Classes: LatticeStructure, KyberKEM, DilithiumDSA, PQCSystem
```
Simulates **NIST-standardized PQC algorithms** based on lattice hard problems.

#### CRYSTALS-Kyber (KEM)
| Level | Security | pk | sk | ct |
|-------|----------|----|----|-----|
| Kyber-512 | 128-bit | 800 B | 1632 B | 768 B |
| **Kyber-768** | **192-bit** | **1184 B** | **2400 B** | **1088 B** |
| Kyber-1024 | 256-bit | 1568 B | 3168 B | 1568 B |

- **Security Basis**: Module Learning With Errors (MLWE)
- Key gen uses polynomial rings `Zq[x]/(xⁿ + 1)` with centered binomial noise

#### CRYSTALS-Dilithium (DSA)
- Security Level 3 (128-bit classical, 64-bit quantum via Grover)
- Module-LWE + Module-SIS hardness
- pk: 1952 B | sk: 4000 B | signature: 3293 B

#### Quantum Attack Resistance
- **Shor's Algorithm**: NOT applicable to lattice problems (Shor breaks RSA/ECC only)
- **Grover's Algorithm**: Halves effective key length — Kyber-768 has 96-bit quantum security
- Platform displays attack resistance score (0–100%) in real time

---

## 🧩 Frontend Components

| Component | Type | Description |
|-----------|------|-------------|
| `BootSequence.tsx` | Full-screen | 3s canvas matrix rain + typed boot log + progress bar |
| `ThreatRadar.tsx` | SVG | Animated radar with 4 rings, rotating sweep, threat dot plotting |
| `BlochSphere.tsx` | CSS 3D | 3D Bloch sphere with lat/lon ellipses, state vector arrow, pole labels |
| `QuantumWalkViz.tsx` | Canvas | 30 FPS walk animation, node glow, probability bars, attack color modes |
| `ClusterSpace3D.tsx` | CSS 3D | Rotating scatter plot with CSS perspective projection |
| `AIThreatIntelligence.tsx` | Mixed | SVG arc gauge, recharts line chart, recommendation panel, history timeline |
| `DetectionPanel.tsx` | HUD | Status card (animated), ML metrics bars, quantum kernel scores |
| `QuantumMLPanel.tsx` | Tabs | 4-stage pipeline tabs with circuit/state/cluster sub-visualizations |
| `QSDCPanel.tsx` | Panel | BB84 protocol visualization, QBER monitor, key bit display |
| `PQCPanel.tsx` | Panel | Kyber key exchange, Dilithium signing ceremony, security metrics |
| `SignalChart.tsx` | Recharts | Live recharts waveform with conditional noise styling |
| `CommunicationPanel.tsx` | Panel | Channel type, encryption status, session metadata |
| `AttackControls.tsx` | Control | Attack type buttons with animated selection state |
| `ConnectionStatus.tsx` | Indicator | WebSocket connected/disconnected pill badge |
| `QuantumCircuitViz.tsx` | SVG | 2-qubit circuit diagram renderer (H, CNOT, Rz, Ry gates) |
| `QuantumClusterViz.tsx` | SVG | 2D cluster scatter plot with centroid markers |
| `QuantumStateViz.tsx` | SVG/bars | State vector component probability bars |

---

## 🔌 Backend API & WebSocket

### WebSocket Events (`ws://localhost:3001`)

#### Client → Server
| Message Type | Payload | Description |
|--------------|---------|-------------|
| `PING` | `{}` | Keepalive; server responds with `PONG` |
| `MODE_CHANGE` | `{ attackType }` | Switch between none/jamming/spoofing |
| `ATTACK_LAUNCHED` | `{ attackType }` | Trigger attack event |
| `STATE_UPDATE` | `{ systemStatus, mlConfidence, ... }` | Partial state update |

#### Server → Client
| Message Type | Payload | Description |
|--------------|---------|-------------|
| `INITIAL_STATE` | `{ state, clientId }` | Sent to new connections with current global state |
| `PONG` | `{}` | Response to PING |
| Any broadcast | `{ type, state, fromClientId }` | Global state after any update |

### REST API Endpoints (`http://localhost:3001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quantum/infer` | Run full 4-stage quantum pipeline on signal data |
| POST | `/api/quantum/train` | Train quantum pipeline (QSVM + clustering) |
| POST | `/api/qsdc/simulate` | Run BB84 QSDC protocol simulation |
| POST | `/api/pqc/simulate` | Run PQC key exchange ceremony |
| POST | `/api/quantum/walk` | Run quantum walk on raw signal |
| GET | `/api/ai/threat-intel` | Get AI threat intelligence & recommendations |
| POST | `/api/quantum-ml/train` | Legacy: Start QSVM training (backward compat) |
| GET | `/api/quantum-ml/status` | Legacy: Get QSVM training status |
| POST | `/api/quantum-ml/evaluate` | Legacy: Evaluate signal with trained model |

All endpoints support CORS (`Access-Control-Allow-Origin: *`).

---

## 🧠 State Management

### `SystemContext.tsx`
Global React context powered by a persistent WebSocket connection.

**State Fields**:
```typescript
// Attack & ML State
attackType: 'none' | 'jamming' | 'spoofing'
systemStatus: 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure'
isProcessing: boolean
mlConfidence: number | null         // 0–1 classifier confidence
mlThreatScore: number | null        // 0–100 threat score
mlResponseTimeMs: number | null     // Inference latency
jammingAccuracy: number | null      // Jamming detection accuracy
modelAccuracy: number | null        // Overall model accuracy
modelF1: number | null              // F1 score
modelValidationAccuracy: number | null

// Connection
isConnected: boolean
clientId: string | null
wsLatencyMs: number

// Quantum Engine Status
quantumEngines: {
  walkEngine: 'online' | 'offline'
  gateEncoder: 'online' | 'offline'
  clustering: 'online' | 'offline'
  qsvm: 'trained' | 'untrained' | 'offline'
  qsdc: 'active' | 'standby' | 'offline'
  pqc: 'active' | 'offline'
  aiThreatIntel: 'active' | 'offline'
}

// Extended
threatLevel: number                 // 0–100 composite threat score
totalAlertsToday: number
lastEventTime: Date | null
sessionId: string | null
quantumKeyActive: boolean
pqcAlgorithm: string
threatForecast: ThreatForecast[]    // Next 5 minutes predictions
```

**Actions**:
```typescript
launchAttack(type: 'jamming' | 'spoofing'): void
activateSecureChannel(): void
resetToNormal(): void
```

**WebSocket Lifecycle**:
- Auto-connects on mount, auto-reconnects with exponential backoff (1s → 2s → 4s → max 30s)
- `isMountedRef` prevents state updates after unmount
- `PING` sent every 25 seconds for keepalive
- All timeout handles tracked in refs for clean teardown

---

## 📐 Quantum Algorithms Explained

### Why Quantum Walk for Signal Analysis?
Classical random walks spread linearly: `σ ∝ √t`. Quantum walks spread quadratically: `σ ∝ t`. This **ballistic spreading** means a jammed signal (high entropy, flat distribution) is clearly distinguishable from a spoofed signal (biased, peaked distribution) or normal signal (symmetric quantum spread).

### Why Quantum Kernel SVM?
The quantum feature map `φ(x): ℝ³ → ℂ⁴` implicitly computes in a **4-dimensional Hilbert space** using only 2 qubits. The inner product `K(xᵢ, xⱼ) = |⟨ψ(xᵢ)|ψ(xⱼ)⟩|²` captures complex non-linear separability that a classical 3D kernel would miss. Even with 2 qubits, this demonstrates quantum advantage in feature space complexity.

### Why BB84 for Secure Channels?
BB84 is **information-theoretically secure** — its security is guaranteed by the laws of physics (no-cloning theorem), not computational hardness. Any eavesdropper measuring the quantum channel introduces detectable errors (QBER > 11%), allowing immediate detection. This makes it fundamentally unbreakable, unlike classical TLS.

### Why CRYSTALS-Kyber for PQC?
RSA and ECC are vulnerable to **Shor's algorithm** on a sufficiently large quantum computer. Kyber is based on the **Module-LWE** problem, which has no known quantum speedup. NIST standardized Kyber-768 (FIPS 203) as the primary KEM for post-quantum cryptography.

---

## ⚙️ Installation & Setup

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |
| Python | ≥ 3.9 (3.10+ recommended) |
| pip | Latest |

### 1. Clone & Install Node Dependencies
```bash
git clone <repo-url>
cd AAQC2
npm install
```

### 2. Install Python Dependencies
```bash
pip install numpy qiskit scikit-learn
```

Or install all at once:
```bash
pip install numpy qiskit scikit-learn qiskit-aer
```

> ⚠️ **Note**: Qiskit requires Python ≥ 3.10 from version 2.1.0 onwards. A deprecation warning is shown on Python 3.9 but the platform still functions normally (it falls back to NumPy-only mode).

### 3. Verify Python Setup
```bash
cd quantum
python3 quantum_walk.py          # Should print walk data JSON
python3 quantum_qsvm_v2.py       # Should train and print accuracy
python3 quantum_pipeline.py --help
```

---

## 🚀 Running the Platform

### Development (Frontend + Backend together)
```bash
npm run dev:all
```
This runs `concurrently`:
- **Backend**: `tsx watch server.ts` → WebSocket + HTTP on port 3001
- **Frontend**: `vite` → Vite dev server on port 5173 (or next available)

### Run Separately
```bash
# Terminal 1 — Backend
npm run server

# Terminal 2 — Frontend
npm run dev
```

### Production Build
```bash
npm run build       # Outputs to /dist
```

### Default URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend WebSocket | ws://localhost:3001 |
| Backend REST API | http://localhost:3001 |

> If port 5173 is in use, Vite will try 5174, 5175, etc.  
> If port 3001 is in use, kill existing process: `lsof -ti:3001 | xargs kill`

---

## 📡 API Reference

### `POST /api/quantum/infer`
Run the full 4-stage quantum pipeline on a signal.

**Request Body:**
```json
{
  "signal": [0.1, -0.5, 0.8, 0.3, ...],
  "attack_hint": "jamming"
}
```

**Response:**
```json
{
  "final_result": "jamming",
  "confidence": 0.92,
  "attack_detected": true,
  "stage_results": {
    "walk": { "probabilities": [...], "entropy": 3.1, "spread": 0.08 },
    "encoding": { "state_vector": [...], "n_qubits": 2 },
    "clustering": { "cluster": "jamming", "similarity": 0.89 },
    "qsvm": { "prediction": 1, "confidence": 0.92 }
  },
  "timestamp": "2026-05-29T15:00:00Z"
}
```

---

### `POST /api/qsdc/simulate`
Run BB84 quantum key distribution.

**Request Body:**
```json
{ "attack": false }
```

**Response:**
```json
{
  "success": true,
  "session_id": "QS-1748524800",
  "qkd_result": {
    "protocol": "BB84",
    "n_qubits_transmitted": 512,
    "sifted_key_length": 251,
    "final_key_length": 188,
    "qber": 0.021,
    "is_secure": true,
    "eavesdrop_detected": false,
    "key_hex": "a3f2b1...",
    "channel_efficiency": 0.49
  },
  "channel_stats": {
    "channel_type": "fiber",
    "total_loss_db": 10.0,
    "transmission_probability": 0.1,
    "max_secure_rate_bps": 91000
  }
}
```

---

### `POST /api/pqc/simulate`
Run full PQC key exchange + signing ceremony.

**Response:**
```json
{
  "success": true,
  "kem": {
    "algorithm": "CRYSTALS-Kyber-768",
    "keygen": { "pk_bytes": 1184, "sk_bytes": 2400, "security_bits": 192 },
    "encapsulate": { "ciphertext_bytes": 1088 },
    "decapsulate": { "success": true }
  },
  "dsa": {
    "algorithm": "CRYSTALS-Dilithium3",
    "sign": { "signature_bytes": 3293 },
    "verify": { "valid": true }
  },
  "security": {
    "classical_security_bits": 192,
    "quantum_security_bits": 96,
    "shor_resistant": true,
    "nist_pqc_standardized": true
  }
}
```

---

## 🔄 Attack Simulation Flow

```
[User on /attacker] → Clicks "LAUNCH JAMMING ATTACK"
         │
         ▼
[AttackerPage] → launchAttack('jamming') via useSystem()
         │
         ▼
[SystemContext] → sends WebSocket: { type: 'ATTACK_LAUNCHED', attackType: 'jamming' }
         │
         ▼
[server.ts] → updates globalState.attackType = 'jamming'
           → broadcasts to ALL connected clients
         │
         ▼
[SystemContext on Defender] → receives broadcast
                            → attackType = 'jamming'
                            → systemStatus = 'under-attack'
         │
         ▼
[DefenderPage] → QuantumMLPanel triggers POST /api/quantum/infer
         │
         ▼
[server.ts] → spawns: python3 quantum_pipeline.py --mode infer
         │
         ▼
[Python] → Stage 1: QuantumWalk.run(signal)
         → Stage 2: QuantumGateEncoding.encode(features)
         → Stage 3: QuantumClustering.classify(state)
         → Stage 4: QuantumSVM.predict_single(features)
         → Returns JSON to stdout
         │
         ▼
[server.ts] → parses Python output
           → sends STATE_UPDATE via WebSocket:
             { systemStatus: 'detected', mlConfidence: 0.92, ... }
         │
         ▼
[All Clients] → UI updates in real time
             → DetectionPanel shows "THREAT DETECTED"
             → Activate Secure Channel button appears
         │
         ▼
[User on /defender] → Clicks "ACTIVATE QUANTUM SECURE CHANNEL"
         │
         ▼
[SystemContext] → systemStatus = 'switching'
               → triggers /api/qsdc/simulate
               → systemStatus = 'secure' after 2 seconds
```

---

## 🔒 Security & Cryptography

### Defense-in-Depth Layers

| Layer | Technology | Role |
|-------|-----------|------|
| Signal Detection | Quantum Walk + QSVM | Detect jamming/spoofing at RF layer |
| Key Distribution | BB84 (QSDC) | Establish tamper-evident secret key |
| Key Encapsulation | CRYSTALS-Kyber-768 | Quantum-safe key exchange |
| Digital Signatures | CRYSTALS-Dilithium-3 | Quantum-safe authentication |
| Communication | BB84 + OTP + AES-256 | Hybrid classical-quantum encryption |

### Security Properties
- **Information-theoretic security**: BB84 security does not depend on computational assumptions
- **Forward secrecy**: New session key for each channel establishment
- **Post-quantum hardness**: Kyber/Dilithium resistant to Shor's and Grover's algorithms
- **Eavesdrop detection**: QBER monitoring detects any man-in-the-middle

---

## 🎨 UI Design System

### Color Palette
| Role | Color | Usage |
|------|-------|-------|
| Primary Neon | `#00f5ff` | Cyan — main accent, QSVM, normal state |
| Danger | `#ff2244` | Red — jamming attacks, threat detected |
| Warning | `#ffaa00` | Amber — spoofing, processing, switching |
| Quantum | `#8b5cf6` | Purple — quantum lab, circuit, spoofing |
| Success | `#00ff88` | Green — normal/secure state, online |
| Background | `#020408` | Deep space dark |
| Surface | `rgba(6,13,26,0.85)` | Panel glass background |
| Border | `rgba(0,245,255,0.12)` | Subtle neon border |

### Design Principles
- **Glassmorphism**: Semi-transparent panels with backdrop blur
- **HUD Corners**: Neon cyan corner brackets on key panels
- **Monospace Typography**: All labels and data in `font-family: monospace`
- **Micro-animations**: Framer Motion `motion/react` for all state transitions
- **Pulsing indicators**: `animate={{ opacity: [1, 0.3, 1] }}` for live status dots
- **Shimmer buttons**: Moving gradient shimmer on CTAs (`@keyframes shimmer`)
- **Glow shadows**: `boxShadow: 0 0 6px #00f5ff88` on active elements

### Responsive Breakpoints
- Desktop first design (optimized for 1280px+ width)
- Tailwind grid: 12-column (`grid-cols-12`) with nested responsive splits

---

## ⚡ Performance Notes

| Concern | Solution |
|---------|---------|
| 30 FPS canvas limit | `QuantumWalkViz.tsx` uses `setTimeout(16ms)` to cap at 60 FPS, effectively ~30 FPS |
| Animation jitter | `CommandCenterPage` uses `useRef` for particle positions, avoiding React re-renders |
| Python spawn latency | `quantum_pipeline.py` loads in ~200ms; inference is ~300–800ms depending on QSVM |
| WebSocket reconnect | Exponential backoff: 1s, 2s, 4s, 8s, ... capped at 30s |
| Memory leaks | All `setInterval`/`setTimeout` handles in `useRef`, cleaned in `useEffect` teardown |
| Bundle size | JS bundle ~1MB (gzipped ~290KB). Consider dynamic imports for further optimization |
| QSVM training time | Training 90 samples takes ~5–15 seconds due to 90×90 quantum kernel matrix |

---

## 🚧 Known Limitations

1. **Python 3.9 deprecation**: Qiskit 2.1+ recommends Python 3.10+. A deprecation warning appears on 3.9 but does not affect functionality.

2. **QSVM training time**: Training computes an N×N quantum kernel matrix. For 90 training samples, this is 8,100 kernel evaluations, taking 5–15 seconds. Training runs once on startup and the result is cached.

3. **NumPy-only mode**: All quantum circuits use NumPy matrix multiplication (`use_qiskit=False`). For hardware-accurate simulation, set `use_qiskit=True` and install `qiskit-aer`.

4. **Single-node**: WebSocket server is in-process with HTTP server. For production, consider Redis pub/sub for multi-instance deployments.

5. **No authentication**: All WebSocket and REST endpoints are open (no API keys or session tokens). This is a simulation platform, not a production security tool.

6. **Port conflicts**: If port 3001 or 5173 are in use, the platform requires manual port clearing or environment variable configuration.

---

## 🗺️ Future Roadmap

### Near-term
- [ ] Real Qiskit hardware backend integration (IBMQ)
- [ ] WebRTC for peer-to-peer attacker-defender sessions
- [ ] Persistent PostgreSQL database for alert history
- [ ] Docker Compose for one-command deployment

### Mid-term
- [ ] FALCON (NIST FIPS 206) signature scheme implementation
- [ ] Quantum error correction visualization (surface codes)
- [ ] Multi-channel attack simulation (wideband jamming)
- [ ] Machine learning attack replay from recorded scenarios

### Long-term
- [ ] Real SDR (Software Defined Radio) integration via GNU Radio
- [ ] Quantum-classical hybrid neural network (QNN) classifier
- [ ] SPHINCS+ (hash-based signature) demonstration
- [ ] Zero-knowledge proof integration for identity verification

---

## 📄 License

This project is for educational and research purposes. All quantum algorithm implementations are mathematical simulations and do not represent production cryptographic implementations.

---

## 👤 Author

**QuantumShield++** — Advanced Quantum Cyber Defense Platform  
Built with React, Node.js, Python, and Quantum Computing Theory

---

*Last updated: May 2026*