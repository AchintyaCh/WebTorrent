# Build Instructions for P2P Blockchain Electron App

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd electron-app
npm install
```

### 2. Update Contract Address
Edit `src/renderer/contract.js` and update the contract address:
```javascript
const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 3. Development Mode
```bash
npm run dev
```

### 4. Production Build
```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build-win    # Windows
npm run build-mac    # macOS  
npm run build-linux  # Linux
```

## 📋 Prerequisites

### Required Software:
- **Node.js 16+**: Download from [nodejs.org](https://nodejs.org/)
- **Git**: For cloning repositories
- **MetaMask**: Browser extension for wallet functionality

### Blockchain Setup:
1. **Deploy Smart Contract**: Use your existing Hardhat setup
2. **Get Contract Address**: Copy the deployed contract address
3. **Fund Test Accounts**: Ensure accounts have ETH for transactions

## 🔧 Configuration Steps

### 1. Contract Configuration
```javascript
// src/renderer/contract.js
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace this
```

### 2. Network Configuration (if needed)
If using a different network than localhost:8545, update MetaMask network settings.

### 3. Build Icons (Optional)
Add app icons to `build/` directory:
- `build/icon.ico` (Windows)
- `build/icon.icns` (macOS)
- `build/icon.png` (Linux)

## 🏗️ Build Process

### Development Build:
```bash
npm run dev
```
- Opens app with DevTools
- Hot reload for development
- Console logging enabled

### Production Build:
```bash
npm run build
```
Creates distributable files in `dist/` directory.

### Platform-Specific Builds:

#### Windows:
```bash
npm run build-win
```
Creates: `dist/P2P Blockchain File Sharing Setup.exe`

#### macOS:
```bash
npm run build-mac
```
Creates: `dist/P2P Blockchain File Sharing.dmg`

#### Linux:
```bash
npm run build-linux
```
Creates: `dist/P2P Blockchain File Sharing.AppImage`

## 📦 Distribution

### Installer Files:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` portable executable

### File Locations:
All build outputs are in the `dist/` directory after building.

## 🧪 Testing

### 1. Local Testing:
```bash
# Start development mode
npm run dev

# Test with two instances
npm run dev &
npm run dev
```

### 2. Production Testing:
```bash
# Build and test
npm run build
# Run the built executable from dist/
```

### 3. Multi-User Testing:
1. Build and distribute to multiple machines
2. Connect different MetaMask accounts
3. Test file upload/download between users

## 🔍 Verification Checklist

Before distributing, verify:

- [ ] Contract address is correct
- [ ] MetaMask connects successfully
- [ ] File upload creates torrent and lists on blockchain
- [ ] File purchase processes payment
- [ ] Download starts and completes successfully
- [ ] DHT peer discovery works (no trackers used)
- [ ] UI is responsive and user-friendly
- [ ] Error handling works properly
- [ ] App closes cleanly

## 🐛 Troubleshooting Build Issues

### Common Problems:

1. **Node Modules Issues**:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Electron Builder Fails**:
```bash
npm install electron-builder --save-dev
npm run build
```

3. **Native Dependencies**:
```bash
npm rebuild
```

4. **Permission Issues (macOS/Linux)**:
```bash
chmod +x dist/P2P\ Blockchain\ File\ Sharing.AppImage
```

### Debug Build:
```bash
DEBUG=electron-builder npm run build
```

## 📊 Build Output Structure

```
dist/
├── P2P Blockchain File Sharing Setup.exe    # Windows installer
├── P2P Blockchain File Sharing.dmg          # macOS disk image
├── P2P Blockchain File Sharing.AppImage     # Linux portable
├── win-unpacked/                            # Windows unpacked
├── mac/                                     # macOS app bundle
└── linux-unpacked/                          # Linux unpacked
```

## 🚀 Deployment

### For End Users:
1. Download appropriate installer for their OS
2. Install MetaMask browser extension
3. Run the installer
4. Connect to your blockchain network
5. Start sharing files!

### For Developers:
1. Clone repository
2. Follow build instructions
3. Customize as needed
4. Build and distribute

## 📈 Performance Optimization

### Build Optimization:
- Use `--publish=never` for local builds
- Enable compression in electron-builder config
- Exclude unnecessary files from build

### Runtime Optimization:
- DHT bootstrap nodes for faster peer discovery
- Efficient torrent management
- Memory cleanup on app close

---

**Ready to build your decentralized file sharing network! 🌐**