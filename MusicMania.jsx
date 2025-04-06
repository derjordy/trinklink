import React, { useState, useEffect, useRef } from 'react';
import './Lobby.css';

function MusicMania({ socket, roomId, isHost }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(10);
  const [videoId, setVideoId] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [scores, setScores] = useState([]);
  const [losers, setLosers] = useState([]);
  const [correctVideo, setCorrectVideo] = useState(null);
  const [gameState, setGameState] = useState('selection');
  const [voteCount, setVoteCount] = useState({ totalVotes: 0, totalPlayers: 0 });
  const [videoError, setVideoError] = useState(false);
  const [genre, setGenre] = useState(null);
  const [genreName, setGenreName] = useState('');
  const [genreColor, setGenreColor] = useState('#3b82f6');
  const [playerReady, setPlayerReady] = useState(false);
  
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  // Aktualisierte deutsche Musik-Genres
  const musicGenres = [
    { key: 'deutschrap', name: 'Deutscher Rap', icon: '🎤', color: '#ff9800', playlistId: 'RDGMEMKKvuhLDtb_nrDglYSihevQ' },
    { key: 'indie', name: 'Indie & Alternative', icon: '🎸', color: '#4caf50', playlistId: 'PLPZaW4n4wuhPRu2OQD5s6N6I7AFK6pZHA' },
    { key: 'musical', name: 'Musicals', icon: '🎭', color: '#e91e63', playlistId: 'PLiy0XOfUv4hGKvbULOvGBDPcYc6mOjwJX' },
    { key: 'rock', name: 'Rock', icon: '🤘', color: '#2196f3', playlistId: 'PL3485902CC4FB6C67' }
  ];

  // YouTube API laden
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
        if (videoId) {
          initializeYouTubePlayer();
        }
      };
    } else if (window.YT && window.YT.Player && videoId) {
      initializeYouTubePlayer();
    }
    
    return () => {
      // Don't remove the global callback as other components might need it
    };
  }, []);

  // YouTube-Player initialisieren wenn sowohl API als auch Video-ID vorhanden sind
  useEffect(() => {
    if (window.YT && window.YT.Player && videoId && !youtubePlayerRef.current) {
      initializeYouTubePlayer();
    }
  }, [videoId]);

  // YouTube-Player initialisieren
  const initializeYouTubePlayer = () => {
    // Sicherstellen, dass der Container existiert
    if (!document.getElementById('youtube-player')) {
      console.warn('YouTube player container not found');
      
      // Container erstellen, falls er nicht existiert
      const playerContainer = document.createElement('div');
      playerContainer.id = 'youtube-player';
      playerContainer.style.display = 'none';
      document.body.appendChild(playerContainer);
    }
    
    try {
      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          'autoplay': 1,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'modestbranding': 1,
          'rel': 0,
          'start': 30, // 30 Sekunden in das Video springen
          'origin': window.location.origin
        },
        events: {
          'onReady': onPlayerReady,
          'onError': onPlayerError,
          'onStateChange': onPlayerStateChange
        }
      });
      console.log('YouTube player initialized with video ID:', videoId);
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setVideoError(true);
    }
  };

  // YouTube-Player Event Handler
  const onPlayerReady = (event) => {
    console.log('Player ready');
    setPlayerReady(true);
    try {
      event.target.playVideo();
      // Nur 15 Sekunden abspielen
      setTimeout(() => {
        if (youtubePlayerRef.current) {
          youtubePlayerRef.current.pauseVideo();
        }
      }, 15000);
    } catch (error) {
      console.error('Error in onPlayerReady:', error);
    }
  };

  const onPlayerError = (event) => {
    console.error('YouTube Player Error:', event.data);
    setVideoError(true);
  };

  const onPlayerStateChange = (event) => {
    // Automatisch nach 15 Sekunden pausieren
    if (event.data === window.YT.PlayerState.PLAYING) {
      setTimeout(() => {
        try {
          if (youtubePlayerRef.current) {
            youtubePlayerRef.current.pauseVideo();
          }
        } catch (error) {
          console.error('Error in player state change:', error);
        }
      }, 15000);
    }
  };

  // Player beim Unmount aufräumen
  useEffect(() => {
    return () => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
        youtubePlayerRef.current = null;
      }
    };
  }, []);

  // Socket-Event-Listener
  useEffect(() => {
    // Neue Runde starten
    socket.on('music_mania_round', ({ videoId, thumbnailUrl, options, round, totalRounds, timeLeft, genreColor }) => {
      console.log('Round started:', { videoId, round });
      setGameState('playing');
      setVideoId(videoId);
      setThumbnailUrl(thumbnailUrl);
      setOptions(options);
      setCurrentRound(round);
      setTotalRounds(totalRounds);
      setTimeLeft(timeLeft);
      setSelectedOption(null);
      setVideoError(false);
      if (genreColor) setGenreColor(genreColor);
      
      // Alten Player löschen, wenn vorhanden
      if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
        try {
          youtubePlayerRef.current.destroy();
          youtubePlayerRef.current = null;
        } catch (error) {
          console.error('Error destroying previous player:', error);
        }
      }
      
      // Wenn YouTube API bereit ist, neuen Player erstellen
      if (window.YT && window.YT.Player) {
        setTimeout(() => {
          initializeYouTubePlayer();
        }, 500); // Kurze Verzögerung, um sicherzustellen, dass DOM bereit ist
      }
    });

    // Stimmabgaben-Updates
    socket.on('vote_update', (voteData) => {
      setVoteCount(voteData);
    });

    // Rundenergebnis
    socket.on('round_result', ({ correctVideo, losers, scores }) => {
      console.log('Round result:', { correctVideo, losers, scores });
      setGameState('result');
      setCorrectVideo(correctVideo);
      setLosers(losers);
      setScores(scores);
      
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.pauseVideo();
        } catch (error) {
          console.error('Error pausing video on result:', error);
        }
      }
    });

    // Spiel beendet
    socket.on('game_finished', ({ scores, losers, correctVideo }) => {
      console.log('Game finished:', { scores, losers });
      setGameState('scoreboard');
      setScores(scores);
      setLosers(losers);
      setCorrectVideo(correctVideo);
      
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.pauseVideo();
        } catch (error) {
          console.error('Error pausing video on game end:', error);
        }
      }
    });
    
    // Genre-Auswahl
    socket.on('genre_selected', ({ genre, genreName, genreColor }) => {
      setGenre(genre);
      setGenreName(genreName);
      if (genreColor) setGenreColor(genreColor);
    });

    // Event-Listener beim Unmount entfernen
    return () => {
      socket.off('music_mania_round');
      socket.off('vote_update');
      socket.off('round_result');
      socket.off('game_finished');
      socket.off('genre_selected');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [socket]);

  // Timer für den Countdown - verbesserte Implementation
  useEffect(() => {
    // Zuerst jeden bestehenden Timer löschen
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Nur einen neuen Timer starten, wenn wir im Spielzustand sind und Zeit > 0
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    // Aufräumfunktion
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, timeLeft]);

  const handleVote = (videoId) => {
    if (selectedOption || timeLeft === 0) return;
    
    setSelectedOption(videoId);
    socket.emit('music_mania_vote', { roomId, videoId, timeLeft });
  };
  
  const handleGenreSelect = (genreKey) => {
    if (!isHost) return;
    setGenre(genreKey);
    
    // Das ausgewählte Genre-Objekt finden
    const selectedGenre = musicGenres.find(g => g.key === genreKey);
    if (selectedGenre) {
      setGenreColor(selectedGenre.color);
    }
    
    socket.emit('select_genre', { 
      roomId, 
      genre: genreKey,
      playlistId: selectedGenre?.playlistId
    });
  };
  
  const handleStartGame = () => {
    if (!isHost) return;
    
    // Das ausgewählte Genre-Objekt finden, um die Playlist-ID zu erhalten
    const selectedGenre = musicGenres.find(g => g.key === genre);
    
    socket.emit('start_game', { 
      roomId, 
      mode: 'music_mania', 
      genre,
      playlistId: selectedGenre?.playlistId
    });
  };
  
  const handleBackToLobby = () => {
    window.location.reload();
  };

  // Genre-Auswahl rendern
  const renderGenreSelection = () => (
    <div className="game-mode-selection">
      <h2 style={{ color: genreColor }}>Wähle eine Musik-Kategorie</h2>
      <div className="game-mode-options">
        {musicGenres.map(g => (
          <div 
            key={g.key}
            className={`game-mode-card ${genre === g.key ? 'selected' : ''}`}
            style={{ 
              borderColor: genre === g.key ? g.color : 'transparent',
              boxShadow: genre === g.key ? `0 8px 16px ${g.color}30` : 'none' 
            }}
            onClick={() => handleGenreSelect(g.key)}
          >
            <div 
              className="game-mode-image"
              style={{ backgroundColor: g.color }}
            >
              {g.icon}
            </div>
            <div className="game-mode-content">
              <h3 style={{ color: g.color }}>{g.name}</h3>
              <p style={{ color: '#4b5563' }}>Musik aus dem Genre {g.name}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="start-game" 
        onClick={handleStartGame}
        disabled={!genre}
        style={{ 
          backgroundColor: genre ? genreColor : '#9ca3af',
          boxShadow: genre ? `0 4px 12px ${genreColor}40` : 'none'
        }}
      >
        Spiel starten
      </button>
    </div>
  );

  // Spielbildschirm rendern
  const renderGameScreen = () => (
    <div className="game-screen">
      <h2 style={{ color: genreColor }}>Runde {currentRound}/{totalRounds} - {genreName}</h2>
      
      {/* Versteckter YouTube-Player-Container */}
      <div id="youtube-player" style={{ position: 'absolute', left: '-9999px', height: '1px', width: '1px' }}></div>
      
      {videoError && <div className="error-message">Fehler beim Laden des Videos!</div>}
      
      <div className="song-display">
        {thumbnailUrl && (
          <div className="cover-art">
            <img src={thumbnailUrl} alt="Video Thumbnail" />
          </div>
        )}
        {!thumbnailUrl && (
          <div className="cover-placeholder" style={{ backgroundColor: genreColor }}>
            🎵
          </div>
        )}
      </div>
      
      <div className="timer" style={{ color: timeLeft < 5 ? '#ef4444' : genreColor }}>
        Verbleibende Zeit: {timeLeft}s
      </div>
      
      <div className="voting-bar">
        <div
          className="voting-fill"
          style={{ 
            width: `${(timeLeft / 15) * 100}%`,
            background: `linear-gradient(to right, ${genreColor}, ${genreColor}bb)`
          }}
        ></div>
      </div>
      
      <div className="voting-progress" style={{ color: '#4b5563' }}>
        {voteCount.totalVotes}/{voteCount.totalPlayers} Spieler haben abgestimmt
      </div>
      
      <div className="player-options">
        {options.map(opt => (
          <button
            key={opt.id}
            className={`player-option ${selectedOption === opt.id ? 'selected' : ''}`}
            style={{ 
              borderColor: selectedOption === opt.id ? genreColor : '#e5e7eb',
              backgroundColor: selectedOption === opt.id ? `${genreColor}10` : 'white',
              color: '#333333'
            }}
            onClick={() => handleVote(opt.id)}
            disabled={selectedOption !== null}
          >
            {opt.title} - {opt.artist}
          </button>
        ))}
      </div>
    </div>
  );

  // Ergebnis-Bildschirm rendern
  const renderResultScreen = () => (
    <div className="game-screen result">
      <h2 style={{ color: genreColor }}>Ergebnis Runde {currentRound}</h2>
      
      <div className="correct-answer">
        <h3 style={{ color: '#065f46' }}>Der richtige Song war:</h3>
        <div className="song-info" style={{ color: '#333333' }}>
          <strong>{correctVideo?.title}</strong> von {correctVideo?.artist}
        </div>
      </div>
      
      {losers.length > 0 && (
        <div className="losers">
          <h3 style={{ color: '#b91c1c' }}>Diese Spieler müssen trinken:</h3>
          <ul>
            {losers.map(player => (
              <li key={player} style={{ color: '#333333' }}>{player}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="current-scores">
        <h3 style={{ color: '#1f2937' }}>Aktuelle Punktzahl:</h3>
        <ul>
          {scores.map((s, index) => (
            <li key={index} style={{ color: '#333333' }}>
              {s.name}: {s.score} Punkte
              {index === 0 && <span className="leader-badge">👑</span>}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="next-round-info" style={{ color: '#4b5563' }}>
        Nächste Runde startet in wenigen Sekunden...
      </div>
    </div>
  );

  // Spielstand-Bildschirm rendern
  const renderScoreboard = () => (
    <div className="game-screen scoreboard">
      <h2 style={{ color: genreColor }}>Spiel beendet!</h2>
      
      <div className="winner-announcement">
        <h3 style={{ color: '#b45309' }}>Gewinner: {scores[0]?.name}</h3>
        <div className="winner-crown">👑</div>
      </div>
      
      <div className="final-scores">
        <h3 style={{ color: '#1f2937' }}>Endstand:</h3>
        <ul>
          {scores.map((s, index) => (
            <li 
              key={index} 
              className={index === 0 ? 'winner' : ''}
              style={{ color: index === 0 ? '#b45309' : '#333333' }}
            >
              {index + 1}. {s.name}: {s.score} Punkte
            </li>
          ))}
        </ul>
      </div>
      
      <button 
        className="back-to-lobby" 
        onClick={handleBackToLobby}
        style={{ backgroundColor: genreColor }}
      >
        Zurück zur Lobby
      </button>
    </div>
  );

  // Je nach Spielzustand einen Bildschirm rendern
  if (gameState === 'selection') return renderGenreSelection();
  if (gameState === 'playing') return renderGameScreen();
  if (gameState === 'result') return renderResultScreen();
  if (gameState === 'scoreboard') return renderScoreboard();
  
  // Standard: Genre-Auswahl
  return renderGenreSelection();
}

export default MusicMania;