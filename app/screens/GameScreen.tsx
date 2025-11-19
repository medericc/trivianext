'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GameState } from '../models/GameState';
import { Team } from '../models/Team';
import { Question } from '../models/Question';

// Composant Modal Équipe Suivante
function NextTeamModal({ isOpen, teamName, onClose }: { isOpen: boolean; teamName: string; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-parchment rounded-lg p-6 border-2 border-brown-800 max-w-md w-full">
        <h2 className="text-xl font-bold text-brown-900 font-times mb-4">
          Équipe suivante : {teamName}
        </h2>
        <p className="text-brown-800 mb-6">
          Appuyez sur OK quand vous êtes prêts à poser la question.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-brown-700 text-white px-6 py-2 rounded-full hover:bg-brown-800 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant Modal Camembert
function CamembertModal({ isOpen, theme, onClose }: { isOpen: boolean; theme: string; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-parchment rounded-lg p-6 border-2 border-brown-800 max-w-md w-full">
        <h2 className="text-xl font-bold text-brown-900 font-times mb-4">
          Question Camembert
        </h2>
        <p className="text-brown-800 mb-4">
          Thème : <span className="font-semibold">{theme}</span>
        </p>
        <p className="text-brown-800 mb-6">
          Appuyez sur OK pour continuer.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-brown-700 text-white px-6 py-2 rounded-full hover:bg-brown-800 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GameScreen() {
  const router = useRouter();
  
  // États du jeu
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCamembertTurn, setIsCamembertTurn] = useState(false);
  const [camembertTheme, setCamembertTheme] = useState<string | null>(null);
  
  // États des modales
  const [showNextTeamModal, setShowNextTeamModal] = useState(false);
  const [showCamembertModal, setShowCamembertModal] = useState(false);

  // Détection tablette/desktop
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth > 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // CORRECTION : Charger l'état du jeu de manière asynchrone
  useEffect(() => {
    const initializeGame = () => {
      const saved = sessionStorage.getItem('gameState');
      if (saved) {
        try {
          const data = JSON.parse(saved);
        type RawTeam = {
  name: string;
  wonThemes?: string[];
};

const teams = (data.teams as RawTeam[]).map((t) => {
  const team = new Team(t.name);
  team.wonThemes = t.wonThemes || [];
  return team;
});
          
          const newGameState = new GameState(teams);
          newGameState.currentTeamIndex = data.currentTeamIndex || 0;
          newGameState.askedQuestions = data.askedQuestions || [];
          
          // CORRECTION : Mettre à jour l'état en une seule fois
          const questions = newGameState.getRandomQuestions(1);
          const firstQuestion = questions.length > 0 ? questions[0] : null;
          
          setGameState(newGameState);
          setCurrentQuestion(firstQuestion);
          
          // CORRECTION : Utiliser setTimeout pour éviter la cascade
          setTimeout(() => {
            setShowNextTeamModal(true);
          }, 0);
          
        } catch (error) {
          console.error('Erreur chargement jeu:', error);
          router.push('/');
        }
      } else {
        router.push('/');
      }
    };

    initializeGame();
  }, [router]);

  // CORRECTION : Sauvegarder l'état de manière optimisée
  useEffect(() => {
    if (gameState) {
      // Utiliser requestAnimationFrame pour éviter les updates synchrones
      requestAnimationFrame(() => {
        sessionStorage.setItem('gameState', JSON.stringify({
          teams: gameState.teams,
          currentTeamIndex: gameState.currentTeamIndex,
          askedQuestions: gameState.askedQuestions
        }));
      });
    }
  }, [gameState]);

  const loadQuestion = useCallback(() => {
    if (!gameState) return;

    setShowAnswer(false);

    if (!isCamembertTurn) {
      const questions = gameState.getRandomQuestions(1);
      if (questions.length > 0) {
        setCurrentQuestion(questions[0]);
      }
    }
  }, [gameState, isCamembertTurn]);

  const resetTurn = useCallback(() => {
    if (!gameState) return;

    // CORRECTION : Regrouper les updates d'état
    const newGameState = new GameState([...gameState.teams]);
    newGameState.currentTeamIndex = (gameState.currentTeamIndex + 1) % gameState.teams.length;
    newGameState.askedQuestions = [...gameState.askedQuestions];
    
    const questions = newGameState.getRandomQuestions(1);
    const nextQuestion = questions.length > 0 ? questions[0] : null;

    // Mettre à jour tous les états en une fois
    setCorrectAnswers(0);
    setIsCamembertTurn(false);
    setCamembertTheme(null);
    setGameState(newGameState);
    setCurrentQuestion(nextQuestion);
    
    // CORRECTION : Délai pour éviter la cascade
    setTimeout(() => {
      setShowNextTeamModal(true);
    }, 0);
    
  }, [gameState]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!gameState || !currentQuestion) return;

    if (isCorrect) {
      const newCorrect = correctAnswers + 1;
      setCorrectAnswers(newCorrect);

      if (!isCamembertTurn && newCorrect === 3) {
        const camembertQuestion = gameState.getRandomQuestionForAvailableThemes();
        
        if (!camembertQuestion) {
          resetTurn();
          return;
        }

        setCamembertTheme(camembertQuestion.theme);
        
        // CORRECTION : Délai pour éviter la cascade
        setTimeout(() => {
          setShowCamembertModal(true);
        }, 0);
        
        return;
      } else if (isCamembertTurn && camembertTheme) {
        gameState.addThemeToCurrentTeam(camembertTheme);
        
        if (gameState.currentTeamHasWon()) {
          sessionStorage.removeItem('gameState');
          router.push(`/result?winner=${encodeURIComponent(gameState.currentTeam.name)}`);
          return;
        }
        
        resetTurn();
        return;
      }
    } else {
      resetTurn();
      return;
    }
    
    loadQuestion();
  }, [gameState, currentQuestion, correctAnswers, isCamembertTurn, camembertTheme, loadQuestion, resetTurn, router]);

  const startCamembertTurn = useCallback(() => {
    if (!gameState || !camembertTheme) return;

    const camembertQuestion = gameState.getQuestionForTheme(camembertTheme);
    if (camembertQuestion) {
      // CORRECTION : Regrouper les updates
      setIsCamembertTurn(true);
      setCurrentQuestion(camembertQuestion);
      setShowAnswer(false);
    } else {
      resetTurn();
    }
  }, [gameState, camembertTheme, resetTurn]);

  // Tableau des scores
  const buildScoreBoard = () => (
    <div className="bg-parchment/85 rounded-xl p-4 md:p-6 border-2 border-brown-800">
      <div className="space-y-2 md:space-y-3">
        {gameState?.teams.map((team, index) => {
          const isCurrent = team === gameState.currentTeam;
          return (
            <p
              key={index}
              className={`text-brown-900 text-lg md:text-xl ${
                isCurrent ? 'font-bold' : 'font-normal'
              } font-times`}
            >
              {team.name} : {isCurrent ? correctAnswers : 0}/3,{' '}
              {team.wonThemes.length} {team.wonThemes.length === 1 ? 'camembert' : 'camemberts'}
            </p>
          );
        })}
      </div>
    </div>
  );

  // Écran de chargement
  if (!gameState || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-beige via-sand to-leather flex items-center justify-center">
        <div className="text-white text-xl">Chargement du jeu...</div>
      </div>
    );
  }

  return (
    <>
      {/* Modales */}
      <NextTeamModal
        isOpen={showNextTeamModal}
        teamName={gameState.currentTeam.name}
        onClose={() => {
          setShowNextTeamModal(false);
          loadQuestion();
        }}
      />

      <CamembertModal
        isOpen={showCamembertModal}
        theme={camembertTheme || ''}
        onClose={() => {
          setShowCamembertModal(false);
          startCamembertTurn();
        }}
      />

      {/* Écran principal du jeu */}
      <div className="min-h-screen bg-gradient-to-b from-beige via-sand to-leather p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Espacement ajusté */}
          <div className={isTablet ? "h-12" : "h-16"}></div>

          {/* Titre équipe */}
          <h1 className="text-3xl md:text-5xl font-bold text-brown-900 font-times text-center mb-8 md:mb-12">
            Équipe : {gameState.currentTeam.name}
          </h1>

          {/* Espacement */}
          <div className="h-8 md:h-12"></div>

          {/* Carte question */}
          <div className="bg-parchment/90 rounded-xl p-4 md:p-8 border-2 border-brown-800 mb-6 md:mb-8">
            <div className="space-y-4 md:space-y-6">
              {/* Thème */}
              <p className="text-brown-800 text-lg md:text-xl italic text-center font-times">
                Thème : {currentQuestion.theme}
              </p>
              
              <div className="border-t border-brown-600"></div>
              
              {/* Question */}
              <p className="text-brown-900 text-xl md:text-2xl font-bold text-center leading-relaxed">
                {currentQuestion.question}
              </p>
              
              <div className="h-6 md:h-8"></div>

              {/* Zone réponse/boutons */}
              {!showAnswer ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="bg-brown-700 text-white px-8 py-4 rounded-full text-lg md:text-xl hover:bg-brown-800 transition-colors shadow-lg font-semibold"
                  >
                    RÉVÉLER LA RÉPONSE
                  </button>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {/* Réponse */}
                  <div className="bg-brown-50 border-2 border-brown-800 rounded-xl p-4 md:p-6">
                    <p className="text-brown-900 text-lg md:text-xl font-bold text-center">
                      {currentQuestion.options[currentQuestion.correctIndex]}
                    </p>
                  </div>
                  
                  <div className="h-4 md:h-6"></div>
                  
                  {/* Boutons réponse */}
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
                    <button
                      onClick={() => handleAnswer(true)}
                      className="bg-[#3B3B6D] text-white px-6 py-3 md:px-8 md:py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#2A2A4D] transition-colors text-lg font-semibold min-w-[140px]"
                    >
                      <span className="text-xl">✓</span>
                      <span>Correct</span>
                    </button>
                    
                    <button
                      onClick={() => handleAnswer(false)}
                      className="bg-[#8B4000] text-white px-6 py-3 md:px-8 md:py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#6B3000] transition-colors text-lg font-semibold min-w-[140px]"
                    >
                      <span className="text-xl">✗</span>
                      <span>Incorrect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Espacement ajusté */}
          <div className={isTablet ? "h-10" : "h-5"}></div>

          {/* Tableau des scores */}
          {buildScoreBoard()}

          {/* Espacement pour le bas */}
          <div className="h-16 md:h-20"></div>
        </div>
      </div>
    </>
  );
}