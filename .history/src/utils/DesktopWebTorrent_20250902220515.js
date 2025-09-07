import WebTorrent from 'webtorrent';

class DesktopWebTorrent {
  constructor() {
    this.client = null;
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
    this.networkInfo = null;
    this.init();
  }

  async init() {
    try {
      // Initialize WebTorrent with enhanced options for desktop
      const options = {
        // Enhanced tracker options
        tracker: {
          announce: [
            'wss://tracker.btorrent.xyz',
            'wss://tracker.openwebtorrent.com',
            'wss://tracker.fastcast.nz',
            'wss://tracker.webtorrent.io'
          ]
        },
        // Enable DHT for better peer discovery
        dht: true,
        // Enable local peer discovery
        lsd: true,
        // Enhanced WebRTC options
        webSeeds: true,
        // Allow more connections
        maxConns: 100
      };

      this.client = new WebTorrent(options);
      
      if (this.isElectron) {
        await this.setupDesktopFeatures();
      }
      
      this.setupEventHandlers();
      
    } catch (error) {
      console.error('Failed to initialize DesktopWebTorrent:', error);
      throw error;
    }
  }

  async setupDesktopFeatures() {
    try {
      // Get network information for better connectivity
      this.networkInfo = await window.electronAPI?.getNetworkInfo();
      
      // Enhanced peer discovery for desktop
      this.client.on('listening', () => {
        console.log('WebTorrent client is listening on:', this.client.address());
      });
      
    } catch (error) {
      console.warn('Desktop features setup failed:', error);
    }
  }

  setupEventHandlers() {
    this.client.on('error', (err) => {
      console.error('WebTorrent error:', err);
    });

    this.client.on('warning', (err) => {
      console.warn('WebTorrent warning:', err);
    });
  }

  // Enhanced file selection using native dialog
  async selectFiles() {
    if (this.isElectron && window.electronAPI) {
      try {
        const result = await window.electronAPI.selectFiles();
        if (!result.canceled && result.filePaths.length > 0) {
          // For Electron, we'll handle files differently
          // Return file paths for now, actual file handling will be done in the UI
          return result.filePaths;
        }
      } catch (error) {
        console.error('Error selecting files:', error);
      }
    }
    return null;
  }

  // Enhanced torrent creation with better announce list
  createTorrent(files, options = {}) {
    return new Promise((resolve, reject) => {
      const enhancedOptions = {
        announce: [
          'wss://tracker.btorrent.xyz',
          'wss://tracker.openwebtorrent.com',
          'wss://tracker.fastcast.nz',
          'wss://tracker.webtorrent.io'
        ],
        ...options
      };

      this.client.seed(files, enhancedOptions, (torrent) => {
        console.log('Torrent created:', torrent.magnetURI);
        resolve(torrent);
      });
    });
  }

  // Enhanced download with native file saving
  async downloadTorrentFiles(torrent) {
    if (!torrent || !torrent.files || torrent.files.length === 0) {
      throw new Error('No files found in torrent');
    }

    for (const file of torrent.files) {
      try {
        const buffer = await new Promise((resolve, reject) => {
          file.getBuffer((err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
          });
        });

        if (this.isElectron && window.electronAPI) {
          // Use native save dialog
          const result = await window.electronAPI.saveFile(file.name, buffer);
          if (result.success) {
            console.log(`File saved: ${result.path}`);
          }
        } else {
          // Fallback to browser download
          const blob = new Blob([buffer]);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error(`Error downloading ${file.name}:`, error);
      }
    }
  }

  addTorrent(magnetURI) {
    return new Promise((resolve, reject) => {
      this.client.add(magnetURI, (torrent) => {
        resolve(torrent);
      });
    });
  }

  removeTorrent(torrent) {
    this.client.remove(torrent);
  }

  getStats() {
    return {
      peerCount: this.client.numPeers,
      downloadSpeed: this.client.downloadSpeed,
      uploadSpeed: this.client.uploadSpeed,
      activeTorrents: this.client.torrents.length,
      networkInfo: this.networkInfo
    };
  }

  destroy() {
    if (this.client) {
      this.client.destroy();
    }
  }
}

export default DesktopWebTorrent;
