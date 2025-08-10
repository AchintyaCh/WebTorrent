import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import WebTorrentPage from './components/WebTorrentPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/webtorrent" element={<WebTorrentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
