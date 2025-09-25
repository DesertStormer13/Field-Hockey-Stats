import React from 'react';
import { Match, Goal, Penalty, Team, Player } from '../types';
import { CardIcon } from './icons/CardIcons';

interface SummaryScreenProps {
  match: Match;
  onNewMatch: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ match, onNewMatch }) => {
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getTeamPlayerStats = (team: Team, goals: Goal[], penalties: Penalty[]) => {
    const playerStats: { [key: number]: { player: Player; goals: number; assists: number; penalties: Penalty[] } } = {};

    team.players.forEach(p => {
      playerStats[p.id] = {
        player: p,
        goals: 0,
        assists: 0,
        penalties: [],
      };
    });

    goals.forEach(goal => {
      if (goal.teamName === team.name) {
        if (playerStats[goal.scorer.id]) {
          playerStats[goal.scorer.id].goals++;
        }
        if (goal.assist && playerStats[goal.assist.id]) {
          playerStats[goal.assist.id].assists++;
        }
      }
    });
    
    penalties.forEach(penalty => {
      if (penalty.teamName === team.name) {
        if (playerStats[penalty.player.id]) {
          playerStats[penalty.player.id].penalties.push(penalty);
        }
      }
    });

    return Object.values(playerStats)
      .filter(p => p.goals > 0 || p.assists > 0 || p.penalties.length > 0)
      .sort((a, b) => b.goals - a.goals || b.assists - b.assists || a.player.number - b.player.number);
  };
  
  const homePlayerStats = getTeamPlayerStats(match.homeTeam, match.goals, match.penalties);
  const awayPlayerStats = getTeamPlayerStats(match.awayTeam, match.goals, match.penalties);
  const homeSubsCount = match.substitutions.filter(s => s.teamName === match.homeTeam.name).length;
  const awaySubsCount = match.substitutions.filter(s => s.teamName === match.awayTeam.name).length;

  const renderPlayerStats = (stats: ReturnType<typeof getTeamPlayerStats>) => {
    if (stats.length === 0) {
        return <p className="text-gray-500">No individual statistics recorded.</p>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-600 text-sm text-gray-400">
                    <tr>
                        <th className="py-2 pr-2 font-semibold">Player</th>
                        <th className="py-2 px-2 text-center font-semibold">G</th>
                        <th className="py-2 px-2 text-center font-semibold">A</th>
                        <th className="py-2 pl-2 font-semibold">Cards</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map(({ player, goals, assists, penalties }) => (
                        <tr key={player.id} className="border-b border-gray-700 last:border-0">
                            <td className="py-2 pr-2">
                                <div className="font-semibold">{player.name}</div>
                                <div className="text-xs text-gray-400">#{player.number}</div>
                            </td>
                            <td className="py-2 px-2 text-center font-bold text-lg">{goals > 0 ? goals : <span className="text-gray-500">-</span>}</td>
                            <td className="py-2 px-2 text-center font-bold text-lg">{assists > 0 ? assists : <span className="text-gray-500">-</span>}</td>
                            <td className="py-2 pl-2">
                                <div className="flex items-center space-x-1">
                                    {penalties.length > 0
                                        ? penalties.map(p => <CardIcon key={p.id} card={p.card} className="w-3 h-4" />)
                                        : <span className="text-gray-500">-</span>}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-green-400">Match Summary</h1>
        <p className="text-center text-gray-400 mb-8">{match.venue} - {match.date}</p>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8 flex justify-around items-center">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-cyan-400">{match.homeTeam.name}</h2>
            </div>
            <div className="text-center">
                <p className="text-7xl font-black">
                    <span className="text-cyan-400">{match.homeTeam.score}</span> - <span className="text-rose-400">{match.awayTeam.score}</span>
                </p>
                <p className="text-gray-500 font-semibold">FINAL</p>
            </div>
            <div className="text-center">
                <h2 className="text-3xl font-bold text-rose-400">{match.awayTeam.name}</h2>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Team Summary */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-2 text-cyan-400">Individual Stats</h3>
                <p className="text-gray-400 mb-4">Total Substitutions: <span className="font-bold">{homeSubsCount}</span></p>
                {renderPlayerStats(homePlayerStats)}
            </div>
            
            {/* Away Team Summary */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-2 text-rose-400">Individual Stats</h3>
                 <p className="text-gray-400 mb-4">Total Substitutions: <span className="font-bold">{awaySubsCount}</span></p>
                 {renderPlayerStats(awayPlayerStats)}
            </div>
        </div>

        <div className="mt-12 flex justify-center">
             <button onClick={onNewMatch} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
                Start New Match
            </button>
        </div>
      </div>
    </div>
  );
};