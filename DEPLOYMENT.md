# Deploying QuantumShield++ to Railway

**Railway** is the recommended platform because it:
- Supports Docker (which we need for Python + Node.js together)
- Handles WebSocket connections natively
- Has a free tier (500 hours/month)
- Deploys directly from GitHub with zero config

---

## What Was Changed for Deployment

| File | Change |
|------|--------|
| `Dockerfile` | New — builds Python 3.11 + Node.js 20 container |
| `.dockerignore` | New — keeps Docker build fast |
| `requirements.txt` | New — Python packages for quantum modules |
| `package.json` | Added `start` script for production |
| `server.ts` | Now serves React static files from `dist/` in production |
| `SystemContext.tsx` | WebSocket + API URLs now use same origin in production (supports HTTPS/wss://) |

---

## Step 1 — Push to GitHub

If not already on GitHub:

```bash
cd /Users/revanth/Desktop/QuantumShield

git init                          # (skip if already a git repo)
git add .
git commit -m "Add deployment config"
```

Create a repo on https://github.com/new then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/QuantumShield.git
git push -u origin main
```

---

## Step 2 — Deploy on Railway

1. Go to **https://railway.app** and sign up (free — use GitHub login)

2. Click **"New Project"** → **"Deploy from GitHub repo"**

3. Select your **QuantumShield** repository

4. Railway auto-detects the `Dockerfile` — no extra config needed

5. Click **"Deploy"**

Railway will:
- Pull your code
- Build the Docker image (~5–10 minutes first time — installing Python + Qiskit takes a while)
- Start the container with `npm start`
- Railway will assign you a public URL like `https://quantumshield-production.up.railway.app`

---

## Step 3 — Get Your Public URL

Once deployed, click the service → **"Settings"** → **"Domains"**.

Railway auto-assigns a domain. You can also click **"Generate Domain"** to get a custom subdomain.

Your app will be live at:
```
https://quantumshield.up.railway.app
```

---

## Step 4 — Verify It Works

Open the URL in your browser. You should see the boot sequence and the Command Center.

Check these things:
- ✅ Boot sequence animation plays
- ✅ "WS LIVE" indicator is green (WebSocket connected)
- ✅ QSVM accuracy shows ~94% (model trained on startup)
- ✅ Launching an attack returns a classification result

---

## Environment Variables (Optional)

Railway automatically sets `PORT`. The server reads `process.env.PORT || 3001` so it works without any configuration.

If you need custom settings, go to **Railway → your service → Variables** and add:

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `3001` | (already handled automatically) |

---

## Build Times

| Phase | Time |
|-------|------|
| Docker image build (first deploy) | ~8–15 min |
| Subsequent deploys (cached layers) | ~2–5 min |
| QSVM training on startup | ~15–30 sec |

The first deploy is slow because it installs Qiskit and its dependencies. After the first build, Docker layer caching makes updates much faster.

---

## Alternative Platforms

### Render
1. Go to https://render.com → New → Web Service
2. Connect GitHub repo
3. Select **"Docker"** as environment
4. Set **Start Command**: leave blank (uses Dockerfile CMD)
5. Free tier available (spins down after 15 min of inactivity)

### Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

cd /Users/revanth/Desktop/QuantumShield
fly launch     # follow prompts, select region
fly deploy
```

---

## How It Works in Production

```
Browser (https://your-app.railway.app)
    │
    ├── GET /            → Node.js serves dist/index.html
    ├── GET /assets/*    → Node.js serves dist/assets/*
    │
    ├── WS  wss://your-app.railway.app   → WebSocket server (same port)
    │
    └── POST /api/quantum-ml/evaluate    → Node.js spawns Python
                                              └── quantum_ml_trainer.py
```

Everything runs on a **single port** (Railway's assigned PORT). The Node.js server:
- Serves static React files for the frontend
- Handles all `/api/*` REST calls
- Manages the WebSocket real-time connection
- Spawns Python child processes for quantum computations

---

## Troubleshooting

**Build fails with Python package error**
→ Check Railway build logs. If `qiskit-aer` fails, it may need more memory. Upgrade Railway plan or remove `qiskit-aer` from `requirements.txt` (the numpy fallback will still work).

**App loads but shows "OFFLINE" for WebSocket**
→ Make sure you're visiting the `https://` URL, not `http://`. Railway forces HTTPS and the code now correctly uses `wss://` for HTTPS pages.

**Python process fails silently**
→ The server has simulation fallbacks for all Python calls. If a Python process errors, realistic simulated data is returned so the UI still works.

**"WS LIVE" briefly shows then goes offline**
→ Normal during QSVM startup training. The model trains for ~15–30 seconds on boot. Everything stabilizes after that.
