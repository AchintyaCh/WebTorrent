# 🌐 Sepolia Testnet Setup Guide

## 🎯 Quick Fix for Your Current Issue

The error shows the app is trying to connect to `localhost:8545` instead of using MetaMask's Sepolia connection. Here's how to fix it:

### **Step 1: Update Contract Address**

Edit `src/renderer/app-metamask-browser.js` line 9:
```javascript
const contractAddress = "YOUR_SEPOLIA_CONTRACT_ADDRESS_HERE";
```

Replace `YOUR_SEPOLIA_CONTRACT_ADDRESS_HERE` with your actual deployed Sepolia contract address.

### **Step 2: Deploy Contract to Sepolia**

If you haven't deployed to Sepolia yet:

```bash
# In your main project directory (not electron-app)
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract address from the output.

### **Step 3: Update MetaMask**

Make sure MetaMask is:
- ✅ Connected to **Sepolia Test Network**
- ✅ Has **Sepolia ETH** for transactions
- ✅ Using the **same account** that will interact with the contract

### **Step 4: Get Sepolia ETH**

If you need Sepolia ETH:
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Alchemy Faucet**: https://sepoliafaucet.com/
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

## 🔧 Complete Sepolia Configuration

### **1. Hardhat Config (hardhat.config.js)**
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### **2. Environment Variables (.env)**
```bash
INFURA_API_KEY=your_infura_api_key_here
PRIVATE_KEY=your_wallet_private_key_here
```

### **3. Deploy Script**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### **4. Update Electron App**
```javascript
// In app-metamask-browser.js
const contractAddress = "0xYourSepoliaContractAddress";
```

## 🚀 Testing on Multiple Machines

### **Advantages of Sepolia:**
- ✅ **Public testnet** - accessible from any machine
- ✅ **Persistent** - contract stays deployed
- ✅ **Real network conditions** - better P2P testing
- ✅ **Free ETH** - from faucets
- ✅ **Block explorer** - track transactions

### **Testing Process:**
1. **Deploy contract** to Sepolia once
2. **Update contract address** in all app copies
3. **Distribute portable app** to different machines
4. **Each machine** connects to same Sepolia contract
5. **Test P2P** file sharing across real internet

## 🔍 Verification Steps

### **1. Check Contract Deployment**
Visit: `https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS`

### **2. Verify MetaMask Network**
- Network: **Sepolia Test Network**
- Chain ID: **11155111**
- RPC URL: **https://sepolia.infura.io/v3/...**

### **3. Test Contract Interaction**
```javascript
// In browser console after connecting
const contract = await getContract();
const count = await contract.fileCount();
console.log('File count:', count.toString());
```

## 🛠️ Troubleshooting

### **"Connection Refused" Error:**
- ✅ Update contract address to Sepolia deployment
- ✅ Make sure MetaMask is on Sepolia network
- ✅ Check you have Sepolia ETH

### **"Contract Not Found" Error:**
- ✅ Verify contract address is correct
- ✅ Check deployment was successful
- ✅ Confirm you're on right network

### **"Insufficient Funds" Error:**
- ✅ Get Sepolia ETH from faucets
- ✅ Check account has enough balance
- ✅ Verify gas price settings

## 🎉 Ready for Multi-Machine Testing!

Once configured for Sepolia:
- **Same contract** accessible from all machines
- **Real P2P** connections across internet
- **Persistent data** - files stay listed
- **True decentralization** - no localhost dependencies

Your tracker-less P2P file sharing will work perfectly across different machines and networks! 🌐