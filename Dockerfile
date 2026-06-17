# ── Base: Python 3.11 slim ──────────────────────────────────────────────────
FROM python:3.11-slim

# Install system dependencies + Node.js 20
RUN apt-get update && apt-get install -y \
      curl \
      gnupg \
      build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Working directory ────────────────────────────────────────────────────────
WORKDIR /app

# ── Python deps (cached layer) ───────────────────────────────────────────────
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# ── Node deps (cached layer) ─────────────────────────────────────────────────
COPY package*.json ./
# Install all deps including devDeps (needed for vite build)
# Also explicitly install react/react-dom (listed as peerDeps)
RUN npm install --legacy-peer-deps

# ── Copy source ──────────────────────────────────────────────────────────────
COPY . .

# ── Build React frontend ─────────────────────────────────────────────────────
RUN npm run build

# ── Expose port ──────────────────────────────────────────────────────────────
EXPOSE 3001

# ── Start Node server (serves API + static files) ────────────────────────────
CMD ["npm", "start"]
