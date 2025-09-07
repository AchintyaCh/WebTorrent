import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./WebTorrentPage.css";
import Footer from "./Footer";
import DesktopWebTorrent from "../utils/DesktopWebTorrent";
import WebTorrent from "../utils/webtorrent-browser";

const WebTorrentPage = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [torrents, setTorrents] = useState([]);
  const [stats, setStats] = useState({
    peerCount: 0,
    downloadSpeed: "0 B/s",
    uploadSpeed: "0 B/s",
    activeTorrents: 0,
  });
  const [magnetLink, setMagnetLink] = useState("");
  const [magnetStatus, setMagnetStatus] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [webtorrentError, setWebtorrentError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopClient, setDesktopClient] = useState(null);
  const statsIntervalRef = useRef(null);

  useEffect(() => {
    // Initialize WebTorrent when the component mounts
    const initializeWebTorrent = async () => {
      try {
        const client = new DesktopWebTorrent({
          dht: false, // Disable built-in DHT initially
        });
        await client.init(); // Wait for initialization
        return client;
      } catch (error) {
        console.error("Failed to initialize WebTorrent:", error);
        throw error;
      }
    };

    let isMounted = true;

    const init = async () => {
      try {
        const client = await initializeWebTorrent();
        if (isMounted) {
          setClient(client);
          setIsLoading(false);
          showNotification(
            "Desktop P2P client initialized with enhanced features!"
          );
        }
      } catch (error) {
        console.error("WebTorrent initialization failed:", error);
        setWebtorrentError(
          "Failed to initialize WebTorrent client: " + error.message
        );
        setIsLoading(false);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      isMounted = false;
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
        if (WebTorrent.WEBRTC_SUPPORT) {
          // Force cleanup of any remaining WebRTC connections
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // This helps ensure WebRTC connections are properly closed
            navigator.mediaDevices
              .getUserMedia({ audio: false, video: false })
              .then((stream) => {
                stream.getTracks().forEach((track) => track.stop());
              })
              .catch(() => {
                // Ignore errors, this is just for cleanup
              });
          }
        }
      } catch (error) {
        console.warn("Error during additional cleanup:", error);
      }
    };
  }, []);

  const updateStats = () => {
    if (!client) return;

    setStats({
      peerCount: client.numPeers,
      downloadSpeed: formatSpeed(client.downloadSpeed),
      uploadSpeed: formatSpeed(client.uploadSpeed),
      activeTorrents: client.torrents.length,
    });
  };

  const formatSpeed = (bytesPerSecond) => {
    if (bytesPerSecond === 0) return "0 B/s";
    const k = 1024;
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return (
      parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const createTorrent = async () => {
    if (!client) {
      showNotification("WebTorrent client not initialized", "error");
      return;
    }

    if (selectedFiles.length === 0) {
      showNotification("Please select files to share", "error");
      return;
    }

    try {
      const torrent = await new Promise((resolve, reject) => {
        client.seed(selectedFiles, (torrent) => {
          if (!torrent) reject(new Error("Failed to create torrent"));
          else resolve(torrent);
        });
      });

      console.log("Torrent created:", torrent.magnetURI);
      setMagnetLink(torrent.magnetURI);
      addTorrentToList(torrent, "seeding");
      setSelectedFiles([]);
      showNotification("Torrent created successfully!");
    } catch (error) {
      console.error("Error creating torrent:", error);
      showNotification("Failed to create torrent: " + error.message, "error");
    }
  };

  const addTorrent = () => {
    if (!client) {
      showNotification("WebTorrent client not initialized", "error");
      return;
    }

    const magnetURI = magnetLink.trim();

    if (!magnetURI) {
      showNotification("Please enter a magnet link", "error");
      return;
    }

    try {
      if (isTorrentAlreadyAdded(magnetURI)) {
        showNotification("This torrent is already added!", "error");
        return;
      }

      client.add(magnetURI, {}, (torrent) => {
        console.log("Torrent added:", torrent.name);
        addTorrentToList(torrent, "downloading");
        setMagnetLink("");
        setMagnetStatus("");
      });
    } catch (error) {
      console.error("Error adding torrent:", error);
      showNotification("Failed to add torrent: " + error.message, "error");
    }
  };

  const getInfoHashFromMagnet = (magnetURI) => {
    const match = magnetURI.match(/xt=urn:btih:([a-fA-F0-9]{40})/);
    return match ? match[1].toLowerCase() : null;
  };

  const isTorrentAlreadyAdded = (magnetURI) => {
    if (!client) return false;

    const infoHash = getInfoHashFromMagnet(magnetURI);
    if (!infoHash) return false;

    return client.torrents.some(
      (torrent) =>
        torrent.infoHash === infoHash || torrent.magnetURI === magnetURI
    );
  };

  const checkMagnetLink = () => {
    const magnetURI = magnetLink.trim();

    if (!magnetURI) {
      setMagnetStatus("");
      return;
    }

    if (!magnetURI.startsWith("magnet:?")) {
      setMagnetStatus("⚠️ Invalid magnet link format");
      return;
    }

    if (isTorrentAlreadyAdded(magnetURI)) {
      setMagnetStatus("⚠️ This torrent is already added");
      return;
    }

    setMagnetStatus("✅ Valid magnet link - ready to add");
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
    };

    setTorrents((prev) => [...prev, newTorrent]);

    // Handle torrent completion
    torrent.on("done", () => {
      console.log("Torrent completed:", torrent.name);
      downloadTorrentFiles(torrent);

      setTorrents((prev) =>
        prev.map((t) =>
          t.id === torrent.infoHash ? { ...t, type: "seeding" } : t
        )
      );
    });
  };

  const removeTorrent = (infoHash) => {
    if (!client) return;

    try {
      const torrent = client.get(infoHash);
      if (torrent) {
        // Remove from UI first
        setTorrents((prev) => prev.filter((t) => t.id !== infoHash));

        // Then remove from client
        client.remove(torrent, (err) => {
          if (err) {
            console.error("Error removing torrent:", err);
            showNotification("Error removing torrent", "error");
          } else {
            showNotification("Torrent removed successfully");
          }
        });
      }
    } catch (error) {
      console.error("Error in removeTorrent:", error);
      showNotification("Failed to remove torrent", "error");
    }
  };

  const downloadTorrent = (infoHash) => {
    if (!client) {
      showNotification("WebTorrent client not initialized", "error");
      return;
    }

    try {
      const torrent = client.get(infoHash);
      if (!torrent) {
        showNotification("Torrent not found", "error");
        return;
      }

      if (!torrent.files || torrent.files.length === 0) {
        showNotification("No files available in this torrent", "error");
        return;
      }

      downloadTorrentFiles(torrent);
    } catch (error) {
      console.error("Error downloading torrent:", error);
      showNotification("Failed to download torrent: " + error.message, "error");
    }
  };

  const downloadTorrentFiles = async (torrent) => {
    if (!torrent || !torrent.files || torrent.files.length === 0) {
      showNotification("No files found in torrent", "error");
      return;
    }

    showNotification(`Starting download of ${torrent.files.length} file(s)...`);

    try {
      if (isDesktop && desktopClient) {
        await desktopClient.downloadTorrentFiles(torrent);
        showNotification("Files saved using native file system!");
      } else {
        // Browser fallback
        for (const file of torrent.files) {
          try {
            await new Promise((resolve, reject) => {
              // Create array to store file chunks
              const fileChunks = [];

              // Get file stream
              const stream = file.createReadStream();

              // Handle data chunks
              stream.on("data", (chunk) => {
                fileChunks.push(chunk);
              });

              // Handle stream end
              stream.on("end", () => {
                // Create blob from chunks
                const blob = new Blob(fileChunks, {
                  type: "application/octet-stream",
                });

                // Create download URL
                const url = URL.createObjectURL(blob);

                // Create download link
                const a = document.createElement("a");
                a.href = url;
                a.download = file.name;
                a.style.display = "none";
                document.body.appendChild(a);

                try {
                  a.click();
                  showNotification(`Download started: ${file.name}`);
                  resolve();
                } catch (error) {
                  window.open(url, "_blank");
                  showNotification(`Opened ${file.name} in new tab`, "error");
                  resolve();
                } finally {
                  setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }, 1000);
                }
              });

              // Handle stream error
              stream.on("error", (err) => {
                reject(new Error(`Failed to read file: ${err.message}`));
              });
            });
          } catch (error) {
            console.error(`Error downloading file ${file.name}:`, error);
            showNotification(`Error downloading ${file.name}`, "error");
          }
        }
      }
    } catch (error) {
      console.error("Error downloading files:", error);
      showNotification("Error downloading files: " + error.message, "error");
    }
  };

  const showNotification = (message, type = "success") => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications((prev) => [...prev, notification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const handleFileSelect = async (event) => {
    if (isDesktop && desktopClient) {
      // Use native file dialog
      const files = await desktopClient.selectFiles();
      if (files) {
        setSelectedFiles(files);
        showNotification(
          `Selected ${files.length} file(s) using native dialog`
        );
      }
    } else {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const clearMagnetInput = () => {
    setMagnetLink("");
    setMagnetStatus("");
    showNotification("Magnet link cleared");
  };

  const copyMagnetLink = () => {
    if (magnetLink) {
      navigator.clipboard
        .writeText(magnetLink)
        .then(() => {
          showNotification("Magnet link copied to clipboard!");
        })
        .catch(() => {
          showNotification("Failed to copy magnet link", "error");
        });
    }
  };

  const downloadingTorrents = torrents.filter((t) => t.type === "downloading");
  const seedingTorrents = torrents.filter((t) => t.type === "seeding");

  // Show loading state
  if (isLoading) {
    return (
      <div className="webtorrent-container">
        <div className="container">
          <div className="header">
            <h1>WebTorrent P2P File Share</h1>
            <p>Cross-firewall file sharing with WebTorrent</p>
            <button className="btn-back" onClick={() => navigate("/")}>
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
            <button className="btn-back" onClick={() => navigate("/")}>
              ← Back to Home
            </button>
          </div>
          <div className="content">
            <div className="section">
              <h3>❌ WebTorrent Error</h3>
              <div
                style={{
                  color: "#dc3545",
                  padding: "20px",
                  background: "#f8d7da",
                  borderRadius: "8px",
                }}
              >
                <p>
                  <strong>Error:</strong> {webtorrentError}
                </p>
                <p>
                  Please try refreshing the page or check your internet
                  connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="webtorrent-container">
      <div className="container">
        <div className="header">
          <h1>WebTorrent P2P File Share</h1>
          <p>Cross-firewall file sharing with WebTorrent</p>
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>

        <div className="content">
          <div className="section">
            <h3>Network Stats</h3>
            <div className="stats">
              <div className="stat-card connected">
                <div className="stat-value">{stats.peerCount}</div>
                <div className="stat-label">Connected Peers</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.downloadSpeed}</div>
                <div className="stat-label">Download Speed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.uploadSpeed}</div>
                <div className="stat-label">Upload Speed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.activeTorrents}</div>
                <div className="stat-label">Active Torrents</div>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>📁 Share Files</h3>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              accept="*/*"
            />
            <button
              onClick={createTorrent}
              disabled={selectedFiles.length === 0 || !client}
            >
              Create & Share Torrent
            </button>
            {magnetLink && (
              <div className="magnet-link">
                <div className="magnet-header">
                  <strong>Magnet Link:</strong>
                  <button
                    className="btn-copy"
                    onClick={copyMagnetLink}
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                </div>
                <textarea value={magnetLink} readOnly rows={3} />
              </div>
            )}
            <div className="tip">
              <strong>💡 Tip:</strong> Files will automatically download when
              torrent completes. You can also manually trigger downloads using
              the "Download Files" button in the seeding section.
            </div>
          </div>

          <div className="section">
            <h3>Join Torrent</h3>
            <input
              type="text"
              placeholder="Paste magnet link or torrent file"
              value={magnetLink}
              onChange={(e) => {
                setMagnetLink(e.target.value);
                checkMagnetLink();
              }}
            />
            <button
              onClick={addTorrent}
              disabled={!magnetLink.trim() || !client}
            >
              Add Torrent
            </button>
            <button onClick={clearMagnetInput} className="btn-clear">
              Clear
            </button>
            {magnetStatus && (
              <div className="magnet-status">{magnetStatus}</div>
            )}
          </div>

          <div className="torrents-grid">
            <div className="torrent-list">
              <h3>Downloading Torrents</h3>
              <div className="torrent-items">
                {downloadingTorrents.map((torrent) => (
                  <TorrentItem
                    key={torrent.id}
                    torrent={torrent}
                    onRemove={removeTorrent}
                    onDownload={downloadTorrent}
                    formatBytes={formatBytes}
                    formatSpeed={formatSpeed}
                  />
                ))}
                {downloadingTorrents.length === 0 && (
                  <div className="empty-state">No downloading torrents</div>
                )}
              </div>
            </div>

            <div className="torrent-list">
              <h3>Seeding Torrents</h3>
              <div className="torrent-items">
                {seedingTorrents.map((torrent) => (
                  <TorrentItem
                    key={torrent.id}
                    torrent={torrent}
                    onRemove={removeTorrent}
                    onDownload={downloadTorrent}
                    formatBytes={formatBytes}
                    formatSpeed={formatSpeed}
                    isSeeding={true}
                  />
                ))}
                {seedingTorrents.length === 0 && (
                  <div className="empty-state">No seeding torrents</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
        >
          {notification.message}
        </div>
      ))}
      <Footer />
    </div>
  );
};

// TorrentItem component
const TorrentItem = ({
  torrent,
  onRemove,
  onDownload,
  formatBytes,
  formatSpeed,
  isSeeding,
}) => {
  const [torrentInfo, setTorrentInfo] = useState({
    progress: torrent.progress,
    downloaded: torrent.downloaded,
    length: torrent.length,
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    numPeers: torrent.numPeers,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTorrentInfo({
        progress: torrent.torrent.progress,
        downloaded: torrent.torrent.downloaded,
        length: torrent.torrent.length,
        downloadSpeed: torrent.torrent.downloadSpeed,
        uploadSpeed: torrent.torrent.uploadSpeed,
        numPeers: torrent.torrent.numPeers,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [torrent.torrent]);

  const progress = torrentInfo.progress * 100;
  const downloaded = formatBytes(torrentInfo.downloaded);
  const total = formatBytes(torrentInfo.length);
  const speed = isSeeding ? torrentInfo.uploadSpeed : torrentInfo.downloadSpeed;
  const speedFormatted = formatSpeed(speed);

  return (
    <div className="torrent-item">
      <div className="torrent-name">{torrent.name}</div>
      <div className="torrent-info">
        {!isSeeding
          ? `Downloaded: ${downloaded} / ${total} (${progress.toFixed(1)}%)`
          : `Size: ${total}`}
        <br />
        Peers: {torrentInfo.numPeers} |
        {isSeeding ? ` ↑ ${speedFormatted}` : ` ↓ ${speedFormatted}`}
      </div>
      {!isSeeding && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="torrent-actions">
        {isSeeding ? (
          <>
            <button
              className="btn-small btn-seed"
              onClick={() => onDownload(torrent.id)}
            >
              Download Files
            </button>
            <button
              className="btn-small btn-stop"
              onClick={() => onRemove(torrent.id)}
            >
              Stop
            </button>
          </>
        ) : (
          <>
            <button
              className="btn-small btn-stop"
              onClick={() => onRemove(torrent.id)}
            >
              Stop
            </button>
            <button
              className="btn-small btn-download"
              onClick={() => onDownload(torrent.id)}
              disabled={progress < 100}
            >
              Download Now
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WebTorrentPage;
