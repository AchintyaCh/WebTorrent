#!/usr/bin/env node

// Simple script to verify if the contract is deployed on Sepolia
const { ethers } = require('ethers');

async function verifyContract() {
    try {
        console.log('🔍 Verifying P2P File Marketplace contract on Sepolia...\n');

        // Read contract address from network config
        const networkConfig = require('./src/renderer/network-config.js');
        const contractAddr = networkConfig.NETWORK_CONFIG.sepolia.contractAddress;

        console.log('Contract Address:', contractAddr);

        if (contractAddr.startsWith('YOUR_')) {
            console.log('❌ Contract address not set! Please deploy the contract first.');
            console.log('\nTo deploy:');
            console.log('1. cd .. (go to root directory)');
            console.log('2. npx hardhat run scripts/deploy.js --network sepolia');
            console.log('3. Update the address in src/renderer/network-config.js');
            return;
        }

        // Connect to Sepolia
        const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/demo');

        console.log('🌐 Connecting to Sepolia...');

        // Check if contract exists
        const contractCode = await provider.getCode(contractAddr);

        if (contractCode === '0x') {
            console.log('❌ No contract found at this address!');
            console.log('\nPossible issues:');
            console.log('- Contract was never deployed to Sepolia');
            console.log('- Wrong contract address');
            console.log('- Network issues');
            console.log('\nTo fix:');
            console.log('1. Deploy contract: npx hardhat run scripts/deploy.js --network sepolia');
            console.log('2. Update address in network-config.js');
        } else {
            console.log('✅ Contract found!');
            console.log('Contract code size:', contractCode.length, 'bytes');

            // Try to call fileCount to verify it's working
            const contractABI = require('../artifacts/contracts/MyContract.sol/P2PFileMarketplace.json').abi;
            const contract = new ethers.Contract(contractAddr, contractABI, provider);

            try {
                const fileCount = await contract.fileCount();
                console.log('📁 Current file count:', fileCount.toString());
                console.log('✅ Contract is working correctly!');
            } catch (error) {
                console.log('⚠️  Contract exists but fileCount() failed:', error.message);
                console.log('This might indicate an ABI mismatch or contract issue.');
            }
        }

        console.log('\n🔗 View on Etherscan:', `https://sepolia.etherscan.io/address/${contractAddr}`);

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyContract();