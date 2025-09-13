import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './DownloadPage.css';
import Footer from './Footer';

const DownloadPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [detectedOS, setDetectedOS] = useState('');
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // OS Detection function
  const detectOS = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('win')) {
      return 'windows';
    } else if (userAgent.includes('mac')) {
      return 'macos';
    } else if (userAgent.includes('linux')) {
      return 'linux';
    } else {
      return 'unknown';
    }
  };

  // Get download info based on OS
  const getDownloadInfo = (os) => {
    const downloads = {
      windows: {
        name: 'WebTorrent for Windows',
        file: 'WebTorrent-Setup.exe',
        icon: '🪟',
        size: '~45 MB',
        description: 'Windows 10/11 compatible installer'
      },
      macos: {
        name: 'WebTorrent for macOS',
        file: 'WebTorrent.dmg',
        icon: '🍎',
        size: '~52 MB',
        description: 'macOS 10.15+ compatible disk image'
      },
      linux: {
        name: 'WebTorrent for Ubuntu/Debian',
        file: 'webtorrent.deb',
        icon: '🐧',
        size: '~38 MB',
        description: 'Ubuntu 18.04+ / Debian 10+ package'
      }
    };
    return downloads[os] || null;
  };

  // Start download function
  const startDownload = (filename) => {
    try {
      const link = document.createElement('a');
      link.href = `/downloads/${filename}`;
      link.download = filename;
      link.style.display = 'none';
      
      // Add error handling for the download
      link.onerror = () => {
        setDownloadError(`File ${filename} not found. Please contact support.`);
        setDownloadStarted(false);
      };
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadStarted(true);
      setDownloadError('');
      
      // Show success message and redirect after delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError('Failed to start download. Please try again.');
      setDownloadStarted(false);
    }
  };

  useEffect(() => {
    const os = detectOS();
    setDetectedOS(os);
    
    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Auto-start download after a short delay
    const timer = setTimeout(() => {
      const downloadInfo = getDownloadInfo(os);
      if (downloadInfo) {
        startDownload(downloadInfo.file);
      } else {
        setDownloadError('Your operating system is not supported yet.');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isDarkMode]);

  const downloadInfo = getDownloadInfo(detectedOS);
  const allDownloads = ['windows', 'macos', 'linux'].map(os => ({
    os,
    ...getDownloadInfo(os)
  }));

  return (
    <div className="download-container">
      {/* Header */}
      <header className="download-header">
        <div className="header-content">
          <div className="header-left">
            <div className="brand" onClick={() => navigate('/')}>
              WebTorrent
            </div>
          </div>
          <div className="header-right">
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button className="btn-back" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="download-main">
        <div className="download-content">
          {!downloadStarted && !downloadError && (
            <div className="download-preparing">
              <div className="download-spinner">⬇️</div>
              <h1>Preparing Your Download</h1>
              <p>Detecting your operating system and preparing the download...</p>
              {detectedOS && downloadInfo && (
                <div className="detected-os">
                  <span className="os-icon">{downloadInfo.icon}</span>
                  <span>Detected: {downloadInfo.name}</span>
                </div>
              )}
            </div>
          )}

          {downloadStarted && (
            <div className="download-success">
              <div className="success-icon">✅</div>
              <h1>Download Started!</h1>
              <p>Your WebTorrent download has begun.</p>
              {downloadInfo && (
                <div className="download-details">
                  <div className="download-item">
                    <span className="item-icon">{downloadInfo.icon}</span>
                    <div className="item-info">
                      <div className="item-name">{downloadInfo.name}</div>
                      <div className="item-meta">{downloadInfo.size} • {downloadInfo.description}</div>
                    </div>
                  </div>
                </div>
              )}
              <p className="redirect-notice">Redirecting to home page in a few seconds...</p>
            </div>
          )}

          {downloadError && (
            <div className="download-error">
              <div className="error-icon">❌</div>
              <h1>Download Error</h1>
              <p>{downloadError}</p>
              <button className="btn-retry" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {/* Manual Download Options */}
          <div className="manual-downloads">
            <h2>Manual Download Options</h2>
            <p>Choose your operating system to download manually:</p>
            
            <div className="download-grid">
              {allDownloads.map(({ os, name, file, icon, size, description }) => (
                <div key={os} className={`download-card ${detectedOS === os ? 'recommended' : ''}`}>
                  <div className="card-header">
                    <span className="card-icon">{icon}</span>
                    <div className="card-title">
                      <h3>{name}</h3>
                      {detectedOS === os && <span className="recommended-badge">Recommended</span>}
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">Size:</span>
                      <span className="detail-value">{size}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Requirements:</span>
                      <span className="detail-value">{description}</span>
                    </div>
                  </div>
                  <button 
                    className="btn-download"
                    onClick={() => startDownload(file)}
                  >
                    <span>⬇️</span>
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="download-info">
            <h3>Installation Instructions</h3>
            <div className="info-grid">
              <div className="info-item">
                <h4>🪟 Windows</h4>
                <p>Run the .exe installer and follow the setup wizard. Windows Defender may show a warning for unsigned apps.</p>
              </div>
              <div className="info-item">
                <h4>🍎 macOS</h4>
                <p>Open the .dmg file and drag WebTorrent to your Applications folder. You may need to allow the app in System Preferences &gt; Security.</p>
              </div>
              <div className="info-item">
                <h4>🐧 Linux</h4>
                <p>Install using: <code>sudo dpkg -i webtorrent.deb</code> or double-click the .deb file in your file manager.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadPage;