import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import HomePage from "./components/HomePage";
import WebTorrentPage from "./components/WebTorrentPage";
import AboutPage from "./components/AboutPage";
import Blockchain from "./components/Blockchain";
import getContract from "./contract";
import "./App.css";

// Scroll-to-top button
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Inject WebTorrent browser script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/webtorrent/webtorrent.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Check wallet on load
  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) setAccount(accounts[0]);
      }
    };
    checkWallet();
  }, []);

  // Connect wallet manually
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
      setErrorMessage("Wallet connection failed");
    }
  };

  // Contract execution wrapper
  const executeContract = async (callback) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const contract = await getContract();
      const result = await callback(contract);
      if (result.wait) await result.wait();
      alert("Transaction successful!");
      return result;
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Contract call failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  account={account}
                  connectWallet={connectWallet}
                  executeContract={executeContract}
                  loading={loading}
                />
              }
            />
            <Route
              path="/webtorrent"
              element={
                <WebTorrentPage
                  account={account}
                  connectWallet={connectWallet}
                  executeContract={executeContract}
                  loading={loading}
                />
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/blockchain"
              element={
                <Blockchain
                  account={account}
                  connectWallet={connectWallet}
                  executeContract={executeContract}
                  loading={loading}
                />
              }
            />
          </Routes>

          <ScrollToTop />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
