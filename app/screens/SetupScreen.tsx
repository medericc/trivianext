'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Team } from '../models/Team';
import { GameState } from '../models/GameState';

export default function SetupScreen() {
  const [teamCount, setTeamCount] = useState(2);
  const [teamNames, setTeamNames] = useState(['', '']);
  const router = useRouter();

  const handleTeamNameChange = (index: number, value: string) => {
    const newTeamNames = [...teamNames];
    newTeamNames[index] = value;
    setTeamNames(newTeamNames);
  };

  const handleStartGame = () => {
    if (teamNames.slice(0, teamCount).some(name => name.trim() === '')) {
      alert('Veuillez nommer toutes les équipes');
      return;
    }

    const teams = teamNames.slice(0, teamCount).map(name => new Team(name));
    const gameState = new GameState(teams);
    
    // Stocker dans sessionStorage pour la persistance
    sessionStorage.setItem('gameState', JSON.stringify({
      teams: gameState.teams,
      currentTeamIndex: gameState.currentTeamIndex
    }));

    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige via-sand to-leather flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-parchment/90 rounded-lg p-6 shadow-lg border-2 border-brown-800">
          <h1 className="text-2xl md:text-3xl font-bold text-brown-900 font-times text-center tracking-wider mb-4">
            CONFIGURATION
          </h1>
          
          <div className="border-t border-brown-600 my-6"></div>
          
          <div className="text-brown-700 text-4xl text-center mb-4">👥</div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-brown-800 text-lg mb-2 text-center">
                Nombre d&apos;équipes:
              </label>
              <select 
                value={teamCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value);
                  setTeamCount(count);
                  // Ajuster le tableau des noms
                  const newTeamNames = [...teamNames];
                  while (newTeamNames.length < count) newTeamNames.push('');
                  while (newTeamNames.length > count) newTeamNames.pop();
                  setTeamNames(newTeamNames);
                }}
                className="w-full bg-brown-50 border border-brown-300 rounded-xl px-4 py-2 text-brown-900 text-lg focus:outline-none focus:border-brown-700"
              >
                <option value={2}>2 équipes</option>
                <option value={3}>3 équipes</option>
              </select>
            </div>

            <div className="space-y-4">
              {teamNames.slice(0, teamCount).map((name, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Nom de l'équipe ${index + 1}`}
                  value={name}
                  onChange={(e) => handleTeamNameChange(index, e.target.value)}
                  className="w-full bg-brown-50 border border-brown-300 rounded-lg px-4 py-3 text-brown-900 placeholder-brown-700 focus:outline-none focus:border-brown-700"
                />
              ))}
            </div>

            <button
              onClick={handleStartGame}
              className="w-full bg-brown-700 text-white py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-brown-800 transition-colors border border-brown-900"
            >
              COMMENCER LE JEU
            </button>
          </div>
        </div>
        
        <p className="text-brown-800 italic text-center mt-8">
          « Là où deux ou trois sont assemblés... » - Matthieu 18:20
        </p>
      </div>
    </div>
  );
}