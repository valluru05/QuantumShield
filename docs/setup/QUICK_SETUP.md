# 🚀 Quick Setup: Connect Two Laptops

## What You Need to Do

### Step 1: Find Your Laptop A's Local IP Address

Open Terminal on **Laptop A** and run:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for an IP like: `192.168.1.100` or `10.0.x.x`

**Save this IP address!** (Let's call it `YOUR_LAPTOP_IP`)

---

## Step 2: Start the Server on Laptop A

### Terminal 1 on Laptop A:
```bash
cd "/Users/mylaptop/Desktop/AA 2"
npm run server
```

You should see:
```
WebSocket server is running on ws://192.168.1.100:3001
```

**Keep this terminal open!**

### Terminal 2 on Laptop A:
```bash
cd "/Users/mylaptop/Desktop/AA 2"
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

**Keep this terminal open!**

---

## Step 3: Connect Laptop B

### On Laptop B, open your browser and navigate to:
```
http://YOUR_LAPTOP_IP:5173/
```

**Example:** `http://192.168.1.100:5173/`

---

## Step 4: Test Real-Time Sync

### On Laptop A:
1. Click **"Attacker"** button
2. Click **"Launch Attack"**
3. Select **"Jamming"** or **"Spoofing"**

### On Laptop B:
1. Click **"Defender"** button
2. **Watch it update in real-time!** 🎉

You should see:
- ✅ System status changes to "Under Attack"
- ✅ The attack type is displayed
- ✅ Connection status shows "Connected"

---

## How It Works

1. **Laptop A** is the **Server/Host** running on port 3001 & 5173
2. **Laptop B** connects to **Laptop A's IP address** 
3. WebSocket synchronizes state between both laptops **in real-time**
4. When you attack on A → Defender screen updates instantly on B

---

## Troubleshooting

### "Can't connect" or "Connection refused"
- Double-check the IP address is correct
- Make sure both laptops are on the **same WiFi network**
- Check that the WebSocket server is running on Laptop A

### "Page won't load"
- Verify `http://YOUR_LAPTOP_IP:5173/` in the address bar
- Make sure Terminal 2 (dev server) is running on Laptop A

### Still not working?
- Restart both terminals
- Check firewall settings (ports 3001 & 5173 might need access)
- Verify with: `ping 192.168.1.100` (from Laptop B, using Laptop A's IP)

---

## That's it! 🎉

Your two-laptop quantum shield system is now synchronized!
