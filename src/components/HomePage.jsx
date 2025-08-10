import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import Footer from './Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const attemptAutoplay = async () => {
      try {
        await video.play();
      } catch (err) {
        // If autoplay is blocked, show the poster image
        setShowPoster(true);
      }
    };
    attemptAutoplay();
  }, []);

  return (
    <div className="home-container">
      <header className="site-header">
        <div className="brand">WebTorrent</div>
        <nav className="nav">
          <Link to="/about#about">About</Link>
          <a href="#contact">Contact</a>
          <button className="btn-open" onClick={() => navigate('/webtorrent')}>Open</button>
        </nav>
      </header>

      <main className="hero">
        <h1 className="headline">P2P File Sharing Marketplace</h1>
        {showPoster ? (
          <img className="hero-image" src="/p2p.jpg" alt="P2P device hero" />
        ) : (
          <video
            className="hero-video"
            ref={videoRef}
            src="/hero.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/p2p.jpg"
            onEnded={() => setShowPoster(true)}
            onError={() => setShowPoster(true)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
