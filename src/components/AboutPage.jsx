import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AboutPage.css';
import Footer from './Footer';

const AboutPage = () => {
  const navigate = useNavigate();
  return (
    <div className="about-container">
      <header className="about-header">
        <div className="brand">WebTorrent</div>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/about#about">About</Link>
          <button className="btn-open" onClick={() => navigate('/webtorrent')}>Open</button>
        </nav>
      </header>

      <main id="about" className="about-content">
        <div className="about-image-wrap">
          <img
            src="/square.png"
            alt="Peer-to-peer connections illustration"
            className="about-image"
          />
        </div>
        <div className="about-text">
          <h1 className="about-title">About This Project</h1>
          <p className="about-lead">
            WebTorrent P2P File Sharing Marketplace lets you share and fetch files directly from
            peers — no central server required. It runs entirely in your browser.
          </p>

          <h2 className="about-subtitle">Current Status</h2>
          <p>
            <strong>Phase I:</strong> This project is currently in <strong>Phase I</strong>.
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

          <h2 className="about-subtitle">Future Plans</h2>
          <ul className="about-list">
            <li>
              <strong>Phase II:</strong> Connecting Blockchain to store magnet links of files and storing file chunks in a Merkle tree, hashed using SHA-256. Blockchain will hide user IP addresses to ensure privacy and security, eliminating the need for traditional trackers. Currently, this project uses a tracker, mimicking BitTorrent's model.
            </li>
            <li>
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
