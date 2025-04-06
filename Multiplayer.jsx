import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Lobby.css';
import MusicMania from './MusicMania';

function Multiplayer() {
  const { roomId: urlRoomId } = useParams();

  const [socket, setSocket] = useState(null);
  const [screen, setScreen] = useState(urlRoomId ? 'join' : 'multiplayer');
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [roomId, setRoomId] = useState(() => {
    const savedRoomId = sessionStorage.getItem('roomId');
    return urlRoomId || savedRoomId || '';
  });
  const [roomCode, setRoomCode] = useState(urlRoomId || roomId || '');
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Deutsche Musik-Genres
  const musicGenres = [
    { key: 'deutschrap', name: 'Deutscher Rap', icon: '🎤', color: '#ff9800', playlistId: 'RDGMEMKKvuhLDtb_nrDglYSihevQ' },
    { key: 'indie', name: 'Indie & Alternative', icon: '🎸', color: '#4caf50', playlistId: 'PLPZaW4n4wuhPRu2OQD5s6N6I7AFK6pZHA' },
    { key: 'musical', name: 'Musicals', icon: '🎭', color: '#e91e63', playlistId: 'PLiy0XOfUv4hGKvbULOvGBDPcYc6mOjwJX' },
    { key: 'rock', name: 'Rock', icon: '🤘', color: '#2196f3', playlistId: 'PL3485902CC4FB6C67' }
  ];

  useEffect(() => {
    const newSocket = io('https://api.trinklink.de', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
    newSocket.on('connect_error', (error) => {
      setError('Verbindungsfehler zum Server.');
    });
    newSocket.on('room_created', ({ roomId, success }) => {
      if (success) {
        console.log('Room created:', roomId);
        setRoomId(roomId);
        setRoomCode(roomId);
        setScreen('room');
        sessionStorage.setItem('roomId', roomId);
      }
    });
    newSocket.on('update_participants', (participants) => {
      console.log('Participants updated:', participants);
      setParticipants(participants);
      setIsHost(participants.some(p => p.id === newSocket.id && p.name.includes('(Host)')));
    });
    newSocket.on('game_started', ({ mode, genre, genreName }) => {
      if (mode === 'music_mania') {
        console.log(`Game started with genre: ${genreName}`);
        setSelectedGenre(genre);
        setScreen('music_mania');
      }
    });
    newSocket.on('error', (msg) => setError(msg));
    newSocket.on('room_closed', () => {
      setScreen('multiplayer');
      setError('Raum wurde geschlossen');
    });
    
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleCreateRoom = () => {
    if (!playerName) {
      setError('Bitte gib deinen Namen ein');
      return;
    }
    socket.emit('create_room', { playerName });
  };

  const handleJoinRoom = () => {
    if (!playerName || !roomCode) {
      setError('Bitte gib deinen Namen und Raum-ID ein');
      return;
    }
    socket.emit('join_room', { roomId: roomCode, playerName });
    setRoomId(roomCode);
    setScreen('room');
  };

  const handleStartGame = () => {
    // Das ausgewählte Genre-Objekt finden, um die Playlist-ID zu erhalten
    const selectedGenreObj = musicGenres.find(g => g.key === selectedGenre);
    
    socket.emit('start_game', { 
      roomId, 
      mode: 'music_mania', 
      genre: selectedGenre,
      playlistId: selectedGenreObj?.playlistId
    });
  };
  
  const handleGenreSelect = (genreKey) => {
    setSelectedGenre(genreKey);
    
    // Das ausgewählte Genre-Objekt finden
    const selectedGenreObj = musicGenres.find(g => g.key === genreKey);
    
    socket.emit('select_genre', { 
      roomId, 
      genre: genreKey,
      playlistId: selectedGenreObj?.playlistId
    });
  };

  const renderMultiplayerHome = () => (
    <div className="lobby-options">
      <h2>MusicMania</h2>
      {error && <div className="error-message">{error}</div>}
      <button onClick={() => setScreen('create')}>Raum erstellen</button>
      <button onClick={() => setScreen('join')}>Raum beitreten</button>
      <button className="secondary" onClick={() => window.location.href = "/"}>Zurück</button>
    </div>
  );

  const renderCreate = () => (
    <div className="lobby-options">
      <h2>Raum erstellen</h2>
      <input
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Dein Name"
      />
      <button onClick={handleCreateRoom}>Erstellen</button>
      <button className="secondary" onClick={() => setScreen('multiplayer')}>Zurück</button>
    </div>
  );

  const renderJoin = () => (
    <div className="lobby-options">
      <h2>Raum beitreten</h2>
      <input
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder="Raum-ID"
      />
      <input
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Dein Name"
      />
      <button onClick={handleJoinRoom}>Beitreten</button>
      <button className="secondary" onClick={() => setScreen('multiplayer')}>Zurück</button>
    </div>
  );

  const renderRoom = () => (
    <div className="lobby-container">
      <div className="room-header">
        <h2 style={{ color: '#333333' }}>Raum: {roomId}</h2>
        <QRCode value={`https://trinklink.de/room/${roomId}`} size={100} />
      </div>
      
      <div className="participants-list">
        <h3 style={{ color: '#333333' }}>Spieler ({participants.length})</h3>
        <ul>
          {participants.map(p => (
            <li key={p.id} style={{ color: '#333333' }}>{p.name}</li>
          ))}
        </ul>
      </div>
      
      {isHost && (
        <div className="game-settings">
          <h3 style={{ color: '#333333' }}>Musik-Kategorie wählen</h3>
          <div className="genre-selection">
            {musicGenres.map(genre => (
              <button 
                key={genre.key}
                className={`genre-button ${selectedGenre === genre.key ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: selectedGenre === genre.key ? `${genre.color}20` : 'white',
                  borderColor: selectedGenre === genre.key ? genre.color : '#e5e7eb',
                  color: '#333333'
                }}
                onClick={() => handleGenreSelect(genre.key)}
              >
                {genre.icon} {genre.name}
              </button>
            ))}
          </div>
          
          <button 
            className="start-game" 
            onClick={handleStartGame}
            disabled={!selectedGenre}
            style={{ 
              backgroundColor: selectedGenre ? 
                musicGenres.find(g => g.key === selectedGenre)?.color || '#3b82f6' : 
                '#9ca3af'
            }}
          >
            Spiel starten - MusicMania
          </button>
        </div>
      )}
      
      {!isHost && (
        <div className="waiting-message" style={{ color: '#4b5563' }}>
          <p>Warte auf den Host, um das Spiel zu starten...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="lobby-container">
      {screen === 'multiplayer' && renderMultiplayerHome()}
      {screen === 'create' && renderCreate()}
      {screen === 'join' && renderJoin()}
      {screen === 'room' && renderRoom()}
      {screen === 'music_mania' && socket && (
        <MusicMania 
          socket={socket} 
          roomId={roomId} 
          isHost={isHost}
        />
      )}
      {error && !['create', 'join', 'room', 'multiplayer'].includes(screen) && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
}

export default Multiplayer;