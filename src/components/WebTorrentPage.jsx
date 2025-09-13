import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Upload, Users, HardDrive, Activity,
  Play, Pause, Square, Copy, Plus, Link,
  BarChart3, PieChart, Wifi, Clock, FileText,
  Moon, Sun, Settings, Trash2, Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import './WebTorrentPage.css';
import Footer from './Footer';

// WebTorrent will be loaded from CDN for browser compatibility
let WebTorrent = null;

// Professional Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue', animated = true }) => {
  return (
    <motion.div
      className={`stat-card stat-card-${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="stat-card-header">
        <div className="stat-icon">
          <Icon size={24} />
        </div>
        <div className="stat-trend">
          {trend && (
            <span className={`trend trend-${trend.type}`}>
              {trend.value}
            </span>
          )}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">
          {animated ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={value}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.span>
          ) : (
            value
          )}
        </div>
        <p className="stat-subtitle">{subtitle}</p>
      </div>
    </motion.div>
  );
};

// Professional Circular Progress
const CircularProgress = ({ progress, size = 80, strokeWidth = 8, color = '#3b82f6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="circular-progress-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(156, 163, 175, 0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-circle"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      <div className="progress-text">
        <motion.span
          className="progress-percentage"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </div>
  );
};

// Storage Wave Visualization
const StorageWave = ({ percentage, totalStorage, usedStorage }) => {
  const waveHeight = Math.max(10, Math.min(85, percentage));

  return (
    <div className="storage-wave-container">
      <div className="storage-wave-jar">
        <svg className="storage-wave-svg" viewBox="0 0 200 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="orangeWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f38d0e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e67e22" stopOpacity="1" />
            </linearGradient>
          </defs>
          <motion.path
            className="storage-wave-path"
            d={`M0,${300 - (waveHeight * 2.5)} Q50,${300 - (waveHeight * 2.5) - 20} 100,${300 - (waveHeight * 2.5)} T200,${300 - (waveHeight * 2.5)} L200,300 L0,300 Z`}
            fill="url(#orangeWaveGradient)"
            initial={{ d: "M0,300 Q50,300 100,300 T200,300 L200,300 L0,300 Z" }}
            animate={{
              d: [
                `M0,${300 - (waveHeight * 2.5)} Q50,${300 - (waveHeight * 2.5) - 20} 100,${300 - (waveHeight * 2.5)} T200,${300 - (waveHeight * 2.5)} L200,300 L0,300 Z`,
                `M0,${300 - (waveHeight * 2.5)} Q50,${300 - (waveHeight * 2.5) - 15} 100,${300 - (waveHeight * 2.5)} T200,${300 - (waveHeight * 2.5)} L200,300 L0,300 Z`,
                `M0,${300 - (waveHeight * 2.5)} Q50,${300 - (waveHeight * 2.5) - 25} 100,${300 - (waveHeight * 2.5)} T200,${300 - (waveHeight * 2.5)} L200,300 L0,300 Z`,
                `M0,${300 - (waveHeight * 2.5)} Q50,${300 - (waveHeight * 2.5) - 20} 100,${300 - (waveHeight * 2.5)} T200,${300 - (waveHeight * 2.5)} L200,300 L0,300 Z`
              ]
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
          {/* Second wave for more realistic effect */}
          <motion.path
            className="storage-wave-path-2"
            d={`M0,${300 - (waveHeight * 2.5) + 15} Q75,${300 - (waveHeight * 2.5) - 10} 150,${300 - (waveHeight * 2.5) + 15} T200,${300 - (waveHeight * 2.5) + 15} L200,300 L0,300 Z`}
            fill="url(#orangeWaveGradient)"
            opacity="0.6"
            animate={{
              d: [
                `M0,${300 - (waveHeight * 2.5) + 15} Q75,${300 - (waveHeight * 2.5) - 10} 150,${300 - (waveHeight * 2.5) + 15} T200,${300 - (waveHeight * 2.5) + 15} L200,300 L0,300 Z`,
                `M0,${300 - (waveHeight * 2.5) + 15} Q75,${300 - (waveHeight * 2.5) - 5} 150,${300 - (waveHeight * 2.5) + 15} T200,${300 - (waveHeight * 2.5) + 15} L200,300 L0,300 Z`,
                `M0,${300 - (waveHeight * 2.5) + 15} Q75,${300 - (waveHeight * 2.5) - 15} 150,${300 - (waveHeight * 2.5) + 15} T200,${300 - (waveHeight * 2.5) + 15} L200,300 L0,300 Z`,
                `M0,${300 - (waveHeight * 2.5) + 15} Q75,${300 - (waveHeight * 2.5) - 10} 150,${300 - (waveHeight * 2.5) + 15} T200,${300 - (waveHeight * 2.5) + 15} L200,300 L0,300 Z`
              ]
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
              delay: 0.3
            }}
          />
        </svg>
        <div className="storage-wave-overlay">
          <div className="storage-wave-text">
            <div className="storage-percentage">{percentage.toFixed(1)}%</div>
            <div className="storage-details">
              <div>{usedStorage} used</div>
              <div>of {totalStorage}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini Speed Chart Component
const MiniSpeedChart = ({ data, color = '#3b82f6', height = 40 }) => {
  return (
    <div className="mini-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="speed"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Network Visualization Component
const NetworkVisualization = ({ peerCount }) => {
  const peers = Array.from({ length: Math.min(peerCount, 12) }, (_, i) => ({
    id: i,
    angle: (i * 360) / Math.min(peerCount, 12),
    distance: 60 + Math.random() * 20
  }));

  return (
    <div className="network-viz">
      <svg width="200" height="200" className="network-svg">
        {/* Central node */}
        <motion.circle
          cx="100"
          cy="100"
          r="12"
          fill="#f38d0e"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Peer nodes */}
        {peers.map((peer, index) => {
          const x = 100 + peer.distance * Math.cos((peer.angle * Math.PI) / 180);
          const y = 100 + peer.distance * Math.sin((peer.angle * Math.PI) / 180);

          return (
            <g key={peer.id}>
              {/* Connection line */}
              <motion.line
                x1="100"
                y1="100"
                x2={x}
                y2={y}
                stroke="rgba(243, 141, 14, 0.4)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
              {/* Peer node */}
              <motion.circle
                cx={x}
                cy={y}
                r="5"
                fill="#e67e22"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              />
            </g>
          );
        })}

        {/* Pulse animation */}
        <motion.circle
          cx="100"
          cy="100"
          r="12"
          fill="none"
          stroke="#f38d0e"
          strokeWidth="2"
          initial={{ r: 12, opacity: 1 }}
          animate={{ r: 40, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      </svg>
      <div className="network-count">{peerCount} peers</div>
    </div>
  );
};

const WebTorrentPage = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [torrents, setTorrents] = useState([]);
  const [stats, setStats] = useState({
    peerCount: 0,
    downloadSpeed: '0 B/s',
    uploadSpeed: '0 B/s',
    activeTorrents: 0,
    totalDownloaded: 0,
    totalUploaded: 0,
    storageUsed: 0,
    sessionTime: 0
  });
  const [speedHistory, setSpeedHistory] = useState([]);
  const [magnetLink, setMagnetLink] = useState('');
  const [magnetStatus, setMagnetStatus] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [webtorrentError, setWebtorrentError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState('share'); // Main navigation: share, download, overview
  const [activeTab, setActiveTab] = useState('downloading');
  const [activityLog, setActivityLog] = useState([]);
  const statsIntervalRef = useRef(null);
  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    // Initialize WebTorrent when the component mounts
    const initializeWebTorrent = () => {
      try {
        // Check if WebTorrent is available globally
        if (typeof window !== 'undefined' && window.WebTorrent) {
          WebTorrent = window.WebTorrent;
          const newClient = new WebTorrent();

          newClient.on('error', (err) => {
            console.error('WebTorrent error:', err);
            showNotification('Error: ' + err.message, 'error');
          });

          newClient.on('warning', (err) => {
            console.warn('WebTorrent warning:', err);
          });

          setClient(newClient);
          setIsLoading(false);

          // Start stats updates
          statsIntervalRef.current = setInterval(updateStats, 1000);
        } else {
          // Wait a bit for the script to load
          setTimeout(() => {
            if (window.WebTorrent) {
              initializeWebTorrent();
            } else {
              setWebtorrentError('WebTorrent failed to load. Please refresh the page.');
              setIsLoading(false);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error initializing WebTorrent:', error);
        setWebtorrentError('Failed to initialize WebTorrent client: ' + error.message);
        setIsLoading(false);
      }
    };

    initializeWebTorrent();

    // Cleanup on unmount
    return () => {
      try {
        if (statsIntervalRef.current) {
          clearInterval(statsIntervalRef.current);
          statsIntervalRef.current = null;
        }
        if (client) {
          // Remove all torrents before destroying
          client.torrents.forEach(torrent => {
            try {
              torrent.destroy();
            } catch (error) {
              console.warn('Error destroying torrent:', error);
            }
          });
          client.destroy();
        }
      } catch (error) {
        console.warn('Error during WebTorrent cleanup:', error);
      }
    };
  }, []);

  useEffect(() => {
    if (client) {
      updateStats();
    }
  }, [client, torrents]);

  // Additional cleanup effect to ensure WebTorrent processes are terminated
  useEffect(() => {
    return () => {
      // Clean up any remaining WebTorrent references
      try {
        if (window.WebTorrent && window.WebTorrent.WEBRTC_SUPPORT) {
          // Force cleanup of any remaining WebRTC connections
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // This helps ensure WebRTC connections are properly closed
            navigator.mediaDevices.getUserMedia({ audio: false, video: false })
              .then(stream => {
                stream.getTracks().forEach(track => track.stop());
              })
              .catch(() => {
                // Ignore errors, this is just for cleanup
              });
          }
        }
      } catch (error) {
        console.warn('Error during additional cleanup:', error);
      }
    };
  }, []);

  const updateStats = () => {
    if (!client) return;

    const torrents = client.torrents || [];
    const totalDownloaded = torrents.reduce((sum, t) => sum + (t.downloaded || 0), 0);
    const totalUploaded = torrents.reduce((sum, t) => sum + (t.uploaded || 0), 0);
    const storageUsed = torrents.reduce((sum, t) => sum + (t.length || 0), 0);
    const sessionTime = Math.floor((Date.now() - sessionStartTime.current) / 1000);

    const newStats = {
      peerCount: client.numPeers || 0,
      downloadSpeed: formatSpeed(client.downloadSpeed || 0),
      uploadSpeed: formatSpeed(client.uploadSpeed || 0),
      activeTorrents: torrents.length,
      totalDownloaded,
      totalUploaded,
      storageUsed,
      sessionTime
    };

    setStats(newStats);

    // Update speed history for charts
    const now = Date.now();
    setSpeedHistory(prev => {
      const newHistory = [...prev, {
        time: now,
        downloadSpeed: client.downloadSpeed || 0,
        uploadSpeed: client.uploadSpeed || 0,
        timestamp: new Date().toLocaleTimeString()
      }];
      // Keep only last 20 data points
      return newHistory.slice(-20);
    });
  };

  const formatSpeed = (bytesPerSecond) => {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createTorrent = () => {
    if (!client) {
      showNotification('WebTorrent client not initialized', 'error');
      return;
    }

    if (selectedFiles.length === 0) {
      showNotification('Please select files to share', 'error');
      return;
    }

    client.seed(selectedFiles, (torrent) => {
      console.log('Torrent created:', torrent.magnetURI);
      setMagnetLink(torrent.magnetURI);
      addTorrentToList(torrent, 'seeding');
      setSelectedFiles([]);
      showNotification('Torrent created successfully!');
    });
  };

  const addTorrent = () => {
    if (!client) {
      showNotification('WebTorrent client not initialized', 'error');
      return;
    }

    const magnetURI = magnetLink.trim();

    if (!magnetURI) {
      showNotification('Please enter a magnet link', 'error');
      return;
    }

    if (!magnetURI.startsWith('magnet:?')) {
      showNotification('Please enter a valid magnet link starting with "magnet:?"', 'error');
      return;
    }

    if (isTorrentAlreadyAdded(magnetURI)) {
      showNotification('This torrent is already added!', 'error');
      return;
    }

    client.add(magnetURI, (torrent) => {
      console.log('Torrent added:', torrent.name);
      addTorrentToList(torrent, 'downloading');
      setMagnetLink('');
      setMagnetStatus('');
    });
  };

  const getInfoHashFromMagnet = (magnetURI) => {
    const match = magnetURI.match(/xt=urn:btih:([a-fA-F0-9]{40})/);
    return match ? match[1].toLowerCase() : null;
  };

  const isTorrentAlreadyAdded = (magnetURI) => {
    if (!client) return false;

    const infoHash = getInfoHashFromMagnet(magnetURI);
    if (!infoHash) return false;

    return client.torrents.some(torrent =>
      torrent.infoHash === infoHash ||
      torrent.magnetURI === magnetURI
    );
  };

  const checkMagnetLink = () => {
    const magnetURI = magnetLink.trim();

    if (!magnetURI) {
      setMagnetStatus('');
      return;
    }

    if (!magnetURI.startsWith('magnet:?')) {
      setMagnetStatus('⚠️ Invalid magnet link format');
      return;
    }

    if (isTorrentAlreadyAdded(magnetURI)) {
      setMagnetStatus('⚠️ This torrent is already added');
      return;
    }

    setMagnetStatus('✅ Valid magnet link - ready to add');
  };

  const addTorrentToList = (torrent, type) => {
    const newTorrent = {
      id: torrent.infoHash,
      torrent: torrent,
      type: type,
      name: torrent.name,
      progress: torrent.progress,
      downloaded: torrent.downloaded,
      length: torrent.length,
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      numPeers: torrent.numPeers,
      speedHistory: []
    };

    setTorrents(prev => [...prev, newTorrent]);
    addActivityLog(`${type === 'downloading' ? 'Started downloading' : 'Started seeding'} "${torrent.name}"`, 'success');

    // Handle torrent completion
    torrent.on('done', () => {
      console.log('Torrent completed:', torrent.name);
      addActivityLog(`Completed download of "${torrent.name}"`, 'success');
      downloadTorrentFiles(torrent);

      setTorrents(prev => prev.map(t =>
        t.id === torrent.infoHash
          ? { ...t, type: 'seeding' }
          : t
      ));
    });
  };

  const removeTorrent = (infoHash) => {
    if (!client) return;

    const torrent = client.get(infoHash);
    if (torrent) {
      client.remove(torrent);
      setTorrents(prev => prev.filter(t => t.id !== infoHash));
      showNotification('Torrent removed');
    }
  };

  const downloadTorrentFiles = (torrent) => {
    if (!torrent || !torrent.files || torrent.files.length === 0) {
      showNotification('No files found in torrent', 'error');
      return;
    }

    showNotification(`Starting download of ${torrent.files.length} file(s)...`);

    torrent.files.forEach((file) => {
      file.getBlobURL((err, url) => {
        if (err) {
          showNotification(`Error downloading ${file.name}`, 'error');
          return;
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.style.display = 'none';

        document.body.appendChild(a);

        try {
          a.click();
          showNotification(`Download started: ${file.name}`);
        } catch (error) {
          window.open(url, '_blank');
          showNotification(`Opened ${file.name} in new tab`, 'error');
        }

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1000);
      });
    });
  };

  const downloadTorrent = (infoHash) => {
    if (!client) return;

    const torrent = client.get(infoHash);
    if (torrent && torrent.files.length > 0) {
      downloadTorrentFiles(torrent);
    }
  };

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const addActivityLog = (message, type = 'info') => {
    const logEntry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setActivityLog(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
  };

  const handleFileSelect = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const clearMagnetInput = () => {
    setMagnetLink('');
    setMagnetStatus('');
    showNotification('Magnet link cleared');
  };

  const copyMagnetLink = () => {
    if (magnetLink) {
      navigator.clipboard.writeText(magnetLink).then(() => {
        showNotification('Magnet link copied to clipboard!');
      }).catch(() => {
        showNotification('Failed to copy magnet link', 'error');
      });
    }
  };

  const downloadingTorrents = torrents.filter(t => t.type === 'downloading');
  const seedingTorrents = torrents.filter(t => t.type === 'seeding');

  // Show loading state
  if (isLoading) {
    return (
      <div className="webtorrent-container">
        <div className="container">
          <div className="header">
            <h1>WebTorrent P2P File Share</h1>
            <p>Cross-firewall file sharing with WebTorrent</p>
            <button className="btn-back" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
          <div className="content">
            <div className="section">
              <h3>⏳ Loading WebTorrent...</h3>
              <div className="loading-container">
                <div className="loading-spinner">🔄</div>
                <p>Initializing WebTorrent client...</p>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if WebTorrent failed to load
  if (webtorrentError) {
    return (
      <div className="webtorrent-container">
        <div className="container">
          <div className="header">
            <h1>WebTorrent P2P File Share</h1>
            <p>Cross-firewall file sharing with WebTorrent</p>
            <button className="btn-back" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
          <div className="content">
            <div className="section">
              <h3>❌ WebTorrent Error</h3>
              <div style={{ color: '#dc3545', padding: '20px', background: '#f8d7da', borderRadius: '8px' }}>
                <p><strong>Error:</strong> {webtorrentError}</p>
                <p>Please try refreshing the page or check your internet connection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Header */}
        <motion.header
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/')}>
              <Activity size={20} />
              Back to Home
            </button>
            <div className="header-title">
              <h1>WebTorrent Dashboard</h1>
              <p>Professional P2P monitoring & analytics</p>
            </div>
          </div>
          <div className="header-right">
            <ThemeToggle variant="header" />

          </div>
        </motion.header>

        <div className="dashboard-content">
          {/* Stats Overview */}
          <section className="stats-section">
            <div className="stats-grid">
              <StatCard
                title="Connected Peers"
                value={(stats.peerCount || 0).toLocaleString()}
                subtitle="Active connections"
                icon={Users}
                trend={{ type: 'positive', value: '+5.2%' }}
                color="blue"
              />
              <StatCard
                title="Download Speed"
                value={stats.downloadSpeed || '0 B/s'}
                subtitle="Current rate"
                icon={Download}
                trend={{ type: 'neutral', value: 'Real-time' }}
                color="green"
              />
              <StatCard
                title="Upload Speed"
                value={stats.uploadSpeed || '0 B/s'}
                subtitle="Current rate"
                icon={Upload}
                trend={{ type: 'positive', value: '+12.3%' }}
                color="purple"
              />
              <StatCard
                title="Active Torrents"
                value={stats.activeTorrents || 0}
                subtitle="Currently managed"
                icon={Activity}
                trend={{ type: 'positive', value: 'Stable' }}
                color="orange"
              />
            </div>
          </section>

          {/* Main Dashboard Grid */}
          <div className="main-grid">
            {/* Left Column */}
            <div className="left-column">
              {/* Network Activity Chart */}
              <motion.div
                className="dashboard-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <BarChart3 size={20} />
                    <h3>Network Activity</h3>
                  </div>
                  <div className="card-subtitle">Real-time bandwidth monitoring</div>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={speedHistory}>
                      <defs>
                        <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="timestamp" hide />
                      <YAxis hide />
                      <Area
                        type="monotone"
                        dataKey="downloadSpeed"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="url(#downloadGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="uploadSpeed"
                        stackId="2"
                        stroke="#10b981"
                        fill="url(#uploadGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-dot" style={{ backgroundColor: '#f38d0e' }}></div>
                      <span>Download</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot" style={{ backgroundColor: '#ffffff' }}></div>
                      <span>Upload</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Torrent Management */}
              <motion.div
                className="dashboard-card torrent-management"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <FileText size={20} />
                    <h3>Torrent Management</h3>
                  </div>
                  <div className="tab-navigation">
                    <button
                      className={`tab-btn ${activeTab === 'downloading' ? 'active' : ''}`}
                      onClick={() => setActiveTab('downloading')}
                    >
                      <Download size={16} />
                      Downloading ({downloadingTorrents.length})
                    </button>
                    <button
                      className={`tab-btn ${activeTab === 'seeding' ? 'active' : ''}`}
                      onClick={() => setActiveTab('seeding')}
                    >
                      <Upload size={16} />
                      Seeding ({seedingTorrents.length})
                    </button>
                  </div>
                </div>
                <div className="torrent-list">
                  <AnimatePresence mode="wait">
                    {activeTab === 'downloading' && (
                      <motion.div
                        key="downloading"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {downloadingTorrents.length > 0 ? (
                          downloadingTorrents.map((torrent) => (
                            <TorrentCard
                              key={torrent.id}
                              torrent={torrent}
                              onRemove={removeTorrent}
                              onDownload={downloadTorrent}
                              formatBytes={formatBytes}
                              formatSpeed={formatSpeed}
                              type="downloading"
                            />
                          ))
                        ) : (
                          <div className="empty-state">
                            <Download size={48} />
                            <h4>No active downloads</h4>
                            <p>Add a magnet link to start downloading</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                    {activeTab === 'seeding' && (
                      <motion.div
                        key="seeding"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {seedingTorrents.length > 0 ? (
                          seedingTorrents.map((torrent) => (
                            <TorrentCard
                              key={torrent.id}
                              torrent={torrent}
                              onRemove={removeTorrent}
                              onDownload={downloadTorrent}
                              formatBytes={formatBytes}
                              formatSpeed={formatSpeed}
                              type="seeding"
                            />
                          ))
                        ) : (
                          <div className="empty-state">
                            <Upload size={48} />
                            <h4>No active seeds</h4>
                            <p>Create a torrent to start seeding</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Storage Visualization */}
              <motion.div
                className="dashboard-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <HardDrive size={20} />
                    <h3>Storage Usage</h3>
                  </div>
                  <div className="card-subtitle">Wave visualization</div>
                </div>
                <div className="storage-wave-section">
                  <StorageWave
                    percentage={(stats.storageUsed / (1024 ** 3)) * 100}
                    totalStorage="1TB"
                    usedStorage={formatBytes(stats.storageUsed || 0)}
                  />
                </div>
              </motion.div>

              {/* Network Visualization */}
              <motion.div
                className="dashboard-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <Wifi size={20} />
                    <h3>Network Map</h3>
                  </div>
                  <div className="card-subtitle">Peer connections</div>
                </div>
                <div className="network-section">
                  <NetworkVisualization peerCount={stats.peerCount} />
                </div>
              </motion.div>

              {/* Activity Log */}
              <motion.div
                className="dashboard-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <Activity size={20} />
                    <h3>Activity Feed</h3>
                  </div>
                  <div className="card-subtitle">Real-time events</div>
                </div>
                <div className="activity-log">
                  {activityLog.length > 0 ? (
                    activityLog.slice(0, 10).map((log) => (
                      <motion.div
                        key={log.id}
                        className={`log-entry log-${log.type}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="log-time">{log.timestamp}</div>
                        <div className="log-message">{log.message}</div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="empty-log">
                      <Activity size={24} />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Control Panel */}
          <motion.section
            className="control-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="control-grid">
              <div className="control-card">
                <div className="control-header">
                  <div className="control-title">
                    <Plus size={20} />
                    <h3>Share Files</h3>
                  </div>
                  <p>Create new torrent</p>
                </div>
                <div className="control-content">
                  <div className="file-upload-area">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      accept="*/*"
                      className="file-input"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="file-upload-label">
                      <Plus size={24} />
                      <span>Choose Files</span>
                      <small>Select files to share</small>
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="selected-files">
                      <p>{selectedFiles.length} file(s) selected</p>
                      <button
                        onClick={createTorrent}
                        disabled={!client}
                        className="btn-primary"
                      >
                        <Upload size={16} />
                        Create Torrent
                      </button>
                    </div>
                  )}
                  {magnetLink && (
                    <motion.div
                      className="magnet-output"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="magnet-header">
                        <span>Generated Magnet Link:</span>
                        <button
                          className="btn-copy"
                          onClick={copyMagnetLink}
                          title="Copy to clipboard"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <textarea
                        value={magnetLink}
                        readOnly
                        rows={3}
                        className="magnet-textarea"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="control-card">
                <div className="control-header">
                  <div className="control-title">
                    <Link size={20} />
                    <h3>Add Torrent</h3>
                  </div>
                  <p>Join existing torrent</p>
                </div>
                <div className="control-content">
                  <div className="magnet-input-area">
                    <input
                      type="text"
                      placeholder="Paste magnet link here..."
                      value={magnetLink}
                      onChange={(e) => {
                        setMagnetLink(e.target.value);
                        checkMagnetLink();
                      }}
                      className="magnet-input-large"
                    />
                    {magnetStatus && (
                      <motion.div
                        className={`magnet-status ${magnetStatus.includes('✅') ? 'valid' : 'invalid'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {magnetStatus}
                      </motion.div>
                    )}
                    <div className="magnet-buttons">
                      <button
                        onClick={addTorrent}
                        disabled={!magnetLink.trim() || !client}
                        className="btn-primary"
                      >
                        <Download size={16} />
                        Add Torrent
                      </button>
                      <button onClick={clearMagnetInput} className="btn-secondary">
                        Clear Input
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>


        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={`notification notification-${notification.type}`}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <div className="notification-content">
              {notification.type === 'success' && <Eye size={20} />}
              {notification.type === 'error' && <Trash2 size={20} />}
              <span>{notification.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

// Enhanced TorrentCard component with circular progress and better data visualization
const TorrentCard = ({ torrent, onRemove, onDownload, formatBytes, formatSpeed, type }) => {
  const [torrentInfo, setTorrentInfo] = useState({
    progress: torrent.progress || 0,
    downloaded: torrent.downloaded || 0,
    length: torrent.length || 0,
    downloadSpeed: torrent.downloadSpeed || 0,
    uploadSpeed: torrent.uploadSpeed || 0,
    numPeers: torrent.numPeers || 0,
    created: (torrent.torrent && torrent.torrent.created) || new Date()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (torrent.torrent) {
        setTorrentInfo({
          progress: torrent.torrent.progress || 0,
          downloaded: torrent.torrent.downloaded || 0,
          length: torrent.torrent.length || 0,
          downloadSpeed: torrent.torrent.downloadSpeed || 0,
          uploadSpeed: torrent.torrent.uploadSpeed || 0,
          numPeers: torrent.torrent.numPeers || 0,
          created: torrent.torrent.created || new Date()
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [torrent.torrent]);

  const progress = (torrentInfo.progress || 0) * 100;
  const isSeeding = type === 'seeding';
  const speed = isSeeding ? (torrentInfo.uploadSpeed || 0) : (torrentInfo.downloadSpeed || 0);
  const speedFormatted = formatSpeed(speed);
  const createdDate = new Date(torrentInfo.created || new Date()).toLocaleDateString();

  return (
    <div className={`torrent-card ${type}`}>
      <div className="torrent-card-header">
        <div className="torrent-title">
          <h4>{torrent.name || 'Unknown'}</h4>
          <div className="torrent-meta">
            <span className="meta-item">📁 {formatBytes(torrentInfo.length || 0)}</span>
            <span className="meta-item">📅 {createdDate}</span>
            <span className="meta-item">👥 {torrentInfo.numPeers || 0} peers</span>
          </div>
        </div>
        <div className="torrent-status">
          {!isSeeding && (
            <CircularProgress
              progress={progress}
              size={60}
              strokeWidth={6}
              color={type === 'downloading' ? '#4299e1' : '#48bb78'}
            />
          )}
          {isSeeding && (
            <div className="seeding-indicator">
              <div className="seeding-icon">🌱</div>
              <div className="seeding-text">SEEDING</div>
            </div>
          )}
        </div>
      </div>

      <div className="torrent-card-body">
        <div className="torrent-stats">
          <div className="stat-row">
            <div className="stat-item">
              <div className="stat-label">
                {isSeeding ? 'Total Size' : 'Downloaded'}
              </div>
              <div className="stat-value">
                {isSeeding ?
                  formatBytes(torrentInfo.length || 0) :
                  `${formatBytes(torrentInfo.downloaded || 0)} / ${formatBytes(torrentInfo.length || 0)}`
                }
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">
                {isSeeding ? 'Upload Speed' : 'Download Speed'}
              </div>
              <div className="stat-value speed">
                {isSeeding ? '↑' : '↓'} {speedFormatted}
              </div>
            </div>
          </div>

          {!isSeeding && (
            <div className="progress-section">
              <div className="progress-info">
                <span>Progress: {progress.toFixed(1)}%</span>
                <span>ETA: {progress > 0 ? 'Calculating...' : 'Unknown'}</span>
              </div>
              <div className="linear-progress">
                <div
                  className="linear-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="torrent-actions">
          <div className="action-buttons">
            {isSeeding ? (
              <>
                <button
                  className="btn-action btn-download"
                  onClick={() => onDownload(torrent.id)}
                  title="Download files"
                >
                  📥 Download
                </button>
                <button
                  className="btn-action btn-stop"
                  onClick={() => onRemove(torrent.id)}
                  title="Stop seeding"
                >
                  ⏹️ Stop
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-action btn-download"
                  onClick={() => onDownload(torrent.id)}
                  disabled={progress < 100}
                  title={progress < 100 ? 'Download in progress' : 'Download files'}
                >
                  📥 {progress < 100 ? 'Downloading...' : 'Download'}
                </button>
                <button
                  className="btn-action btn-stop"
                  onClick={() => onRemove(torrent.id)}
                  title="Stop download"
                >
                  ⏹️ Stop
                </button>
              </>
            )}
          </div>
          <div className="activity-indicator">
            <div className={`activity-dot ${speed > 0 ? 'active' : 'inactive'}`}></div>
            <span className="activity-text">
              {speed > 0 ? (isSeeding ? 'Uploading' : 'Downloading') : 'Idle'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebTorrentPage;
