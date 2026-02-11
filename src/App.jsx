import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './components/HomePage';
import WebTorrentPage from './components/WebTorrentPage';
import { Analytics } from '@vercel/analytics/react';
import AboutPage from './components/AboutPage';
import './App.css';

// Scroll to top component
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const toggleVisibility = () => {
      if (!isMounted) return;
      
      try {
        if (window.pageYOffset > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.warn('Scroll event error:', error);
      }
    };

    // Use passive listener for better performance and to avoid potential issues
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    
    return () => {
      isMounted = false;
      try {
        window.removeEventListener('scroll', toggleVisibility);
      } catch (error) {
        console.warn('Error removing scroll listener:', error);
      }
    };
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      console.warn('Error scrolling to top:', error);
      // Fallback for browsers that don't support smooth scrolling
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/webtorrent" element={<WebTorrentPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
          <ScrollToTop />
           <Analytics />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
