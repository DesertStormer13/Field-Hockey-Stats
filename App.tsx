import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Match, Goal, Penalty, ActivePenalty, Substitution, MatchPeriod } from './types';
import { SetupScreen } from './components/SetupScreen';
import { MatchScreen } from './components/MatchScreen';
import { SummaryScreen } from './components/SummaryScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [matchData, setMatchData] = useState<Match | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activePenalties, setActivePenalties] = useState<ActivePenalty[]>([]);
  const [matchPeriod, setMatchPeriod] = useState<MatchPeriod>('Q1');

  useEffect(() => {
    if (!matchData || gameState !== GameState.IN_PROGRESS) {
      setActivePenalties([]);
      return;
    }

    const active = matchData.penalties
      .filter(p => p.duration && currentTime >= p.time && currentTime < (p.time + p.duration * 60))
      .map(p => ({
        penaltyId: p.id,
        player: p.player,
        teamName: p.teamName,
        endTime: p.time + p.duration! * 60,
      }));
      
    setActivePenalties(active.sort((a, b) => a.endTime - b.endTime));
  }, [currentTime, matchData, gameState]);

  const handleMatchStart = (initialMatchData: Match) => {
    setMatchData(initialMatchData);
    setCurrentTime(0);
    setMatchPeriod('Q1');
    setGameState(GameState.IN_PROGRESS);
  };
  
  const handleNewMatch = () => {
      setMatchData(null);
      setCurrentTime(0);
      setMatchPeriod('Q1');
      setGameState(GameState.SETUP);
  }

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleSetTime = (newTime: number) => {
    if (newTime >= 0) {
      setCurrentTime(newTime);
    }
  };

  const handleSetPeriod = (period: MatchPeriod) => {
    setMatchPeriod(period);
    switch (period) {
      case 'Q1':
        setCurrentTime(0);
        break;
      case 'Q2':
        setCurrentTime(15 * 60);
        break;
      case 'HT':
      case 'Q3':
        setCurrentTime(30 * 60);
        break;
      case 'Q4':
        setCurrentTime(45 * 60);
        break;
      case 'FT':
        setCurrentTime(60 * 60);
        break;
    }
  };

  const handleAddGoal = (goal: Goal) => {
    setMatchData((prevMatch) => {
      if (!prevMatch) return null;
      const updatedMatch = { ...prevMatch };
      updatedMatch.goals = [...updatedMatch.goals, goal];
      if (goal.teamName === updatedMatch.homeTeam.name) {
        updatedMatch.homeTeam.score += 1;
      } else {
        updatedMatch.awayTeam.score += 1;
      }
      return updatedMatch;
    });
  };

  const handleAddPenalty = (penalty: Penalty) => {
    setMatchData((prevMatch) => {
      if (!prevMatch) return null;
      return {
        ...prevMatch,
        penalties: [...prevMatch.penalties, penalty],
      };
    });
  };

  const handleAddSubstitution = (substitution: Substitution) => {
    setMatchData((prevMatch) => {
        if (!prevMatch) return null;
        return {
            ...prevMatch,
            substitutions: [...(prevMatch.substitutions || []), substitution],
        };
    });
  };

  const handleUpdateEvent = (updatedEvent: Goal | Penalty | Substitution) => {
    setMatchData(prevMatch => {
      if (!prevMatch) return null;
      
      let matchCopy = { ...prevMatch };

      if ('scorer' in updatedEvent) { // Goal
        matchCopy.goals = prevMatch.goals.map(g => g.id === updatedEvent.id ? updatedEvent : g);
      } else if ('card' in updatedEvent) { // Penalty
        matchCopy.penalties = prevMatch.penalties.map(p => p.id === updatedEvent.id ? updatedEvent : p);
      } else if ('playerOff' in updatedEvent) { // Substitution
        matchCopy.substitutions = (prevMatch.substitutions || []).map(s => s.id === updatedEvent.id ? updatedEvent as Substitution : s);
      }
      
      return matchCopy;
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setMatchData(prevMatch => {
      if (!prevMatch) return null;
      
      const goalToDelete = prevMatch.goals.find(g => g.id === eventId);
      
      let newHomeScore = prevMatch.homeTeam.score;
      let newAwayScore = prevMatch.awayTeam.score;

      if (goalToDelete) {
        if (goalToDelete.teamName === prevMatch.homeTeam.name) {
          newHomeScore--;
        } else {
          newAwayScore--;
        }
      }

      return {
        ...prevMatch,
        goals: prevMatch.goals.filter(g => g.id !== eventId),
        penalties: prevMatch.penalties.filter(p => p.id !== eventId),
        substitutions: (prevMatch.substitutions || []).filter(s => s.id !== eventId),
        homeTeam: { ...prevMatch.homeTeam, score: newHomeScore },
        awayTeam: { ...prevMatch.awayTeam, score: newAwayScore },
      };
    });
  };

  const handleMatchEnd = () => {
    setGameState(GameState.SUMMARY);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.SETUP:
        return <SetupScreen onMatchStart={handleMatchStart} />;
      case GameState.IN_PROGRESS:
        if (matchData) {
          return (
            <MatchScreen
              match={matchData}
              onAddGoal={handleAddGoal}
              onAddPenalty={handleAddPenalty}
              onAddSubstitution={handleAddSubstitution}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onMatchEnd={handleMatchEnd}
              onTimeUpdate={handleTimeUpdate}
              onSetTime={handleSetTime}
              currentTime={currentTime}
              activePenalties={activePenalties}
              matchPeriod={matchPeriod}
              onSetPeriod={handleSetPeriod}
            />
          );
        }
        return null; // Should not happen
      case GameState.SUMMARY:
        if (matchData) {
          return <SummaryScreen match={matchData} onNewMatch={handleNewMatch} />;
        }
        return null; // Should not happen
      default:
        return <SetupScreen onMatchStart={handleMatchStart} />;
    }
  };

  return <div className="App">{renderContent()}</div>;
};

export default App;
