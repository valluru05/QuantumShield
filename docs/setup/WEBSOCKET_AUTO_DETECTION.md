# 🔗 Automatic WebSocket Connection Detection

## What's New

The project now has **automatic WebSocket URL detection**! This means:

✅ **Same Machine (Localhost):** Automatically uses `ws://localhost:3001`  
✅ **Different Machines (Network):** Automatically uses `ws://192.168.x.x:3001`

## No Manual Configuration Needed!

The system automatically detects your connection type:

### How It Works

**File:** `src/config/wsConfig.ts`

```typescript
export const getWSUrl = (): string => {
  const hostname = window.location.hostname;

  // Same machine? Use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'ws://localhost:3001';
  }

  // Different machine? Use the IP you accessed from
  return `ws://${hostname}:3001`;
};
```

## Scenario Examples

### Scenario 1: Single Laptop (localhost)
- URL: `http://localhost:5173/`
- WebSocket: `ws://localhost:3001/` ✅

### Scenario 2: Two Laptops
- **Laptop A** (Server): Runs on `192.168.1.100`
- **Laptop B** opens: `http://192.168.1.100:5173/`
- WebSocket automatically uses: `ws://192.168.1.100:3001/` ✅

### Scenario 3: Multiple Tabs on Same Machine
- Tab 1: `http://localhost:5173/` → `ws://localhost:3001/` ✅
- Tab 2: `http://192.168.1.100:5173/` → `ws://192.168.1.100:3001/` ✅
- Both still sync because they connect to the same server!

## Implementation Details

The `getWSUrl()` function is called in:
- **`src/app/context/SystemContext.tsx`** - Sets up the WebSocket connection

When a new user opens the app:
1. Browser loads page from hostname
2. `getWSUrl()` reads that hostname
3. WebSocket connects to `ws://{hostname}:3001/`
4. Real-time sync begins! 🔄

## Benefits

1. **Zero Configuration** - Just change the URL in the browser address bar
2. **Smart Detection** - Automatically handles localhost vs network IPs
3. **Scalable** - Works with any number of connected devices
4. **Developer Friendly** - No manual URL changes needed

## Manual Override (If Needed)

If you want to manually specify a WebSocket URL for advanced setups:

Edit `src/config/wsConfig.ts`:

```typescript
export const getWSUrl = (): string => {
  // Force a specific WebSocket server
  return 'ws://192.168.1.50:3001';  // Your custom IP
};
```

Then update `src/app/context/SystemContext.tsx`:
```typescript
// Use a fixed URL instead
const WS_URL = 'ws://192.168.1.50:3001';
```

## Testing the Detection

Open browser DevTools (F12) → Console, and check:
- It should log the WebSocket URL being used
- Verify it matches your intended hostname

---

**That's it!** The automatic detection makes multi-laptop setups seamless. 🎉
