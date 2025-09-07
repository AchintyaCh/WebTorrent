import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import HomePage from "./components/HomePage";
import WebTorrentPage from "./components/WebTorrentPage";
import AboutPage from "./components/AboutPage";
import "./App.css";

// Custom hook to handle routing initialization
const useRoutingFix = () => {
  const location = useLocation();

  useEffect(() => {
    const isElectron = window?.electronAPI;
    const currentPath = location.pathname;

    console.log("Current path:", currentPath); // Add this debug log

    if (
      isElectron &&
      (currentPath.includes("index.html") ||
        currentPath.startsWith("/dist/") ||
        currentPath.startsWith("/build/") ||
        currentPath.includes("resources/app.asar"))
    ) {
      console.log("Redirecting to home from:", currentPath);
      window.history.replaceState(null, "", "/");
    }
  }, [location]);
};

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
        console.warn("Scroll event error:", error);
      }
    };

    // Use passive listener for better performance and to avoid potential issues
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => {
      isMounted = false;
      try {
        window.removeEventListener("scroll", toggleVisibility);
      } catch (error) {
        console.warn("Error removing scroll listener:", error);
      }
    };
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.warn("Error scrolling to top:", error);
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

// Main App component with routing fix
const AppContent = () => {
  useRoutingFix();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/webtorrent" element={<WebTorrentPage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* Catch all unmatched routes and redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ScrollToTop />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
