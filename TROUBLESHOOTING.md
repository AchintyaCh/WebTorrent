# Troubleshooting Guide

## 🚨 Common Errors and Solutions

### 1. ES Module Error (ERR_REQUIRE_ESM)

**Error**: `require() of ES Module not supported`

**Solutions**:

#### Option A: Use Setup Script (Recommended)
```bash
cd electron-app
node setup.js
```

#### Option B: Manual Fix
1. Replace `package.json` with `package-compatible.json`:
```bash
cp package-compatible.json package.json
```

2. Replace contract file:
```bash
cp src/renderer/contract-compatible.js src/renderer/contract.js
```

3. Install with legacy peer deps:
```bash
npm install --legacy-peer-deps
```

### 2. WebTorrent Import Issues

**Error**: WebTorrent module loading fails

**Solutions**:

#### Use Compatible Versions:
- WebTorrent: `^1.8.32` (instead of `^2.0.0`)
- Electron: `^20.0.0` (instead of `^22.0.0`)
- Ethers: `^5.7.2` (instead of `^6.0.0`)

#### Alternative WebTorrent Setup:
```javascript
// In main.js, use this approach:
let WebTorrent;
try {
  WebTorrent = require('webtorrent');
} catch (error) {
  console.error('WebTorrent require failed, trying alternative...');
  // Use alternative P2P library or fallback
}
```

### 3. Node.js Version Issues

**Error**: Module compatibility problems

**Solutions**:
- Use Node.js 16.x or 18.x (avoid 19+ for better compatibility)
- Check version: `node --version`
- Use nvm to switch versions if needed

### 4. MetaMask Connection Issues

**Error**: MetaMask not detected or connection fails

**Solutions**:
1. Install MetaMask browser extension
2. Ensure MetaMask is unlocked
3. Add your local network to MetaMask:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

### 5. Contract Address Issues

**Error**: Contract not found or invalid address

**Solutions**:
1. Deploy your smart contract first
2. Copy the deployed contract address
3. Update `src/renderer/contract.js`:
```javascript
const contractAddress = "0xYourContractAddressHere";
```

### 6. Build Issues

**Error**: Electron builder fails

**Solutions**:

#### Clear Cache and Reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### Use Specific Electron Builder Version:
```bash
npm install electron-builder@23.0.0 --save-dev
```

#### Platform-Specific Issues:
- **Windows**: Install Visual Studio Build Tools
- **macOS**: Install Xcode Command Line Tools
- **Linux**: Install build-essential

### 7. DHT Peer Discovery Issues

**Error**: No peers found, download timeout

**Solutions**:

#### Network Configuration:
1. Check firewall settings (allow UDP traffic)
2. Ensure ports are not blocked
3. Try different network (mobile hotspot for testing)

#### DHT Bootstrap:
```javascript
// Add more bootstrap nodes
dhtBootstrap: [
  'router.bittorrent.com:6881',
  'dht.transmissionbt.com:6881',
  'router.utorrent.com:6881',
  'dht.libtorrent.org:25401'
]
```

### 8. File System Permissions

**Error**: Cannot read/write files

**Solutions**:
- Run as administrator (Windows) or with sudo (Linux/macOS)
- Check file permissions
- Ensure download folder is writable

## 🔧 Alternative Installation Methods

### Method 1: Clean Install
```bash
# Remove everything and start fresh
rm -rf electron-app
mkdir electron-app
cd electron-app

# Copy only essential files
# Then run setup
```

### Method 2: Docker Setup (Advanced)
```dockerfile
FROM node:16
WORKDIR /app
COPY package-compatible.json package.json
RUN npm install --legacy-peer-deps
COPY . .
CMD ["npm", "run", "dev"]
```

### Method 3: Use Older Electron
```json
{
  "dependencies": {
    "electron": "^13.0.0",
    "webtorrent": "^1.5.0",
    "ethers": "^5.0.0"
  }
}
```

## 🧪 Testing Steps

### 1. Basic Functionality Test:
```bash
cd electron-app
npm run dev
```
- App should start without errors
- UI should load properly
- Console should show "WebTorrent client initialized"

### 2. WebTorrent Test:
- Create a small test file
- Try to seed it
- Check console for torrent creation logs

### 3. MetaMask Test:
- Click "Connect Wallet"
- MetaMask should prompt for connection
- Wallet address should display

### 4. Blockchain Test:
- Try listing a file
- Check transaction in MetaMask
- Verify file appears in marketplace

## 📞 Getting Help

If you're still having issues:

1. **Check Console Logs**: Open DevTools (F12) and check for errors
2. **Enable Debug Mode**: Run with `npm run dev` for detailed logging
3. **Version Check**: Ensure you're using compatible versions
4. **Network Check**: Test with different networks/connections
5. **Clean Install**: Try the setup script or manual clean install

## 🔄 Fallback Options

If Electron continues to have issues:

### Option 1: Browser Version
Use the original browser-based version with trackers as a fallback.

### Option 2: Alternative P2P Libraries
- Use `bittorrent-protocol` directly
- Try `torrent-stream` for simpler implementation
- Consider `hypercore` for different P2P approach

### Option 3: Simplified Version
Create a version without WebTorrent that just handles blockchain operations and uses external torrent clients.

---

**Remember**: The goal is tracker-less P2P, so even if we need to use compatible versions, we're still achieving decentralization! 🎯