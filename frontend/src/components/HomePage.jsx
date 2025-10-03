import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "./HomePage.css";
import Footer from "./Footer";

const HomePage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const headerRef = useRef(null);
  const [showPoster, setShowPoster] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Video autoplay logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptAutoplay = async () => {
      try {
        await video.play();
      } catch (err) {
        setShowPoster(true);
      }
    };
    attemptAutoplay();
  }, []);

  // Scroll detection
  useEffect(() => {
    let isMounted = true;

    const handleScroll = () => {
      if (!isMounted) return;
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    let isMounted = true;
    const handleClickOutside = (event) => {
      if (!isMounted) return;
      if (
        isMobileMenuOpen &&
        !event.target.closest(".nav") &&
        !event.target.closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      isMounted = false;
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNavClick = () => setIsMobileMenuOpen(false);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  return (
    <div className="home-container">
      <header
        className={`site-header ${isScrolled ? "scrolled" : ""}`}
        ref={headerRef}
      >
        <div className="brand" onClick={() => navigate("/")}>
          WebTorrent
        </div>

        <nav className={`nav ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <a href="#about" onClick={handleNavClick}>
            About
          </a>
          <a href="#contact" onClick={handleNavClick}>
            Contact
          </a>
          <ThemeToggle variant="header" />
        </nav>

        <div
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
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
            Share and download files directly from peers — no central server
            required. Built with WebTorrent for secure, decentralized file
            sharing.
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/webtorrent")}
            >
              WebTorrent Version
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/blockchain")}
            >
              Blockchain Version
            </button>
          </div>
        </div>

        <div className="hero-media">
          {showPoster ? (
            <img
              className="hero-image"
              src="/p2p.jpg"
              alt="P2P device hero"
              onClick={handleVideoClick}
            />
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
