import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BlockchainPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Load the blockchain marketplace scripts
    const loadBlockchainApp = () => {
      // Load network config
      const networkScript = document.createElement('script');
      networkScript.src = './network-config.js';
      document.head.appendChild(networkScript);

      // Load main blockchain app
      const appScript = document.createElement('script');
      appScript.src = './app-metamask-browser.js';
      document.head.appendChild(appScript);

      // Load ethers library if not already loaded
      if (!window.ethers) {
        const ethersScript = document.createElement('script');
        ethersScript.src = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js';
        document.head.appendChild(ethersScript);
      }
    };

    loadBlockchainApp();

    // Cleanup function
    return () => {
      // Remove scripts when component unmounts
      const scripts = document.querySelectorAll('script[src*="network-config"], script[src*="app-metamask-browser"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="blockchain-page">
      {/* Header with back button */}
      <header className="blockchain-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
        <h1>🔗 P2P Blockchain File Sharing</h1>
        <p className="subtitle">Decentralized • Tracker-less • Blockchain-powered</p>
      </header>

      {/* This div will contain the blockchain marketplace content */}
      <div className="app-container">
        {/* Wallet Connection Section */}
        <section className="wallet-section">
          <div className="wallet-status" id="wallet-status">
            <button id="connect-wallet" className="btn btn-primary">🦊 Connect MetaMask (External Browser)</button>
            <button id="test-connection" className="btn btn-secondary hidden" style={{marginLeft: '10px'}}>🔧 Test Connection</button>
            <div id="wallet-info" className="wallet-info hidden">
              <span>Connected: </span>
              <span id="wallet-address"></span>
            </div>
          </div>
        </section>

        {/* Status Messages */}
        <div id="status-messages" className="status-messages">
          <div id="error-message" className="message error hidden"></div>
          <div id="success-message" className="message success hidden"></div>
          <div id="info-message" className="message info hidden"></div>
        </div>

        {/* Main Content Tabs */}
        <div className="tabs">
          <button className="tab-button active" data-tab="upload">📤 Upload & Share</button>
          <button className="tab-button" data-tab="marketplace">🛒 Marketplace</button>
          <button className="tab-button" data-tab="downloads">📥 Downloads</button>
          <button className="tab-button" data-tab="torrents">🌐 Active Torrents</button>
        </div>

        {/* Upload Tab */}
        <div id="upload-tab" className="tab-content active">
          <div className="upload-section">
            <h2>Share a File</h2>
            <div className="upload-form">
              <div className="form-group">
                <label htmlFor="file-title">Title:</label>
                <input type="text" id="file-title" placeholder="Enter file title" />
              </div>
              <div className="form-group">
                <label htmlFor="file-description">Description:</label>
                <textarea id="file-description" placeholder="Describe your file"></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="file-price">Price (ETH):</label>
                <input type="number" id="file-price" step="0.001" placeholder="0.001" />
              </div>
              <div className="form-group">
                <label>Select File:</label>
                <button id="select-file" className="btn btn-secondary">Choose File</button>
                <span id="selected-file" className="file-info"></span>
              </div>
              <button id="upload-file" className="btn btn-primary" disabled>List File on Blockchain</button>
            </div>
          </div>
        </div>

        {/* Marketplace Tab */}
        <div id="marketplace-tab" className="tab-content">
          <div className="marketplace-section">
            <h2>Available Files</h2>
            <div className="marketplace-controls">
              <button id="refresh-files" className="btn btn-secondary">🔄 Refresh</button>
              <button id="reload-marketplace" className="btn btn-primary">🔄 Reload Marketplace</button>
            </div>
            <div id="files-grid" className="files-grid">
              {/* Files will be loaded here */}
            </div>
          </div>
        </div>

        {/* Downloads Tab */}
        <div id="downloads-tab" className="tab-content">
          <div className="downloads-section">
            <h2>Download Progress</h2>
            <div className="download-controls">
              <button id="test-p2p" className="btn btn-secondary">🔧 Test P2P Connection</button>
              <button id="download-help" className="btn btn-info">❓ Download Help</button>
            </div>
            <div id="downloads-list" className="downloads-list">
              {/* Active downloads will appear here */}
            </div>
          </div>
        </div>

        {/* Active Torrents Tab */}
        <div id="torrents-tab" className="tab-content">
          <div className="torrents-section">
            <h2>Active Torrents</h2>
            <button id="refresh-torrents" className="btn btn-secondary">🔄 Refresh</button>
            <div id="torrents-list" className="torrents-list">
              {/* Active torrents will appear here */}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <div id="loading-overlay" className="loading-overlay hidden">
        <div className="loading-spinner"></div>
        <div className="loading-text">Processing...</div>
      </div>
    </div>
  );
};

export default BlockchainPage;