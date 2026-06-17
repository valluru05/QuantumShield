# 🚀 System Running Guide

**Last Started:** $(date)
**Status:** ✅ FULLY OPERATIONAL

---

## 🌐 Access URLs

### Local Development
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **WebSocket:** ws://localhost:3001

### Network Access (Other Devices)
- **Frontend:** http://10.2.25.155:5173
- **Backend API:** http://10.2.25.155:3001
- **WebSocket:** ws://10.2.25.155:3001

---

## 🎮 How to Use the UI

1. **Open browser:** http://localhost:5173

2. **Navigate to page:** 
   - Attacker Page (for launching attacks)
   - Defender Page (for monitoring)

3. **Find Quantum ML Panel:**
   - Scroll down to find the purple/blue gradient panel
   - Title: "Quantum ML Panel"

4. **Test Quantum Pipeline:**
   - Click button: "Show Quantum Pipeline"
   - Wait 1-2 seconds for computation
   - 4 tabs will appear:
     - **Circuit:** Quantum circuit diagram (QASM code)
     - **State:** 4D state vector visualization
     - **Cluster:** Kernel similarity radar chart
     - **Walk:** Probability distribution

---

## 🧪 Test Commands

### Check Server Status
```bash
curl http://localhost:3001/api/quantum-ml/status
```

### Train Quantum Model
```bash
curl -X POST http://localhost:3001/api/quantum/train
```

### Run Inference
```bash
curl -X POST http://localhost:3001/api/quantum/infer \
  -H "Content-Type: application/json" \
  -d '{"attack_type": "jamming", "return_full_pipeline": true}'
```

---

## 🔄 Restart Services

### Stop All
```bash
pkill -f "tsx watch server.ts"
pkill -f "vite"
```

### Start Backend
```bash
cd /Users/revanth/Desktop/AA\ 2
npm run server
```

### Start Frontend (new terminal)
```bash
cd /Users/revanth/Desktop/AA\ 2
npm run dev
```

---

## 📊 What's Working

✅ **Backend Server**
- Node.js server running on port 3001
- WebSocket server for multi-device sync
- QSVM model trained (51 support vectors)
- Model persisted to quantum_pipeline_model.json

✅ **Frontend Application**
- React/Vite dev server on port 5173
- Hot module reload enabled
- All quantum visualization components loaded

✅ **Quantum ML Pipeline**
- Quantum Walk (16-position simulation)
- 2-Qubit Circuit Encoding (H, Ry, Rz, CNOT)
- Quantum Clustering (3-class kernel)
- QSVM Classifier (binary attack detection)
- Execution time: ~0.3ms per inference

✅ **API Endpoints**
- POST /api/quantum/train - Train QSVM
- POST /api/quantum/infer - Run inference
- GET  /api/quantum-ml/status - Check status
- POST /api/quantum-ml/train - Legacy training
- POST /api/quantum-ml/evaluate - Legacy evaluation

---

## 🎓 Demo Script

**1-Minute Demo:**
1. Open http://localhost:5173
2. Go to Attacker/Defender page
3. Click "Show Quantum Pipeline"
4. Switch between tabs to show:
   - 2-qubit quantum circuit
   - 4D state vector
   - 3-cluster classification
   - Quantum walk distribution

**Technical Points:**
- "2-qubit system provides 4D Hilbert space"
- "Quantum kernels enable non-linear classification"
- "Entanglement creates feature correlations"
- "0.3ms latency for real-time detection"
- "Model persists across server restarts"

---

## 🐛 Troubleshooting

**Backend not responding?**
```bash
ps aux | grep tsx
# If not running: npm run server
```

**Frontend not loading?**
```bash
ps aux | grep vite
# If not running: npm run dev
```

**Quantum panel not showing?**
- Check browser console (F12)
- Verify backend is running on :3001
- Test endpoint: curl http://localhost:3001/api/quantum/infer

**Python errors?**
```bash
cd quantum
python3 quantum_pipeline.py --mode demo --debug
# Should complete without errors
```

---

**System ready! Open http://localhost:5173 and test!** 🎉
