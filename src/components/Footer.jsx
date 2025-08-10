import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">WebTorrent</div>
        <nav className="footer-nav">
          <Link to="/about#about">About</Link>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy</a>
        </nav>
      </div>
      <div className="footer-bottom">© {currentYear} WebTorrent — P2P File Sharing Marketplace</div>
    </footer>
  );
};

export default Footer;


