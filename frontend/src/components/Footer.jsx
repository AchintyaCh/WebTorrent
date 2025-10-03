import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const handleBrandClick = () => {
    navigate('/');
  };

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand" onClick={handleBrandClick}>
          WebTorrent
        </div>
        <nav className="footer-nav">
          <Link to="/about#about">About</Link>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy</a>
        </nav>
      </div>
      <div className="footer-bottom">
        © {currentYear} WebTorrent — P2P File Sharing Marketplace
      </div>
    </footer>
  );
};

export default Footer;


