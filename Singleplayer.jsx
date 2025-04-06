import React, { useState, useEffect } from 'react';
import './Singleplayer.css';
import logo from '../assets/logo.png';
import SingleplayerFragen from './Singleplayer_fragen.jsx';
import SingleplayerPflicht from './SIngleplayer_pflicht.jsx';

const Singleplayer = ({ onReturn }) => {
  const [gameMode, setGameMode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Trigger fullscreen mode
  const triggerFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  // Exit fullscreen mode
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Handle exiting the game
  const handleExitGame = () => {
    exitFullscreen();
    setShowReturnConfirm(false);
    onReturn();
  };

  // Select game mode and start game
  const handleSelectMode = (mode) => {
    setGameMode(mode);
    triggerFullscreen();
  };

  // Return to mode selection
  const handleReturnToModeSelection = () => {
    setGameMode(null);
  };

  // Render game mode selection
  const renderModeSelection = () => (
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

      <h1>DrinkLink Singleplayer</h1>
      <div className="app-logo">
        <img src={logo} alt="DrinkLink Logo" />
      </div>
      <p className="welcome-text">Wähle einen Spielmodus für einen lustigen Abend!</p>
      
      <div className="game-mode-options home-options">
        <div 
          className="game-mode-card"
          onClick={() => handleSelectMode('fragen')}
        >
          <div className="game-mode-image">❓</div>
          <div className="game-mode-content">
            <h3>Fragen-Modus</h3>
            <p>Wähle Kategorien und stelle Fragen an deine Freunde. Wer nicht antworten will, muss eine Strafe annehmen!</p>
          </div>
        </div>
        
        <div 
          className="game-mode-card"
          onClick={() => handleSelectMode('pflicht')}
        >
          <div className="game-mode-image">🎯</div>
          <div className="game-mode-content">
            <h3>Pflicht-Modus</h3>
            <p>Zufällige Pflichtaufgaben für einen lustigen Abend. Trinken, Wahrheiten oder Challenges!</p>
          </div>
        </div>
      </div>
      
      <button 
        className="home-button2"
        onClick={onReturn}
      >
        Zurück zum Hauptmenü
      </button>
    </div>
  );
  
  // Return confirmation modal
  const renderReturnConfirmation = () => (
    <div className="overlay">
      <div className="return-confirm-modal">
        <div className="modal-content">
          <h3>Spiel verlassen?</h3>
          <p>Möchtest du wirklich zum Hauptmenü zurückkehren?</p>
          <div className="modal-actions">
            <button onClick={handleExitGame}>
              Ja, verlassen
            </button>
            <button 
              onClick={() => setShowReturnConfirm(false)}
              className="secondary"
            >
              Nein, weiterspielen
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`singleplayer-wrapper ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {gameMode === null && renderModeSelection()}
      
      {gameMode === 'fragen' && (
        <SingleplayerFragen 
          onReturn={handleReturnToModeSelection}
          onExit={() => setShowReturnConfirm(true)}
        />
      )}
      
      {gameMode === 'pflicht' && (
        <SingleplayerPflicht 
          onReturn={handleReturnToModeSelection}
          onExit={() => setShowReturnConfirm(true)}
        />
      )}
      
      {showReturnConfirm && renderReturnConfirmation()}
    </div>
  );
};

export default Singleplayer;