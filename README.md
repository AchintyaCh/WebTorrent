# P2P Blockchain File Sharing - Electron App

A decentralized peer-to-peer file sharing application that uses blockchain for peer discovery and eliminates the need for traditional BitTorrent trackers.

## 🚀 Features

- **Tracker-less P2P**: Uses DHT (Distributed Hash Table) for peer discovery
- **Blockchain Integration**: Stores peer information on blockchain
- **Decentralized**: No central servers or trackers required
- **Secure Payments**: Cryptocurrency payments via MetaMask
- **Real-time Progress**: Live download/upload progress monitoring
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🏗️ Architecture

### Core Components:
1. **Electron Main Process**: Handles WebTorrent operations and file system access
2. **Renderer Process**: User interface and blockchain interactions
3. **Smart Contract**: Stores encrypted peer information on blockchain
4. **DHT Network**: Discovers peers without trackers

### Peer Discovery Flow:
```
File Upload → Create Torrent → Store Peer Info on Blockchain → Seed via DHT
File Purchase → Get Peer Info from Blockchain → Query DHT → Connect to Peers
```

## 📦 Installation

### Prerequisites:
- Node.js 16+ 
- MetaMask browser extension
- Sepolia testnet ETH (for testing)

### Smart Contract Deployment:

**IMPORTANT**: Before using the app, you need to deploy the smart contract to Sepolia testnet.

1. **Get Sepolia ETH**: 
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get test ETH
   - Add Sepolia network to MetaMask if not already added

2. **Deploy Contract**:
   ```bash
   # From the root directory (not electron-app)
   npm install
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Update Contract Address**:
   - Copy the deployed contract address from the console output
   - Update `electron-app/src/renderer/network-config.js`:
   ```javascript
   contractAddress: 'YOUR_NEW_CONTRACT_ADDRESS_HERE'
   ```

4. **Verify Deployment**:
   - Check your contract on [Sepolia Etherscan](https://sepolia.etherscan.io/)
   - Search for your contract address to confirm deployment

### App Installation:
- Node.js 16+ 
- MetaMask browser extension
- Hardhat local blockchain (for development)

### Setup:
```bash
# Navigate to electron app directory
cd electron-app

# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

### 1. Update Contract Address
Edit `src/renderer/contract.js`:
```javascript
const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";
```

### 2. MetaMask Setup
- Install MetaMask extension
- Connect to your local Hardhat network
- Import test accounts with ETH

### 3. Smart Contract Deployment
Deploy the P2P marketplace contract to your blockchain network.

## 🎯 Usage

### For File Sellers:
1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Select File**: Choose any file from your computer
3. **Set Details**: Enter title, description, and price in ETH
4. **List File**: Click "List File on Blockchain" to create torrent and store on blockchain
5. **Keep Seeding**: Leave the app running to seed your file for buyers

### For File Buyers:
1. **Connect Wallet**: Connect your MetaMask wallet
2. **Browse Files**: View available files in the Marketplace tab
3. **Purchase**: Click "Purchase & Download" and approve the transaction
4. **Select Folder**: Choose where to save the downloaded file
5. **Monitor Progress**: Watch download progress in the Downloads tab

## 🔍 Key Differences from Browser Version

| Feature | Browser Version | Electron Version |
|---------|----------------|------------------|
| **Peer Discovery** | WebRTC + Trackers | DHT + Direct TCP |
| **Network Protocol** | WebRTC only | Full BitTorrent protocol |
| **Tracker Dependency** | Required | None (tracker-less) |
| **NAT Traversal** | Limited | Better (uTP support) |
| **File System Access** | Restricted | Full access |
| **Performance** | Limited | Native networking |

## 🛠️ Technical Details

### WebTorrent Configuration (Tracker-less):
```javascript
const client = new WebTorrent({
  dht: true,           // Enable DHT
  tracker: false,      // Disable trackers
  webSeeds: false,     // No web seeds
  utp: true,           // Better NAT traversal
  dhtBootstrap: [      // DHT bootstrap nodes
    'router.bittorrent.com:6881',
    'dht.transmissionbt.com:6881'
  ]
});
```

### Peer Information Storage:
```javascript
const peerInfo = {
  infoHash: torrent.infoHash,
  name: torrent.name,
  size: torrent.length,
  files: torrent.files.map(f => ({
    name: f.name,
    length: f.length,
    path: f.path
  })),
  nodeId: client.nodeId,
  peerId: client.peerId,
  timestamp: Date.now()
};
```

## 📊 Monitoring & Debugging

### Active Torrents Tab:
- View all seeding and downloading torrents
- Monitor peer connections and transfer speeds
- Remove torrents when no longer needed

### Console Logs:
- DHT peer discovery events
- Torrent creation and seeding status
- Download progress and completion
- Error handling and debugging info

## 🔒 Security Features

- **Encrypted Peer Info**: Peer data is encoded before blockchain storage
- **Wallet Authentication**: MetaMask signature verification
- **File Integrity**: BitTorrent protocol ensures file integrity
- **Decentralized**: No single point of failure

## 🚧 Troubleshooting

### Common Issues:

1. **No Peers Found**:
   - Ensure seller is online and seeding
   - Check firewall settings
   - Wait for DHT peer discovery (can take 30-60 seconds)

2. **MetaMask Connection Failed**:
   - Refresh the app and try again
   - Check MetaMask is unlocked
   - Verify network configuration

3. **Download Timeout**:
   - Seller may be offline
   - Try again later
   - Check internet connection

### Debug Mode:
```bash
npm run dev
```
This opens DevTools for detailed logging and debugging.

## 🔮 Future Enhancements

- **Multi-seeder Support**: Allow multiple users to seed the same file
- **Incentive Mechanisms**: Reward long-term seeders
- **File Verification**: Add checksums and digital signatures
- **Offline Mode**: Enable downloads when original seeder is offline
- **Mobile App**: React Native version for mobile devices

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ using Electron, WebTorrent, and Blockchain Technology**