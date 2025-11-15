import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './HomePage.css';
import Footer from './Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const headerRef = useRef(null);
  const [showPoster, setShowPoster] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const handleScroll = () => {
      if (!isMounted) return;

      try {
        const scrolled = window.scrollY > 50;
        setIsScrolled(scrolled);
      } catch (error) {
        console.warn('Scroll event error:', error);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      isMounted = false;
      try {
        window.removeEventListener('scroll', handleScroll);
      } catch (error) {
        console.warn('Error removing scroll listener:', error);
      }
    };
  }, []);

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

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleMarketplaceClick = () => {
    // Navigate to the integrated blockchain marketplace
    navigate('/blockchain');
  };

  return (
    <div className="home-container">
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`} ref={headerRef}>
        <div className="brand" onClick={() => navigate('/')}>
          WebTorrent
        </div>

        <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/about#about" onClick={handleNavClick}>About</Link>
          <a href="#contact" onClick={handleNavClick}>Contact</a>
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

      <main className="hero">
        <div className="hero-content">
          <h1 className="headline">
            P2P File Sharing <span>Marketplace</span>
          </h1>
          <p className="hero-subtitle">
            Share and download files directly from peers — no central server required.
            Built with WebTorrent for secure, decentralized file sharing.
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={handleMarketplaceClick}
            >
              🔗 Open Blockchain Marketplace
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate('/about')}
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-media">
          {showPoster ? (
            <img
              className="hero-image"
              src="../../public/p2p.jpg"
              alt="P2P device hero"
              onClick={handleVideoClick}
            />
          ) : (
            <video
              className="hero-video"
              ref={videoRef}
              src="../../public/hero.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="../../public/p2p.jpg"
              onEnded={() => setShowPoster(true)}
              onError={() => setShowPoster(true)}
              onClick={handleVideoClick}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
