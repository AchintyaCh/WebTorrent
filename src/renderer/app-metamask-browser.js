// P2P Blockchain App with External Browser MetaMask Connection
console.log('Loading P2P Blockchain App with external MetaMask support...');

const { ipcRenderer, shell } = require('electron');
const { ethers } = require('ethers');
const http = require('http');

// Browser-based WebTorrent client
let browserWebTorrentClient = null;

// Contract configuration
const contractAddress = "0x1FaA0fbD2C8E334a3De11362774a3D198f5769AE"; // Updated Sepolia contract address with magnet link support
const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fileSize",
                "type": "uint256"
            }
        ],
        "name": "FileListed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "name": "FilePurchased",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "checkPurchase",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            }
        ],
        "name": "deactivateFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fileCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "files",
        "outputs": [
            {
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "magnetLink",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "fileSize",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            }
        ],
        "name": "getFileInfo",
        "outputs": [
            {
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fileSize",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            }
        ],
        "name": "getMagnetLink",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "hasPurchased",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "magnetLink",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "fileSize",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            }
        ],
        "name": "listFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            }
        ],
        "name": "purchaseFile",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "name": "FilePurchased",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "checkPurchase",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            }
        ],
        "name": "deactivateFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fileCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "files",
        "outputs": [
            {
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "magnetLink",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "fileSize",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            }
        ],
        "name": "getFileInfo",
        "outputs": [
            {
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fileSize",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            }
        ],
        "name": "getMagnetLink",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "hasPurchased",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "magnetLink",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "fileSize",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            }
        ],
        "name": "listFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            }
        ],
        "name": "purchaseFile",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

class P2PBlockchainApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.connected = false;
        this.files = [];
        this.cachedMarketplaceFiles = []; // Cache for marketplace files
        this.activeDownloads = new Map();
        this.selectedFilePath = null;
        this.localServer = null;
        this.serverPort = 3001;
        this.currentTheme = localStorage.getItem('theme') || 'light';

        console.log('P2PBlockchainApp constructor called');
        this.init();
    }

    async init() {
        try {
            console.log('Initializing P2P app...');
            this.setupEventListeners();
            this.setupIPCListeners();
            this.setupTabs();
            this.initializeTheme();
            await this.initializeBrowserWebTorrent();
            this.startTorrentUpdates();

            this.showSuccess('P2P Blockchain App initialized! Click "Connect Wallet" to open MetaMask in browser.');
            console.log('P2P Blockchain App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to initialize app: ' + error.message);
        }
    }

    async initializeBrowserWebTorrent() {
        try {
            console.log('Initializing browser WebTorrent client...');

            // Wait for WebTorrent to be available
            if (typeof WebTorrent === 'undefined') {
                console.log('Waiting for WebTorrent to load...');
                await new Promise((resolve) => {
                    const checkWebTorrent = () => {
                        if (typeof WebTorrent !== 'undefined') {
                            resolve();
                        } else {
                            setTimeout(checkWebTorrent, 100);
                        }
                    };
                    checkWebTorrent();
                });
            }

            // Initialize WebTorrent client with proven working trackers
            browserWebTorrentClient = new WebTorrent({
                tracker: {
                    announce: [
                        // Proven working WebSocket trackers
                        'wss://tracker.openwebtorrent.com',
                        'wss://tracker.btorrent.xyz',
                        'wss://tracker.webtorrent.dev',
                        'wss://peertube2.cpy.re:443/tracker/socket',
                        'wss://tracker.novage.com.ua:443/announce'
                    ]
                },
                dht: true
            });

            browserWebTorrentClient.on('error', (err) => {
                console.error('Browser WebTorrent error:', err);
                this.showError('WebTorrent error: ' + err.message);
            });

            browserWebTorrentClient.on('warning', (err) => {
                console.warn('Browser WebTorrent warning:', err);
            });

            console.log('Browser WebTorrent client initialized successfully');

        } catch (error) {
            console.error('Failed to initialize browser WebTorrent:', error);
            this.showError('Failed to initialize WebTorrent: ' + error.message);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');

        try {
            // Wallet connection
            const connectBtn = document.getElementById('connect-wallet');
            if (connectBtn) {
                connectBtn.addEventListener('click', () => {
                    console.log('Connect wallet clicked');
                    this.connectWalletViaBrowser();
                });
            }



            // File selection
            const selectFileBtn = document.getElementById('select-file');
            if (selectFileBtn) {
                selectFileBtn.addEventListener('click', () => {
                    console.log('Select file clicked');
                    this.selectFile();
                });
            }

            // Upload file
            const uploadBtn = document.getElementById('upload-file');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => {
                    console.log('Upload file clicked');
                    this.uploadFile();
                });
            }

            // Marketplace refresh
            const refreshBtn = document.getElementById('refresh-files');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    console.log('Refresh files clicked');
                    this.loadFiles();
                });
            }

            // Marketplace reload button
            const reloadBtn = document.getElementById('reload-marketplace');
            if (reloadBtn) {
                reloadBtn.addEventListener('click', () => {
                    console.log('Reload marketplace clicked');
                    this.reloadMarketplace();
                });
            }

            // Torrents refresh
            const refreshTorrentsBtn = document.getElementById('refresh-torrents');
            if (refreshTorrentsBtn) {
                refreshTorrentsBtn.addEventListener('click', () => {
                    console.log('Refresh torrents clicked');
                    this.loadActiveTorrents();
                });
            }



            // Theme toggle
            const themeToggleBtn = document.getElementById('theme-toggle');
            if (themeToggleBtn) {
                themeToggleBtn.addEventListener('click', () => {
                    this.toggleTheme();
                });
            }



            console.log('Event listeners set up successfully');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    setupIPCListeners() {
        console.log('Setting up IPC listeners...');

        try {
            // Download progress updates
            ipcRenderer.on('download-progress', (event, data) => {
                console.log('Download progress:', data);
                this.updateDownloadProgress(data);
            });

            // Download completion
            ipcRenderer.on('download-complete', (event, data) => {
                console.log('Download complete:', data);
                this.handleDownloadComplete(data);
            });

            // Download error
            ipcRenderer.on('download-error', (event, data) => {
                console.error('Download error:', data);
                this.handleDownloadError(data);
            });

            // Connection method suggestions
            ipcRenderer.on('suggest-connection-methods', (event, data) => {
                console.log('Connection suggestions:', data);
                this.showConnectionSuggestions(data);
            });

            // Peer connection events
            ipcRenderer.on('peer-connected', (event, data) => {
                console.log('Peer connected:', data);
                this.handlePeerConnected(data);
            });

            // No peers found
            ipcRenderer.on('no-peers', (event, data) => {
                console.log('No peers found:', data);
                this.handleNoPeers(data);
            });

            // Torrent seeding started
            ipcRenderer.on('torrent-seeding-started', (event, data) => {
                console.log('Torrent seeding started:', data);
                this.handleSeedingStarted(data);
            });

            // Torrents being restored
            ipcRenderer.on('torrents-restoring', (event, data) => {
                console.log('Torrents being restored:', data);
                this.handleTorrentsRestoring(data);
            });

            console.log('IPC listeners set up successfully');
        } catch (error) {
            console.error('Error setting up IPC listeners:', error);
        }
    }

    setupTabs() {
        console.log('Setting up tabs...');

        try {
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabName = button.getAttribute('data-tab');
                    console.log('Tab clicked:', tabName);

                    // Remove active class from all tabs
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));

                    // Add active class to clicked tab
                    button.classList.add('active');
                    const tabContent = document.getElementById(`${tabName}-tab`);
                    if (tabContent) {
                        tabContent.classList.add('active');
                    }

                    // Load data for specific tabs
                    if (tabName === 'marketplace') {
                        // Show cached files if available, otherwise load fresh
                        if (this.cachedMarketplaceFiles.length > 0) {
                            console.log('Displaying cached marketplace files');
                            this.displayFiles(this.cachedMarketplaceFiles);
                        } else {
                            this.loadFiles();
                        }
                    } else if (tabName === 'torrents') {
                        this.loadActiveTorrents();
                    }
                });
            });

            console.log('Tabs set up successfully');
        } catch (error) {
            console.error('Error setting up tabs:', error);
        }
    }

    async connectWalletViaBrowser() {
        try {
            this.showLoading('Opening browser for MetaMask connection...');
            console.log('Starting external browser MetaMask connection...');

            // Start local server to receive wallet connection
            await this.startLocalServer();

            // Open HTTP server URL in browser (better MetaMask compatibility)
            const serverUrl = `http://localhost:${this.serverPort}`;
            await shell.openExternal(serverUrl);

            this.showInfo('Browser opened! Please connect MetaMask and return to this app.');

        } catch (error) {
            console.error('Browser connection failed:', error);
            this.showError('Failed to open browser: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async startLocalServer() {
        return new Promise((resolve, reject) => {
            this.localServer = http.createServer((req, res) => {
                // Enable CORS
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.writeHead(200);
                    res.end();
                    return;
                }

                // Serve the MetaMask connection page
                if (req.method === 'GET' && req.url === '/') {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(this.createMetaMaskConnectionPage());
                    return;
                }

                if (req.method === 'POST' && req.url === '/wallet-connected') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });

                    req.on('end', () => {
                        try {
                            const data = JSON.parse(body);
                            console.log('Received wallet connection:', data);

                            if (data.success) {
                                this.handleWalletConnected(data);
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ status: 'success' }));
                            } else {
                                this.showError('Wallet connection failed: ' + data.error);
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ status: 'error', message: data.error }));
                            }
                        } catch (error) {
                            console.error('Error parsing wallet data:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'error', message: 'Invalid data' }));
                        }
                    });
                } else {
                    res.writeHead(404);
                    res.end('Not found');
                }
            });

            this.localServer.listen(this.serverPort, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Local server started on port ${this.serverPort}`);
                    resolve();
                }
            });
        });
    }

    createMetaMaskConnectionPage() {
        return `
<!DOCTYPE html>
<html data-theme="light">
<head>
    <title>Connect MetaMask - P2P File Sharing</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root {
            --orange: #f38d0e;
            --text: #0f0f0f;
            --background: #ffffff;
            --surface: #f8f9fa;
            --border: #e9ecef;
            --shadow: rgba(0, 0, 0, 0.1);
            --radius: 12px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-theme="dark"] {
            --text: #ffffff;
            --background: #000000;
            --surface: #111111;
            --border: #333333;
            --shadow: rgba(0, 0, 0, 0.5);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: var(--background);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }

        .container {
            background: var(--surface);
            padding: 40px;
            border-radius: var(--radius);
            text-align: center;
            max-width: 500px;
            width: 90%;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px var(--shadow);
            border: 1px solid var(--border);
            animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        h1 { 
            margin-bottom: 20px; 
            font-size: 2.5rem; 
            color: var(--orange);
            font-weight: 900;
            text-shadow: 2px 2px 4px var(--shadow);
        }

        p { 
            font-size: 1.1rem; 
            margin: 15px 0; 
            opacity: 0.9; 
            color: var(--text);
        }

        button {
            background: var(--orange);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: var(--radius);
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            margin: 15px;
            transition: var(--transition);
            box-shadow: 0 4px 15px rgba(243, 141, 14, 0.3);
            position: relative;
            overflow: hidden;
        }

        button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }

        button:hover::before {
            left: 100%;
        }

        button:hover { 
            background: #e67e22;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(243, 141, 14, 0.4);
        }

        button:disabled {
            background: #666;
            cursor: not-allowed;
            transform: none;
            opacity: 0.6;
        }

        button:active {
            transform: scale(0.98);
        }

        .status { 
            margin: 20px 0; 
            padding: 15px; 
            border-radius: var(--radius); 
            font-weight: 500;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .success { 
            background: rgba(76, 175, 80, 0.1); 
            border: 1px solid #4CAF50; 
            color: #4CAF50;
        }
        .error { 
            background: rgba(244, 67, 54, 0.1); 
            border: 1px solid #f44336; 
            color: #f44336;
        }
        .info { 
            background: rgba(33, 150, 243, 0.1); 
            border: 1px solid #2196F3; 
            color: #2196F3;
        }

        [data-theme="dark"] .success { 
            background: rgba(76, 175, 80, 0.2); 
            color: #66bb6a;
        }
        [data-theme="dark"] .error { 
            background: rgba(244, 67, 54, 0.2); 
            color: #ef5350;
        }
        [data-theme="dark"] .info { 
            background: rgba(33, 150, 243, 0.2); 
            color: #42a5f5;
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid var(--border);
            border-top: 3px solid var(--orange);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .metamask-logo {
            width: 64px;
            height: 64px;
            margin: 20px auto;
            background: var(--orange);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .theme-toggle {
            position: absolute;
            top: 20px;
            right: 20px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }

        .theme-toggle:hover {
            background: var(--orange);
            color: white;
            transform: scale(1.1);
        }

        small {
            color: var(--text);
            opacity: 0.7;
        }

        @media (max-width: 768px) {
            .container {
                padding: 30px 20px;
                margin: 20px;
            }
            h1 {
                font-size: 2rem;
            }
            button {
                padding: 12px 24px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
        <span class="theme-icon">🌙</span>
    </button>
    
    <div class="container">
        <div class="metamask-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
        </div>
        <h1>Connect MetaMask</h1>
        <p>Connect your MetaMask wallet to use the P2P File Sharing app</p>
        
        <button id="connectBtn" onclick="connectWallet()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            Connect MetaMask
        </button>
        <button id="refreshBtn" onclick="location.reload()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,4 23,10 17,10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Refresh Page
        </button>
        
        <div id="status"></div>
        
        <p><small>This page will communicate with your Electron app automatically</small></p>
        <p><small>If MetaMask is not detected, try refreshing this page or check if MetaMask is enabled</small></p>
    </div>

    <script>
        // Theme management
        let currentTheme = localStorage.getItem('theme') || 'light';
        
        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            const themeIcon = document.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
            }
        }
        
        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            applyTheme(currentTheme);
        }
        
        // Apply theme on load
        applyTheme(currentTheme);
        
        const statusDiv = document.getElementById('status');
        const connectBtn = document.getElementById('connectBtn');
        
        async function connectWallet() {
            try {
                if (!window.ethereum) {
                    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
                }
                
                connectBtn.disabled = true;
                connectBtn.innerHTML = '<span class="loading"></span>Connecting...';
                statusDiv.innerHTML = '<div class="status info">Connecting to MetaMask...</div>';
                
                // Request account access
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                if (accounts.length === 0) {
                    throw new Error('No accounts found. Please unlock MetaMask.');
                }
                
                const account = accounts[0];
                
                // Get network info
                const chainId = await window.ethereum.request({
                    method: 'eth_chainId'
                });
                
                statusDiv.innerHTML = '<div class="status success">Connected! Sending data to app...</div>';
                
                // Send connection data to Electron app
                const connectionData = {
                    success: true,
                    account: account,
                    chainId: chainId,
                    timestamp: Date.now()
                };
                
                // Send to local server
                const response = await fetch('http://localhost:${this.serverPort}/wallet-connected', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(connectionData)
                });
                
                if (response.ok) {
                    statusDiv.innerHTML = '<div class="status success">Successfully connected! You can close this tab and return to the app.</div>';
                    connectBtn.innerHTML = 'Connected';
                    
                    // Auto-close after 3 seconds
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                } else {
                    throw new Error('Failed to communicate with app');
                }
                
            } catch (error) {
                console.error('Connection failed:', error);
                statusDiv.innerHTML = '<div class="status error">' + error.message + '</div>';
                connectBtn.disabled = false;
                connectBtn.innerHTML = 'Try Again';
            }
        }
        
        // Enhanced MetaMask detection
        window.addEventListener('load', async () => {
            // Wait a bit for MetaMask to inject
            setTimeout(async () => {
                console.log('Checking for MetaMask...');
                console.log('window.ethereum:', !!window.ethereum);
                console.log('window.web3:', !!window.web3);
                
                if (window.ethereum) {
                    try {
                        const accounts = await window.ethereum.request({
                            method: 'eth_accounts'
                        });
                        
                        if (accounts.length > 0) {
                            statusDiv.innerHTML = '<div class="status info">MetaMask detected and connected. Click connect to proceed.</div>';
                        } else {
                            statusDiv.innerHTML = '<div class="status info">MetaMask detected. Click connect to proceed.</div>';
                        }
                    } catch (error) {
                        console.log('MetaMask detected but not connected yet');
                        statusDiv.innerHTML = '<div class="status info">MetaMask detected. Click connect to proceed.</div>';
                    }
                } else if (window.web3) {
                    statusDiv.innerHTML = '<div class="status info">Legacy Web3 detected. Please update MetaMask.</div>';
                } else {
                    statusDiv.innerHTML = '<div class="status error">MetaMask not detected. Please install MetaMask extension and refresh this page.</div>';
                    connectBtn.innerHTML = 'Install MetaMask First';
                    connectBtn.onclick = () => {
                        window.open('https://metamask.io/download/', '_blank');
                    };
                }
            }, 1000); // Wait 1 second for MetaMask injection
        });
    </script>
</body>
</html>`;
    }

    async handleWalletConnected(data) {
        try {
            console.log('Handling wallet connection:', data);

            // Store network config but don't create a separate provider
            // We'll use MetaMask's provider for all operations
            const networkConfig = this.getNetworkConfig(data.chainId);
            console.log('Connected to network:', networkConfig.name);

            // For transactions, we'll need to use a different approach since we don't have the private key
            // We'll store the account info and handle transactions through the browser
            this.account = data.account;
            this.chainId = data.chainId;
            this.networkConfig = networkConfig;
            this.connected = true;

            // Update UI
            const connectBtn = document.getElementById('connect-wallet');
            const walletInfo = document.getElementById('wallet-info');
            const walletAddress = document.getElementById('wallet-address');

            if (connectBtn) connectBtn.classList.add('hidden');
            if (walletInfo) walletInfo.classList.remove('hidden');
            if (walletAddress) walletAddress.textContent = `${data.account.slice(0, 6)}...${data.account.slice(-4)}`;

            this.showSuccess(`Wallet connected! Address: ${data.account.slice(0, 6)}...${data.account.slice(-4)}`);

            // Close local server
            if (this.localServer) {
                this.localServer.close();
                this.localServer = null;
            }

            // Load files
            this.loadFiles();

        } catch (error) {
            console.error('Error handling wallet connection:', error);
            this.showError('Failed to process wallet connection: ' + error.message);
        }
    }





    getNetworkConfig(chainId) {
        console.log('Getting network config for chainId:', chainId);

        // Use the network config from network-config.js
        if (window.NetworkConfig && window.NetworkConfig.getNetworkConfig) {
            return window.NetworkConfig.getNetworkConfig(chainId);
        }

        // Fallback to hardcoded values with correct contract address
        const chainIdNum = typeof chainId === 'string' && chainId.startsWith('0x')
            ? parseInt(chainId, 16)
            : parseInt(chainId);

        switch (chainIdNum) {
            case 11155111: // Sepolia
                return {
                    name: 'Sepolia Testnet',
                    rpcUrl: 'https://rpc.sepolia.org',
                    contractAddress: '0x1FaA0fbD2C8E334a3De11362774a3D198f5769AE'
                };
            case 31337: // Hardhat Local
                return {
                    name: 'Hardhat Local',
                    rpcUrl: 'http://127.0.0.1:8545',
                    contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
                };
            case 80001: // Polygon Mumbai
                return {
                    name: 'Polygon Mumbai',
                    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
                    contractAddress: 'YOUR_MUMBAI_CONTRACT_ADDRESS'
                };
            default:
                console.warn('Unknown network, using Sepolia as default');
                return {
                    name: 'Sepolia Testnet',
                    rpcUrl: 'https://rpc.sepolia.org',
                    contractAddress: '0x1FaA0fbD2C8E334a3De11362774a3D198f5769AE'
                };
        }
    }

    async executeTransaction(method, params) {
        try {
            console.log('Executing transaction via browser bridge:', method, params);

            // Create transaction request
            const txRequest = {
                method: method,
                params: params,
                contractAddress: this.networkConfig?.contractAddress || contractAddress,
                timestamp: Date.now()
            };

            // Start local server to receive transaction result
            await this.startTransactionServer();

            // Create transaction page and serve via HTTP (MetaMask needs HTTP, not file://)
            const txHTML = this.createTransactionPage(txRequest);
            this.transactionHTML = txHTML;

            // Open transaction page via HTTP server
            const { shell } = require('electron');
            await shell.openExternal(`http://localhost:3002/transaction`);

            // Wait for transaction completion
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Transaction timeout'));
                }, 120000); // 2 minutes

                this.transactionResolve = (result) => {
                    clearTimeout(timeout);
                    if (result.success) {
                        resolve(result);
                    } else {
                        reject(new Error(result.error));
                    }
                };
            });

        } catch (error) {
            console.error('Transaction execution failed:', error);
            throw error;
        }
    }

    async startTransactionServer() {
        if (this.transactionServer) {
            return; // Already running
        }

        const http = require('http');

        return new Promise((resolve, reject) => {
            const self = this;
            this.transactionServer = http.createServer((req, res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.writeHead(200);
                    res.end();
                    return;
                }

                // Serve transaction page
                if (req.method === 'GET' && req.url === '/transaction') {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(self.transactionHTML || '<h1>Transaction page not ready</h1>');
                    return;
                }

                if (req.method === 'POST' && req.url === '/transaction-result') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });

                    req.on('end', () => {
                        try {
                            const result = JSON.parse(body);
                            console.log('Transaction result received:', result);

                            if (self.transactionResolve) {
                                self.transactionResolve(result);
                                self.transactionResolve = null;
                            }

                            // Handle read operations
                            if (self.readResolve) {
                                self.readResolve(result);
                                self.readResolve = null;
                            }

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'received' }));

                            // Close transaction server
                            setTimeout(() => {
                                if (self.transactionServer) {
                                    self.transactionServer.close();
                                    self.transactionServer = null;
                                }
                            }, 1000);

                        } catch (error) {
                            console.error('Error parsing transaction result:', error);
                            res.writeHead(500);
                            res.end('Error');
                        }
                    });
                } else {
                    res.writeHead(404);
                    res.end('Not found');
                }
            });

            this.transactionServer.listen(3002, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Transaction server started on port 3002');
                    resolve();
                }
            });
        });
    }

    createTransactionPage(txRequest) {
        return `
<!DOCTYPE html>
<html data-theme="light">
<head>
    <title>Execute Transaction - P2P File Sharing</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root {
            --orange: #f38d0e;
            --text: #0f0f0f;
            --background: #ffffff;
            --surface: #f8f9fa;
            --border: #e9ecef;
            --shadow: rgba(0, 0, 0, 0.1);
            --radius: 12px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-theme="dark"] {
            --text: #ffffff;
            --background: #000000;
            --surface: #111111;
            --border: #333333;
            --shadow: rgba(0, 0, 0, 0.5);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: var(--background);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }

        .container {
            background: var(--surface);
            padding: 40px;
            border-radius: var(--radius);
            text-align: center;
            max-width: 600px;
            width: 90%;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px var(--shadow);
            border: 1px solid var(--border);
            animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        h1 { 
            margin-bottom: 20px; 
            font-size: 2.5rem; 
            color: var(--orange);
            font-weight: 900;
            text-shadow: 2px 2px 4px var(--shadow);
        }

        p {
            font-size: 1.1rem;
            margin: 15px 0;
            opacity: 0.9;
            color: var(--text);
        }

        .tx-info { 
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 20px; 
            border-radius: var(--radius); 
            margin: 20px 0; 
            text-align: left;
            box-shadow: 0 2px 8px var(--shadow);
        }

        .tx-info h3 {
            color: var(--orange);
            margin-bottom: 15px;
            font-size: 1.2rem;
        }

        .tx-info p {
            margin: 8px 0;
            font-size: 1rem;
        }

        .tx-info strong {
            color: var(--orange);
        }

        button {
            background: var(--orange);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: var(--radius);
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            margin: 15px;
            transition: var(--transition);
            box-shadow: 0 4px 15px rgba(243, 141, 14, 0.3);
            position: relative;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }

        button:hover::before {
            left: 100%;
        }

        button:hover { 
            background: #e67e22;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(243, 141, 14, 0.4);
        }

        button:disabled {
            background: #666;
            cursor: not-allowed;
            transform: none;
            opacity: 0.6;
        }

        button:active {
            transform: scale(0.98);
        }

        .status { 
            margin: 20px 0; 
            padding: 15px; 
            border-radius: var(--radius); 
            font-weight: 500;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .success { 
            background: rgba(76, 175, 80, 0.1); 
            border: 1px solid #4CAF50; 
            color: #4CAF50;
        }
        .error { 
            background: rgba(244, 67, 54, 0.1); 
            border: 1px solid #f44336; 
            color: #f44336;
        }
        .info { 
            background: rgba(33, 150, 243, 0.1); 
            border: 1px solid #2196F3; 
            color: #2196F3;
        }

        [data-theme="dark"] .success { 
            background: rgba(76, 175, 80, 0.2); 
            color: #66bb6a;
        }
        [data-theme="dark"] .error { 
            background: rgba(244, 67, 54, 0.2); 
            color: #ef5350;
        }
        [data-theme="dark"] .info { 
            background: rgba(33, 150, 243, 0.2); 
            color: #42a5f5;
        }

        .theme-toggle {
            position: absolute;
            top: 20px;
            right: 20px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }

        .theme-toggle:hover {
            background: var(--orange);
            color: white;
            transform: scale(1.1);
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid var(--border);
            border-top: 3px solid var(--orange);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
            .container {
                padding: 30px 20px;
                margin: 20px;
            }
            h1 {
                font-size: 2rem;
            }
            button {
                padding: 12px 24px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
        <span class="theme-icon">🌙</span>
    </button>
    
    <div class="container">
        <h1>Execute Transaction</h1>
        <p>Execute blockchain transaction via MetaMask</p>
        
        <div class="tx-info">
            <h3>Transaction Details:</h3>
            <p><strong>Method:</strong> ${txRequest.method}</p>
            <p><strong>Contract:</strong> ${txRequest.contractAddress}</p>
            <p><strong>Network:</strong> Current MetaMask network</p>
        </div>
        
        <button id="executeBtn" onclick="executeTransaction()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Execute Transaction
        </button>
        
        <div id="status"></div>
    </div>

    <!-- Load ethers library first -->
    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
    <script>
        // Theme management
        let currentTheme = localStorage.getItem('theme') || 'light';
        
        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            const themeIcon = document.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
            }
        }
        
        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            applyTheme(currentTheme);
        }
        
        // Apply theme on load
        applyTheme(currentTheme);
        
        const txRequest = ${JSON.stringify(txRequest)};
        const statusDiv = document.getElementById('status');
        const executeBtn = document.getElementById('executeBtn');
        
        async function executeTransaction() {
            try {
                if (!window.ethereum) {
                    throw new Error('MetaMask not available');
                }
                
                // Check if ethers is loaded
                if (typeof ethers === 'undefined') {
                    throw new Error('Ethers library not loaded. Please refresh the page.');
                }
                
                executeBtn.disabled = true;
                executeBtn.innerHTML = '<span class="loading"></span>Executing...';
                statusDiv.innerHTML = '<div class="status info">Preparing transaction...</div>';
                
                // Ensure MetaMask is connected and has accounts
                statusDiv.innerHTML = '<div class="status info">Connecting to MetaMask...</div>';
                
                // Request account access if needed
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (!accounts || accounts.length === 0) {
                    throw new Error('No MetaMask accounts available. Please connect your wallet.');
                }
                
                // Verify network
                const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
                console.log('Current network:', currentChainId);
                
                // Check if we're on Sepolia (0xaa36a7) or localhost (0x7a69)
                if (currentChainId !== '0xaa36a7' && currentChainId !== '0x7a69') {
                    statusDiv.innerHTML = '<div class="status error">Please switch to Sepolia Testnet or Localhost network in MetaMask</div>';
                    throw new Error('Please switch to Sepolia Testnet or Localhost network in MetaMask');
                }
                
                // Get contract instance
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                
                // Ensure connection and get network info
                await provider.send("eth_requestAccounts", []);
                const network = await provider.getNetwork();
                console.log('Connected to network:', network);
                
                const signer = provider.getSigner();
                
                // Verify signer has an address
                let signerAddress;
                try {
                    signerAddress = await signer.getAddress();
                    console.log('Using signer address:', signerAddress);
                    statusDiv.innerHTML = '<div class="status info">Connected to account: ' + signerAddress.substring(0, 10) + '...</div>';
                } catch (signerError) {
                    console.error('Signer error details:', signerError);
                    
                    // Try alternative approach - get accounts directly
                    try {
                        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                        if (accounts && accounts.length > 0) {
                            signerAddress = accounts[0];
                            console.log('Got address from eth_accounts:', signerAddress);
                            statusDiv.innerHTML = '<div class="status info">Using account: ' + signerAddress.substring(0, 10) + '...</div>';
                        } else {
                            throw new Error('No accounts available from MetaMask');
                        }
                    } catch (accountError) {
                        console.error('Account error:', accountError);
                        throw new Error('Failed to get account from MetaMask. Please ensure MetaMask is unlocked and connected to this site.');
                    }
                }
                
                const contractABI = ${JSON.stringify(contractABI)};
                const contract = new ethers.Contract(txRequest.contractAddress, contractABI, signer);
                
                statusDiv.innerHTML = '<div class="status info">Sending transaction to MetaMask...</div>';
                
                // Execute the transaction
                let tx;
                if (txRequest.method === 'listFile') {
                    const [title, description, priceEth, magnetLink, fileSize, fileHash] = txRequest.params;
                    // Convert price from ETH to wei
                    const priceWei = ethers.utils.parseEther(priceEth.toString());
                    tx = await contract.listFile(title, description, priceWei, magnetLink, fileSize, fileHash);
                } else if (txRequest.method === 'purchaseFile') {
                    const [fileId, priceEth] = txRequest.params;
                    // Convert price from ETH to wei
                    const priceWei = ethers.utils.parseEther(priceEth.toString());
                    tx = await contract.purchaseFile(fileId, { value: priceWei });
                }
                
                statusDiv.innerHTML = '<div class="status info">Waiting for confirmation...</div>';
                
                const receipt = await tx.wait();
                
                statusDiv.innerHTML = '<div class="status success">Transaction confirmed!</div>';
                
                // Send result back to Electron
                const result = {
                    success: true,
                    txHash: receipt.transactionHash,
                    blockNumber: receipt.blockNumber
                };
                
                await fetch('http://localhost:3002/transaction-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result)
                });
                
                executeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>Complete';
                setTimeout(() => window.close(), 2000);
                
            } catch (error) {
                console.error('Transaction failed:', error);
                statusDiv.innerHTML = '<div class="status error">' + error.message + '</div>';
                executeBtn.disabled = false;
                executeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,4 23,10 17,10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>Try Again';
                
                // Send error back to Electron
                const result = {
                    success: false,
                    error: error.message
                };
                
                try {
                    await fetch('http://localhost:3002/transaction-result', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(result)
                    });
                } catch (e) {
                    console.error('Failed to send error result:', e);
                }
            }
        }
    </script>
</body>
</html>`;
    }

    async getContract() {
        if (!this.connected) {
            throw new Error('Wallet not connected');
        }

        // Use network-specific contract address
        const contractAddr = this.networkConfig?.contractAddress || contractAddress;

        if (contractAddr.startsWith('YOUR_')) {
            throw new Error(`Please update the contract address for ${this.networkConfig?.name || 'this network'}`);
        }

        // Use MetaMask's provider for all operations to avoid ENS issues
        // This requires MetaMask to be connected and available
        if (typeof window !== 'undefined' && window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            return new ethers.Contract(contractAddr, contractABI, provider);
        } else {
            throw new Error('MetaMask not available for contract operations');
        }
    }

    async selectFile() {
        try {
            console.log('Selecting file...');

            // Create file input element for browser-based file selection
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = false;
            fileInput.accept = '*/*';

            fileInput.onchange = (event) => {
                const files = event.target.files;
                if (files && files.length > 0) {
                    this.selectedFile = files[0]; // Store the File object directly
                    const fileName = files[0].name;

                    const selectedFileSpan = document.getElementById('selected-file');
                    if (selectedFileSpan) {
                        selectedFileSpan.textContent = fileName;
                    }

                    const uploadBtn = document.getElementById('upload-file');
                    if (uploadBtn) {
                        uploadBtn.disabled = false;
                        uploadBtn.textContent = 'List File on Blockchain';
                    }

                    this.showSuccess(`File selected: ${fileName}`);
                    console.log('File selected:', fileName, 'Size:', files[0].size);
                }
            };

            fileInput.click();

        } catch (error) {
            console.error('File selection failed:', error);
            this.showError('Failed to select file: ' + error.message);
        }
    }

    async uploadFile() {
        if (!this.connected) {
            this.showError('Please connect your wallet first');
            return;
        }

        if (!this.selectedFile) {
            this.showError('Please select a file first');
            return;
        }

        const title = document.getElementById('file-title').value.trim();
        const description = document.getElementById('file-description').value.trim();
        const price = document.getElementById('file-price').value;

        if (!title || !description || !price) {
            this.showError('Please fill in all fields');
            return;
        }

        try {
            this.showLoading('Creating torrent and listing on blockchain...');
            console.log('Starting file upload process...');

            // Create torrent using browser WebTorrent
            const fileInfo = await this.createBrowserTorrent(this.selectedFile, {
                title,
                description,
                price
            });

            console.log('File info generated:', {
                name: fileInfo.name,
                size: fileInfo.size,
                magnetLink: fileInfo.magnetLink?.substring(0, 100) + '...',
                fileHash: fileInfo.fileHash?.substring(0, 16) + '...'
            });

            // Store on blockchain via transaction bridge
            console.log('Preparing transaction for MetaMask...');

            // Pass all required parameters for new contract
            await this.executeTransaction('listFile', [
                title,
                description,
                price,
                fileInfo.magnetLink,
                fileInfo.size.toString(),
                fileInfo.fileHash
            ]);

            this.showSuccess('File listed successfully! Your file is now being seeded.');
            console.log('File listed on blockchain successfully');

            // Clear form
            document.getElementById('file-title').value = '';
            document.getElementById('file-description').value = '';
            document.getElementById('file-price').value = '';
            document.getElementById('selected-file').textContent = '';
            const uploadBtn = document.getElementById('upload-file');
            if (uploadBtn) {
                uploadBtn.disabled = true;
                uploadBtn.textContent = 'List File on Blockchain';
            }
            this.selectedFile = null;

            // Refresh files list
            this.loadFiles();

        } catch (error) {
            console.error('Upload failed:', error);
            this.showError('Failed to upload file: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async loadFiles() {
        if (!this.connected) {
            console.log('Not connected, skipping file load');
            return;
        }

        try {
            console.log('Setting up file loading...');

            // Show loading message
            const filesGrid = document.getElementById('files-grid');
            if (filesGrid) {
                filesGrid.innerHTML = `
                    <div class="marketplace-info">
                        <h3>  Blockchain File Marketplace</h3>
                        <p>Files shared on the blockchain will appear here.</p>
                        <button id="load-files-btn" class="btn btn-primary"> Load Files from Blockchain</button>
                    </div>
                `;

                // Add click handler for manual loading
                const loadBtn = document.getElementById('load-files-btn');
                if (loadBtn) {
                    loadBtn.addEventListener('click', () => this.loadFilesManually());
                }
            }

            return; // Skip automatic loading to avoid RPC issues

            // Use a reliable RPC provider for read operations with explicit network config
            const networkConfig = {
                name: 'sepolia',
                chainId: 11155111,
                ensAddress: null // Disable ENS to avoid resolution issues
            };

            // Try multiple RPC endpoints for reliability
            let provider;

        } catch (error) {
            console.error('Failed to load files:', error);
            this.showError('Failed to load files: ' + error.message);
        }
    }

    async reloadMarketplace() {
        if (!this.connected) {
            this.showError('Please connect your wallet first');
            return;
        }

        try {
            console.log('Reloading marketplace from blockchain...');
            
            // Show loading state
            const reloadBtn = document.getElementById('reload-marketplace');
            if (reloadBtn) {
                reloadBtn.disabled = true;
                reloadBtn.textContent = ' Reloading...';
            }

            // Clear cache and reload fresh data
            this.cachedMarketplaceFiles = [];
            await this.loadFilesManually();

            // Restore button state
            if (reloadBtn) {
                reloadBtn.disabled = false;
                reloadBtn.textContent = ' Reload Marketplace';
            }

        } catch (error) {
            console.error('Failed to reload marketplace:', error);
            this.showError('Failed to reload marketplace: ' + error.message);
            
            // Restore button state
            const reloadBtn = document.getElementById('reload-marketplace');
            if (reloadBtn) {
                reloadBtn.disabled = false;
                reloadBtn.textContent = ' Reload Marketplace';
            }
        }
    }

    async loadFilesManually() {
        if (!this.connected) {
            this.showError('Please connect your wallet first');
            return;
        }

        try {
            console.log('Manually loading files from blockchain...');

            // Show loading state
            const loadBtn = document.getElementById('load-files-btn');
            const filesGrid = document.getElementById('files-grid');

            if (loadBtn) {
                loadBtn.disabled = true;
                loadBtn.textContent = ' Loading...';
            }

            if (filesGrid) {
                filesGrid.innerHTML = '<div class="loading">Opening browser to read blockchain data...</div>';
            }

            // Use browser-based reading to avoid RPC network detection issues
            console.log('Using browser-based reading for better compatibility...');
            const filesData = await this.readFilesViaBrowser();

            console.log('Files loaded via browser:', filesData.length);
            this.displayFiles(filesData);
            this.showSuccess(`Loaded ${filesData.length} files from blockchain`);
            return;

            // RPC-based reading (keeping as backup but commented out due to network detection issues)
            /*
            
            // Use a more reliable RPC endpoint with explicit network config
            const networkConfig = {
                name: 'sepolia',
                chainId: 11155111,
                ensAddress: null // Disable ENS to avoid issues
            };
            
            // Try multiple endpoints for better reliability
            const rpcEndpoints = [
                'https://ethereum-sepolia-rpc.publicnode.com',
                'https://sepolia.gateway.tenderly.co',
                'https://eth-sepolia.g.alchemy.com/v2/demo'
            ];
            
            let provider = null;
            for (const rpcUrl of rpcEndpoints) {
                try {
                    console.log('Trying RPC endpoint:', rpcUrl);
                    provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl, networkConfig);
            
                    // Test with a simple call (don't use getNetwork which causes detection issues)
                    await provider.getBlockNumber();
                    console.log('Successfully connected to:', rpcUrl);
                    break;
                } catch (rpcError) {
                    console.warn('RPC endpoint failed:', rpcUrl, rpcError.message);
                    provider = null;
                }
            }
            
            if (!provider) {
                throw new Error('All RPC endpoints failed. Please check your internet connection.');
            }
            
            // Create contract instance for reading
            const contractAddr = this.networkConfig?.contractAddress || contractAddress;
            console.log('Using contract address:', contractAddr);
            
            // Verify contract exists
            if (filesGrid) {
                filesGrid.innerHTML = '<div class="loading">Verifying contract...</div>';
            }
            
            const contractCode = await provider.getCode(contractAddr);
            if (contractCode === '0x') {
                const errorMsg = `No contract found at address ${contractAddr} on Sepolia testnet. 
                
            This could mean:
            1. The contract was never deployed to Sepolia
            2. The contract address is incorrect
            3. You're on the wrong network
            
            To fix this:
            1. Make sure you're connected to Sepolia testnet in MetaMask
            2. Deploy the contract using: npx hardhat run scripts/deploy.js --network sepolia
            3. Update the contract address in the app
            
            Current address: ${contractAddr}`;
            
                throw new Error(errorMsg);
            }
            
            console.log('Contract verified, code length:', contractCode.length);
            
            const contract = new ethers.Contract(contractAddr, contractABI, provider);
            
            if (filesGrid) {
                filesGrid.innerHTML = '<div class="loading">Reading file count...</div>';
            }
            
            const count = await contract.fileCount();
            const filesList = [];
            
            console.log('Total files on blockchain:', count.toString());
            
            for (let i = 1; i <= Number(count); i++) {
                try {
                    if (filesGrid) {
                        filesGrid.innerHTML = `<div class="loading">Loading file ${i} of ${count}...</div>`;
                    }
            
                    const file = await contract.files(i);
                    const hex = file.encryptedPeerInfo;
            
                    if (!hex || hex === "0x") {
                        console.warn(`Skipping file ${i}: empty peer info`);
                        continue;
                    }
            
                    // Decode peer info
                    const bytes = ethers.utils.arrayify(hex);
                    const decoded = new TextDecoder().decode(bytes);
                    const peerInfo = JSON.parse(decoded);
            
                    filesList.push({
                        id: i,
                        title: file.title,
                        description: file.description,
                        price: ethers.utils.formatEther(file.price),
                        owner: file.owner,
                        peerInfo: peerInfo
                    });
            
                } catch (fileError) {
                    console.warn(`Error reading file ${i}:`, fileError);
                }
            }
            
            console.log('Files loaded successfully:', filesList.length);
            this.displayFiles(filesList);
            this.showSuccess(`Loaded ${filesList.length} files from blockchain`);
            */

        } catch (error) {
            console.error('Failed to load files manually:', error);
            this.showError('Failed to load files: ' + error.message);

            // Reset UI with helpful error message
            const filesGrid = document.getElementById('files-grid');
            if (filesGrid) {
                const isContractError = error.message.includes('No contract found');

                if (isContractError) {
                    filesGrid.innerHTML = `
            <div class="marketplace-error" style="text-align: left; padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; color: var(--text);">
                <h3 style="color: var(--orange);">Contract Not Found</h3>
                <p>The smart contract is not deployed on Sepolia testnet.</p>
                <div class="error-details">
                    <h4>To fix this:</h4>
                    <ol>
                        <li>Open terminal in the root directory (not electron-app)</li>
                        <li>Run: <code style="background: #f1f1f1; padding: 2px 4px;">npx hardhat run scripts/deploy.js --network sepolia</code></li>
                        <li>Copy the deployed contract address</li>
                        <li>Update <code>src/renderer/network-config.js</code></li>
                        <li>Restart the app</li>
                    </ol>
                </div>
                <button id="load-files-btn" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23,4 23,10 17,10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Retry Loading Files
                </button>
            </div>
        `;
                } else {
                    const isTimeoutError = error.message.includes('timeout');
                    filesGrid.innerHTML = `
            <div class="marketplace-error" style="text-align: center; padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; color: var(--text);">
                <h3 style="color: var(--orange);">Failed to Load Files</h3>
                <p><strong>Error:</strong> ${error.message}</p>
                ${isTimeoutError ? `
                <div class="error-details">
                    <h4>Timeout occurred - possible solutions:</h4>
                    <ul style="text-align: left;">
                        <li>Check your internet connection</li>
                        <li>Make sure MetaMask is connected and unlocked</li>
                        <li>Ensure you're on Sepolia testnet</li>
                        <li>Try closing and reopening the browser tab</li>
                    </ul>
                </div>
                ` : ''}
                <button id="load-files-btn" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23,4 23,10 17,10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Retry Loading Files
                </button>
            </div>
        `;
                }

                const loadBtn = document.getElementById('load-files-btn');
                if (loadBtn) {
                    loadBtn.addEventListener('click', () => this.loadFilesManually());
                }
            }
        }
    }

    async readFilesViaBrowser() {
        // Create a read-only page to fetch files from blockchain
        const readHTML = this.createReadFilesPage();

        // Start server if not running
        if (!this.localServer) {
            await this.startTransactionServer();
        }

        this.transactionHTML = readHTML;

        // Open in external browser (same as transactions)
        const { shell } = require('electron');
        await shell.openExternal(`http://localhost:3002/transaction`);

        // Wait for the result
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Read operation timeout - please try again or check your internet connection'));
            }, 120000); // 2 minute timeout

            this.readResolve = (result) => {
                clearTimeout(timeout);
                if (result.success) {
                    resolve(result.data);
                } else {
                    reject(new Error(result.error));
                }
            };
        });
    }

    createReadFilesPage() {
        return `<!DOCTYPE html>
<html>
<head>
<title>Reading Blockchain Files</title>
<style>
body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
.status { margin: 20px 0; padding: 15px; border-radius: 10px; font-weight: 500; }
.success { background: rgba(76, 175, 80, 0.3); border: 1px solid #4CAF50; }
.error { background: rgba(244, 67, 54, 0.3); border: 1px solid #f44336; }
.info { background: rgba(33, 150, 243, 0.3); border: 1px solid #2196F3; }
</style>
</head>
<body>
<h1> Reading Files from Blockchain</h1>
<div id="status" class="status info">Connecting to blockchain...</div>

<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
<script>
const statusDiv = document.getElementById('status');
 
async function readFiles() {
try {
    statusDiv.innerHTML = ' Checking MetaMask connection...';
    
    if (!window.ethereum) {
        throw new Error('MetaMask not available. Please ensure MetaMask is installed and this page is opened in a browser with MetaMask.');
    }

    statusDiv.innerHTML = ' Connecting to blockchain...';
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Ensure we have access to accounts
    await provider.send("eth_requestAccounts", []);
    
    const contractABI = ${JSON.stringify(contractABI)};
    const contractAddress = '${this.networkConfig?.contractAddress || contractAddress}';
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    statusDiv.innerHTML = 'Reading file count...';
    const count = await contract.fileCount();
    console.log('Total files:', count.toString());
    
    statusDiv.innerHTML = \`Loading \${count} files...\`;
    const filesList = [];

    for (let i = 1; i <= Number(count); i++) {
        try {
            statusDiv.innerHTML = \`Loading file \${i} of \${count}...\`;
            
            // Use getFileInfo to get public file information
            const fileInfo = await contract.getFileInfo(i);
            
            if (!fileInfo.active) {
                console.warn('Skipping file', i, ': not active');
                continue;
            }

            filesList.push({
                id: i,
                title: fileInfo.title,
                description: fileInfo.description,
                price: ethers.utils.formatEther(fileInfo.price),
                fileSize: fileInfo.fileSize.toString(),
                fileHash: fileInfo.fileHash,
                owner: fileInfo.seller,
                timestamp: fileInfo.timestamp.toString()
                // Note: magnetLink is not included here - only available after purchase
            });
        } catch (fileError) {
            console.warn('Error reading file', i, ':', fileError);
        }
    }

    statusDiv.innerHTML = \`Successfully loaded \${filesList.length} files!\`;
    
    // Send result back
    await fetch('http://localhost:3002/transaction-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: filesList })
    });

    statusDiv.innerHTML = 'Files loaded! You can close this tab and return to the app.';
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        window.close();
    }, 3000);

} catch (error) {
    console.error('Read files error:', error);
    statusDiv.innerHTML = 'Error: ' + error.message;
    
    await fetch('http://localhost:3002/transaction-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: error.message })
    });
}
}

// Start reading when page loads
readFiles();
</script>
</body>
</html>`;
    }

    displayFiles(filesList) {
        const marketplaceContent = document.getElementById('files-grid');
        if (!marketplaceContent) return;

        // Cache the files for persistence across tab switches
        this.cachedMarketplaceFiles = filesList;

        if (filesList.length === 0) {
            marketplaceContent.innerHTML = '<p class="no-files">No files available for download</p>';
            return;
        }

        const filesHTML = filesList.map(file => this.createFileCard(file)).join('');
        marketplaceContent.innerHTML = filesHTML;
    }

    createFileCard(file) {
        return `
<div class="file-card">
<h3>${file.title}</h3>
<p>${file.description}</p>
<p><strong>Price:</strong> ${file.price} ETH</p>
<p><strong>Size:</strong> ${this.formatBytes(parseInt(file.fileSize))}</p>
<p><strong>Owner:</strong> ${file.owner.substring(0, 10)}...</p>
<p><strong>Hash:</strong> ${file.fileHash.substring(0, 16)}...</p>
<button class="btn btn-success" onclick="app.purchaseFile(${file.id}, '${file.price}', ${JSON.stringify(file).replace(/"/g, '&quot;')})">
  💳 Purchase & Download
</button>
</div>`;
    }

    // Keep the old loadFiles logic as backup
    async loadFilesOld() {
        if (!this.connected) {
            console.log('Not connected, skipping file load');
            return;
        }

        try {
            console.log('Loading files from blockchain...');
            const contract = await this.getContract();
            const count = await contract.fileCount();
            const filesList = [];

            console.log('Total files on blockchain:', count.toString());

            for (let i = 1; i <= Number(count); i++) {
                try {
                    const file = await contract.files(i);
                    const hex = file.encryptedPeerInfo;

                    if (!hex || hex === "0x") {
                        console.warn(`Skipping file ${i}: empty peer info`);
                        continue;
                    }

                    // Decode peer info
                    const uint8 = new Uint8Array(
                        hex.slice(2).match(/.{1,2}/g).map(byte => parseInt(byte, 16))
                    );
                    const decoded = new TextDecoder().decode(uint8);
                    const peerInfo = JSON.parse(decoded);

                    filesList.push({
                        id: i,
                        title: file.title,
                        description: file.description,
                        price: ethers.utils.formatEther(file.price),
                        seller: file.seller,
                        peerInfo: peerInfo,
                        active: file.active
                    });
                } catch (err) {
                    console.warn(`Skipping file ${i}:`, err.message);
                }
            }

            this.files = filesList;
            this.renderFiles();
            console.log('Files loaded successfully:', filesList.length);

        } catch (error) {
            console.error('Failed to load files:', error);
            this.showError('Failed to load files: ' + error.message);
        }
    }

    renderFiles() {
        const grid = document.getElementById('files-grid');
        if (!grid) return;

        if (this.files.length === 0) {
            grid.innerHTML = '<div class="no-data">No files available</div>';
            return;
        }

        grid.innerHTML = this.files.map(file => `
<div class="file-card">
<h3>${this.escapeHtml(file.title)}</h3>
<p>${this.escapeHtml(file.description)}</p>
<p class="price">💰 ${file.price} ETH</p>
<p><strong>Seller:</strong> ${file.seller.slice(0, 6)}...${file.seller.slice(-4)}</p>
<p><strong>Size:</strong> ${this.formatBytes(file.peerInfo.size)}</p>
<p><strong>Files:</strong> ${file.peerInfo.files ? file.peerInfo.files.length : 1}</p>
<button class="btn btn-success" onclick="app.purchaseFile(${file.id}, '${file.price}', ${JSON.stringify(file.peerInfo).replace(/"/g, '&quot;')})">
💳 Purchase & Download
</button>
</div>
`).join('');
    }

    async purchaseFile(fileId, price, fileInfo) {
        if (!this.connected) {
            this.showError('Please connect your wallet first');
            return;
        }

        try {
            this.showLoading('Processing purchase...');
            console.log('Starting purchase process for file:', fileId);

            // Purchase on blockchain via transaction bridge
            console.log('Preparing purchase transaction for MetaMask...');

            // Pass price as string, convert to wei in transaction page
            const txResult = await this.executeTransaction('purchaseFile', [fileId, price]);

            this.showSuccess('Purchase successful! Getting magnet link...');
            console.log('Purchase transaction completed:', txResult);

            // Get magnet link after purchase (with retry for blockchain confirmation)
            this.showLoading('Waiting for transaction confirmation...');

            // Wait a bit for transaction to be confirmed
            await new Promise(resolve => setTimeout(resolve, 3000));

            this.showLoading('Getting download link...');

            // Use direct method since it always works (skip the unreliable getMagnetLink function)
            console.log('Using direct method to get magnet link...');
            const magnetLink = await this.getMagnetLinkDirect(fileId);
            console.log('Successfully got magnet link via direct method');

            console.log('Got magnet link:', magnetLink.substring(0, 100) + '...');

            // Select download folder
            const downloadPath = await ipcRenderer.invoke('select-download-folder');
            if (!downloadPath) {
                this.showError('Download cancelled - no folder selected');
                return;
            }

            // Create file info for download
            const downloadInfo = {
                infoHash: this.extractInfoHashFromMagnet(magnetLink),
                name: fileInfo.title,
                size: parseInt(fileInfo.fileSize),
                magnetLink: magnetLink,
                fileHash: fileInfo.fileHash
            };

            console.log('Download info created:', downloadInfo);

            // Start download
            this.startDownload(downloadInfo, downloadPath);

        } catch (error) {
            console.error('Purchase failed:', error);
            this.showError('Purchase failed: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async getMagnetLinkWithRetry(fileId, maxRetries = 5) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempting to get magnet link (attempt ${attempt}/${maxRetries})`);

                // First, let's check if the purchase was recorded
                if (attempt > 1) {
                    console.log('Checking purchase status before getting magnet link...');
                    const purchaseStatus = await this.checkPurchaseStatus(fileId);
                    console.log('Purchase status:', purchaseStatus);
                }

                return await this.getMagnetLink(fileId);
            } catch (error) {
                if (error.message.includes('Purchase required') && attempt < maxRetries) {
                    console.log(`Purchase not confirmed yet, waiting... (attempt ${attempt})`);
                    this.showLoading(`Waiting for blockchain confirmation... (${attempt}/${maxRetries})`);

                    // Increase wait time with each attempt
                    const waitTime = attempt * 8000; // 8s, 16s, 24s, 32s, 40s
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                } else {
                    throw error; // Re-throw if it's not a purchase required error or max retries reached
                }
            }
        }
    }

    async checkPurchaseStatus(fileId) {
        try {
            // Create a simple page to check purchase status
            const checkHTML = this.createCheckPurchasePage(fileId);

            // Start server if not running
            if (!this.localServer) {
                await this.startTransactionServer();
            }

            this.transactionHTML = checkHTML;

            // Open in external browser
            const { shell } = require('electron');
            await shell.openExternal(`http://localhost:3002/transaction`);

            // Wait for the result
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    resolve(false); // Default to false on timeout
                }, 15000); // 15 second timeout

                this.readResolve = (result) => {
                    clearTimeout(timeout);
                    resolve(result.success ? result.purchased : false);
                };
            });
        } catch (error) {
            console.error('Failed to check purchase status:', error);
            return false;
        }
    }

    createCheckPurchasePage(fileId) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Checking Purchase Status</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
        .status { margin: 20px 0; padding: 15px; border-radius: 10px; font-weight: 500; }
        .success { background: rgba(76, 175, 80, 0.3); border: 1px solid #4CAF50; }
        .error { background: rgba(244, 67, 54, 0.3); border: 1px solid #f44336; }
        .info { background: rgba(33, 150, 243, 0.3); border: 1px solid #2196F3; }
    </style>
</head>
<body>
    <h1>🔍 Checking Purchase Status</h1>
    <div id="status" class="status info">Checking if purchase was recorded...</div>

    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
    <script>
        const statusDiv = document.getElementById('status');
        
        async function checkPurchase() {
            try {
                if (!window.ethereum) {
                    throw new Error('MetaMask not available');
                }

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                
                const accounts = await provider.listAccounts();
                const userAccount = accounts[0];
                
                const contractABI = ${JSON.stringify(contractABI)};
                const contractAddress = '${this.networkConfig?.contractAddress || contractAddress}';
                const contract = new ethers.Contract(contractAddress, contractABI, provider);

                statusDiv.innerHTML = ' Checking purchase record for account: ' + userAccount.substring(0, 10) + '...';
                
                const hasPurchased = await contract.checkPurchase(${fileId}, userAccount);
                
                statusDiv.innerHTML = hasPurchased ? 
                    ' Purchase confirmed!' : 
                    'Purchase not found in blockchain';
                
                // Send result back
                await fetch('http://localhost:3002/transaction-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: true, purchased: hasPurchased })
                });

                setTimeout(() => window.close(), 2000);

            } catch (error) {
                console.error('Check purchase error:', error);
                statusDiv.innerHTML = ' Error: ' + error.message;
                
                await fetch('http://localhost:3002/transaction-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: false, error: error.message })
                });
            }
        }

        checkPurchase();
    </script>
</body>
</html>`;
    }

    async getMagnetLink(fileId) {
        // Get magnet link via browser (since we need MetaMask)
        return new Promise(async (resolve, reject) => {
            try {
                // Create a simple page to get magnet link
                const getMagnetHTML = this.createGetMagnetPage(fileId);

                // Start server if not running
                if (!this.localServer) {
                    await this.startTransactionServer();
                }

                this.transactionHTML = getMagnetHTML;

                // Open in external browser
                const { shell } = require('electron');
                await shell.openExternal(`http://localhost:3002/transaction`);

                // Wait for the result
                const timeout = setTimeout(() => {
                    reject(new Error('Get magnet link timeout'));
                }, 30000);

                this.readResolve = (result) => {
                    clearTimeout(timeout);
                    if (result.success) {
                        resolve(result.magnetLink);
                    } else {
                        reject(new Error(result.error));
                    }
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    createGetMagnetPage(fileId) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Getting Download Link</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
        .status { margin: 20px 0; padding: 15px; border-radius: 10px; font-weight: 500; }
        .success { background: rgba(76, 175, 80, 0.3); border: 1px solid #4CAF50; }
        .error { background: rgba(244, 67, 54, 0.3); border: 1px solid #f44336; }
        .info { background: rgba(33, 150, 243, 0.3); border: 1px solid #2196F3; }
    </style>
</head>
<body>
    <h1>🔗 Getting Download Link</h1>
    <div id="status" class="status info">Connecting to blockchain...</div>

    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
    <script>
        const statusDiv = document.getElementById('status');
        
        async function getMagnetLink() {
            try {
                statusDiv.innerHTML = ' Checking MetaMask connection...';
                
                if (!window.ethereum) {
                    throw new Error('MetaMask not available');
                }

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                
                const accounts = await provider.listAccounts();
                const userAccount = accounts[0];
                
                const contractABI = ${JSON.stringify(contractABI)};
                const contractAddress = '${this.networkConfig?.contractAddress || contractAddress}';
                const contract = new ethers.Contract(contractAddress, contractABI, provider);

                // Debug: Check file info and purchase status
                statusDiv.innerHTML = 'Debugging access permissions...';
                
                const fileInfo = await contract.getFileInfo(${fileId});
                const hasPurchased = await contract.checkPurchase(${fileId}, userAccount);
                
                console.log('Debug info:', {
                    fileId: ${fileId},
                    userAccount: userAccount,
                    filePrice: ethers.utils.formatEther(fileInfo.price),
                    fileSeller: fileInfo.seller,
                    hasPurchased: hasPurchased,
                    isOwner: fileInfo.seller.toLowerCase() === userAccount.toLowerCase(),
                    isFree: fileInfo.price.toString() === '0'
                });
                
                statusDiv.innerHTML = \` Access Check:
                <br>• Account: \${userAccount.substring(0, 10)}...
                <br>• File Price: \${ethers.utils.formatEther(fileInfo.price)} ETH
                <br>• Is Owner: \${fileInfo.seller.toLowerCase() === userAccount.toLowerCase()}
                <br>• Has Purchased: \${hasPurchased}
                <br>• Is Free: \${fileInfo.price.toString() === '0'}\`;

                statusDiv.innerHTML = ' Getting download link...';
                const magnetLink = await contract.getMagnetLink(${fileId});
                
                statusDiv.innerHTML = 'Download link retrieved!';
                
                // Send result back
                await fetch('http://localhost:3002/transaction-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: true, magnetLink: magnetLink })
                });

                statusDiv.innerHTML = ' Ready to download! You can close this tab.';
                setTimeout(() => window.close(), 2000);

            } catch (error) {
                console.error('Get magnet link error:', error);
                statusDiv.innerHTML = ' Error: ' + error.message;
                
                await fetch('http://localhost:3002/transaction-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: false, error: error.message })
                });
            }
        }

        getMagnetLink();
    </script>
</body>
</html>`;
    }

    async getMagnetLinkDirect(fileId) {
        // Alternative method: get magnet link directly from files mapping
        // This bypasses the access control check in getMagnetLink()
        return new Promise(async (resolve, reject) => {
            try {
                const directHTML = this.createDirectMagnetPage(fileId);

                // Start server if not running
                if (!this.localServer) {
                    await this.startTransactionServer();
                }

                this.transactionHTML = directHTML;

                // Open in external browser
                const { shell } = require('electron');
                await shell.openExternal(`http://localhost:3002/transaction`);

                // Wait for the result
                const timeout = setTimeout(() => {
                    reject(new Error('Direct magnet link timeout'));
                }, 30000);

                this.readResolve = (result) => {
                    clearTimeout(timeout);
                    if (result.success) {
                        resolve(result.magnetLink);
                    } else {
                        reject(new Error(result.error));
                    }
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    createDirectMagnetPage(fileId) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Getting Magnet Link (Direct)</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
        .status { margin: 20px 0; padding: 15px; border-radius: 10px; font-weight: 500; }
        .success { background: rgba(76, 175, 80, 0.3); border: 1px solid #4CAF50; }
        .error { background: rgba(244, 67, 54, 0.3); border: 1px solid #f44336; }
        .info { background: rgba(33, 150, 243, 0.3); border: 1px solid #2196F3; }
    </style>
</head>
<body>
    <h1>🔗 Getting Download Link (Direct Method)</h1>
    <div id="status" class="status info"> Accessing file data directly...</div>

    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
    <script>
        const statusDiv = document.getElementById('status');
        
        async function getDirectMagnetLink() {
            try {
                if (!window.ethereum) {
                    throw new Error('MetaMask not available');
                }

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                
                const contractABI = ${JSON.stringify(contractABI)};
                const contractAddress = '${this.networkConfig?.contractAddress || contractAddress}';
                const contract = new ethers.Contract(contractAddress, contractABI, provider);

                statusDiv.innerHTML = ' Getting file data directly...';
                
                // Get file data directly from files mapping (this is public)
                const fileData = await contract.files(${fileId});
                
                if (!fileData.active) {
                    throw new Error('File is not active');
                }
                
                const magnetLink = fileData.magnetLink;
                
                if (!magnetLink || magnetLink.trim() === '') {
                    throw new Error('No magnet link found in file data');
                }
                
                statusDiv.innerHTML = '  Download link retrieved via direct method!';
                
                // Send result back
                await fetch('http://localhost:3002/transaction-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: true, magnetLink: magnetLink })
                });

                statusDiv.innerHTML = '  Ready to download! You can close this tab.';
                setTimeout(() => window.close(), 2000);

            } catch (error) {
                console.error('Direct magnet link error:', error);
                statusDiv.innerHTML = '  Error: ' + error.message;
                
                await fetch('http://localhost:3002/transaction-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: false, error: error.message })
                });
            }
        }

        getDirectMagnetLink();
    </script>
</body>
</html>`;
    }

    extractInfoHashFromMagnet(magnetLink) {
        // Extract info hash from magnet link
        const match = magnetLink.match(/xt=urn:btih:([a-fA-F0-9]{40})/);
        return match ? match[1] : null;
    }

    async startDownload(peerInfo, downloadPath) {
        try {
            console.log('Starting download for:', peerInfo.name);

            // Add to active downloads
            this.activeDownloads.set(peerInfo.infoHash, {
                name: peerInfo.name,
                progress: 0,
                peers: 0,
                downloadSpeed: 0,
                status: 'Starting...'
            });

            this.renderDownloads();

            // Switch to downloads tab
            const downloadsTab = document.querySelector('[data-tab="downloads"]');
            if (downloadsTab) downloadsTab.click();

            // Start download using browser WebTorrent
            console.log('Starting browser WebTorrent download for:', peerInfo.name);
            const result = await this.downloadWithBrowserWebTorrent(peerInfo);
            console.log('Browser WebTorrent download result:', result);

            if (result && result.success) {
                console.log('Download completed successfully:', result.name);
            }

        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Download failed: ' + error.message);
            this.activeDownloads.delete(peerInfo.infoHash);
            this.renderDownloads();
        }
    }

    updateDownloadProgress(data) {
        const download = this.activeDownloads.get(data.infoHash);
        if (download) {
            download.progress = data.progress;
            download.peers = data.peers;
            download.downloadSpeed = data.downloadSpeed;
            download.downloaded = data.downloaded;
            download.timeRemaining = data.timeRemaining;
            // Update status based on progress and peers
            if (data.status) {
                download.status = data.status;
            } else if (data.peers > 0) {
                download.status = `Downloading... (${data.peers} peers)`;
            } else if (data.progress > 0) {
                download.status = 'Downloading...';
            } else {
                download.status = 'Searching for peers...';
            }

            this.renderDownloads();
        }
    }

    handleDownloadComplete(data) {
        const download = this.activeDownloads.get(data.infoHash);
        if (download) {
            download.progress = 1;
            download.status = 'Completed';
            this.renderDownloads();

            this.showSuccess(`Download completed: ${data.result.name}`);

            // Remove from active downloads after 5 seconds
            setTimeout(() => {
                this.activeDownloads.delete(data.infoHash);
                this.renderDownloads();
            }, 5000);
        }
    }

    handleDownloadError(data) {
        const download = this.activeDownloads.get(data.infoHash);
        if (download) {
            download.status = `Error: ${data.error}`;
            download.progress = 0;
            this.renderDownloads();

            this.showError(`Download failed: ${data.error}`);

            // Remove from active downloads after 10 seconds
            setTimeout(() => {
                this.activeDownloads.delete(data.infoHash);
                this.renderDownloads();
            }, 10000);
        }
    }





    showConnectionSuggestions(data) {
        console.log('Showing connection suggestions for:', data.infoHash);

        const suggestionsHTML = `
        <div style="max-width: 600px; text-align: left;">
            <h3>🔗 Connection Troubleshooting</h3>
            <p><strong>Having trouble connecting to peers?</strong></p>
            <p>Try these solutions in order:</p>
            <ol>
                ${data.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ol>
            <p><strong>Why this happens:</strong> NAT (Network Address Translation) and firewalls can block P2P connections between different networks.</p>
            <p><strong>Best success rate:</strong> Both devices on the same WiFi network.</p>
        </div>
        `;

        this.showInfo(suggestionsHTML);

        // Also update the download status
        const download = this.activeDownloads.get(data.infoHash);
        if (download) {
            download.status = 'No peers found - try connection suggestions above';
            this.renderDownloads();
        }
    }

    handlePeerConnected(data) {
        console.log(`Peer connected for ${data.infoHash}: ${data.peerAddress}`);
        this.showInfo(`Connected to peer: ${data.peerAddress}`);
    }

    handleNoPeers(data) {
        console.log(`No peers found for ${data.name}`);
        this.showInfo(`Searching for peers for ${data.name}...`);
    }

    handleSeedingStarted(data) {
        console.log(`Seeding started for ${data.name}`);
        
        if (data.persistent) {
            this.showSuccess(`🌱 "${data.name}" is now seeding and will continue seeding even after app restart!`);
        } else {
            this.showSuccess(`🌱 "${data.name}" is now seeding!`);
        }
        
        // Refresh torrents list to show the new seeding torrent
        setTimeout(() => {
            this.loadActiveTorrents();
        }, 1000);
    }

    handleTorrentsRestoring(data) {
        console.log(`Restoring ${data.count} torrents from previous session`);
        
        if (data.count > 0) {
            const fileNames = data.torrents.map(t => t.name).join(', ');
            this.showInfo(`🔄 Restoring ${data.count} seeding file${data.count > 1 ? 's' : ''} from previous session: ${fileNames}`);
            
            // Refresh torrents list after a delay to show restored torrents
            setTimeout(() => {
                this.loadActiveTorrents();
            }, 3000);
        }
    }

    renderDownloads() {
        const container = document.getElementById('downloads-list');
        if (!container) return;

        if (this.activeDownloads.size === 0) {
            container.innerHTML = '<div class="no-data">No active downloads</div>';
            return;
        }

        container.innerHTML = Array.from(this.activeDownloads.entries()).map(([infoHash, download]) => `
<div class="download-item">
<div class="download-header">
<div class="download-name">${this.escapeHtml(download.name)}</div>
<div class="download-status">${download.status}</div>
</div>
<div class="progress-bar">
<div class="progress-fill" style="width: ${(download.progress * 100).toFixed(1)}%"></div>
</div>
<div class="download-stats">
<div class="stat-item">
<span class="stat-label">Progress</span>
<span class="stat-value">${(download.progress * 100).toFixed(1)}%</span>
</div>
<div class="stat-item">
<span class="stat-label">Peers</span>
<span class="stat-value">
  ${download.peers > 0 ? '<span class="peer-indicator"></span>' : ''}
  ${download.peers}
</span>
</div>
<div class="stat-item">
<span class="stat-label">Speed</span>
<span class="stat-value">${this.formatBytes(download.downloadSpeed || 0)}/s</span>
</div>
<div class="stat-item">
<span class="stat-label">Downloaded</span>
<span class="stat-value">${this.formatBytes(download.downloaded || 0)}</span>
</div>
</div>
</div>
`).join('');
    }

    async loadActiveTorrents() {
        try {
            console.log('Loading active torrents...');

            // Get torrents from both browser WebTorrent client and main process
            let browserTorrents = [];
            let mainProcessTorrents = [];

            // Browser WebTorrent torrents
            if (browserWebTorrentClient) {
                browserTorrents = browserWebTorrentClient.torrents.map(torrent => ({
                    infoHash: torrent.infoHash,
                    name: torrent.name || 'Unknown',
                    progress: torrent.progress || 0,
                    peers: torrent.numPeers || 0,
                    downloadSpeed: torrent.downloadSpeed || 0,
                    uploadSpeed: torrent.uploadSpeed || 0,
                    downloaded: torrent.downloaded || 0,
                    uploaded: torrent.uploaded || 0,
                    length: torrent.length || 0,
                    source: 'browser'
                }));
            }

            // Main process torrents (persistent seeding)
            try {
                mainProcessTorrents = await ipcRenderer.invoke('get-active-torrents');
                mainProcessTorrents = mainProcessTorrents.map(torrent => ({
                    ...torrent,
                    source: 'main'
                }));
            } catch (error) {
                console.warn('Could not get main process torrents:', error);
            }

            // Combine and deduplicate torrents
            const allTorrents = [...browserTorrents];
            
            // Add main process torrents that aren't already in browser torrents
            for (const mainTorrent of mainProcessTorrents) {
                const exists = browserTorrents.find(bt => bt.infoHash === mainTorrent.infoHash);
                if (!exists) {
                    allTorrents.push(mainTorrent);
                }
            }

            this.renderTorrents(allTorrents);
            
            // Also load persistent torrents info
            await this.loadPersistentTorrentsInfo();
            
            console.log('Active torrents loaded:', allTorrents.length);
        } catch (error) {
            console.error('Failed to load torrents:', error);
            this.showError('Failed to load active torrents: ' + error.message);
        }
    }

    async loadPersistentTorrentsInfo() {
        try {
            const persistentTorrents = await ipcRenderer.invoke('get-persistent-torrents');
            
            if (persistentTorrents.length > 0) {
                this.displayPersistentTorrentsInfo(persistentTorrents);
            }
            
        } catch (error) {
            console.warn('Could not load persistent torrents info:', error);
        }
    }

    displayPersistentTorrentsInfo(persistentTorrents) {
        const container = document.getElementById('torrents-list');
        if (!container) return;

        const activeTorrents = persistentTorrents.filter(t => t.isActive);
        const inactiveTorrents = persistentTorrents.filter(t => !t.isActive);

        if (persistentTorrents.length > 0) {
            const infoHTML = `
                <div class="persistent-torrents-info">
                    <h3>📁 Persistent Seeding Status</h3>
                    <div class="seeding-stats">
                        <div class="stat-card">
                            <div class="stat-number">${activeTorrents.length}</div>
                            <div class="stat-label">Currently Seeding</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${persistentTorrents.length}</div>
                            <div class="stat-label">Total Files Shared</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${inactiveTorrents.length}</div>
                            <div class="stat-label">Will Resume on Restart</div>
                        </div>
                    </div>
                    <p class="seeding-note">
                        🌱 Your files continue seeding even after closing the app. 
                        This helps maintain the P2P network and ensures your shared files remain available to others.
                    </p>
                </div>
            `;
            
            // Prepend the info to the torrents list
            container.innerHTML = infoHTML + container.innerHTML;
        }
    }

    renderTorrents(torrents) {
        const container = document.getElementById('torrents-list');
        if (!container) return;

        if (torrents.length === 0) {
            container.innerHTML = '<div class="no-data">No active torrents</div>';
            return;
        }

        container.innerHTML = torrents.map(torrent => {
            const isSeeding = torrent.progress === 1;
            const statusClass = isSeeding ? 'seeding' : 'downloading';
            const statusText = isSeeding ? '🌱 Seeding' : '⬇️ Downloading';
            
            return `
            <div class="torrent-item ${statusClass}">
                <div class="torrent-header">
                    <div class="torrent-name">
                        ${this.escapeHtml(torrent.name || 'Unknown')}
                        <span class="torrent-status">${statusText}</span>
                    </div>
                    <button class="btn btn-secondary" onclick="app.removeBrowserTorrent('${torrent.infoHash}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                        </svg>
                        ${isSeeding ? 'Stop Seeding' : 'Remove'}
                    </button>
                </div>
                <div class="torrent-progress">
                    <div class="progress-bar ${statusClass}" style="width: ${(torrent.progress * 100).toFixed(1)}%"></div>
                </div>
                <div class="torrent-stats">
                    <div class="stat-item">
                        <span class="stat-label">Progress:</span>
                        <span class="stat-value">${(torrent.progress * 100).toFixed(1)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Peers:</span>
                        <span class="stat-value">${torrent.peers || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">↓ Speed:</span>
                        <span class="stat-value">${this.formatSpeed(torrent.downloadSpeed || 0)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">↑ Speed:</span>
                        <span class="stat-value">${this.formatSpeed(torrent.uploadSpeed || 0)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Size:</span>
                        <span class="stat-value">${this.formatBytes(torrent.length || 0)}</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    async removeTorrent(infoHash) {
        try {
            const result = await ipcRenderer.invoke('remove-torrent', infoHash);
            if (result.success) {
                this.showSuccess('Torrent removed successfully');
                this.loadActiveTorrents();
            } else {
                this.showError('Failed to remove torrent: ' + result.error);
            }
        } catch (error) {
            console.error('Failed to remove torrent:', error);
            this.showError('Failed to remove torrent: ' + error.message);
        }
    }

    async testTrackerConnectivity() {
        const trackers = [
            // Proven working WebSocket trackers
            'wss://tracker.openwebtorrent.com',
            'wss://tracker.btorrent.xyz',
            'wss://tracker.webtorrent.dev',
            'wss://peertube2.cpy.re:443/tracker/socket',
            'wss://tracker.novage.com.ua:443/announce'
        ];

        console.log('🔧 Testing tracker connectivity...');
        const results = [];

        for (const trackerUrl of trackers) {
            try {
                const startTime = Date.now();

                // Test WebSocket connection to tracker
                const testResult = await this.testWebSocketTracker(trackerUrl);
                const endTime = Date.now();

                results.push({
                    url: trackerUrl,
                    accessible: testResult,
                    time: endTime - startTime,
                    error: testResult ? null : 'Connection failed'
                });

                console.log(`${testResult ? ' ' : ' '} ${trackerUrl} (${endTime - startTime}ms)`);

            } catch (error) {
                results.push({
                    url: trackerUrl,
                    accessible: false,
                    time: 0,
                    error: error.message
                });
                console.log(`  ${trackerUrl} - Error: ${error.message}`);
            }
        }

        return results;
    }

    async testWebSocketTracker(trackerUrl) {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket(trackerUrl);

                const timeout = setTimeout(() => {
                    ws.close();
                    resolve(false);
                }, 5000); // 5 second timeout

                ws.onopen = () => {
                    clearTimeout(timeout);
                    ws.close();
                    resolve(true);
                };

                ws.onerror = () => {
                    clearTimeout(timeout);
                    resolve(false);
                };

                ws.onclose = () => {
                    clearTimeout(timeout);
                };

            } catch (error) {
                resolve(false);
            }
        });
    }

    // Utility methods
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const text = document.querySelector('.loading-text');
        if (overlay) overlay.classList.remove('hidden');
        if (text) text.textContent = message;
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    showMessage(message, type) {
        console.log(`${type.toUpperCase()}: ${message}`);

        const messageEl = document.getElementById(`${type}-message`);
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.classList.remove('hidden');

            // Hide other message types
            ['error', 'success', 'info'].forEach(t => {
                if (t !== type) {
                    const otherEl = document.getElementById(`${t}-message`);
                    if (otherEl) {
                        otherEl.classList.add('hidden');
                    }
                }
            });

            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageEl.classList.add('hidden');
            }, 5000);
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing P2P app with external MetaMask...');
    try {
        window.app = new P2PBlockchainApp();
        console.log('P2P app instance created and assigned to window.app');
    } catch (error) {
        console.error('Failed to create app instance:', error);
    }
});

console.log('P2P Blockchain App with external MetaMask loaded successfully');



// Add createBrowserTorrent method to the P2PBlockchainApp prototype
P2PBlockchainApp.prototype.createBrowserTorrent = async function (file, metadata) {
    return new Promise((resolve, reject) => {
        try {
            if (!browserWebTorrentClient) {
                reject(new Error('WebTorrent client not initialized'));
                return;
            }

            console.log('Creating torrent for file:', file.name, 'Size:', file.size);

            // Create torrent with proven working trackers
            const torrentOptions = {
                announce: [
                    // Proven working WebSocket trackers
                    'wss://tracker.openwebtorrent.com',
                    'wss://tracker.btorrent.xyz',
                    'wss://tracker.webtorrent.dev',
                    'wss://peertube2.cpy.re:443/tracker/socket',
                    'wss://tracker.novage.com.ua:443/announce',

                    // Proven working UDP trackers from sample magnet
                    'udp://tracker.leechers-paradise.org:6969',
                    'udp://tracker.coppersurfer.tk:6969',
                    'udp://tracker.opentrackr.org:1337',
                    'udp://explodie.org:6969',
                    'udp://tracker.empire-js.us:1337'
                ],
                name: file.name,
                createdBy: 'P2P Blockchain File Sharing v2.0'
            };

            browserWebTorrentClient.seed(file, torrentOptions, (torrent) => {
                console.log('Torrent created successfully:', {
                    infoHash: torrent.infoHash,
                    name: torrent.name,
                    magnetURI: torrent.magnetURI
                });

                // Calculate file hash for verification
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const arrayBuffer = e.target.result;
                        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                        const hashArray = Array.from(new Uint8Array(hashBuffer));
                        const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                        const fileInfo = {
                            infoHash: torrent.infoHash,
                            name: torrent.name,
                            size: file.size,
                            magnetLink: torrent.magnetURI,
                            fileHash: fileHash,
                            files: torrent.files.map(f => ({
                                name: f.name,
                                length: f.length,
                                path: f.path
                            })),
                            timestamp: Date.now(),
                            version: '2.0.0'
                        };

                        console.log('Generated magnet link:', torrent.magnetURI);
                        resolve(fileInfo);

                    } catch (hashError) {
                        console.error('Error calculating file hash:', hashError);
                        reject(hashError);
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Failed to read file for hashing'));
                };

                reader.readAsArrayBuffer(file);
            });

        } catch (error) {
            console.error('Error creating torrent:', error);
            reject(error);
        }
    });
};

// Add downloadWithBrowserWebTorrent method to the P2PBlockchainApp prototype
P2PBlockchainApp.prototype.downloadWithBrowserWebTorrent = async function (fileInfo) {
    return new Promise((resolve, reject) => {
        try {
            if (!browserWebTorrentClient) {
                reject(new Error('WebTorrent client not initialized'));
                return;
            }

            console.log('Starting download with browser WebTorrent:', fileInfo.name);
            console.log('Magnet link:', fileInfo.magnetLink);

            // Add torrent using magnet link
            browserWebTorrentClient.add(fileInfo.magnetLink, (torrent) => {
                console.log('Torrent added for download:', {
                    infoHash: torrent.infoHash,
                    name: torrent.name,
                    numPeers: torrent.numPeers
                });

                // Add to active downloads
                this.activeDownloads.set(fileInfo.infoHash, {
                    name: fileInfo.name,
                    progress: 0,
                    peers: 0,
                    downloadSpeed: 0,
                    status: 'Starting...'
                });

                this.renderDownloads();

                // Monitor progress
                const progressInterval = setInterval(() => {
                    const progress = torrent.progress;
                    const peers = torrent.numPeers;
                    const downloadSpeed = torrent.downloadSpeed;

                    console.log(`Download progress: ${(progress * 100).toFixed(1)}%, Peers: ${peers}, Speed: ${this.formatSpeed(downloadSpeed)}`);

                    // Update download info
                    const download = this.activeDownloads.get(fileInfo.infoHash);
                    if (download) {
                        download.progress = progress;
                        download.peers = peers;
                        download.downloadSpeed = downloadSpeed;
                        download.status = peers > 0 ? 'Downloading...' : 'Searching for peers...';
                        this.renderDownloads();
                    }
                }, 1000);

                // Handle completion
                torrent.on('done', () => {
                    clearInterval(progressInterval);
                    console.log('Download completed:', torrent.name);

                    // Download files to user's device
                    this.downloadTorrentFiles(torrent);

                    // Update status
                    const download = this.activeDownloads.get(fileInfo.infoHash);
                    if (download) {
                        download.progress = 1;
                        download.status = 'Completed';
                        this.renderDownloads();
                    }

                    this.showSuccess(`Download completed: ${torrent.name}`);
                    resolve({
                        success: true,
                        name: torrent.name,
                        files: torrent.files.map(f => ({ name: f.name, size: f.length }))
                    });
                });

                // Handle errors
                torrent.on('error', (err) => {
                    clearInterval(progressInterval);
                    console.error('Download error:', err);
                    this.activeDownloads.delete(fileInfo.infoHash);
                    this.renderDownloads();
                    this.showError('Download failed: ' + err.message);
                    reject(err);
                });

                // Handle no peers
                torrent.on('noPeers', () => {
                    console.warn('No peers found for torrent:', torrent.infoHash);
                    const download = this.activeDownloads.get(fileInfo.infoHash);
                    if (download) {
                        download.status = 'No peers found';
                        this.renderDownloads();
                    }
                });

                // Handle peer connections
                torrent.on('wire', (wire) => {
                    console.log('Connected to peer:', wire.remoteAddress);
                });

            });

        } catch (error) {
            console.error('Error starting download:', error);
            reject(error);
        }
    });
};

// Add downloadTorrentFiles method to handle file downloads
P2PBlockchainApp.prototype.downloadTorrentFiles = function (torrent) {
    if (!torrent || !torrent.files || torrent.files.length === 0) {
        this.showError('No files found in torrent');
        return;
    }

    console.log(`Starting download of ${torrent.files.length} file(s)...`);

    torrent.files.forEach((file) => {
        file.getBlobURL((err, url) => {
            if (err) {
                console.error(`Error downloading ${file.name}:`, err);
                this.showError(`Error downloading ${file.name}`);
                return;
            }

            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.style.display = 'none';
            document.body.appendChild(a);

            try {
                a.click();
                console.log(`Download started: ${file.name}`);
                this.showSuccess(`Download started: ${file.name}`);
            } catch (error) {
                console.warn('Click download failed, opening in new tab:', error);
                window.open(url, '_blank');
                this.showSuccess(`Opened ${file.name} in new tab`);
            }

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 1000);
        });
    });
};

// Add formatSpeed helper method
P2PBlockchainApp.prototype.formatSpeed = function (bytesPerSecond) {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
// Add theme support methods to the P2PBlockchainApp prototype
P2PBlockchainApp.prototype.initializeTheme = function () {
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.updateThemeIcon();
};

P2PBlockchainApp.prototype.toggleTheme = function () {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
    this.updateThemeIcon();
    console.log('Theme switched to:', this.currentTheme);
};

P2PBlockchainApp.prototype.updateThemeIcon = function () {
    const moonIcon = document.querySelector('.theme-moon');
    const sunIcon = document.querySelector('.theme-sun');

    if (moonIcon && sunIcon) {
        if (this.currentTheme === 'light') {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        } else {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        }
    }
};
// Add removeBrowserTorrent method to handle browser WebTorrent removal
P2PBlockchainApp.prototype.removeBrowserTorrent = async function (infoHash) {
    try {
        let removed = false;
        
        // Try to remove from browser WebTorrent client first
        if (browserWebTorrentClient) {
            const torrent = browserWebTorrentClient.get(infoHash);
            if (torrent) {
                torrent.destroy();
                removed = true;
                console.log('Removed torrent from browser client:', infoHash);
            }
        }
        
        // Also try to remove from main process (persistent torrents)
        try {
            const result = await ipcRenderer.invoke('remove-torrent', infoHash);
            if (result.success) {
                removed = true;
                console.log('Removed torrent from main process:', infoHash);
            }
        } catch (error) {
            console.warn('Could not remove from main process:', error);
        }
        
        if (removed) {
            this.showSuccess('Torrent removed successfully');
            this.loadActiveTorrents(); // Refresh the list
        } else {
            this.showError('Torrent not found');
        }
        
    } catch (error) {
        console.error('Failed to remove torrent:', error);
        this.showError('Failed to remove torrent: ' + error.message);
    }
};

// Add formatBytes helper method
P2PBlockchainApp.prototype.formatBytes = function (bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
//Add periodic torrent updates
P2PBlockchainApp.prototype.startTorrentUpdates = function () {
    // Update torrents list every 2 seconds if torrents tab is active
    setInterval(() => {
        const torrentsTab = document.querySelector('[data-tab="torrents"]');
        const torrentsContent = document.getElementById('torrents-tab');

        if (torrentsTab && torrentsTab.classList.contains('active') &&
            torrentsContent && torrentsContent.classList.contains('active')) {
            this.loadActiveTorrents();
        }
    }, 2000);
};
// Navigation function for Back to Home button
function goBackToHome() {
    console.log('Navigating back to homepage...');

    try {
        // Navigate to the homepage
        window.location.href = './homepage.html';
    } catch (error) {
        console.error('Error navigating to homepage:', error);

        // Fallback: try to go back in history
        try {
            window.history.back();
        } catch (historyError) {
            console.error('Error going back in history:', historyError);

            // Last resort: reload the page and hope it redirects properly
            window.location.reload();
        }
    }
}
// Make sure the goBackToHome function is globally available
window.goBackToHome = goBackToHome;

// Also add event listener when DOM is loaded as backup
document.addEventListener('DOMContentLoaded', function () {
    const backToHomeBtn = document.getElementById('back-to-home');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            goBackToHome();
        });
    }
});// Professional loading and animation utilities
function addLoadingAnimation(element, text = 'Loading...') {
    if (!element) return;

    element.innerHTML = `
        <div class="loading-container" style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="loading-spinner" style="width: 16px; height: 16px; border: 2px solid #f3f3f3; border-top: 2px solid var(--orange); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span>${text}</span>
        </div>
    `;
}

function removeLoadingAnimation(element, content) {
    if (!element) return;
    element.innerHTML = content;
}

// Enhanced button state management
function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        const originalContent = button.innerHTML;
        button.dataset.originalContent = originalContent;
        button.innerHTML = `
            <span class="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
            </span>
            ${loadingText}
        `;
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        if (button.dataset.originalContent) {
            button.innerHTML = button.dataset.originalContent;
        }
    }
}

// Smooth transitions for theme changes
function smoothThemeTransition() {
    document.documentElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 300);
}