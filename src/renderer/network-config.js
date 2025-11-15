// Network Configuration for P2P Blockchain App
console.log('Loading network configuration...');

const NETWORK_CONFIG = {
    // Sepolia Testnet
    sepolia: {
        chainId: '0xaa36a7', // 11155111 in hex
        name: 'Sepolia Testnet',
        rpcUrl: 'https://rpc.sepolia.org',
        contractAddress: '0x81E0C37F2eF5320Ff77935C7f5a2ad4FAff68700',
        blockExplorer: 'https://sepolia.etherscan.io'
    },

    // Local Hardhat (for development)
    localhost: {
        chainId: '0x7a69', // 31337 in hex
        name: 'Hardhat Local',
        rpcUrl: 'http://127.0.0.1:8545',
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        blockExplorer: null
    },

    // Polygon Mumbai (alternative testnet)
    mumbai: {
        chainId: '0x13881', // 80001 in hex
        name: 'Polygon Mumbai',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        contractAddress: 'YOUR_MUMBAI_CONTRACT_ADDRESS',
        blockExplorer: 'https://mumbai.polygonscan.com'
    }
};

// Auto-detect network or use default
function getNetworkConfig(chainId) {
    console.log('Detecting network for chainId:', chainId);

    switch (chainId) {
        case '0xaa36a7':
        case 11155111:
            return NETWORK_CONFIG.sepolia;
        case '0x7a69':
        case 31337:
            return NETWORK_CONFIG.localhost;
        case '0x13881':
        case 80001:
            return NETWORK_CONFIG.mumbai;
        default:
            console.warn('Unknown network, using Sepolia as default');
            return NETWORK_CONFIG.sepolia;
    }
}

// Validate network configuration
function validateNetwork(config) {
    if (!config.contractAddress || config.contractAddress.startsWith('YOUR_')) {
        throw new Error(`Please update the contract address for ${config.name} network`);
    }
    return true;
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NETWORK_CONFIG, getNetworkConfig, validateNetwork };
} else {
    window.NetworkConfig = { NETWORK_CONFIG, getNetworkConfig, validateNetwork };
}

console.log('Network configuration loaded successfully');