import React, { useState, useEffect, useRef } from 'react';

const SingleplayerPflicht = ({ onReturn, onExit }) => {
  // UI Zustände
  const [showRules, setShowRules] = useState(true);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskCount, setTaskCount] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isTaskChanging, setIsTaskChanging] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [screen, setScreen] = useState('player_selection');
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const rulesTimerRef = useRef(null);
  const [usedTasks, setUsedTasks] = useState([]);

  // Kategorie Definitionen
  const taskCategories = {
    basic: {
      name: 'Basic',
      icon: '🎮',
      color: '#4361EE',
      description: 'Einfache und spaßige Aufgaben',
      tasks: [
        'Trinke 2 Schlücke',
        'Trinke 3 Schlücke',
        'Gib dein Handy für 10 Minuten an einen Mitspieler ab',
        'Erzähle eine peinliche Geschichte',
        'Mache 10 Kniebeugen',
        'Singe den Refrain deines Lieblingsliedes',
        'Zeige das peinlichste Foto auf deinem Handy',
        'Trinke ein Glas auf Ex',
        'Ahme ein Tier deiner Wahl nach',
        'Trinke einen Shot',
        'Führe einen Tanz für 30 Sekunden auf',
        'Schreibe einer Person deiner Wahl eine Nachricht (Gruppe entscheidet den Text)',
        'Spiele "Schere, Stein, Papier" gegen einen Mitspieler - der Verlierer trinkt',
        'Sprich für die nächsten 3 Minuten mit einem Akzent'
      ]
    },
    actions: {
      name: 'Aktionen',
      icon: '🏃',
      color: '#F72585',
      description: 'Körperliche Aufgaben und Herausforderungen',
      tasks: [
        'Mache 5 Liegestütze',
        'Balanciere ein Buch auf deinem Kopf und laufe durch den Raum',
        'Stehe auf einem Bein, bis du wieder dran bist',
        'Versuche für 30 Sekunden im Handstand zu stehen',
        'Tanze zu einem von der Gruppe gewählten Song',
        'Führe einen Cheerleader-Sprung vor',
        'Imitiere die Körperhaltung einer berühmten Statue',
        'Versuche, deine Ellbogen zu lecken',
        'Mache eine Kniebeuge, während du jemanden auf dem Rücken trägst',
        'Spiele Pantomime und lasse die Gruppe raten',
        'Bewege dich wie ein Roboter für die nächsten 2 Minuten',
        'Mache eine Yoga-Pose für 30 Sekunden',
        'Hüpfe wie ein Frosch durchs Zimmer',
        'Mache einen Handstand an der Wand'
      ]
    },
    extreme: {
      name: 'Extrem',
      icon: '🔥',
      color: '#FF5733',
      description: 'Herausfordernde und verrückte Aufgaben',
      tasks: [
        'Trinke ein Shotglas mit einer Mischung aus Getränken (von der Gruppe gemischt)',
        'Rufe die letzte Person in deiner Anrufliste an und singe ein Lied',
        'Lasse die Gruppe ein Wort auf deinem Arm mit einem Stift schreiben',
        'Teile ein peinliches Selfie in deiner Story',
        'Esse einen Löffel Senf/Ketchup/Mayonnaise',
        'Tausche ein Kleidungsstück mit einem Mitspieler bis zum Ende des Spiels',
        'Lasse die Gruppe eine SMS an einen deiner Kontakte verfassen',
        'Trinke aus dem Schuh eines Mitspielers',
        'Mache einen Handstand und versuche, etwas zu trinken',
        'Lasse dich für die nächste Runde mit Lebensmitteln verzieren',
        'Iss eine Kombination aus drei Lebensmitteln, die die Gruppe auswählt',
        'Trinke ein halbes Glas mit geschlossenen Augen und verbundenen Händen',
        'Führe ein 30-sekündiges Video-Interview mit einem beliebigen Objekt',
        'Führe ein 30-sekündiges Stand-up-Comedy-Set auf'
      ]
    },
    greedy: {
      name: 'Gierig',
      icon: '😈',
      color: '#FF006E',
      description: 'Versaute und freizügige Aufgaben',
      tasks: [
        // Deine ursprünglichen 20 Aufgaben
        'NAME, stelle eine Sexposition mit NAME nach, halte sie 10 Sekunden – sonst 4 Strafen',
        'NAME, setz dich auf den Schoß eines Spielers deiner Wahl – bei Weigerung 4 Strafen für euch beide',
        'NAME und NAME, sucht lange Gegenstände – wer ihn tiefer in den Mund nimmt, gewinnt, Verlierer 5 Strafen',
        'NAME, trinke einen Shot aus NAMEs Bauchnabel – sonst 3 Strafen',
        'Die Gruppe wählt: Eine Person spuckt einem anderen ein Getränk in den Mund – bei Weigerung 5 Strafen für beide, sonst 5 Strafen für die Gruppe',
        'NAME und NAME sucht euche beide einen langen Gegestand und schaut wie tief ihr ihn in den Mund bekommt - Verlierer 5 Strafen',
        'NAME stelle deine heißeste Sexerfahrung mit einem Spieler deiner Wahl nach',
        'NAME, leck einem Spieler über den Hals – sonst 3 Strafen',
        'NAME, zieh ein Kleidungsstück aus und gib es NAME zum Anziehen – sonst 4 Strafen',
        'NAME und NAME, reibt euch 10 Sekunden aneinander – Verlierer (wer aufhört) 4 Strafen',
        'NAME, gib NAME einen Kuss auf den Hintern – bei Weigerung 5 Strafen für beide',
        'NAME, wälz dich auf dem Schoß von NAME – bei Abbruch 3 Strafen',
        'NAME und NAME, tauscht Oberteile für eine Runde – Weigerung 4 Strafen',
        'NAME, beiß NAME sanft in den Oberschenkel – sonst 5 Strafen',
        'NAME, lass dir von einem Spieler deiner Wahl die Füße lecken – sonst 3 Strafen',
        'Die Gruppe wählt: NAME muss einer Person den Fuß 5 Sekunden massieren – Weigerung 5 Strafen',
        // Die weiteren 40 Aufgaben
        'NAME, leck einem Spieler über den Hals – sonst 3 Strafen',
        'NAME, zieh ein Kleidungsstück aus und gib es NAME – sonst 4 Strafen',
        'NAME und NAME, reibt euch 10 Sekunden aneinander – wer aufhört, 4 Strafen',
        'NAME, gib NAME einen Zungenkuss – bei Weigerung 5 Strafen',
        'NAME, streich einem Spieler über den Bauch – bei Abbruch 3 Strafen',
        'NAME, lass dir von NAME einen Shot zwischen die Beine gießen – sonst 4 Strafen',
        'NAME, gib einem Spieler einen Kuss auf den Hals – sonst 3 Strafen',
        'NAME, schleck NAME über die Hand – sonst 4 Strafen',
        'NAME, setz dich rittlings auf NAME – bei Weigerung 5 Strafen',
        'NAME und NAME, macht 10 Sekunden lang Kussgeräusche – wer lacht, 4 Strafen',
        'NAME, lass dir von NAME einen Shot aus der Hand trinken – sonst 3 Strafen',
        'NAME, zieh ein Kleidungsstück aus und wirf es einem Spieler zu – sonst 4 Strafen',
        'NAME, leck einem Spieler über die Finger – sonst 5 Strafen',
        'NAME und NAME, haltet euch an den Hüften fest – wer loslässt, 4 Strafen',
        'NAME, lass dir von einem Spieler deiner Wahl über den Rücken pusten – sonst 3 Strafen',
        'NAME, gieße einem Spieler einen Shot über den Arm – sonst 4 Strafen',
        'NAME, schnüffel an NAMEs Hals – bei Abbruch 5 Strafen',
        'NAME, gib NAME einen Kuss auf die Wange – sonst 3 Strafen',
        'NAME, streich NAME mit einem Finger über die Lippen – sonst 3 Strafen',
        'NAME, lass dir von einem Spieler deiner Wahl den Nacken massieren – sonst 4 Strafen',
        'NAME, spuck NAME einen Shot in den Mund – sonst 5 Strafen',
        'NAME und NAME, reibt eure Nasen aneinander – wer lacht, 4 Strafen',
        'NAME, gib einem Spieler deiner Wahleinen Zungenkuss – sonst 5 Strafen',
        'NAME, lass dir von NAME über die Beine streichen – sonst 3 Strafen',
        'Die Gruppe wählt: NAME muss NAMEs Hand 5 Sekunden halten – Weigerung 5 Strafen'
      ]
    }
  };

  // Regeln automatisch nach 3 Sekunden ausblenden
  useEffect(() => {
    if (showRules && screen === 'game') {
      rulesTimerRef.current = setTimeout(() => {
        setShowRules(false);
      }, 3000);
      
      return () => {
        if (rulesTimerRef.current) {
          clearTimeout(rulesTimerRef.current);
        }
      };
    }
  }, [showRules, screen]);

  // Spieler hinzufügen
  const addPlayer = () => {
    if (newPlayer.trim() && !players.includes(newPlayer.trim())) {
      setPlayers(prev => [...prev, newPlayer.trim()]);
      setNewPlayer('');
    }
  };

  // Spieler entfernen
  const removePlayer = (player) => {
    setPlayers(prev => prev.filter(p => p !== player));
  };

  // Kategorie auswählen
  const toggleCategorySelection = (categoryKey) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryKey)) {
        if (prev.length === 1) return prev;
        if (categoryKey === prev[0]) {
          const newThemeCategory = prev.filter(cat => cat !== categoryKey)[0];
          setCurrentTheme(taskCategories[newThemeCategory]);
        }
        return prev.filter(cat => cat !== categoryKey);
      } else {
        if (prev.length === 0) setCurrentTheme(taskCategories[categoryKey]);
        return [...prev, categoryKey];
      }
    });
  };

  // Zu Kategorien wechseln
  const goToCategorySelection = () => {
    if (players.length > 0) setScreen('category_selection');
  };

  // Spiel starten
  const startGame = () => {
    if (selectedCategories.length === 0) return;
    setScreen('game');
    setShowRules(true);
    setTaskCount(1);
    getRandomTask();
  };

  // Zufällige Aufgabe auswählen ohne Wiederholungen
  const getRandomTask = () => {
    if (selectedCategories.length === 0) return;
    
    let allTasks = [];
    selectedCategories.forEach(categoryKey => {
      allTasks = [...allTasks, ...taskCategories[categoryKey].tasks];
    });
    
    const availableTasks = allTasks.filter(task => !usedTasks.includes(task));
    if (availableTasks.length === 0) {
      setUsedTasks([]);
      allTasks.forEach(task => availableTasks.push(task));
    }
    
    const randomIndex = Math.floor(Math.random() * availableTasks.length);
    const taskTemplate = availableTasks[randomIndex];
    let newTask = taskTemplate;
    
    // Ersetze "NAME" mit zufälligen Spielern
    if (newTask.includes('NAME')) {
      const randomPlayer1 = players[Math.floor(Math.random() * players.length)];
      let randomPlayer2 = players[Math.floor(Math.random() * players.length)];
      while (randomPlayer2 === randomPlayer1 && players.length > 1) {
        randomPlayer2 = players[Math.floor(Math.random() * players.length)];
      }
      newTask = newTask.replace('NAME', randomPlayer1).replace('NAME', randomPlayer2);
    }
    
    // Speichere nur die Vorlage in usedTasks, nicht die ersetzte Aufgabe
    setUsedTasks(prev => [...prev, taskTemplate]);
    setCurrentTask(newTask);
  };

  // Nächste Aufgabe
  const handleNextTask = () => {
    setIsTaskChanging(true);
    setConfetti(true);
    
    setTimeout(() => {
      getRandomTask();
      setTaskCount(prev => prev + 1);
      setIsTaskChanging(false);
      
      setTimeout(() => {
        setConfetti(false);
      }, 1000);
    }, 300);
  };

  // Dominant color from current theme
  const getDominantColor = () => {
    if (!currentTheme) return '#4c1d95';
    return currentTheme.color;
  };

  // Create confetti elements
  const renderConfetti = () => {
    if (!confetti) return null;
    
    const confettiElements = [];
    for (let i = 0; i < 50; i++) {
      const left = Math.random() * 100;
      const animDelay = Math.random() * 2;
      const size = Math.random() * 10 + 5;
      
      confettiElements.push(
        <div 
          key={i}
          className="confetti-piece"
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
            animationDelay: `${animDelay}s`
          }}
        />
      );
    }
    
    return <div className="confetti-container">{confettiElements}</div>;
  };

  // Render player selection
  const renderPlayerSelection = () => (
    <div className="player-selection">
      <h1>Spieler hinzufügen</h1>
      <div className="player-input">
        <input
          type="text"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          placeholder="Spielername eingeben"
          onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
        />
        <button className="home-button" onClick={addPlayer} disabled={!newPlayer.trim()}>
          Hinzufügen
        </button>
      </div>
      <div className="player-list">
        {players.map((player, index) => (
          <div key={index} className="player-item">
            {player}
            <button onClick={() => removePlayer(player)}>X</button>
          </div>
        ))}
      </div>
      <div className="home-button">
        <button
          className="next-button"
          onClick={goToCategorySelection}
          disabled={players.length === 0}
          style={{
            backgroundColor: players.length > 0 ? '#4c1d95' : '#9ca3af',
          }}
        >
          {players.length > 0
            ? `Weiter zu Kategorien (${players.length} Spieler)`
            : 'Mindestens einen Spieler hinzufügen'}
        </button>
        <button
          className="home-button"
          onClick={onReturn}
          style={{ borderColor: '#4c1d95', color: '#4c1d95' }}
        >
          Zurück
        </button>
      </div>
    </div>
  );

  // Render category selection
  const renderCategorySelection = () => (
    <div className="category-selection">
      <h1>Wähle Kategorien für Pflichtaufgaben</h1>
      
      <div className="category-cards">
        {Object.entries(taskCategories).map(([key, category]) => (
          <div 
            key={key}
            className={`category-card ${selectedCategories.includes(key) ? 'selected' : ''}`}
            style={{ 
              borderColor: selectedCategories.includes(key) ? category.color : 'transparent',
              background: `linear-gradient(to bottom right, white, ${category.color}20)`,
            }}
            onClick={() => toggleCategorySelection(key)}
          >
            <div className="category-icon" style={{ backgroundColor: category.color }}>
              {category.icon}
            </div>
            <div className="category-content">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </div>
            
            {selectedCategories.includes(key) && (
              <div className="category-selected-badge" style={{ backgroundColor: category.color }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="category-actions">
        <button 
          className="start-game-button"
          onClick={startGame}
          disabled={selectedCategories.length === 0}
          style={{ 
            backgroundColor: selectedCategories.length > 0 ? getDominantColor() : '#9ca3af',
          }}
        >
          {selectedCategories.length > 0 
            ? `Spiel starten (${selectedCategories.length} ${selectedCategories.length === 1 ? 'Kategorie' : 'Kategorien'})`
            : 'Wähle mindestens eine Kategorie'}
        </button>
        
        <button 
          className="home-button"
          onClick={() => setScreen('player_selection')}
          style={{ 
            borderColor: getDominantColor(), 
            color: getDominantColor() 
          }}
        >
          Zurück zu Spielern
        </button>
      </div>
    </div>
  );

  // Render game screen
  const renderGame = () => (
    <div 
      className="singleplayer-container"
      style={{ 
        "--dominant-color": getDominantColor(),
        "--secondary-color": currentTheme ? currentTheme.color : "#4c1d95" 
      }}
    >
      <div className="singleplayer-header">
        <h1>DrinkLink - Pflichtmodus</h1>
        <div 
          className="question-counter"
          style={{ backgroundColor: getDominantColor() }}
        >
          Aufgabe #{taskCount}
        </div>
      </div>

      {showRules && (
        <div className="singleplayer-rules">
          <h3>Spielanleitung:</h3>
          <ol>
            <li>Gib das Handy an eine Person weiter, die eine neue Aufgabe ziehen soll</li>
            <li>Diese Person liest die Aufgabe laut vor und muss sie ausführen</li>
            <li>Nach jeder Runde drücke "Nächste Aufgabe" und gib das Handy weiter</li>
            <li>Jeder sollte seine Aufgabe ehrlich erfüllen - das macht mehr Spaß!</li>
          </ol>
          <button 
            className="dismiss-rules-button"
            onClick={() => setShowRules(false)}
            style={{ backgroundColor: getDominantColor() }}
          >
            Verstanden
          </button>
        </div>
      )}

      <div 
        className="singleplayer-card"
        style={{ 
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)` 
        }}
      >
        <div className={isTaskChanging ? 'fade-out' : 'fade-in'} style={{ width: "100%" }}>
          <h2 className="singleplayer-question">
            {currentTask || "Wähle eine Kategorie..."}
          </h2>
          <div className="singleplayer-actions">
            <button 
              className="next-question-button"
              onClick={handleNextTask}
              disabled={!currentTask}
            >
              Nächste Aufgabe
            </button>
          </div>
        </div>
      </div>

      <div className="game-controls">
        <button 
          className="show-rules-button"
          onClick={() => setShowRules(true)}
          style={{ borderColor: getDominantColor(), color: getDominantColor() }}
        >
          Regeln anzeigen
        </button>
        
        <button 
          className="change-categories-button"
          onClick={() => setScreen('category_selection')}
          style={{ backgroundColor: getDominantColor() }}
        >
          Kategorien ändern
        </button>
        
        <button 
          className="home-button"
          onClick={onExit}
          style={{ borderColor: getDominantColor(), color: getDominantColor() }}
        >
          Zum Hauptmenü
        </button>
      </div>

    </div>
  );

  return (
    <div className="singleplayer-wrapper">
      {screen === 'player_selection' && renderPlayerSelection()}
      {screen === 'category_selection' && renderCategorySelection()}
      {screen === 'game' && renderGame()}
    </div>
  );
};

export default SingleplayerPflicht;