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

          <h2 className="about-subtitle">How it works</h2>
          <ul className="about-list">
            <li><strong>Seed files</strong>: Pick files in the app to create a torrent and start seeding.</li>
            <li><strong>Share magnet link</strong>: Send the generated magnet link to others.</li>
            <li><strong>Connect via WebRTC</strong>: Peers discover each other using trackers and connect browser-to-browser.</li>
            <li><strong>Stream and download</strong>: Pieces are exchanged in parallel, enabling fast, resilient transfers.</li>
          </ul>

          <h2 className="about-subtitle">Tech stack</h2>
          <ul className="about-list">
            <li><strong>React + Vite</strong>: Modern, fast SPA tooling and UI.</li>
            <li><strong>WebTorrent</strong>: BitTorrent for the web, powered by WebRTC in the browser.</li>
            <li><strong>WebRTC + Trackers</strong>: Peer discovery and encrypted, firewall-friendly P2P transport.</li>
            <li><strong>Vanilla CSS</strong>: Lightweight styles with a clean, accessible layout.</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;


