import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const modes = [
    {
      id: 'webtorrent',
      icon: '🌊',
      title: 'WebTorrent Mode',
      description: 'Cross-firewall P2P file sharing with WebTorrent',
      features: [
        'Works through firewalls and NATs',
        'Standard torrent protocol',
        'Magnet link sharing',
        'Real-time speed and peer stats'
      ],
      path: '/webtorrent'
    }
  ];

  return (
    <div className="home-container">
      <div className="container">
        <div className="header">
          <h1>🌐 P2P File Share</h1>
          <p>Choose your sharing mode</p>
        </div>
        
        <div className="content">
          <div className="mode-grid">
            {modes.map((mode) => (
              <div 
                key={mode.id} 
                className="mode-card" 
                onClick={() => navigate(mode.path)}
              >
                <div className="mode-icon">{mode.icon}</div>
                <h3>{mode.title}</h3>
                <p>{mode.description}</p>
                <ul className="feature-list">
                  {mode.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <button className="btn" onClick={(e) => {
                  e.stopPropagation();
                  navigate(mode.path);
                }}>
                  Start {mode.title.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
