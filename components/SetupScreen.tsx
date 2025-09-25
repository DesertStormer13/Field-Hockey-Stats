import React, { useState } from 'react';
import { Match, Player } from '../types';

interface SetupScreenProps {
  onMatchStart: (matchData: Match) => void;
}

const parsePlayers = (playerText: string): Player[] => {
  const lines = playerText.split('\n').map(l => l.trim()).filter(Boolean);
  
  const parsed = lines.map((line, index) => {
    const parts = line.match(/^(\d+)\s+(.*)$/);
    if (parts) {
      return { id: index, number: parseInt(parts[1], 10), name: parts[2].trim() };
    }
    // Player with no explicit number yet
    return { id: index, number: null as number | null, name: line };
  });

  const usedNumbers = new Set<number>(
    parsed.filter(p => p.number !== null).map(p => p.number as number)
  );

  let nextSequentialNumber = 1;
  
  return parsed.map(player => {
    if (player.number !== null) {
      return player as Player;
    }
    
    // Find the next available sequential number
    while (usedNumbers.has(nextSequentialNumber)) {
      nextSequentialNumber++;
    }
    
    const assignedNumber = nextSequentialNumber;
    nextSequentialNumber++; // Ensure the next player doesn't get the same number
    
    return { ...player, number: assignedNumber } as Player;
  });
};

export const SetupScreen: React.FC<SetupScreenProps> = ({ onMatchStart }) => {
  const [homeTeamName, setHomeTeamName] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('');
  const [homePlayersText, setHomePlayersText] = useState('');
  const [awayPlayersText, setAwayPlayersText] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleStartMatch = () => {
    if (!homeTeamName || !awayTeamName || !venue || !date) {
      alert('Please fill in all match details.');
      return;
    }

    const homePlayers = parsePlayers(homePlayersText);
    const awayPlayers = parsePlayers(awayPlayersText);

    if (homePlayers.length < 1 || awayPlayers.length < 1) {
        alert('Each team must have at least one player.');
        return;
    }

    const matchData: Match = {
      id: `match-${Date.now()}`,
      homeTeam: { name: homeTeamName, players: homePlayers, score: 0 },
      awayTeam: { name: awayTeamName, players: awayPlayers, score: 0 },
      venue,
      date,
      goals: [],
      penalties: [],
      substitutions: [],
    };
    onMatchStart(matchData);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-green-400">Field Hockey Match Setup</h1>
        <p className="text-center text-gray-400 mb-8">Enter the details below to start tracking the match.</p>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Match Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Team */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Home Team</h2>
            <input
              type="text"
              placeholder="Team Name"
              value={homeTeamName}
              onChange={(e) => setHomeTeamName(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded-md mb-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            <textarea
              placeholder="Enter players (e.g., '10 John Doe'), one per line."
              value={homePlayersText}
              onChange={(e) => setHomePlayersText(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded-md h-48 resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {/* Away Team */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-rose-400">Away Team</h2>
            <input
              type="text"
              placeholder="Team Name"
              value={awayTeamName}
              onChange={(e) => setAwayTeamName(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded-md mb-4 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <textarea
              placeholder="Enter players (e.g., '7 Jane Smith'), one per line."
              value={awayPlayersText}
              onChange={(e) => setAwayPlayersText(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded-md h-48 resize-none focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleStartMatch}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-lg"
          >
            Start Match
          </button>
        </div>
      </div>
    </div>
  );
};