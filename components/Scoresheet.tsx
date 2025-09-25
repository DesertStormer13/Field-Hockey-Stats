
import React from 'react';
import { Match, Player, PenaltyType } from '../types';
import { PENALTY_NAMES } from '../constants';

interface ScoresheetProps {
  match: Match;
  onBack: () => void;
}

const ScoresheetCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({ children, className, colSpan }) => (
    <td colSpan={colSpan} className={`border border-black px-2 py-1 text-sm ${className}`}>{children}</td>
);

const ScoresheetHeaderCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({ children, className, colSpan }) => (
    <th colSpan={colSpan} className={`border border-black px-2 py-1 text-sm bg-gray-200 font-bold ${className}`}>{children}</th>
);

export const Scoresheet: React.FC<ScoresheetProps> = ({ match, onBack }) => {
  
  const printScoresheet = () => {
    window.print();
  };

  const renderPlayerList = (players: Player[], teamName: string) => {
    const rows = [];
    const maxPlayers = Math.max(20, players.length);
    for (let i = 0; i < maxPlayers; i++) {
        const player = players[i];
        const goals = match.goals.filter(g => g.teamName === teamName && g.scorer.id === player?.id);
        const penalties = match.penalties.filter(p => p.teamName === teamName && p.player.id === player?.id);
        rows.push(
            <tr key={i}>
                <ScoresheetCell className="text-center">{player?.number ?? ''}</ScoresheetCell>
                <ScoresheetCell>{player?.name ?? ''}</ScoresheetCell>
                <ScoresheetCell className="text-center">{goals.length > 0 ? goals.length : ''}</ScoresheetCell>
                {Object.values(PenaltyType).map(cardType => {
                    const penalty = penalties.find(p => p.card === cardType);
                    const minute = penalty ? Math.floor(penalty.time / 60) : '';
                    return <ScoresheetCell key={cardType} className="text-center">{minute}</ScoresheetCell>
                })}
            </tr>
        );
    }
    return rows;
  };
  
  const getScoreAtQuarter = (teamName: string, quarter: number) => {
    const quarterEnd = quarter * 15 * 60;
    return match.goals.filter(g => g.teamName === teamName && g.time <= quarterEnd).length;
  }

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
       <div className="max-w-4xl mx-auto mb-4 no-print flex justify-between items-center">
            <h1 className="text-2xl font-bold">Scoresheet Preview</h1>
            <div>
                 <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg mr-2">
                    Back to Summary
                </button>
                <button onClick={printScoresheet} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
                    Print Scoresheet
                </button>
            </div>
        </div>

        <div className="bg-white text-black p-4 max-w-4xl mx-auto shadow-lg">
            <h1 className="text-2xl font-bold text-center mb-2">FIH INTERNATIONAL HOCKEY FEDERATION</h1>
            <h2 className="text-xl font-bold text-center mb-4">TOURNAMENT MATCH REPORT</h2>
            <table className="w-full border-collapse border border-black mb-4">
                 <tbody>
                    <tr>
                        <ScoresheetCell><strong>Match No:</strong> {match.id.slice(-4)}</ScoresheetCell>
                        <ScoresheetCell><strong>Date:</strong> {match.date}</ScoresheetCell>
                        <ScoresheetCell><strong>Venue:</strong> {match.venue}</ScoresheetCell>
                    </tr>
                </tbody>
            </table>
            
            <table className="w-full border-collapse border border-black mb-4">
                 <thead>
                    <tr>
                        <ScoresheetHeaderCell className="w-2/5">Team A</ScoresheetHeaderCell>
                        <ScoresheetHeaderCell className="w-1/5">Result</ScoresheetHeaderCell>
                        <ScoresheetHeaderCell className="w-2/5">Team B</ScoresheetHeaderCell>
                    </tr>
                </thead>
                <tbody>
                     <tr>
                        <ScoresheetCell className="text-center text-lg font-bold">{match.homeTeam.name}</ScoresheetCell>
                        <ScoresheetCell className="text-center text-2xl font-bold">{match.homeTeam.score} - {match.awayTeam.score}</ScoresheetCell>
                        <ScoresheetCell className="text-center text-lg font-bold">{match.awayTeam.name}</ScoresheetCell>
                    </tr>
                </tbody>
            </table>

            <div className="grid grid-cols-2 gap-4">
                {/* Team A Details */}
                <div>
                    <table className="w-full border-collapse border border-black">
                        <thead>
                             <tr>
                                <ScoresheetHeaderCell colSpan={6}>{match.homeTeam.name}</ScoresheetHeaderCell>
                            </tr>
                            <tr>
                                <ScoresheetHeaderCell className="w-1/12">No.</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-5/12">Player Name</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-1/12">G</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-1/12 bg-green-300">GC</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-1/12 bg-yellow-300">YC</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-1/12 bg-red-300">RC</ScoresheetHeaderCell>
                            </tr>
                        </thead>
                        <tbody>
                            {renderPlayerList(match.homeTeam.players, match.homeTeam.name)}
                        </tbody>
                    </table>
                </div>

                {/* Team B Details */}
                <div>
                    <table className="w-full border-collapse border border-black">
                         <thead>
                             <tr>
                                <ScoresheetHeaderCell colSpan={6}>{match.awayTeam.name}</ScoresheetHeaderCell>
                            </tr>
                            <tr>
                                <ScoresheetHeaderCell className="w-1/12">No.</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-5/12">Player Name</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-1/12">G</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-1/12 bg-green-300">GC</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-1/12 bg-yellow-300">YC</ScoresheetHeaderCell>
                                <ScoresheetHeaderCell className="w-1/12 bg-red-300">RC</ScoresheetHeaderCell>
                            </tr>
                        </thead>
                         <tbody>
                            {renderPlayerList(match.awayTeam.players, match.awayTeam.name)}
                        </tbody>
                    </table>
                </div>
            </div>

             <table className="w-full border-collapse border border-black mt-4">
                <thead>
                    <tr>
                        <ScoresheetHeaderCell>Result</ScoresheetHeaderCell>
                        <ScoresheetHeaderCell>Q1</ScoresheetHeaderCell>
                        <ScoresheetHeaderCell>Q2</ScoresheetHeaderCell>
                        <ScoresheetHeaderCell>Q3</ScoresheetHeaderCell>
                        <ScoresheetHeaderCell>Q4</ScoresheetHeaderCell>
                        <ScoresheetHeaderCell>Final</ScoresheetHeaderCell>
                    </tr>
                </thead>
                 <tbody>
                    <tr>
                        <ScoresheetCell>{match.homeTeam.name}</ScoresheetCell>
                        <ScoresheetCell className="text-center">{getScoreAtQuarter(match.homeTeam.name, 1)}</ScoresheetCell>
                        <ScoresheetCell className="text-center">{getScoreAtQuarter(match.homeTeam.name, 2)}</ScoresheetCell>
                        <ScoresheetCell className="text-center">{getScoreAtQuarter(match.homeTeam.name, 3)}</ScoresheetCell>
                        <ScoresheetCell className="text-center">{getScoreAtQuarter(match.homeTeam.name, 4)}</ScoresheetCell>
                        <ScoresheetCell className="text-center font-bold">{match.homeTeam.score}</ScoresheetCell>
                    </tr>
                     <tr>
                        <ScoresheetCell>{match.awayTeam.name}</ScoresheetCell>
                        <ScoresheetCell className="text-center">{getScoreAtQuarter(match.awayTeam.name, 1)}</ScoresheetCell>
                        <ScoresheetCell className="text-center">{getScoreAtQuarter(match.awayTeam.name, 2)}</ScoresheetCell>
                        <ScoresheetCell className="text-center">{getScoreAtQuarter(match.awayTeam.name, 3)}</ScoresheetCell>
                        <ScoresheetCell className="text-center">{getScoreAtQuarter(match.awayTeam.name, 4)}</ScoresheetCell>
                        <ScoresheetCell className="text-center font-bold">{match.awayTeam.score}</ScoresheetCell>
                    </tr>
                </tbody>
            </table>

        </div>
    </div>
  );
};
