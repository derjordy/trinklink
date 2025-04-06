import React, { useState, useEffect, useRef } from 'react';

const SingleplayerFragen = ({ onReturn, onExit }) => {
  // UI Zustände
  const [showRules, setShowRules] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [nextThreeQuestions, setNextThreeQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [showPenalty, setShowPenalty] = useState(false);
  const [currentPenalty, setCurrentPenalty] = useState(null);
  const [screen, setScreen] = useState('category_selection');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const rulesTimerRef = useRef(null);
  
  // UI Verbesserungen
  const [isCategoryAnimating, setIsCategoryAnimating] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [isQuestionChanging, setIsQuestionChanging] = useState(false);
  const [confetti, setConfetti] = useState(false);
  
  // Question categories
  const questionCategories = {
    partyFun: {
      name: 'Party & Fun',
      icon: '🎉',
      color: '#FF6B6B',
      description: 'Unterhaltsame Fragen für die Party-Stimmung',
      questions: [
        'Wer würde am ehesten auf einer Party auf dem Tisch tanzen?',
        'Wer hat die verrücktesten Party-Stories auf Lager?',
        'Wer kann am meisten trinken, ohne es zu zeigen?',
        'Wer postet am ehesten betrunken peinliche Storys?',
        'Wer wacht am ehesten mit mysteriösen blauen Flecken auf?',
        'Wer würde am ehesten betrunken eine Karaoke-Performance hinlegen?',
        'Wer hat die wildesten DMs von Fremden?',
        'Wer hat das größte Chaos in seinem Dating-Leben?',
        'Wer wird am ehesten nach einer durchzechten Nacht vermisst?',
        'Wer schreibt um 3 Uhr nachts „Ich liebe euch, Leute!" in die Gruppe?',
        'Wer ist der beste Wingman/Wingwoman der Gruppe?',
        'Wer würde am ehesten die Polizei zu einer Party locken?',
        'Wer hat die längste "Walk of Shame"-Geschichte?',
        'Wer würde am ehesten Fremde auf einer Party in ein tiefgründiges Gespräch verwickeln?'
      ]
    },
    drinking: {
      name: 'Trinken',
      icon: '🍻',
      color: '#4ECDC4',
      description: 'Fragen rund ums Trinken und Trinkgewohnheiten',
      questions: [
        'Wer hat am häufigsten einen Filmriss?',
        'Wer würde am ehesten eine wilde Trink-Challenge annehmen?',
        'Wer bestellt am ehesten einen viel zu teuren Drink, nur um cool auszusehen?',
        'Wer kann am schlechtesten seine Promille verstecken?',
        'Wer kann am besten Shots runterkippen?',
        'Wer würde am ehesten eine ganze Runde Drinks ausgeben?',
        'Wer hat sich schon mal beim Flirten blamiert?',
        'Wer würde nach dem Feiern noch spontan weiterziehen, wenn alle anderen nach Hause wollen?',
        'Wer wäre der perfekte Barkeeper für den Abend?',
        'Wer würde am ehesten den DJ überreden, ein Trash-Song zu spielen?',
        'Wer wird nach einem Drink am gesprächigsten?',
        'Wer erfindet immer neue Drinking Games?',
        'Wer hat die schlimmsten Hangover-Geschichten?',
        'Wer kennt die ausgefallensten Cocktail-Rezepte?'
      ]
    },
    spicy: {
      name: 'Spicy',
      icon: '🔥',
      color: '#F2994A',
      description: 'Freche Fragen für mutige Spieler',
      questions: [
        'Wer würde am ehesten bei einem One-Night-Stand erwischt werden?',
        'Wer hat die meisten Dating-Apps auf dem Handy?',
        'Wer würde am ehesten in einer offenen Beziehung sein?',
        'Wer hat das wildeste Sexleben?',
        'Wer hat schon mal ein Nacktfoto verschickt?',
        'Wer würde am ehesten im Büro mit jemandem knutschen?',
        'Wer hatte schon mal einen Dreier?',
        'Wer hat die dunkelsten Fantasien?',
        'Wer wäre am ehesten in einem Stripclub zu finden?',
        'Wer hat den interessantesten Verlauf im Inkognito-Modus?',
        'Wer würde am ehesten bei einer Dating-Show mitmachen?',
        'Wer flirtet am meisten, wenn er/sie betrunken ist?',
        'Wer hat die meisten Ex-Partner in ihrem/seinem Handy geblockt?',
        'Wer würde eine Affäre mit einem Prominenten haben?'
      ]
    },
    challenges: {
      name: 'Challenges',
      icon: '🎯',
      color: '#9B51E0',
      description: 'Herausforderungen und Aktionen für mutige Spieler',
      questions: [
        'Wer würde am ehesten eine verrückte Wette annehmen?',
        'Wer ist am ehesten bereit, ein virales TikTok nachzustellen?',
        'Wer würde am ehesten ein peinliches Outfit in der Öffentlichkeit tragen?',
        'Wer würde am ehesten einen Tag lang im Kostüm herumlaufen?',
        'Wer würde am ehesten an einem Esswettbewerb teilnehmen?',
        'Wer würde am ehesten einen Tag ohne Handy überleben?',
        'Wer würde am ehesten eine Nacht im Wald verbringen?',
        'Wer würde am ehesten eine extreme Sportart ausprobieren?',
        'Wer würde am ehesten ein fremdes Gericht probieren, das eklig aussieht?',
        'Wer würde am ehesten auf einer Bühne performen?',
        'Wer würde am ehesten Bungee-Jumping machen?',
        'Wer würde am ehesten für einen ganzen Tag in einer anderen Rolle/Persönlichkeit leben?',
        'Wer würde am ehesten in ein fremdes Land ziehen, ohne die Sprache zu sprechen?',
        'Wer würde am ehesten auf Social Media einen peinlichen Post machen für eine Challenge?'
      ]
    }
  };

  // Penalties array
  const penalties = [
    '2 Schlücke trinken',
    '3 Schlücke trinken',
    'Shottime! Einen Shot trinken',
    'Ein Glas auf Ex trinken',
    'Handy für 5 Minuten abgeben',
    'Eine peinliche Story erzählen',
    'Wahrheit oder Pflicht: Du musst eine Pflicht erfüllen',
    'Nächste Runde Getränke bezahlen',
    'Einen lustigen Tanz aufführen',
    'Ein peinliches Selfie in deine Story posten',
    '30 Sekunden lang wie ein Tier deiner Wahl herumgehen',
    'Dein peinlichstes Date-Erlebnis erzählen',
    'Einen Zungenbrecher 3x schnell hintereinander aufsagen',
    'Mit geschlossenen Augen ein lustiges Selfie machen'
  ];

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

  // Fragen vorladen wenn Kategorien geändert werden
  useEffect(() => {
    if (selectedCategories.length > 0) {
      let combinedQuestions = [];
      selectedCategories.forEach(categoryKey => {
        combinedQuestions = [...combinedQuestions, ...questionCategories[categoryKey].questions];
      });
      setAvailableQuestions(combinedQuestions);
      
      // Theme vom ersten gewählten Element nehmen
      if (selectedCategories.length > 0 && !currentTheme) {
        setCurrentTheme(questionCategories[selectedCategories[0]]);
      }
      
      // Sofort die ersten Fragen vorladen
      preloadQuestions(combinedQuestions);
    }
  }, [selectedCategories]);

  // Vorladen der nächsten Fragen, ohne Duplikate
  const preloadQuestions = (questions) => {
    if (!questions || questions.length === 0) return;
    
    // Erstelle 3 eindeutige zufällige Fragen, die noch nicht verwendet wurden
    const uniqueQuestions = [];
    // Filter out questions that have already been used
    const availableForSelection = questions.filter(q => !usedQuestions.includes(q));
    
    // If we're running out of questions, reset the used questions
    if (availableForSelection.length < 3) {
      setUsedQuestions([]);
      const availableForSelection = questions;
    }
    
    // Make a copy so we don't modify original array
    const questionsCopy = [...availableForSelection];
    
    while (uniqueQuestions.length < 3 && questionsCopy.length > 0) {
      const randomIndex = Math.floor(Math.random() * questionsCopy.length);
      const randomQuestion = questionsCopy.splice(randomIndex, 1)[0];
      
      // Make sure the current question isn't in the batch
      if (randomQuestion !== currentQuestion) {
        uniqueQuestions.push(randomQuestion);
      }
    }
    
    setNextThreeQuestions(uniqueQuestions);
    
    // Set the first question as "next question"
    if (uniqueQuestions.length > 0) {
      setNextQuestion(uniqueQuestions[0]);
    }
  };

  // Wenn eine Frage verwendet wird, lade eine neue in den Vorrat
  useEffect(() => {
    if (currentQuestion && availableQuestions.length > 0) {
      // Add current question to used questions
      if (currentQuestion && !usedQuestions.includes(currentQuestion)) {
        setUsedQuestions(prev => [...prev, currentQuestion]);
      }
      
      // Remove the current question from the batch
      const updatedQuestions = nextThreeQuestions.filter(q => q !== currentQuestion);
      
      // If we have less than 3 questions in the batch, load more
      if (updatedQuestions.length < 3) {
        // Find questions that aren't in the batch, aren't the current question, and haven't been used
        const availableForPreload = availableQuestions.filter(
          q => q !== currentQuestion && 
               !updatedQuestions.includes(q) && 
               !usedQuestions.includes(q)
        );
        
        // If we're running out of questions, allow reusing some
        if (availableForPreload.length === 0) {
          // Remove the oldest used questions to allow reuse
          const refreshedUsed = usedQuestions.slice(Math.max(0, usedQuestions.length - 5));
          setUsedQuestions(refreshedUsed);
          
          // Now recalculate available questions
          const recycledPool = availableQuestions.filter(
            q => q !== currentQuestion && 
                 !updatedQuestions.includes(q) && 
                 !refreshedUsed.includes(q)
          );
          
          if (recycledPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * recycledPool.length);
            updatedQuestions.push(recycledPool[randomIndex]);
          }
        } else if (availableForPreload.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableForPreload.length);
          updatedQuestions.push(availableForPreload[randomIndex]);
        }
      }
      
      setNextThreeQuestions(updatedQuestions);
      
      // Update the next question
      if (updatedQuestions.length > 0) {
        setNextQuestion(updatedQuestions[0]);
      }
    }
  }, [currentQuestion]);

  // Toggle category selection
  const toggleCategorySelection = (categoryKey) => {
    setIsCategoryAnimating(true);
    setTimeout(() => {
      setSelectedCategories(prev => {
        if (prev.includes(categoryKey)) {
          // Wenn diese Kategorie die letzte ist, nicht entfernen
          if (prev.length === 1) {
            return prev;
          }
          
          // Aktualisiere das Theme wenn wir die aktuelle Theme-Kategorie entfernen
          if (categoryKey === prev[0]) {
            const newThemeCategory = prev.filter(cat => cat !== categoryKey)[0];
            setCurrentTheme(questionCategories[newThemeCategory]);
          }
          
          return prev.filter(cat => cat !== categoryKey);
        } else {
          // Beim ersten Hinzufügen, setze das Theme
          if (prev.length === 0) {
            setCurrentTheme(questionCategories[categoryKey]);
          }
          
          return [...prev, categoryKey];
        }
      });
      setIsCategoryAnimating(false);
    }, 200);
  };

  // Start game with selected categories
  const startGame = () => {
    if (selectedCategories.length === 0) {
      return; // Don't start if no categories selected
    }
    
    setScreen('game');
    setShowRules(true);
    setQuestionCount(1);
    
    // Verwende die vorgeladene Frage, falls vorhanden
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
    } else if (availableQuestions.length > 0) {
      // Fallback zur zufälligen Auswahl
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      setCurrentQuestion(availableQuestions[randomIndex]);
    }
  };

  // Get next question
  const handleNextQuestion = () => {
    // Animation starten
    setIsQuestionChanging(true);
    
    setTimeout(() => {
      // Die vorgeladene Frage verwenden
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setQuestionCount(prev => prev + 1);
        
        // Die nächste Frage im Vorrat wird die neue "nächste Frage"
        if (nextThreeQuestions.length > 1) {
          setNextQuestion(nextThreeQuestions[1]);
        } else if (availableQuestions.length > 0) {
          // Fallback, wenn der Vorrat leer ist
          const availableForNext = availableQuestions.filter(
            q => q !== nextQuestion && q !== currentQuestion && !usedQuestions.includes(q)
          );
          
          if (availableForNext.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableForNext.length);
            setNextQuestion(availableForNext[randomIndex]);
          } else {
            // Wenn wir keine unbenutzten Fragen mehr haben, setzen wir die usedQuestions zurück
            // und wählen aus allen verfügbaren
            setUsedQuestions([currentQuestion]); // Behalte nur die aktuelle als verwendet
            const refreshedPool = availableQuestions.filter(q => q !== currentQuestion);
            if (refreshedPool.length > 0) {
              const randomIndex = Math.floor(Math.random() * refreshedPool.length);
              setNextQuestion(refreshedPool[randomIndex]);
            }
          }
        }
      } else if (availableQuestions.length > 0) {
        // Fallback, wenn keine vorgeladene Frage existiert
        const availableUnused = availableQuestions.filter(
          q => q !== currentQuestion && !usedQuestions.includes(q)
        );
        
        if (availableUnused.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableUnused.length);
          setCurrentQuestion(availableUnused[randomIndex]);
        } else {
          // Wenn keine unbenutzten Fragen mehr übrig sind, setze zurück und starte neu
          setUsedQuestions([]);
          const randomIndex = Math.floor(Math.random() * availableQuestions.length);
          setCurrentQuestion(availableQuestions[randomIndex]);
        }
        
        setQuestionCount(prev => prev + 1);
      }
      
      setIsQuestionChanging(false);
    }, 300);
  };

  // Skip question with penalty
  const handleSkipQuestion = () => {
    // Select a random penalty
    const randomPenalty = penalties[Math.floor(Math.random() * penalties.length)];
    setCurrentPenalty(randomPenalty);
    setShowPenalty(true);
    
    // Prepare the next question
    const nextQuestionForSkip = nextQuestion || (availableQuestions.length > 0 ? 
      availableQuestions.filter(q => q !== currentQuestion && !usedQuestions.includes(q))[0] ||
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)] : 
      "Keine weitere Frage verfügbar");
    
    // Fun confetti effect
    setConfetti(true);
    setTimeout(() => {
      setConfetti(false);
    }, 2000);
    
    // Automatically show next question after penalty display
    setTimeout(() => {
      setCurrentQuestion(nextQuestionForSkip);
      setQuestionCount(prev => prev + 1);
      
      // Hide penalty after a delay
      setTimeout(() => {
        setShowPenalty(false);
      }, 1000);
    }, 3000);
  };

  // Get the dominant color from selected categories for styling
  const getDominantColor = () => {
    if (!currentTheme) return '#4c1d95'; // Default color
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

  // Render category selection
 // Render category selection
const renderCategorySelection = () => (
  <div className="category-selection">
    <h1>Wähle Kategorien</h1>
    
    <div className="category-cards">
      {Object.entries(questionCategories).map(([key, category]) => (
        <div 
          key={key}
          className={`category-card ${selectedCategories.includes(key) ? 'selected' : ''}`}
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
            <div 
              className="category-selected-badge"
              style={{ backgroundColor: category.color }}
            >
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
      >
        {selectedCategories.length > 0 
          ? `Spiel starten (${selectedCategories.length} ${selectedCategories.length === 1 ? 'Kategorie' : 'Kategorien'})`
          : 'Wähle mindestens eine Kategorie'}
      </button>
      
      <button 
        className="home-button"
        onClick={onReturn}
      >
        Zurück
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
        <h1>DrinkLink</h1>
        <div 
          className="question-counter"
          style={{ backgroundColor: getDominantColor() }}
        >
          Frage #{questionCount}
        </div>
      </div>

      {showRules && (
        <div className="singleplayer-rules">
          <h3>Spielanleitung:</h3>
          <ol>
            <li>Gib das Handy an die Person weiter, die die Frage lesen soll</li>
            <li>Diese Person liest die Frage laut vor und wählt dann einen anderen Spieler aus</li>
            <li>Wenn ein Spieler die Frage nicht beantworten will, drücke "Pass"</li>
            <li>Die Person muss dann die angezeigte Strafe ausführen</li>
            <li>Nach jeder Runde drücke "Nächste Frage" und gib das Handy weiter</li>
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
        {showPenalty ? (
          <div className="penalty-display">
            <h2>Deine Strafe!</h2>
            <div className="penalty-icon">🍻</div>
            <p 
              className="penalty-text"
              style={{ 
                backgroundColor: `rgba(${parseInt(getDominantColor().slice(1, 3), 16)}, 
                                     ${parseInt(getDominantColor().slice(3, 5), 16)}, 
                                     ${parseInt(getDominantColor().slice(5, 7), 16)}, 0.15)`,
                border: `2px solid ${getDominantColor()}30`
              }}
            >
              {currentPenalty}
            </p>
          </div>
        ) : (
          <div className={isQuestionChanging ? 'fade-out' : 'fade-in'} style={{ width: "100%" }}>
            <h2 className="singleplayer-question">
              {currentQuestion || "Wähle eine Kategorie..."}
            </h2>
            <div className="singleplayer-actions">
              <button 
                className="next-question-button"
                onClick={handleNextQuestion}
                disabled={!currentQuestion}
              >
                Nächste Frage
              </button>
              <button 
                className="skip-question-button"
                onClick={handleSkipQuestion}
                disabled={!currentQuestion}
              >
                Pass! (Strafe akzeptieren)
              </button>
            </div>
          </div>
        )}
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
      
      {renderConfetti()}
    </div>
  );

  return (
    <div className="singleplayer-wrapper">
      {screen === 'category_selection' && renderCategorySelection()}
      {screen === 'game' && renderGame()}
    </div>
  );
};

export default SingleplayerFragen;