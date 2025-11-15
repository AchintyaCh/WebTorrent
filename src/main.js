const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');

// Import WebTorrent using dynamic import to handle ES module
let WebTorrent;
const initWebTorrent = async () => {
  try {
    console.log('Attempting to import WebTorrent...');
    const webTorrentModule = await import('webtorrent');
    WebTorrent = webTorrentModule.default;
    console.log('WebTorrent imported successfully via dynamic import');
  } catch (error) {
    console.log('Dynamic import failed, trying require...', error.message);
    try {
      // Fallback to require for older versions
      WebTorrent = require('webtorrent');
      console.log('WebTorrent imported successfully via require');
    } catch (requireError) {
      console.error('Both import methods failed:', requireError);
      throw new Error('Could not load WebTorrent: ' + requireError.message);
    }
  }
};

// WebTorrent client will be initialized after module import
let client;
let mainWindow;
let activeTorrents = new Map(); // Track active torrents
let persistentTorrentsPath; // Path to persistent torrents file

// NAT traversal testing function
async function testNATTraversal() {
  try {
    console.log('🔧 Testing NAT traversal capabilities...');

    // Test if we can bind to ports (indicates potential for incoming connections)
    const net = require('net');
    const testServer = net.createServer();

    testServer.listen(0, () => {
      const testPort = testServer.address().port;
      console.log('✅ Can bind to port:', testPort);
      testServer.close();

      // Test UPnP if available
      if (client.natUpnp) {
        console.log('🔄 Testing UPnP port mapping...');
        // UPnP test would go here
      }
    });

    testServer.on('error', (err) => {
      console.warn('⚠️ Port binding test failed:', err.message);
    });

  } catch (error) {
    console.error('❌ NAT traversal test failed:', error);
  }
}

// Initialize persistent torrents storage
const initializePersistentStorage = () => {
  const os = require('os');
  const userDataPath = path.join(os.homedir(), '.p2p-blockchain-app');
  
  // Create user data directory if it doesn't exist
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
    console.log('Created user data directory:', userDataPath);
  }
  
  persistentTorrentsPath = path.join(userDataPath, 'persistent-torrents.json');
  console.log('Persistent torrents will be stored at:', persistentTorrentsPath);
};

// Save torrent info for persistence
const savePersistentTorrent = (torrent, metadata = {}) => {
  try {
    let persistentTorrents = {};
    
    // Load existing persistent torrents
    if (fs.existsSync(persistentTorrentsPath)) {
      const data = fs.readFileSync(persistentTorrentsPath, 'utf8');
      persistentTorrents = JSON.parse(data);
    }
    
    // Add new torrent info
    persistentTorrents[torrent.infoHash] = {
      infoHash: torrent.infoHash,
      name: torrent.name,
      magnetURI: torrent.magnetURI,
      length: torrent.length,
      files: torrent.files.map(f => ({
        name: f.name,
        length: f.length,
        path: f.path
      })),
      metadata: metadata,
      addedAt: Date.now(),
      lastSeenAt: Date.now()
    };
    
    // Save to file
    fs.writeFileSync(persistentTorrentsPath, JSON.stringify(persistentTorrents, null, 2));
    console.log('Saved persistent torrent:', torrent.name);
    
  } catch (error) {
    console.error('Failed to save persistent torrent:', error);
  }
};

// Remove torrent from persistence
const removePersistentTorrent = (infoHash) => {
  try {
    if (!fs.existsSync(persistentTorrentsPath)) return;
    
    const data = fs.readFileSync(persistentTorrentsPath, 'utf8');
    const persistentTorrents = JSON.parse(data);
    
    if (persistentTorrents[infoHash]) {
      delete persistentTorrents[infoHash];
      fs.writeFileSync(persistentTorrentsPath, JSON.stringify(persistentTorrents, null, 2));
      console.log('Removed persistent torrent:', infoHash);
    }
    
  } catch (error) {
    console.error('Failed to remove persistent torrent:', error);
  }
};

// Update last seen time for active torrents
const updatePersistentTorrentsActivity = () => {
  try {
    if (!fs.existsSync(persistentTorrentsPath)) return;
    
    const data = fs.readFileSync(persistentTorrentsPath, 'utf8');
    const persistentTorrents = JSON.parse(data);
    let updated = false;
    
    // Update last seen time for active torrents
    for (const [infoHash, torrent] of activeTorrents) {
      if (persistentTorrents[infoHash]) {
        persistentTorrents[infoHash].lastSeenAt = Date.now();
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(persistentTorrentsPath, JSON.stringify(persistentTorrents, null, 2));
    }
    
  } catch (error) {
    console.error('Failed to update persistent torrents activity:', error);
  }
};

// Restore persistent torrents on app start
const restorePersistentTorrents = async () => {
  try {
    if (!fs.existsSync(persistentTorrentsPath)) {
      console.log('No persistent torrents file found');
      return;
    }
    
    const data = fs.readFileSync(persistentTorrentsPath, 'utf8');
    const persistentTorrents = JSON.parse(data);
    const torrentHashes = Object.keys(persistentTorrents);
    
    if (torrentHashes.length === 0) {
      console.log('No persistent torrents to restore');
      return;
    }
    
    console.log(`Restoring ${torrentHashes.length} persistent torrents...`);
    
    // Notify renderer about restoration
    if (mainWindow) {
      mainWindow.webContents.send('torrents-restoring', {
        count: torrentHashes.length,
        torrents: Object.values(persistentTorrents).map(t => ({ name: t.name, infoHash: t.infoHash }))
      });
    }
    
    for (const infoHash of torrentHashes) {
      const torrentInfo = persistentTorrents[infoHash];
      
      try {
        console.log(`Restoring torrent: ${torrentInfo.name}`);
        
        // Add torrent using magnet URI
        client.add(torrentInfo.magnetURI, {
          // Use same tracker configuration as before
          announce: [
            'wss://tracker.openwebtorrent.com',
            'wss://tracker.btorrent.xyz',
            'wss://tracker.webtorrent.dev',
            'wss://peertube2.cpy.re:443/tracker/socket',
            'wss://tracker.novage.com.ua:443/announce',
            'udp://tracker.leechers-paradise.org:6969',
            'udp://tracker.coppersurfer.tk:6969',
            'udp://tracker.opentrackr.org:1337',
            'udp://explodie.org:6969',
            'udp://tracker.empire-js.us:1337',
            'udp://tracker.openbittorrent.com:80',
            'udp://exodus.desync.com:6969',
            'udp://tracker.torrent.eu.org:451',
            'udp://tracker.tiny-vps.com:6969',
            'udp://retracker.lanta-net.ru:2710',
            'udp://open.stealth.si:80'
          ],
          dht: true,
          private: false
        }, (torrent) => {
          console.log(`Successfully restored torrent: ${torrent.name}`);
          
          // Store torrent reference
          activeTorrents.set(torrent.infoHash, torrent);
          
          // Set up torrent event listeners
          setupTorrentListeners(torrent);
          
          // Update last seen time
          torrentInfo.lastSeenAt = Date.now();
        });
        
      } catch (error) {
        console.error(`Failed to restore torrent ${torrentInfo.name}:`, error);
        // Don't remove from persistent storage yet - might work next time
      }
    }
    
    // Save updated last seen times
    fs.writeFileSync(persistentTorrentsPath, JSON.stringify(persistentTorrents, null, 2));
    
  } catch (error) {
    console.error('Failed to restore persistent torrents:', error);
  }
};

// Initialize WebTorrent client
const createWebTorrentClient = () => {
  if (!WebTorrent) {
    throw new Error('WebTorrent not initialized');
  }

  client = new WebTorrent({
    // Enable both DHT and trackers for maximum compatibility
    dht: true,           // Keep DHT for decentralized discovery
    tracker: true,       // Enable trackers for NAT traversal
    webSeeds: false,     // Disable web seeds

    // Enhanced UTP configuration for NAT traversal
    utp: true,           // Enable µTP (micro Transport Protocol)
    tcp: true,           // Enable TCP as fallback

    // Use standard ports for better tracker compatibility
    // dhtPort: 6881,    // Standard DHT port (commented to use random)
    // torrentPort: 6881, // Standard torrent port (commented to use random)

    // WebRTC configuration for NAT traversal
    rtcConfig: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    },

    // Public tracker list for NAT traversal - using proven working trackers
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
      'udp://tracker.empire-js.us:1337',

      // Additional reliable UDP trackers
      'udp://tracker.openbittorrent.com:80',
      'udp://exodus.desync.com:6969',
      'udp://tracker.torrent.eu.org:451',
      'udp://tracker.tiny-vps.com:6969',
      'udp://retracker.lanta-net.ru:2710',
      'udp://open.stealth.si:80'
    ],

    // DHT bootstrap nodes (keep for hybrid approach)
    dhtBootstrap: [
      'router.bittorrent.com:6881',
      'dht.transmissionbt.com:6881',
      'router.utorrent.com:6881'
    ],

    // Connection limits and timeouts
    maxConns: 200,       // Maximum connections
    uploadLimit: -1,     // No upload limit
    downloadLimit: -1,   // No download limit

    // NAT traversal specific settings
    natUpnp: true,       // Enable UPnP for automatic port forwarding
    natPmp: true,        // Enable NAT-PMP for automatic port forwarding

    // Peer discovery settings
    peerDiscovery: {
      dht: true,
      tracker: false,
      lsd: true          // Enable Local Service Discovery
    }
  });

  // Setup client event listeners with NAT traversal monitoring
  client.on('listening', () => {
    const dhtPort = client.dht ? client.dht.address().port : 'N/A';
    const torrentPort = client.torrentPort;

    console.log('🌐 WebTorrent client listening:', {
      torrentPort: torrentPort,
      dhtPort: dhtPort,
      nodeId: client.nodeId,
      peerId: client.peerId
    });

    // Test NAT traversal capabilities
    testNATTraversal();
  });

  client.on('error', (err) => {
    console.error('❌ WebTorrent client error:', err);
  });

  // Enhanced DHT monitoring
  if (client.dht) {
    client.dht.on('ready', () => {
      console.log('✅ DHT ready, nodes:', client.dht.nodes.length);
    });

    client.dht.on('peer', (peer, infoHash) => {
      console.log('🔍 DHT found peer:', peer.host + ':' + peer.port, 'for', infoHash.toString('hex'));
    });

    client.dht.on('announce', (peer, infoHash) => {
      console.log('📢 DHT announce from:', peer.host + ':' + peer.port);
    });
  }
  client.on('error', (err) => {
    console.error('WebTorrent client error:', err);
  });

  client.on('torrent', (torrent) => {
    console.log('Torrent added to client:', torrent.infoHash);
  });
  
  // Start periodic activity updates for persistent torrents
  setInterval(() => {
    updatePersistentTorrentsActivity();
  }, 60000); // Update every minute
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    title: 'P2P Blockchain File Sharing',
    show: false // Don't show until ready
  });

  // Load the homepage
  const htmlPath = path.join(__dirname, 'renderer/homepage.html');
  console.log('Loading HTML from:', htmlPath);

  mainWindow.loadFile(htmlPath).then(() => {
    console.log('HTML loaded successfully');
    mainWindow.show();

    // Always open DevTools for debugging
    mainWindow.webContents.openDevTools();
  }).catch((error) => {
    console.error('Failed to load HTML:', error);
  });

  // Handle renderer process crashes
  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
  });

  // Handle unresponsive renderer
  mainWindow.on('unresponsive', () => {
    console.error('Renderer process became unresponsive');
  });

  // Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer Console [${level}]:`, message);
  });
}

// IPC Handlers for P2P Operations

// Seed a file and return peer info for blockchain storage
ipcMain.handle('seed-file', async (event, filePath, metadata) => {
  return new Promise((resolve, reject) => {
    console.log('Starting to seed file:', filePath);

    if (!fs.existsSync(filePath)) {
      reject(new Error('File does not exist'));
      return;
    }

    client.seed(filePath, {
      // Use optimized trackers for cross-device connectivity
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
        'udp://tracker.empire-js.us:1337',

        // Additional reliable UDP trackers
        'udp://tracker.openbittorrent.com:80',
        'udp://exodus.desync.com:6969',
        'udp://tracker.torrent.eu.org:451',
        'udp://tracker.tiny-vps.com:6969',
        'udp://retracker.lanta-net.ru:2710',
        'udp://open.stealth.si:80'
      ],
      dht: true, // Keep DHT as backup
      // Custom torrent creation options
      createdBy: 'P2P Blockchain File Sharing v2.0',
      private: false // Allow public trackers and DHT
    }, (torrent) => {
      console.log('Torrent created successfully:', {
        infoHash: torrent.infoHash,
        name: torrent.name,
        length: torrent.length
      });

      // Store torrent reference
      activeTorrents.set(torrent.infoHash, torrent);

      // Create file info for blockchain storage (now with magnet link)
      const crypto = require('crypto');

      // Calculate file hash for verification
      const fileBuffer = fs.readFileSync(filePath);
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const fileInfo = {
        // Basic torrent info
        infoHash: torrent.infoHash,
        name: torrent.name,
        size: torrent.length,
        magnetLink: torrent.magnetURI, // This is the key change!
        fileHash: fileHash,

        // File structure
        files: torrent.files.map(f => ({
          name: f.name,
          length: f.length,
          path: f.path
        })),

        // Metadata
        timestamp: Date.now(),
        version: '2.0.0'
      };

      console.log('Generated magnet link:', torrent.magnetURI);

      // Save torrent for persistence across app restarts
      savePersistentTorrent(torrent, metadata);

      // Set up torrent event listeners
      setupTorrentListeners(torrent);

      // Notify user about persistent seeding
      console.log(`✅ File "${torrent.name}" is now seeding and will continue seeding even after app restart`);
      
      // Send notification to renderer
      if (mainWindow) {
        mainWindow.webContents.send('torrent-seeding-started', {
          name: torrent.name,
          infoHash: torrent.infoHash,
          persistent: true
        });
      }

      resolve(fileInfo);
    });
  });
});

// Download a file using magnet link and trackers
ipcMain.handle('download-file', async (event, fileInfo, downloadPath) => {
  return new Promise((resolve, reject) => {
    console.log('Starting download with magnet link:', fileInfo.magnetLink);

    // Check if already downloading
    if (activeTorrents.has(fileInfo.infoHash)) {
      reject(new Error('Already downloading this file'));
      return;
    }

    console.log('Download info:', {
      infoHash: fileInfo.infoHash,
      name: fileInfo.name,
      size: fileInfo.size,
      magnetLink: fileInfo.magnetLink?.substring(0, 100) + '...'
    });

    // Enhanced torrent options for tracker-based downloads
    const torrentOptions = {
      path: downloadPath,

      // Use optimized trackers for cross-device connectivity
      announce: [
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.webtorrent.dev',
        'wss://tracker.fastcast.nz',
        'wss://tracker.files.fm:7073/announce',
        'wss://tracker.btorrent.xyz',
        // Additional reliable trackers
        'wss://tracker.webtorrent.io',
        'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
        'wss://tracker.sloppyta.co:443/announce',
        'wss://peertube2.cpy.re:443/tracker/socket',
        'wss://tracker.novage.com.ua:443/announce',
        // UDP trackers (often less blocked)
        'udp://tracker.openbittorrent.com:80',
        'udp://tracker.opentrackr.org:1337',
        'udp://exodus.desync.com:6969',
        'udp://tracker.torrent.eu.org:451',
        'udp://tracker.tiny-vps.com:6969',
        'udp://retracker.lanta-net.ru:2710',
        'udp://open.stealth.si:80'
      ],
      dht: true, // Keep DHT as backup

      // Enhanced NAT traversal settings
      utp: true,           // Prefer µTP for NAT traversal
      tcp: true,           // Allow TCP as fallback

      // Connection strategy
      maxConns: 50,        // Limit connections per torrent
      strategy: 'sequential', // Try sequential download

      // Peer discovery enhancements
      private: false,      // Allow public trackers and DHT
      skipVerify: false    // Always verify pieces
    };

    // Add torrent using magnet link (much better for NAT traversal!)
    try {
      client.add(fileInfo.magnetLink, torrentOptions, (torrent) => {
        console.log('Torrent added, searching for peers via DHT...', {
          infoHash: torrent.infoHash,
          name: torrent.name || fileInfo.name,
          magnetURI: torrent.magnetURI
        });

        // Store torrent reference
        activeTorrents.set(torrent.infoHash, torrent);

        // Resolve immediately after starting download
        resolve({
          success: true,
          message: 'Download started',
          infoHash: torrent.infoHash,
          name: torrent.name || fileInfo.name
        });

        // Enhanced peer discovery and connection monitoring
        torrent.on('wire', (wire) => {
          console.log('🔗 Connected to peer:', {
            address: wire.remoteAddress,
            port: wire.remotePort,
            type: wire.type || 'unknown',
            encrypted: wire.encrypted || false
          });

          // Monitor connection quality
          wire.on('close', () => {
            console.log('🔌 Peer disconnected:', wire.remoteAddress);
          });

          wire.on('error', (err) => {
            console.warn('⚠️ Peer connection error:', err.message);
          });
        });

        torrent.on('noPeers', () => {
          console.warn('❌ No peers found for torrent:', torrent.infoHash);
          console.log('🔄 Attempting enhanced peer discovery...');

          // Multiple discovery strategies
          setTimeout(() => {
            // Strategy 1: Force DHT announcement
            if (client.dht) {
              console.log('📢 Forcing DHT announcement...');
              client.dht.announce(torrent.infoHash, client.torrentPort || 6881, () => {
                console.log('✅ DHT announce completed');
              });
            }
          }, 1000);

          setTimeout(() => {
            // Strategy 2: Try different connection methods
            if (torrent.numPeers === 0) {
              console.log('🔄 Trying alternative connection methods...');
              console.log('💡 Consider: same WiFi, UPnP, mobile hotspot, or VPN');
            }
          }, 10000);

          setTimeout(() => {
            // Strategy 3: Send suggestions to UI
            if (torrent.numPeers === 0) {
              console.log('💡 Sending connection suggestions to UI...');
              mainWindow.webContents.send('suggest-connection-methods', {
                infoHash: torrent.infoHash,
                suggestions: [
                  'Connect both devices to same WiFi network',
                  'Enable UPnP on router settings',
                  'Use mobile hotspot for one device',
                  'Check firewall allows P2P traffic',
                  'Try VPN service on both devices'
                ]
              });
            }
          }, 30000);
        });

        // Monitor peer discovery progress
        torrent.on('peer', (peer) => {
          console.log('🔍 DHT discovered peer:', {
            address: peer.host || peer.address,
            port: peer.port,
            source: 'DHT'
          });
        });

        // Set up progress monitoring
        const progressInterval = setInterval(() => {
          const progress = torrent.progress;
          const peers = torrent.numPeers;
          const downloaded = torrent.downloaded;
          const downloadSpeed = torrent.downloadSpeed;

          console.log(`Download progress: ${(progress * 100).toFixed(1)}%, Peers: ${peers}, Speed: ${downloadSpeed}`);

          // Send progress to renderer
          mainWindow.webContents.send('download-progress', {
            infoHash: torrent.infoHash,
            progress: progress,
            peers: peers,
            downloaded: downloaded,
            downloadSpeed: downloadSpeed,
            timeRemaining: torrent.timeRemaining
          });

          // If no peers found after 30 seconds, try alternative discovery
          if (peers === 0 && Date.now() - torrent.created > 30000) {
            console.log('No peers found after 30s, trying alternative discovery...');

            // Try to find peers using the original seeder info
            if (fileInfo.nodeId && fileInfo.peerId) {
              console.log('Attempting to connect to original seeder...');
            }
          }
        }, 1000);

        // Set up timeout for peer discovery
        const discoveryTimeout = setTimeout(() => {
          if (torrent.numPeers === 0) {
            console.warn('Peer discovery timeout - no peers found after 2 minutes');
            mainWindow.webContents.send('download-progress', {
              infoHash: torrent.infoHash,
              progress: 0,
              peers: 0,
              downloaded: 0,
              downloadSpeed: 0,
              status: 'No peers found - file may not be seeded'
            });
          }
        }, 120000); // 2 minutes

        torrent.on('done', () => {
          clearInterval(progressInterval);
          clearTimeout(discoveryTimeout);
          console.log('Download completed for:', torrent.name);

          const result = {
            success: true,
            name: torrent.name,
            files: torrent.files.map(f => ({
              name: f.name,
              path: path.join(downloadPath, f.path)
            })),
            downloadPath: downloadPath
          };

          mainWindow.webContents.send('download-complete', {
            infoHash: torrent.infoHash,
            result: result
          });
        });

        torrent.on('error', (err) => {
          clearInterval(progressInterval);
          clearTimeout(discoveryTimeout);
          console.error('Download error:', err);
          activeTorrents.delete(torrent.infoHash);

          mainWindow.webContents.send('download-error', {
            infoHash: torrent.infoHash,
            error: err.message
          });
        });

        // Set up torrent event listeners
        setupTorrentListeners(torrent);
      });
    } catch (error) {
      console.error('Failed to add torrent:', error);
      reject(new Error('Failed to start download: ' + error.message));
    }
  });
});

// Get list of active torrents
ipcMain.handle('get-active-torrents', async () => {
  const torrents = [];
  for (const [infoHash, torrent] of activeTorrents) {
    torrents.push({
      infoHash: infoHash,
      name: torrent.name,
      progress: torrent.progress,
      peers: torrent.numPeers,
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      downloaded: torrent.downloaded,
      uploaded: torrent.uploaded,
      length: torrent.length,
      isSeeding: torrent.progress === 1 // Indicate if this is a seeding torrent
    });
  }
  return torrents;
});

// Get persistent torrents info
ipcMain.handle('get-persistent-torrents', async () => {
  try {
    if (!fs.existsSync(persistentTorrentsPath)) {
      return [];
    }
    
    const data = fs.readFileSync(persistentTorrentsPath, 'utf8');
    const persistentTorrents = JSON.parse(data);
    
    return Object.values(persistentTorrents).map(torrent => ({
      ...torrent,
      isActive: activeTorrents.has(torrent.infoHash),
      daysSinceAdded: Math.floor((Date.now() - torrent.addedAt) / (1000 * 60 * 60 * 24)),
      daysSinceLastSeen: Math.floor((Date.now() - torrent.lastSeenAt) / (1000 * 60 * 60 * 24))
    }));
    
  } catch (error) {
    console.error('Failed to get persistent torrents:', error);
    return [];
  }
});

// Remove/stop a torrent
ipcMain.handle('remove-torrent', async (event, infoHash) => {
  const torrent = activeTorrents.get(infoHash);
  if (torrent) {
    torrent.destroy();
    activeTorrents.delete(infoHash);
    
    // Remove from persistent storage
    removePersistentTorrent(infoHash);
    
    return { success: true };
  }
  return { success: false, error: 'Torrent not found' };
});

// File dialog handlers
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('select-download-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Wallet connection helpers
ipcMain.handle('create-temp-html', async (event, htmlContent) => {
  const tempPath = path.join(__dirname, '../temp-wallet-connect.html');
  await fs.writeFile(tempPath, htmlContent);
  return tempPath;
});

ipcMain.handle('open-external-url', async (event, url) => {
  const { shell } = require('electron');
  await shell.openExternal(url);
});

// Test DHT connection
ipcMain.handle('test-dht-connection', async () => {
  try {
    if (!client) {
      return { success: false, error: 'WebTorrent client not initialized' };
    }

    const dhtStatus = {
      success: true,
      connected: client.dht ? client.dht.ready : false,
      bootstrapNodes: client.dht ? client.dht.nodes.length : 0,
      nodeId: client.nodeId,
      torrentPort: client.torrentPort || 'random',
      dhtPort: client.dht ? client.dht.address()?.port : 'N/A',
      natUpnp: client.natUpnp || false,
      natPmp: client.natPmp || false
    };

    console.log('DHT Status:', dhtStatus);
    return dhtStatus;

  } catch (error) {
    console.error('DHT test failed:', error);
    return { success: false, error: error.message };
  }
});

// Test NAT traversal capabilities
ipcMain.handle('test-nat-traversal', async () => {
  try {
    console.log('🔧 Testing NAT traversal capabilities...');

    const results = {
      success: true,
      tests: {},
      recommendations: []
    };

    // Test 1: Port binding capability
    try {
      const net = require('net');
      const testServer = net.createServer();

      await new Promise((resolve, reject) => {
        testServer.listen(0, () => {
          const testPort = testServer.address().port;
          results.tests.portBinding = {
            success: true,
            port: testPort,
            message: 'Can bind to local ports'
          };
          testServer.close();
          resolve();
        });

        testServer.on('error', (err) => {
          results.tests.portBinding = {
            success: false,
            error: err.message,
            message: 'Cannot bind to ports - firewall may be blocking'
          };
          reject(err);
        });

        setTimeout(() => {
          testServer.close();
          reject(new Error('Port binding timeout'));
        }, 5000);
      });
    } catch (error) {
      results.tests.portBinding = {
        success: false,
        error: error.message
      };
    }

    // Test 2: DHT connectivity
    if (client && client.dht) {
      results.tests.dht = {
        success: client.dht.ready,
        nodes: client.dht.nodes.length,
        message: client.dht.ready ? 'DHT is ready' : 'DHT not ready'
      };
    } else {
      results.tests.dht = {
        success: false,
        message: 'DHT not available'
      };
    }

    // Test 3: WebTorrent client status
    if (client) {
      results.tests.webtorrent = {
        success: true,
        torrents: activeTorrents.size,
        nodeId: client.nodeId?.substring(0, 16) + '...',
        message: 'WebTorrent client active'
      };
    } else {
      results.tests.webtorrent = {
        success: false,
        message: 'WebTorrent client not initialized'
      };
    }

    // Generate recommendations
    if (!results.tests.portBinding?.success) {
      results.recommendations.push('Check firewall settings - allow P2P applications');
      results.recommendations.push('Enable UPnP on your router for automatic port forwarding');
    }

    if (!results.tests.dht?.success) {
      results.recommendations.push('Check internet connection for DHT bootstrap');
      results.recommendations.push('Ensure DHT traffic is not blocked by ISP');
    }

    if (results.tests.dht?.nodes < 5) {
      results.recommendations.push('DHT has few nodes - may affect peer discovery');
      results.recommendations.push('Try connecting to different network or restart app');
    }

    // NAT-specific recommendations
    results.recommendations.push('For cross-NAT connections:');
    results.recommendations.push('• Connect both devices to same WiFi first');
    results.recommendations.push('• Enable UPnP on router settings');
    results.recommendations.push('• Use mobile hotspot as fallback');
    results.recommendations.push('• Consider VPN service for both devices');

    return results;

  } catch (error) {
    console.error('NAT traversal test failed:', error);
    return {
      success: false,
      error: error.message,
      recommendations: [
        'Basic connectivity test failed',
        'Check internet connection and firewall settings',
        'Try restarting the application'
      ]
    };
  }
});

// Setup torrent event listeners for debugging and monitoring
function setupTorrentListeners(torrent) {
  torrent.on('wire', (wire) => {
    console.log(`New peer connected via DHT: ${wire.remoteAddress} for ${torrent.name}`);

    // Send peer connection event to renderer
    mainWindow.webContents.send('peer-connected', {
      infoHash: torrent.infoHash,
      peerAddress: wire.remoteAddress,
      totalPeers: torrent.numPeers
    });
  });

  torrent.on('noPeers', () => {
    console.log(`No peers found for ${torrent.name} - continuing DHT search...`);
    mainWindow.webContents.send('no-peers', {
      infoHash: torrent.infoHash,
      name: torrent.name
    });
  });
}

// App event handlers
app.whenReady().then(async () => {
  try {
    // Initialize persistent storage first
    initializePersistentStorage();
    
    // Initialize WebTorrent
    await initWebTorrent();
    createWebTorrentClient();

    // Wait a moment for client to be ready, then restore persistent torrents
    setTimeout(async () => {
      await restorePersistentTorrents();
    }, 2000);

    // Then create window
    createWindow();

    console.log('P2P Blockchain File Sharing started');
    console.log('WebTorrent client initialized:', {
      peerId: client.peerId,
      nodeId: client.nodeId,
      dhtEnabled: client.dht ? true : false
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Cleanup: destroy all torrents and client
  console.log('Cleaning up torrents...');
  client.destroy((err) => {
    if (err) console.error('Error destroying client:', err);
    else console.log('WebTorrent client destroyed successfully');
  });

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});