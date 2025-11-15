import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './AboutPage.css';
import Footer from './Footer';

const AboutPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Close mobile menu when clicking outside
    const handleClickOutside = (event) => {
      if (!isMounted) return;

      try {
        if (isMobileMenuOpen && !event.target.closest('.nav') && !event.target.closest('.mobile-menu-toggle')) {
          setIsMobileMenuOpen(false);
        }
      } catch (error) {
        console.warn('Click outside error:', error);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      isMounted = false;
      try {
        document.removeEventListener('click', handleClickOutside);
      } catch (error) {
        console.warn('Error removing click listener:', error);
      }
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleImageClick = () => {
    // Add any image interaction logic here
    console.log('About image clicked');
  };

  return (
    <div className="about-container">
      <header className="about-header">
        <div className="brand" onClick={() => navigate('/')}>
          WebTorrent
        </div>

        <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" onClick={handleNavClick}>Home</Link>
          <Link to="/about#about" onClick={handleNavClick}>About</Link>
          <ThemeToggle variant="header" />
          <button className="btn-open" onClick={() => {
            handleNavClick();
            navigate('/blockchain');
          }}>
            Open & Start Sharing
          </button>
        </nav>

        <div
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      <main id="about" className="about-content">
        <div className="about-image-wrap">
          <img
            src="../../public/square.png"
            alt="Peer-to-peer connections illustration"
            className="about-image"
            onClick={handleImageClick}
          />
        </div>

        <div className="about-text">
          <h1 className="about-title">About This Project</h1>
          <p className="about-lead">
            WebTorrent P2P File Sharing Marketplace lets you share and fetch files directly from
            peers — no central server required. It runs entirely in your browser.
          </p>
          <p>
          </p>

          <h2 className="about-subtitle">How It Works – In Detail</h2>
          <ol className="about-list">
            <li><strong>File Selection:</strong> Users choose a file in the app, which gets split into multiple smaller chunks.</li>
            <li><strong>Torrent Creation:</strong> The app creates a torrent file containing metadata about these chunks and a unique <em>magnet link</em> that identifies the file.</li>
            <li><strong>Peer Discovery:</strong> Peers find each other using WebRTC trackers, enabling direct browser-to-browser connections without a central server.</li>
            <li><strong>Chunk Exchange:</strong> Once connected, peers exchange file chunks in parallel — this speeds up the download and makes it resilient if some peers disconnect.</li>
            <li><strong>Seeding:</strong> After a user downloads all chunks, they can continue sharing them with others, keeping the file alive in the network.</li>
            <li><strong>Privacy and Security:</strong> All data is transferred over encrypted channels, protecting files from eavesdropping and tampering.</li>
          </ol>

          <ul className="about-list">
            <li>
              <strong>Phase II:</strong> Connecting Blockchain to store magnet links of files and storing file chunks in a Merkle tree, hashed using SHA-256. Blockchain will hide user IP addresses to ensure privacy and security, eliminating the need for traditional trackers. Currently, this project uses a tracker, mimicking BitTorrent's model.
            </li>
            <li>
              <h2>Future Plans</h2>
              <strong>Phase III:</strong> Creating a reward system to incentivize users who seed files, providing tangible benefits to active contributors.
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
