# Multi-Laptop Synchronization Guide

## Scenario: Connect Two Laptops
**Laptop A (Server/Host):** Runs the WebSocket server and can host the app  
**Laptop B (Client):** Connects to Laptop A's WebSocket server

When Laptop A presses "Attack", Laptop B (in Defender mode) will see the attack in real-time!

---

## Step 1: Find Your Laptop A's IP Address

### On macOS (Laptop A):
```bash
# Find your local IP address
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for something like: `192.168.x.x` or `10.0.x.x`

**Example:** `192.168.1.100`

---

## Step 2: Configure the Server to Accept External Connections

### Edit `server.ts` (Laptop A only)

The server currently binds to `localhost` which is not accessible from other machines. We need to bind to `0.0.0.0` to accept connections from any IP.

**File:** `/Users/mylaptop/Desktop/AA 2/server.ts`

Change line where the server binds (around line 73):
```typescript
// Change from:
server.listen(PORT, 'localhost', () => {

// To:
server.listen(PORT, '0.0.0.0', () => {
```

This allows the server to accept WebSocket connections from other machines on your network.

---

## Step 3: Update the WebSocket URL for Laptop B

### Option A: Automatic Detection (Recommended)

Create a configuration file that auto-detects the environment:

**Create a new file:** `src/config/wsConfig.ts`

```typescript
// Determine WebSocket URL based on environment
export const getWSUrl = (): string => {
  // In production or when connecting to a different host
  if (import.meta.env.PROD) {
    return `wss://${window.location.host}`;
  }

  // In development
  // If you're on the same machine: use localhost
  // If you're on a different machine: use the host IP
  
  // Check if we're accessing from a different machine
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Running on same machine
    return 'ws://localhost:3001';
  } else {
    // Connecting from different machine
    return `ws://${window.location.hostname}:3001`;
  }
};
```

Then update `SystemContext.tsx`:
```typescript
import { getWSUrl } from '../config/wsConfig';

// Replace the WS_URL definition with:
const WS_URL = getWSUrl();
```

### Option B: Manual Configuration

Edit `src/app/context/SystemContext.tsx` and change:

```typescript
const WS_URL = import.meta.env.PROD
  ? `wss://${window.location.host}`
  : 'ws://192.168.1.100:3001';  // Replace with your Laptop A's IP
```

---

## Step 4: Run the Project

### On Laptop A (Server Host):

**Terminal 1 - Start WebSocket Server:**
```bash
cd "/Users/mylaptop/Desktop/AA 2"
npm run server
```

Should show:
```
WebSocket server is running on ws://0.0.0.0:3001
```

**Terminal 2 - Start Vite Dev Server:**
```bash
cd "/Users/mylaptop/Desktop/AA 2"
npm run dev
```

Should show:
```
➜  Local:   http://localhost:5173/
```

---

### On Laptop B (Client):

You have two options:

#### Option B.1: Access via Laptop A's IP (Recommended)
```bash
# Open in your browser on Laptop B:
http://192.168.1.100:5173/
```

Replace `192.168.1.100` with your Laptop A's actual IP address.

#### Option B.2: Run Your Own Dev Server (Advanced)
If you want to run the full dev server on Laptop B:

```bash
# Clone or copy the project to Laptop B
# Then on Laptop B:
cd /path/to/project
npm install
npm run dev

# Update SystemContext.tsx on Laptop B to point to Laptop A's IP:
# const WS_URL = 'ws://192.168.1.100:3001';
```

---

## Step 5: Test the Setup

### Laptop A Actions:
1. Open `http://localhost:5173/`
2. Click **"Attacker"** button
3. Click **"Launch Attack"** and select "Jamming" or "Spoofing"

### Laptop B Actions:
1. Open `http://192.168.1.100:5173/` (or your laptop A's IP)
2. Click **"Defender"** button
3. Watch the status update in **real-time** from Laptop A's attack!

You should see:
- ✅ Connection status indicator showing "Connected"
- ✅ System status changing to "Under Attack"
- ✅ The attack type displaying on Laptop B's Defender panel

---

## Troubleshooting

### "Connection Refused" Error
- Check Laptop A's firewall allows port 3001
- Verify the IP address is correct
- Ensure `server.ts` is bound to `0.0.0.0`
- Make sure both laptops are on the same network

### "Can't access the website"
- Verify Laptop A's dev server is running on port 5173
- Check if the IP address is correct
- Make sure both laptops can ping each other:
  ```bash
  # On Laptop B, test connection to Laptop A:
  ping 192.168.1.100
  ```

### Connection drops frequently
- Check network stability
- Ensure there's no firewall blocking WebSocket connections
- Check console logs for detailed error messages

---

## Advanced: Check Network Status

### Find all available IPs on your network:
```bash
# On macOS
ifconfig

# Or use a simpler command:
hostname -I
```

### Test WebSocket connection:
```bash
# On Laptop B, test if you can connect to WebSocket:
wscat -c ws://192.168.1.100:3001
```

---

## Summary Checklist

- [ ] Note Laptop A's IP address (e.g., `192.168.1.100`)
- [ ] Edit `server.ts` to bind to `0.0.0.0` (if not already done)
- [ ] Start WebSocket server on Laptop A (`npm run server`)
- [ ] Start Vite dev server on Laptop A (`npm run dev`)
- [ ] On Laptop B, open `http://192.168.1.100:5173/`
- [ ] Test: Attack on A → Defender updates on B in real-time ✅

---

## What's Happening Behind the Scenes

1. **Laptop A (Attacker)** sends attack command
2. **WebSocket Server** (on Laptop A) receives the message
3. **Server broadcasts** state change to ALL connected clients
4. **Laptop B (Defender)** receives the update via WebSocket
5. **UI updates instantly** on Laptop B to show the attack

This is **true real-time synchronization** across different physical machines!
