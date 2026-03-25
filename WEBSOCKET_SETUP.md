# WebSocket Multi-Device Sync Setup Guide

## Overview
The QuantumShield application now supports **real-time synchronization across multiple devices** using WebSockets. When one device switches to **Attacker Mode**, all connected devices automatically sync to that mode.

## Architecture

### Server (server.ts)
- **Port:** 3001
- **Technology:** Node.js with `ws` library
- **Purpose:** Manages WebSocket connections and broadcasts state changes to all connected clients
- **Global State:** Stores current attack mode and system status

### Client (SystemContext.tsx)
- Connects to WebSocket server via `ws://localhost:3001`
- Sends state changes to server
- Receives state updates from server and all other clients
- Automatic reconnection handling

## Running the Project

### Option 1: Run Both Server and Dev Together (Recommended)
```bash
npm run dev:all
```
This starts:
- WebSocket server on `ws://localhost:3001`
- Vite dev server on `http://localhost:5174` (or next available port)

### Option 2: Run Separately
**Terminal 1 - Start WebSocket Server:**
```bash
npm run server
```

**Terminal 2 - Start Dev Server:**
```bash
npm run dev
```

## How It Works

1. **Client Connection:** Each device connects to the WebSocket server and receives a unique client ID
2. **Initial State Sync:** New clients receive the current global state
3. **Action Broadcasting:** When a device launches an attack:
   - State change is sent to server
   - Server broadcasts to ALL connected clients
   - All clients update their UI in real-time
4. **State Persistence:** Server maintains the current state for new connections

## Features

- ✅ Real-time multi-device synchronization
- ✅ Automatic connection status indicator (shows "Connected/Disconnected")
- ✅ Client ID display for debugging
- ✅ Graceful reconnection handling
- ✅ Global state management across all clients

## Multi-Device Testing

### Local Testing
1. Run `npm run dev:all`
2. Open `http://localhost:5174` in multiple browser windows/tabs
3. Click "Attacker" or "Defender" on one device
4. All devices will sync automatically
5. Launch an attack on one device - **all devices will show the attack status**

### Network Testing (Multiple Computers)
1. Update `WS_URL` in `src/app/context/SystemContext.tsx` to use your machine's IP:
   ```typescript
   const WS_URL = 'ws://YOUR_IP:3001';
   ```
2. Run server on main machine: `npm run server`
3. On other machines, connect to the server IP

## Connection Status Indicator

- **Green dot with pulse:** Connected to server ✅
- **Red dot:** Disconnected from server ❌
- Shows your client ID (first 5 characters)

Location: Top-right corner of Attacker and Defender pages

## Technical Details

### WebSocket Message Types
- `INITIAL_STATE`: Sent when new client connects
- `MODE_CHANGE`: When device switches modes
- `STATE_UPDATE`: Any state change (attack type, system status, etc.)

### Global State Structure
```typescript
{
  attackType: 'none' | 'jamming' | 'spoofing',
  systemStatus: 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure',
  isProcessing: boolean
}
```

## Troubleshooting

**Devices not syncing:**
- Ensure server is running on port 3001
- Check browser console for WebSocket errors
- Verify firewall allows port 3001

**Connection shows as disconnected:**
- Wait 3 seconds for automatic reconnection
- Restart the server: `npm run server`

**Port already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```
