# 📦 Distribution Guide - P2P Blockchain File Sharing

## 🏗️ Building the .exe

### Quick Build:
```bash
cd electron-app
npm run build-exe
```

### Manual Build:
```bash
cd electron-app
npm install electron-builder --save-dev
npm run build-win
```

## 📁 Output Files

After building, you'll find in `dist/` folder:
- `P2P Blockchain File Sharing Setup.exe` - **Installer (Recommended)**
- `win-unpacked/` - **Portable version**

## 🚀 Distribution for Testing

### Method 1: Installer (.exe)
1. **Copy** `P2P Blockchain File Sharing Setup.exe` to other machines
2. **Run installer** on each machine
3. **Install** the application normally

### Method 2: Portable Version
1. **Copy entire** `win-unpacked/` folder to other machines
2. **Run** `P2P Blockchain File Sharing.exe` directly
3. **No installation** required

## 🌐 Network Setup for Testing

### Prerequisites on Each Machine:
1. **MetaMask installed** in default browser
2. **Same blockchain network** configured
3. **Internet connection** for DHT bootstrap
4. **Firewall allows** UDP traffic (for DHT)

### Blockchain Network Setup:

#### Option 1: Public Testnet (Recommended)
```javascript
// Update contract address in app for testnet
const contractAddress = "YOUR_TESTNET_CONTRACT_ADDRESS";
```

#### Option 2: Shared Local Network
1. **Deploy contract** to accessible network
2. **Configure MetaMask** on all machines:
   - Network Name: Shared Test Network
   - RPC URL: http://YOUR_SERVER_IP:8545
   - Chain ID: 31337

## 🧪 Testing Procedure

### Machine 1 (Seller):
1. **Start app** and connect MetaMask
2. **Upload file** with title, description, price
3. **Keep app running** to seed the file
4. **Note the file ID** from marketplace

### Machine 2 (Buyer):
1. **Start app** and connect MetaMask (different account)
2. **Go to Marketplace** and refresh
3. **Purchase the file** from Machine 1
4. **Select download folder**
5. **Wait for DHT peer discovery** (30-60 seconds)

### Expected Results:
- ✅ **Peer discovery** within 1-2 minutes
- ✅ **Download starts** and shows progress
- ✅ **File transfers** directly between machines
- ✅ **No trackers used** - pure DHT + blockchain

## 🔧 Troubleshooting

### No Peers Found:
1. **Check firewall** - allow UDP traffic
2. **Wait longer** - DHT can take 2-3 minutes
3. **Verify internet** - DHT needs bootstrap nodes
4. **Check NAT** - some networks block P2P

### MetaMask Issues:
1. **Install MetaMask** browser extension
2. **Same network** on both machines
3. **Different accounts** with ETH balance
4. **Unlock MetaMask** before connecting

### Build Issues:
1. **Install Visual Studio Build Tools**
2. **Run as Administrator**
3. **Clear node_modules** and reinstall

## 📊 Network Requirements

### Minimum:
- **Internet connection** for DHT bootstrap
- **UDP port access** for peer discovery
- **Different IP addresses** (different machines/networks)

### Optimal:
- **Public IP addresses** or proper NAT traversal
- **Fast internet** for quick peer discovery
- **Stable connection** during file transfer

## 🎯 Production Deployment

### For Real Users:
1. **Deploy contract** to mainnet or stable testnet
2. **Update contract address** in application
3. **Test thoroughly** on different networks
4. **Create proper installer** with signing certificates
5. **Distribute** via website or app stores

### Security Considerations:
- **Code signing** for Windows executable
- **HTTPS** for any web components
- **Smart contract auditing**
- **User education** about MetaMask security

---

**Ready to test true decentralized P2P file sharing! 🌐**