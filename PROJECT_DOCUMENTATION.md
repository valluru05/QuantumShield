# QuantumShield++ — Complete Project Documentation

> **A full-stack quantum-inspired cyber defense platform** that simulates electronic warfare attacks (jamming & spoofing) and defends against them using Quantum Machine Learning, Quantum Secure Communication, and Post-Quantum Cryptography.

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [How It Starts — Boot Sequence](#4-how-it-starts--boot-sequence)
5. [Backend: The Node.js + WebSocket Server](#5-backend-the-nodejs--websocket-server)
6. [The Quantum Python Engine](#6-the-quantum-python-engine)
   - 6.1 [Quantum Walk](#61-quantum-walk-quantum_walkpy)
   - 6.2 [Quantum Gate Encoding](#62-quantum-gate-encoding-quantum_gatespy)
   - 6.3 [Quantum Clustering](#63-quantum-clustering-quantum_clusteringpy)
   - 6.4 [QSVM — Quantum Support Vector Machine](#64-qsvm--quantum_qsvm_v2py)
   - 6.5 [Quantum Pipeline Orchestrator](#65-quantum-pipeline-orchestrator-quantum_pipelinepy)
   - 6.6 [QSDC — Quantum Secure Direct Communication](#66-qsdc--quantum_qsdcpy)
   - 6.7 [PQC — Post-Quantum Cryptography](#67-pqc--quantum_pqcpy)
   - 6.8 [ML Trainer](#68-ml-trainer-quantum_ml_trainerpy)
   - 6.9 [Signal Processor](#69-signal-processor-utilssignal_processorpy)
7. [Frontend: The React UI](#7-frontend-the-react-ui)
   - 7.1 [Global State — SystemContext](#71-global-state--systemcontexttsx)
   - 7.2 [Routing & Pages](#72-routing--pages)
   - 7.3 [Page: Home](#73-page-home)
   - 7.4 [Page: Command Center](#74-page-command-center)
   - 7.5 [Page: Attacker Dashboard](#75-page-attacker-dashboard)
   - 7.6 [Page: Defender Dashboard](#76-page-defender-dashboard)
   - 7.7 [Page: Quantum Lab](#77-page-quantum-lab)
8. [Key UI Components](#8-key-ui-components)
9. [Full Attack & Defense Flow — Step by Step](#9-full-attack--defense-flow--step-by-step)
10. [API Reference](#10-api-reference)
11. [How to Run](#11-how-to-run)

---

## 1. What This Project Is

**QuantumShield++** is an interactive simulation platform that demonstrates how quantum computing concepts can be applied to cyber defense in the domain of **electronic warfare (EW)**. It simulates two types of real-world RF (radio frequency) attacks:

| Attack Type | What It Simulates |
|-------------|-------------------|
| **Jamming** | A high-noise signal is broadcast to drown out legitimate communications |
| **Spoofing** | A fake signal is injected that mimics a real source to deceive a receiver |

The system then uses a **4-stage quantum ML pipeline** to:
1. Detect that an attack is happening
2. Classify what type of attack it is
3. Respond by switching to a quantum-secured communication channel

Everything is visualized in real time in a sci-fi "command center" style dashboard.

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Animations** | Framer Motion (motion/react) |
| **UI Components** | Radix UI, Lucide icons, Recharts, MUI |
| **Backend** | Node.js (TypeScript via `tsx`), native `http` module |
| **Real-time Communication** | WebSocket (`ws` library) |
| **Quantum Engine** | Python 3 (Qiskit, NumPy, SciPy) |
| **Concurrency** | `concurrently` — runs Node server + Vite dev server together |

---

## 3. Project Structure

```
AAQC2/
├── server.ts                    # Node.js backend: HTTP API + WebSocket server
├── vite.config.ts               # Vite configuration for React frontend
├── package.json                 # NPM scripts and dependencies
│
├── quantum/                     # All Python quantum ML modules
│   ├── quantum_pipeline.py      # Main orchestrator — chains all 4 stages
│   ├── quantum_walk.py          # Stage 1: Quantum Walk signal processor
│   ├── quantum_gates.py         # Stage 2: Quantum Gate Encoding
│   ├── quantum_clustering.py    # Stage 3: Quantum Clustering (SWAP test)
│   ├── quantum_qsvm_v2.py       # Stage 4: Quantum SVM classifier
│   ├── quantum_ml_trainer.py    # Standalone ML trainer (legacy + fallback)
│   ├── quantum_qsdc.py          # QSDC: Quantum Secure Direct Communication
│   ├── quantum_pqc.py           # PQC: Post-Quantum Cryptography (Kyber)
│   ├── qsvm_model.json          # Saved QSVM model weights
│   ├── quantum_pipeline_model.json  # Saved pipeline model
│   └── utils/
│       └── signal_processor.py  # RF signal simulation utilities
│
└── src/
    ├── main.tsx                 # React app entry point
    └── app/
        ├── App.tsx              # Root component (wraps with SystemProvider)
        ├── routes.tsx           # React Router route definitions
        ├── context/
        │   └── SystemContext.tsx  # Global state + WebSocket client
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── CommandCenterPage.tsx
        │   ├── AttackerPage.tsx
        │   ├── DefenderPage.tsx
        │   └── QuantumLabPage.tsx
        └── components/
            ├── ThreatRadar.tsx
            ├── BootSequence.tsx
            ├── QuantumMLPanel.tsx
            ├── DetectionPanel.tsx
            ├── AIThreatIntelligence.tsx
            ├── BlochSphere.tsx
            ├── QuantumWalkViz.tsx
            ├── QuantumCircuitViz.tsx
            ├── QuantumClusterViz.tsx
            ├── QuantumStateViz.tsx
            ├── ClusterSpace3D.tsx
            ├── PQCPanel.tsx
            ├── QSDCPanel.tsx
            ├── SignalChart.tsx
            ├── CommunicationPanel.tsx
            └── AttackControls.tsx
```

---

## 4. How It Starts — Boot Sequence

### Step 1: Running the App

You start everything with one command:

```bash
npm run dev:all
```

This uses `concurrently` to launch two processes simultaneously:

- **`npm run server`** → Runs `tsx watch server.ts` — starts the Node.js backend on port **3001**
- **`npm run dev`** → Runs `vite` — starts the React frontend on port **5173**

### Step 2: Server Initialization

The moment the Node.js server starts, it does the following:

1. Creates an HTTP server that handles REST API calls
2. Attaches a WebSocket server (port 3001) to the same HTTP server
3. **Immediately** calls `startInternalQsvmTraining('startup')` — this spawns a Python process running `quantum_ml_trainer.py` in `train` mode to train the QSVM model in the background before any user interaction

### Step 3: Frontend Boot Animation

When a user opens `http://localhost:5173`:

1. The `BootSequence` component runs — this is a full-screen terminal-style animation that shows system initialization messages, mimicking a military/quantum computer booting up
2. Once the boot animation finishes (or the user clicks "SKIP"), the main Command Center dashboard becomes visible
3. The result is stored in `sessionStorage` so the boot only shows **once per browser session**

### Step 4: WebSocket Connection

As soon as the React app loads (`SystemContext.tsx`), it connects to the WebSocket server at `ws://localhost:3001`. The server immediately sends back an `INITIAL_STATE` message with the current system state (attack type, ML confidence, model accuracy, etc.).

The frontend then listens for future state changes broadcast by the server, keeping all connected browser tabs in sync in real time.

---

## 5. Backend: The Node.js + WebSocket Server

**File:** `server.ts`

The backend is a single TypeScript file that does three things:

### 5.1 WebSocket Real-time State Sync

A shared `globalState` object stores the current system state:
- `attackType` — `'none' | 'jamming' | 'spoofing'`
- `systemStatus` — `'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure'`
- `mlConfidence` — percentage (0–100) how confident the model is
- `mlThreatScore` — overall threat score
- `mlResponseTimeMs` — how long inference took
- `modelAccuracy`, `modelF1`, `modelValidationAccuracy` — model quality metrics

When any client sends a `STATE_UPDATE` or `MODE_CHANGE` message via WebSocket, the server:
1. Updates its `globalState`
2. Broadcasts the new state to **all connected clients** — so if you open two browser tabs, they both update simultaneously

Heartbeat/latency measurement: Every 5 seconds, the frontend sends a `PING` message; the server immediately responds with `PONG`. The round-trip time is used to display the "WS LATENCY" metric in the UI.

### 5.2 REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quantum-ml/train` | POST | Triggers QSVM training via `quantum_ml_trainer.py` |
| `/api/quantum-ml/evaluate` | POST | Evaluates signal features using the trained QSVM |
| `/api/quantum-ml/status` | GET | Returns current model training state and metrics |
| `/api/quantum/infer` | POST | Full pipeline inference via `quantum_pipeline.py` |
| `/api/quantum/train` | POST | Full pipeline training via `quantum_pipeline.py` |
| `/api/qsdc/simulate` | POST | Simulates Quantum Secure Direct Communication |
| `/api/pqc/simulate` | POST | Simulates Post-Quantum Cryptography key exchange |
| `/api/quantum/walk` | POST | Runs a standalone Quantum Walk simulation |
| `/api/ai/threat-intel` | GET | Returns AI threat forecast and recommendations |

### 5.3 Python Process Spawning

All quantum computation happens in Python. The Node.js server spawns Python child processes using `child_process.spawn('python3', [...])`. It captures the stdout JSON output and parses it to return results to the frontend.

If a Python module fails or is unavailable, the server has **fallback simulation** built in — it returns realistic-looking simulated data so the UI always shows something meaningful.

---

## 6. The Quantum Python Engine

All Python files are in the `quantum/` folder. They implement real (or numpy-simulated) quantum computing algorithms.

### 6.1 Quantum Walk — `quantum_walk.py`

A **Quantum Walk** is the quantum analog of a classical random walk. Instead of a particle moving left or right based on a coin flip, a quantum particle can be in a superposition of both states simultaneously and interfere with itself.

**What it does in this system:**
- Takes a raw RF signal as input (array of numbers)
- Runs it through a quantum walk over 8 steps on a 16-position grid
- Produces a **probability distribution** across all positions
- For jamming signals: applies noise to spread the probability distribution (broader = more noise = more likely attack)
- For spoofing signals: applies a bias to shift the peak, simulating a signal shift attack
- Extracts 3 key features from the distribution:
  - `freq_peak` — where the peak of the probability distribution is
  - `power_sum` — total "energy" in the distribution
  - `noise_std` — standard deviation (how spread out it is)

These 3 features are the numerical fingerprint of the signal that gets passed to later stages.

### 6.2 Quantum Gate Encoding — `quantum_gates.py`

This module encodes the 3 extracted features into a **2-qubit quantum state** using rotation gates:

- **Ry gate** on qubit 0 with angle θ (proportional to `freq_peak`)
- **Rz gate** on qubit 0 with angle φ (proportional to `power_sum`)
- **CNOT gate** entangles qubit 0 → qubit 1
- **Ry gate** on qubit 1 with angle θ₂ (proportional to `noise_std`)

The result is a 4-element complex vector called a **state vector** — a quantum representation of the signal's characteristics. Different attack types produce distinctly different state vectors, which is what makes classification possible.

The module can use either real Qiskit (if installed and working) or a pure NumPy matrix simulation.

### 6.3 Quantum Clustering — `quantum_clustering.py`

This stage compares the encoded quantum state to **reference states** using the **SWAP test** — a quantum algorithm that measures how similar two quantum states are.

Three reference states are pre-defined:
- `normal` — reference quantum state for clean signals
- `jamming` — reference quantum state for jammed signals
- `spoofing` — reference quantum state for spoofed signals

The SWAP test computes a **kernel score** (0 to 1) for each reference. The input signal is assigned to whichever cluster has the highest kernel score. This is the clustering step — grouping the unknown signal with the most similar known class.

### 6.4 QSVM — `quantum_qsvm_v2.py`

The **Quantum Support Vector Machine** is the final and most precise classification stage. It is a trained binary classifier that learns the decision boundary between attack and non-attack signals.

**Training:**
- Generates synthetic training data: 50 samples of normal signals + 50 samples of jamming + 25 samples of spoofing
- Computes a **quantum kernel matrix** — each entry K(i,j) is the overlap (inner product) between two quantum-encoded samples
- Trains a classical SVM on top of this quantum kernel (this is the "quantum-enhanced" SVM)

**Inference:**
- Takes new signal features
- Computes quantum kernel overlap with all support vectors
- Returns `prediction` (jamming/normal) and `confidence` (0–1)

**Model persistence:** After training, the model is saved to `qsvm_model.json` so it doesn't need to retrain every time.

### 6.5 Quantum Pipeline Orchestrator — `quantum_pipeline.py`

This is the **main entry point** for the full defense pipeline. It chains all 4 stages together into one `process_signal()` call:

```
Raw Signal
   ↓
[Stage 1] Quantum Walk          → Probability distribution
   ↓
[Stage 2] Feature Extraction    → freq_peak, power_sum, noise_std
   ↓
[Stage 3] Quantum Gate Encoding → 2-qubit state vector
   ↓
[Stage 4] Quantum Clustering    → Cluster label + similarity scores
   ↓
[Stage 5] QSVM Classification   → Final prediction + confidence
   ↓
Output: { final_result, confidence, attack_detected, pipeline_stages }
```

The output includes full visualization data for every stage — the probability distributions, state vectors, cluster scores, etc. — which are sent to the frontend to render the Quantum Lab visualizations.

**CLI modes:**
- `--mode infer` — run inference on one signal
- `--mode train` — auto-generate data and train the QSVM
- `--mode test` — test all 3 attack types
- `--mode demo` — full demonstration

### 6.6 QSDC — `quantum_qsdc.py`

**Quantum Secure Direct Communication** simulates quantum key distribution (QKD) using the **BB84 protocol** or a direct communication variant.

It simulates:
- Generating a random quantum key
- Measuring a quantum bit error rate (QBER)
- If QBER < threshold (0.11): channel is secure, key exchange succeeds
- If QBER > threshold: eavesdropping detected, abort

In the UI's "Defender" panel, this is what activates when you click "Activate Quantum Secure Channel" — the system runs QSDC to establish a tamper-proof communication link that resists quantum computer attacks.

### 6.7 PQC — `quantum_pqc.py`

**Post-Quantum Cryptography** simulates the **CRYSTALS-Kyber** Key Encapsulation Mechanism (KEM), which is one of the algorithms standardized by NIST for quantum-resistant encryption.

It performs:
- Key generation (public/private keypair)
- Encapsulation (encrypt a shared secret)
- Decapsulation (recover the shared secret)
- Security analysis: classical bits, quantum bits, resistance to Shor's algorithm, resistance to Grover's algorithm

Supported levels: Kyber-512 (128-bit quantum security), Kyber-768 (192-bit), Kyber-1024 (256-bit)

### 6.8 ML Trainer — `quantum_ml_trainer.py`

This is an older/simpler standalone QSVM trainer. It is called by the server on startup (and as a fallback) because it is faster than the full pipeline trainer.

**`--mode train`:** Generates synthetic data and trains a QSVM model, saves weights to `qsvm_model.json`

**`--mode evaluate --features a,b,c,d`:** Loads the saved model and runs inference on the given 4 feature values, returning prediction + confidence + probabilities as JSON

### 6.9 Signal Processor — `utils/signal_processor.py`

Generates synthetic RF signals for training:
- `generate_normal_signal()` — a clean sinusoidal signal with low noise
- `generate_jamming_signal()` — broadband noise signal (high amplitude random noise)
- `generate_spoofing_signal()` — a shifted sinusoidal signal that mimics a legitimate source but with altered phase/frequency

---

## 7. Frontend: The React UI

### 7.1 Global State — `SystemContext.tsx`

The `SystemProvider` component wraps the entire app and provides global state to every component via the `useSystem()` hook. It manages:

**State variables:**
- `attackType` — current attack (`none`, `jamming`, or `spoofing`)
- `systemStatus` — what the system is doing right now (6 possible states)
- `mlConfidence` — ML model confidence in its detection (0–100%)
- `mlThreatScore` — overall threat score
- `modelAccuracy`, `modelF1` — quality metrics of the trained QSVM
- `quantumEngines` — status of each of the 7 quantum modules (online/offline/trained)
- `threatForecast` — AI-predicted probabilities of future attacks
- `threatLevel` — 0–100 aggregate threat level
- `quantumKeyActive` — whether QSDC has established a secure channel
- `pqcAlgorithm` — which PQC algorithm is active (default: CRYSTALS-Kyber-768)
- `wsLatencyMs` — measured WebSocket round-trip time

**Key functions:**
- `launchAttack(type)` — simulates an attack, calls the evaluation API, updates state
- `activateSecureChannel()` — triggers QSDC + switches system to secure mode
- `resetToNormal()` — resets everything back to baseline

**WebSocket handling:**
The context maintains a persistent WebSocket connection. It auto-reconnects if the connection drops. It handles these message types from the server:
- `INITIAL_STATE` — sync state on first connect
- `MODE_CHANGE` / `STATE_UPDATE` — real-time state updates from any connected client
- `QUANTUM_ML_STATUS` — training progress and inference results
- `PONG` — latency measurement response

### 7.2 Routing & Pages

**File:** `src/app/routes.tsx`

The app uses React Router 7 with these routes:

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/` | `HomePage` | Landing/intro page |
| `/command` | `CommandCenterPage` | Main monitoring dashboard |
| `/attacker` | `AttackerPage` | Attack simulation console |
| `/defender` | `DefenderPage` | Defense and response console |
| `/quantum-lab` | `QuantumLabPage` | Deep dive into quantum internals |

### 7.3 Page: Home

**File:** `HomePage.tsx`

A visually striking landing page that introduces the system. Contains a hero section with animated elements, a brief description of the technology, and navigation buttons to enter the Command Center or either dashboard.

### 7.4 Page: Command Center

**File:** `CommandCenterPage.tsx`

The main monitoring hub. Layout:

**Left column:**
- **Threat Radar** — animated rotating radar showing detected threats as colored dots (red = jamming, yellow = spoofing, green = normal). The sweep arm rotates at 4 seconds per revolution. Threat dots pulse with a glow animation when active.
- **System Health** — progress bars showing: QSVM Accuracy, Threat Level, QW Engine, Cluster Engine, WS Latency

**Center column:**
- **Global Defense Status** — large status banner showing current system state with color coding
- **Attack Type / ML Confidence / Defense Mode** — three metric cards
- **Navigation tiles** — links to Attack Simulator, Defense Center, Quantum Lab
- **Live Event Log** — timestamped log of recent system events

**Right column:**
- **Quantum Engine Status** — list of all 7 engines with animated status indicators (Quantum Walk, Gate Encoding, Q-Clustering, QSVM, QSDC, PQC, AI Threat Intel)
- **AI Threat Forecast** — probability bars for upcoming jamming, spoofing, and hybrid attacks

**Global elements:**
- Animated particle field background (60 floating particles)
- CRT scanline overlay effect
- Fixed bottom navigation bar (always visible, links to all main sections)

### 7.5 Page: Attacker Dashboard

**File:** `AttackerPage.tsx`

Simulates the perspective of an electronic warfare attacker. Contains:

- **Attack Controls** (`AttackControls.tsx`) — two large buttons to launch Jamming or Spoofing attacks. Clicking these calls `launchAttack()` from SystemContext, which hits the `/api/quantum-ml/evaluate` endpoint.
- **Signal Chart** (`SignalChart.tsx`) — real-time waveform visualization of the simulated attack signal vs. the baseline clean signal
- **Communication Panel** (`CommunicationPanel.tsx`) — shows signal parameters, frequency, power level
- **Detection Status** — shows whether the defense system has detected the attack yet and with what confidence

When an attack is launched:
1. The system immediately shows "UNDER ATTACK"
2. Status transitions to "ANALYZING THREAT" while the Python QSVM runs
3. After ~1-3 seconds, the result appears: "ATTACK CLASSIFIED" with the attack type and confidence

### 7.6 Page: Defender Dashboard

**File:** `DefenderPage.tsx`

The defender's perspective. Contains:

- **Detection Panel** (`DetectionPanel.tsx`) — shows what the ML model detected, confidence, threat score, and response time
- **QSVM ML Panel** (`QuantumMLPanel.tsx`) — shows detailed model metrics (accuracy, F1 score, validation accuracy) and allows triggering a fresh training run
- **QSDC Panel** (`QSDCPanel.tsx`) — simulates Quantum Secure Direct Communication. Has a "Establish Secure Channel" button that calls `/api/qsdc/simulate`, shows QBER (quantum bit error rate), key length, and session security status
- **PQC Panel** (`PQCPanel.tsx`) — shows the Post-Quantum Cryptography status, Kyber level selector, security parameters (classical bits, quantum bits, algorithm name, Shor/Grover resistance)
- **AI Threat Intelligence** (`AIThreatIntelligence.tsx`) — AI-powered recommendations ("Activate frequency hopping", "Run signal fingerprinting", etc.) based on detected attack type

When the defender clicks "Activate Quantum Secure Channel":
1. `activateSecureChannel()` is called
2. Status shows "SWITCHING CHANNELS" for 2 seconds
3. Then "SECURE CHANNEL ACTIVE" for 3 seconds
4. Then resets back to normal

### 7.7 Page: Quantum Lab

**File:** `QuantumLabPage.tsx`

The most technically detailed page. Gives a deep look inside the quantum ML pipeline with interactive visualizations:

- **Quantum Walk Visualization** (`QuantumWalkViz.tsx`) — animated bar chart showing the probability distribution from the quantum walk. Updates when a new signal is processed.
- **Bloch Sphere** (`BlochSphere.tsx`) — 3D visualization of the 2-qubit quantum state vector rendered on a Bloch sphere (a standard way to visualize qubit states)
- **Quantum Circuit Viz** (`QuantumCircuitViz.tsx`) — renders the quantum circuit diagram (Ry, Rz, CNOT gates) used in gate encoding
- **Quantum State Viz** (`QuantumStateViz.tsx`) — shows the raw state vector amplitudes (|00⟩, |01⟩, |10⟩, |11⟩) as a bar chart
- **Cluster Space 3D** (`ClusterSpace3D.tsx`) — 3D scatter plot showing quantum state space with cluster centroids and where the current signal falls
- **Quantum Cluster Viz** (`QuantumClusterViz.tsx`) — kernel similarity scores vs. each reference cluster
- **Run Inference Button** — triggers the full quantum pipeline (`/api/quantum/infer`) with the selected attack type and refreshes all visualizations

---

## 8. Key UI Components

| Component | Purpose |
|-----------|---------|
| `ThreatRadar.tsx` | Animated SVG radar with rotating sweep arm, concentric rings, axis labels, and threat dot markers with pulsing glow rings |
| `BootSequence.tsx` | Full-screen terminal boot animation on first load |
| `SignalChart.tsx` | Real-time waveform chart using Recharts, shows attack signal vs clean signal |
| `BlochSphere.tsx` | 3D Bloch sphere rendered via SVG/canvas for qubit state visualization |
| `QuantumWalkViz.tsx` | Animated probability distribution chart for quantum walk output |
| `QuantumCircuitViz.tsx` | Visual circuit diagram of the 2-qubit encoding gate sequence |
| `QuantumStateViz.tsx` | Bar chart of state vector amplitudes |
| `ClusterSpace3D.tsx` | 3D cluster visualization with reference states and input state |
| `QuantumMLPanel.tsx` | ML metrics display (accuracy, F1, validation) + training trigger button |
| `DetectionPanel.tsx` | Attack classification result with confidence ring and threat score |
| `QSDCPanel.tsx` | QSDC key exchange simulation panel |
| `PQCPanel.tsx` | PQC Kyber algorithm parameters and security metrics |
| `AIThreatIntelligence.tsx` | AI-based threat probability forecasts and action recommendations |
| `AttackControls.tsx` | Two launch buttons for Jamming and Spoofing attacks |
| `CommunicationPanel.tsx` | Signal parameters display (frequency, power, SNR) |
| `ConnectionStatus.tsx` | Small indicator showing WebSocket connected/offline |

---

## 9. Full Attack & Defense Flow — Step by Step

Here is the complete sequence of events when a user clicks "Launch Jamming Attack":

```
[User] Clicks "LAUNCH JAMMING ATTACK" on Attacker Page
   ↓
[SystemContext] launchAttack('jamming') called
   ↓
[SystemContext] Local state: attackType='jamming', systemStatus='under-attack'
   ↓
[WebSocket] Sends STATE_UPDATE to server → Server broadcasts to all tabs
   ↓
[SystemContext] Status → 'processing'
   ↓
[SystemContext] Generates synthetic jamming features:
   [1.5+r, -0.3+r, -1.2+r, 0.8+r] (signal fingerprint)
   ↓
[HTTP POST] → /api/quantum-ml/evaluate { features: [...] }
   ↓
[server.ts] Checks if QSVM is trained
   ↓
[server.ts] Spawns Python: python3 quantum/quantum_ml_trainer.py --mode evaluate --features ...
   ↓
[quantum_ml_trainer.py] Loads saved model from qsvm_model.json
   ↓
[quantum_ml_trainer.py] Runs QSVM inference on the 4 features
   ↓
[quantum_ml_trainer.py] Outputs JSON: { prediction, confidence, probabilities, threat_score }
   ↓
[server.ts] Parses JSON, updates globalState, broadcasts via WebSocket
   ↓
[HTTP Response] Returns { success, prediction, confidence, mlConfidence, mlThreatScore, ... }
   ↓
[SystemContext] Updates: mlConfidence, mlThreatScore, modelAccuracy, attackType='jamming'
   ↓
[SystemContext] systemStatus → 'detected'
   ↓
[UI] Command Center shows "ATTACK CLASSIFIED" in red
[UI] Threat Radar shows red dot at 45°
[UI] Defender panel shows detection details + recommendations
   ↓
[User] Clicks "Activate Quantum Secure Channel" on Defender Page
   ↓
[SystemContext] activateSecureChannel() called
   ↓
[WebSocket] Broadcasts 'switching' status to all clients
   ↓
[HTTP POST] → /api/qsdc/simulate { simulate_attack: false }
   ↓
[server.ts] Spawns Python: python3 quantum/quantum_qsdc.py --mode establish
   ↓
[quantum_qsdc.py] Runs BB84-style QKD protocol
   ↓
[quantum_qsdc.py] QBER computed (~0.02 = 2%, well below threshold)
   ↓
[quantum_qsdc.py] Outputs JSON: { is_established: true, qkd_result, key_hex }
   ↓
[UI] After 2s: systemStatus → 'secure', QSDC engine shows ACTIVE
[UI] After 5s: systemStatus → 'normal', attack reset to 'none'
```

---

## 10. API Reference

### POST `/api/quantum-ml/evaluate`

Runs QSVM inference on signal features.

**Request body:**
```json
{ "features": [1.5, -0.3, -1.2, 0.8] }
```

**Response:**
```json
{
  "success": true,
  "prediction": "jamming",
  "confidence": 0.87,
  "probabilities": { "jamming": 0.87, "normal": 0.13 },
  "threatScore": 0.76,
  "mlConfidence": 87,
  "mlThreatScore": 76,
  "mlResponseTimeMs": 1240,
  "modelAccuracy": 0.942
}
```

### POST `/api/quantum/infer`

Runs the full 5-stage quantum pipeline.

**Request body:**
```json
{ "attack_type": "jamming", "return_full_pipeline": true }
```

**Response:**
```json
{
  "final_result": "jamming",
  "confidence": 0.89,
  "attack_detected": true,
  "pipeline_stages": {
    "quantum_walk": { "probability_dist": [...], "entropy": 2.4 },
    "encoding": { "state_vector": [...], "circuit": [...] },
    "clustering": { "scores": { "jamming": 0.89, "normal": 0.11 } },
    "qsvm": { "prediction": "jamming", "confidence": 0.89 }
  },
  "metadata": { "execution_times_ms": { "walk": 12, "total": 156 } }
}
```

### POST `/api/qsdc/simulate`

Runs QKD (Quantum Key Distribution) simulation.

**Request body:**
```json
{ "simulate_attack": false }
```

**Response:**
```json
{
  "is_established": true,
  "qkd_result": {
    "is_secure": true,
    "eavesdrop_detected": false,
    "qber": 0.02,
    "final_key_length": 256,
    "key_hex": "a3f9..."
  }
}
```

### POST `/api/pqc/simulate`

Simulates CRYSTALS-Kyber key exchange.

**Request body:**
```json
{ "kyber_level": 768 }
```

**Response:**
```json
{
  "security": {
    "classical_security_bits": 192,
    "quantum_security_bits": 128,
    "shor_resistant": true,
    "grover_resistant": true,
    "nist_pqc_standardized": true,
    "attack_resistance_percent": 98.7
  },
  "kem": { "algorithm": "CRYSTALS-Kyber-768" },
  "dsa": { "algorithm": "CRYSTALS-Dilithium3" }
}
```

### GET `/api/ai/threat-intel`

Returns current AI threat assessment and recommendations.

**Response:**
```json
{
  "threat_level": 75,
  "prediction": "jamming",
  "confidence": 87,
  "forecast": [
    { "time": "+0m", "threat_probability": 78 },
    { "time": "+1m", "threat_probability": 72 }
  ],
  "recommendations": [
    "Activate frequency hopping",
    "Increase transmission power",
    "Switch to DSSS"
  ]
}
```

---

## 11. How to Run

### Prerequisites

- **Node.js** v18 or higher
- **Python 3.9+** (3.10+ recommended to avoid Qiskit deprecation warnings)
- Python packages: `qiskit`, `numpy`, `scipy`, `scikit-learn`

### Install Python Dependencies

```bash
pip3 install qiskit numpy scipy scikit-learn
```

### Install Node Dependencies

```bash
cd /path/to/AAQC2
npm install
```

### Run Everything

```bash
npm run dev:all
```

This starts:
- Frontend: http://localhost:5173
- Backend + WebSocket: ws://localhost:3001

### Run Only Frontend

```bash
npm run dev
```

### Run Only Backend

```bash
npm run server
```

### Build for Production

```bash
npm run build
```

---

## Notes

- The first time you launch the server, it **automatically trains the QSVM model** in the background. This takes ~10-30 seconds depending on your machine. The UI will still work during this time — if you launch an attack before training is complete, the server will wait for training to finish before running evaluation.
- All Python quantum modules include a **numpy fallback** — if Qiskit is not installed or fails, they fall back to pure numpy matrix math, so the system remains functional without a full Qiskit installation.
- The system supports **multi-tab real-time sync** — open the app in two browser tabs and launch an attack in one tab; the other tab updates automatically via WebSocket broadcast.
- WebSocket **auto-reconnects** if the connection is lost, with a 3-second retry delay.
