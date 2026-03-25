# QuantumShield - Simple Explanation

A complete breakdown of the quantum defense system for detecting RF attacks (jamming/spoofing) on drone communications.

---

## Table of Contents

1. [What Does This System Do?](#what-does-this-system-do)
2. [System Architecture](#system-architecture)
3. [How It Works - The Flow](#how-it-works---the-flow)
4. [Frontend Components](#frontend-components)
5. [Backend Server](#backend-server)
6. [Quantum ML Pipeline](#quantum-ml-pipeline)
7. [State Management](#state-management)
8. [Key Files Explained](#key-files-explained)

---

## What Does This System Do?

QuantumShield is a **cyber defense demonstration** that:

1. **Simulates attacks** (jamming/spoofing) on drone-to-command communications
2. **Detects attacks** using quantum machine learning
3. **Visualizes** the quantum processing pipeline
4. **Activates secure channels** when threats are detected

Think of it like an alarm system, but instead of detecting intruders with motion sensors, it detects electronic warfare attacks using quantum computing algorithms.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  HomePage   │  │AttackerPage │  │DefenderPage │         │
│  │  (Select    │  │  (Launch    │  │  (Monitor   │         │
│  │   Role)     │  │   Attacks)  │  │   + Defend) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                            │                                │
│  ┌─────────────────────────┴────────────────────────┐      │
│  │              SystemContext (React Context)        │      │
│  │  - Manages global state (attackType, systemStatus)│      │
│  │  - WebSocket connection to server                 │      │
│  └───────────────────────┬──────────────────────────┘      │
└──────────────────────────┼──────────────────────────────────┘
                           │ WebSocket + HTTP
┌──────────────────────────▼──────────────────────────────────┐
│                   BACKEND (Node.js server.ts)               │
│  - WebSocket Server (port 3001)                             │
│  - HTTP REST API endpoints                                  │
│  - Spawns Python processes for quantum ML                   │
│  - Broadcasts state to all connected clients                │
└──────────────────────────┬──────────────────────────────────┘
                           │ Python subprocess
┌──────────────────────────▼──────────────────────────────────┐
│                    QUANTUM ML (Python)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            quantum_pipeline.py (Orchestrator)         │  │
│  │  Stage 1 → Stage 2 → Stage 3 → Stage 4 → Output      │  │
│  │  [Walk]    [Encode]  [Cluster]  [QSVM]   [Decision]  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works - The Flow

### Normal Operation Flow

```
1. User opens app → HomePage
2. Selects "Defender" or "Attacker" role
3. Both pages connect via WebSocket to same server
4. State is synchronized across all connected clients
```

### Attack Detection Flow

```
1. ATTACKER clicks "Jamming" or "Spoofing" button
     ↓
2. launchAttack() called in SystemContext
     ↓
3. State updates: attackType='jamming', systemStatus='under-attack'
     ↓
4. WebSocket broadcasts state to all clients (Defender sees it)
     ↓
5. HTTP POST to /api/quantum-ml/evaluate with signal features
     ↓
6. Python QSVM evaluates the signal
     ↓
7. Returns: prediction, confidence, threat score
     ↓
8. State updates: systemStatus='detected'
     ↓
9. DEFENDER can click "Activate Secure Channel"
     ↓
10. State transitions: switching → secure → normal
```

### Quantum Pipeline Visualization Flow (Fixed in this update!)

```
1. DEFENDER clicks "Show Quantum Pipeline" button
     ↓
2. HTTP POST to /api/quantum/infer with visualization_only=true
     ↓
3. Python quantum_pipeline.py runs full inference
     ↓
4. Returns visualization data ONLY (no state changes!)
     ↓
5. Frontend displays: Circuit, State Vector, Clustering, Walk
```

**Important Fix:** Before this fix, clicking "Show Quantum Pipeline" would change the signal state! This was a bug where the server updated `globalState.attackType` even for visualization requests. Now the `visualization_only` flag prevents this.

---

## Frontend Components

### Pages (src/app/pages/)

| Page | Purpose |
|------|---------|
| `HomePage.tsx` | Landing page with "Attacker" and "Defender" role selection |
| `AttackerPage.tsx` | Launch jamming/spoofing attacks, see attack status |
| `DefenderPage.tsx` | Monitor signals, see detection, activate secure channel |

### Key Components (src/app/components/)

| Component | What It Does |
|-----------|--------------|
| `SignalChart.tsx` | Real-time signal visualization (changes based on attackType) |
| `CommunicationPanel.tsx` | Shows UAV-to-Command link animation |
| `DetectionPanel.tsx` | Shows attack classification, ML metrics, "Activate Secure" button |
| `QuantumMLPanel.tsx` | Shows quantum pipeline visualization (Circuit/State/Cluster/Walk tabs) |

### How SignalChart Changes

```javascript
// Normal: Clean sine wave
y = Math.sin(i * 0.2) * 30

// Jamming: Noisy, distorted
y = Math.sin(i * 0.2) * 30 + Math.random() * 40 - 20

// Spoofing: Altered frequency
y = Math.sin(i * 0.4) * 35 + Math.cos(i * 0.15) * 20
```

---

## Backend Server

**File:** `server.ts`

### WebSocket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `INITIAL_STATE` | Server → Client | Send current state on connect |
| `MODE_CHANGE` | Both | Attack type changed |
| `STATE_UPDATE` | Both | Any state property changed |
| `QUANTUM_ML_STATUS` | Server → Client | ML training/inference results |

### HTTP Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/quantum/infer` | POST | Run quantum pipeline inference |
| `/api/quantum/train` | POST | Train quantum pipeline |
| `/api/quantum-ml/train` | POST | Train QSVM model |
| `/api/quantum-ml/evaluate` | POST | Evaluate signal with QSVM |
| `/api/quantum-ml/status` | GET | Get training status |

### State Object

```typescript
globalState = {
  attackType: 'none' | 'jamming' | 'spoofing',
  systemStatus: 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure',
  isProcessing: boolean,
  mlConfidence: number,
  mlThreatScore: number,
  mlResponseTimeMs: number,
  modelAccuracy: number,
  modelF1: number,
  // ... more metrics
}
```

---

## Quantum ML Pipeline

**Main File:** `quantum/quantum_pipeline.py`

### The 4 Stages

```
INPUT SIGNAL → [1. Walk] → [2. Encode] → [3. Cluster] → [4. QSVM] → OUTPUT
```

### Stage 1: Quantum Walk (quantum_walk.py)

**Purpose:** Transform signal into quantum probability distribution

```python
# What it does:
1. Take input signal (64 samples)
2. Create initial quantum state from signal amplitudes
3. Evolve state for 8 steps using quantum walk dynamics
4. Get probability distribution P(x) over 16 positions

# For attacks:
- Jamming: Adds uniform noise (broad distribution)
- Spoofing: Adds Gaussian bias (shifted peak)
```

**Key Output:** `probability_dist` - array of 16 probabilities

### Stage 2: Quantum Encoding (quantum_gates.py)

**Purpose:** Encode signal features into 2-qubit quantum state

```
Circuit:
     ┌──────────┐     ┌──────────┐
q_0: ─┤ Ry(θ₁) ├──●──┤ Rz(φ)   ├───
     └──────────┘  │  └──────────┘
                   │
q_1: ─────H────────⊕──┤ Ry(θ₂) ├───
                      └──────────┘

Where:
- θ₁ = normalized frequency peak (from Stage 1)
- φ  = normalized power sum
- θ₂ = normalized noise std
```

**Key Output:** `state_vector` - 4 complex amplitudes [a, b, c, d]

Represents: |ψ⟩ = a|00⟩ + b|01⟩ + c|10⟩ + d|11⟩

### Stage 3: Quantum Clustering (quantum_clustering.py)

**Purpose:** Compare encoded state to reference "prototype" states

```python
# Reference states:
- normal_state:   What a normal signal looks like in quantum space
- jamming_state:  What jamming attack looks like
- spoofing_state: What spoofing attack looks like

# Quantum Kernel:
K(ψ₁, ψ₂) = |⟨ψ₁|ψ₂⟩|²  # Overlap between states

# Classification:
cluster = argmax(K(input_state, reference_state))
```

**Key Output:** `cluster_label` ('normal', 'jamming', 'spoofing') + `kernel_scores`

### Stage 4: QSVM (quantum_qsvm_v2.py)

**Purpose:** Trained quantum SVM for final classification

```python
# Training:
1. Generate training data (normal + attack signals)
2. For each pair (x_i, x_j):
   - Map to quantum states: |ψ(x_i)⟩, |ψ(x_j)⟩
   - Compute kernel: K = |⟨ψ(x_i)|ψ(x_j)⟩|²
3. Train SVM with precomputed kernel matrix

# Prediction:
1. Map new sample to quantum state
2. Compute kernel with support vectors
3. Decision: f(x) = Σ αᵢ yᵢ K(sv_i, x) + b
4. Confidence via sigmoid
```

**Key Output:** `prediction` (0 or 1) + `confidence` (0.0 to 1.0)

---

## State Management

**File:** `src/app/context/SystemContext.tsx`

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `attackType` | 'none', 'jamming', 'spoofing' | Current attack happening |
| `systemStatus` | See below | Current defense state |
| `mlConfidence` | number | How confident ML is in detection |
| `mlThreatScore` | number | Threat severity (0-100) |

### System Status State Machine

```
                    launchAttack()
    ┌─────────────────────────────────────┐
    │                                     ▼
┌───────┐         ┌─────────────┐    ┌────────────┐
│normal │ ◄────── │   secure    │◄───│ switching  │
└───────┘         └─────────────┘    └────────────┘
                         ▲                  ▲
                         │                  │
                  activateSecure()     ML confirms
                         │                  │
                  ┌──────┴──────┐    ┌──────┴──────┐
                  │  detected   │◄───│ processing  │
                  └─────────────┘    └─────────────┘
                                           ▲
                                           │
                                  ┌────────┴────────┐
                                  │  under-attack   │
                                  └─────────────────┘
```

### WebSocket Sync

All state changes are broadcast via WebSocket so multiple clients (attacker + defender on different laptops) stay synchronized.

---

## Key Files Explained

### Frontend

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/context/SystemContext.tsx` | 418 | Global state + WebSocket + API calls |
| `src/app/pages/DefenderPage.tsx` | 102 | Defender UI layout |
| `src/app/components/QuantumMLPanel.tsx` | 238 | Quantum visualization panel |
| `src/app/components/SignalChart.tsx` | 155 | Real-time signal waveform |

### Backend

| File | Lines | Purpose |
|------|-------|---------|
| `server.ts` | 749 | WebSocket + HTTP server, spawns Python |

### Quantum ML (Python)

| File | Lines | Purpose |
|------|-------|---------|
| `quantum/quantum_pipeline.py` | 567 | Main orchestrator - chains all stages |
| `quantum/quantum_walk.py` | 311 | Stage 1: Quantum walk simulation |
| `quantum/quantum_gates.py` | 327 | Stage 2: 2-qubit state encoding |
| `quantum/quantum_clustering.py` | 278 | Stage 3: Kernel-based clustering |
| `quantum/quantum_qsvm_v2.py` | 340 | Stage 4: Quantum SVM classifier |
| `quantum/utils/signal_processor.py` | 226 | Signal generation utilities |

---

## Bug Fix Summary

### Issue: "Show Quantum Pipeline" Changed Signal State

**What Happened:**
1. User clicked "Show Quantum Pipeline" button
2. This called `/api/quantum/infer` endpoint
3. Server updated `globalState.attackType` based on inference result
4. Server broadcast state change to all clients
5. SignalChart changed to show attack pattern (even though no attack was launched!)

**Root Cause:**
The visualization-only request was being treated like a real attack detection, updating system state.

**Fix Applied:**
1. `QuantumMLPanel.tsx`: Added `visualization_only: true` flag when requesting visualization
2. `server.ts`: When `visualization_only=true`, skip all state updates and WebSocket broadcasts

**Files Changed:**
- `src/app/components/QuantumMLPanel.tsx` - line 43-53
- `server.ts` - line 540 and 606-630

---

## How to Run

```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- WebSocket: ws://localhost:3001

---

## Quick Reference: Colors and States

| State | Color | Meaning |
|-------|-------|---------|
| Normal | Green | No threats detected |
| Under-Attack | Red | Attack in progress |
| Processing | Purple | ML analyzing signal |
| Detected | Red (pulsing) | Attack confirmed |
| Switching | Purple | Changing to secure channel |
| Secure | Cyan | Quantum encryption active |

---

## Summary

QuantumShield demonstrates:

1. **Multi-client sync** via WebSocket (attacker/defender can be on different devices)
2. **Quantum ML pipeline** with 4 stages (Walk → Encode → Cluster → QSVM)
3. **Real-time visualization** of quantum states and signal patterns
4. **State machine** for defense response (detect → process → secure)

The system is a proof-of-concept for using quantum computing algorithms in cybersecurity applications, specifically for defending against electronic warfare attacks on drone communications.
