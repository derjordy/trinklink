import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';
import logo from '../assets/logo.png';
import Singleplayer from './Singleplayer';
import Multiplayer from './Multiplayer';

function Lobby() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState('home');
  const [singleplayerMode, setSingleplayerMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartSingleplayer = () => {
    setSingleplayerMode(true);
    setScreen('singleplayer');
  };

  const handleReturnFromSingleplayer = () => {
    setSingleplayerMode(false);
    setScreen('home');
  };

  const renderSplash = () => (
    <div className="splash-screen">
      <div className="splash-content">
        <img src={logo} alt="TrinkLink Logo" className="splash-logo" />
        <h1>TrinkLink</h1>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );

  const renderInitialHome = () => (
    <div className="initial-home">
      <div className="theme-toggle">
        <button 
          className="theme-button" 
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
        </button>
      </div>
      <div className="app-logo">
        <img src={logo} alt="TrinkLink Logo" />
      </div>
      <p className="welcome-text">Willkommen bei TrinkLink, dem ultimativen Trinkspiel für deine Party!</p>
      
      <div className="game-mode-options home-options">
        <div 
          className="game-mode-card"
          onClick={() => setScreen('multiplayer')}
        >
          <div className="game-mode-image">🎮</div>
          <div className="game-mode-content">
            <h3>Alle mit Handy</h3>
            <p>Spiele mit deinen Freunden in einem Raum</p>
          </div>
        </div>
        
        <div 
          className="game-mode-card"
          onClick={handleStartSingleplayer}
        >
          <div className="game-mode-image">🎲</div>
          <div className="game-mode-content">
            <h3>Ein Handy</h3>
            <p>Einfach direkt loslegen</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`lobby ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {showSplash && renderSplash()}
      
      {!showSplash && (
        <>
          {isMobile && (
            <button 
              className={`mobile-menu-button ${isMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
          
          <div className={`lobby-container ${isMenuOpen ? 'menu-open' : ''}`}>
            {screen === 'home' && renderInitialHome()}
            {screen === 'singleplayer' && (
              <Singleplayer onReturn={handleReturnFromSingleplayer} />
            )}
            {screen === 'multiplayer' && <Multiplayer />}
          </div>
        </>
      )}
    </div>
  );
}

export default Lobby;