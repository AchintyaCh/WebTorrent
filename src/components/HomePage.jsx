import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const headerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const video = videoRef.current;
      if (!video) return;

      try {
        if (window.pageYOffset > 100) {
          video.play();
        } else {
          video.pause();
        }
      } catch (error) {
        console.warn('Video play error:', error);
      }
    };

    const handleScrollHeader = () => {
      setIsScrolled(window.pageYOffset > 50);
    };

    window.addEventListener('scroll', handleScrollHeader, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScrollHeader);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <div className="home-container">
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`} ref={headerRef}>
        <div className="brand" onClick={() => navigate('/')}>
          WebTorrent
        </div>
        
        <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/about#about" onClick={handleNavClick}>About</Link>
          <a href="#contact" onClick={handleNavClick}>Contact</a>
          <button className="btn-open" onClick={() => {
            handleNavClick();
            navigate('/webtorrent');
          }}>
            Open
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
              onClick={() => navigate('/webtorrent')}
            >
              Start Sharing
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
              src="p2p.jpg" 
              alt="P2P device hero" 
              onClick={handleVideoClick}
            />
          ) : (
            <video
              className="hero-video"
              ref={videoRef}
              src="hero.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="p2p.jpg"
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
