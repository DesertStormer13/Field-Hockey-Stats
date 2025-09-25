import React, { useState, useEffect } from 'react';
import { Match, Player, Goal, Penalty, PenaltyType, ActivePenalty, Substitution, MatchPeriod } from '../types';
import { Timer } from './Timer';
import { PENALTY_NAMES } from '../constants';
import { CardIcon } from './icons/CardIcons';
import { HockeyStickIcon } from './icons/HockeyStickIcon';
import { ClockIcon } from './icons/ClockIcon';
import { SubstitutionIcon } from './icons/SubstitutionIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { HockeyField } from './HockeyField';


interface MatchScreenProps {
  match: Match;
  onAddGoal: (goal: Goal) => void;
  onAddPenalty: (penalty: Penalty) => void;
  onAddSubstitution: (substitution: Substitution) => void;
  onUpdateEvent: (event: Goal | Penalty | Substitution) => void;
  onDeleteEvent: (eventId: string) => void;
  onMatchEnd: () => void;
  onTimeUpdate: (time: number) => void;
  onSetTime: (time: number) => void;
  currentTime: number;
  activePenalties: ActivePenalty[];
  matchPeriod: MatchPeriod;
  onSetPeriod: (period: MatchPeriod) => void;
}

type EventObject = Goal | Penalty | Substitution;

interface AddEventModalProps {
    team: { name: string; players: Player[] };
    onClose: () => void;
    onAddGoal: (scorer: Player, type: 'FG' | 'PC' | 'PS', location: string, assist?: Player) => void;
    onAddPenalty: (player: Player, card: PenaltyType, duration?: number) => void;
    onAddSubstitution: (playerOff: Player, playerOn: Player) => void;
    onUpdate: (event: EventObject) => void;
    eventToEdit: EventObject | null;
}

const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const AddEventModal: React.FC<AddEventModalProps> = ({ team, onClose, onAddGoal, onAddPenalty, onAddSubstitution, onUpdate, eventToEdit }) => {
    const [eventType, setEventType] = useState<'goal' | 'penalty' | 'substitution'>('goal');
    
    // Common state
    const [selectedPlayer, setSelectedPlayer] = useState<string>('');
    
    // Goal state
    const [goalStep, setGoalStep] = useState<'location' | 'details'>('location');
    const [goalLocation, setGoalLocation] = useState<string | null>(null);
    const [goalType, setGoalType] = useState<'FG' | 'PC' | 'PS'>('FG');
    const [assistPlayerId, setAssistPlayerId] = useState<string>('');
    
    // Penalty state
    const [penaltyType, setPenaltyType] = useState<PenaltyType>(PenaltyType.GREEN_CARD);
    const [yellowCardDuration, setYellowCardDuration] = useState<5 | 10>(5);

    // Substitution state
    const [selectedPlayerOff, setSelectedPlayerOff] = useState<string>('');
    const [selectedPlayerOn, setSelectedPlayerOn] = useState<string>('');
    
    const isEditing = !!eventToEdit;

    useEffect(() => {
        if (isEditing) {
            setGoalStep('details'); // Skip location selection when editing
            if ('scorer' in eventToEdit) {
                setEventType('goal');
                setSelectedPlayer(eventToEdit.scorer.id.toString());
                setGoalType(eventToEdit.type);
                setGoalLocation(eventToEdit.location || 'Unknown');
                setAssistPlayerId(eventToEdit.assist?.id.toString() || '');
            } else if ('card' in eventToEdit) {
                setEventType('penalty');
                setSelectedPlayer(eventToEdit.player.id.toString());
                setPenaltyType(eventToEdit.card);
                if (eventToEdit.card === PenaltyType.YELLOW_CARD) {
                    setYellowCardDuration(eventToEdit.duration as 5 | 10 || 5);
                }
            } else if ('playerOff' in eventToEdit) {
                setEventType('substitution');
                setSelectedPlayerOff(eventToEdit.playerOff.id.toString());
                setSelectedPlayerOn(eventToEdit.playerOn.id.toString());
            }
        } else {
            // Reset for new event
            setEventType('goal');
            setGoalStep('location');
            setGoalLocation(null);
            setSelectedPlayer(team.players[0]?.id.toString() ?? '');
            setSelectedPlayerOff(team.players[0]?.id.toString() ?? '');
            setSelectedPlayerOn(team.players.length > 1 ? team.players[1].id.toString() : (team.players[0]?.id.toString() ?? ''));
        }
    }, [eventToEdit, team]);
    
    useEffect(() => {
        // Reset assist if scorer changes or goal type is not FG
        if (goalType !== 'FG') {
            setAssistPlayerId('');
        }
    }, [selectedPlayer, goalType]);

    const handleLocationSelect = (location: string) => {
        setGoalLocation(location);
        setGoalStep('details');
    };

    const handleGoBackToLocation = () => {
        setGoalLocation(null);
        setGoalStep('location');
    };

    const handleSubmit = () => {
        if (isEditing) {
            let updatedEvent: EventObject | null = null;
            if (eventType === 'goal') {
                const scorer = team.players.find(p => p.id.toString() === selectedPlayer);
                if (!scorer || !goalLocation) return;
                const assist = team.players.find(p => p.id.toString() === assistPlayerId);
                updatedEvent = { ...eventToEdit, scorer, type: goalType, location: goalLocation, assist: assist || undefined };
            } else if (eventType === 'penalty') {
                const player = team.players.find(p => p.id.toString() === selectedPlayer);
                if (!player) return;
                const duration = penaltyType === PenaltyType.GREEN_CARD ? 2 : (penaltyType === PenaltyType.YELLOW_CARD ? yellowCardDuration : undefined);
                updatedEvent = { ...eventToEdit, player, card: penaltyType, duration };
            } else if (eventType === 'substitution') {
                const playerOff = team.players.find(p => p.id.toString() === selectedPlayerOff);
                const playerOn = team.players.find(p => p.id.toString() === selectedPlayerOn);
                if (!playerOff || !playerOn) return;
                updatedEvent = { ...eventToEdit, playerOff, playerOn };
            }
            if (updatedEvent) onUpdate(updatedEvent);
        } else {
             if (eventType === 'goal') {
                const player = team.players.find(p => p.id.toString() === selectedPlayer);
                if (!player) return;
                if (!goalLocation) {
                    alert("Please select a location on the field.");
                    return;
                }
                let assistPlayer: Player | undefined = undefined;
                if (goalType === 'FG' && assistPlayerId) {
                    assistPlayer = team.players.find(p => p.id.toString() === assistPlayerId);
                }
                onAddGoal(player, goalType, goalLocation, assistPlayer);

            } else if (eventType === 'penalty') {
                const player = team.players.find(p => p.id.toString() === selectedPlayer);
                if (!player) return;
                let duration: number | undefined;
                if (penaltyType === PenaltyType.GREEN_CARD) {
                    duration = 2;
                } else if (penaltyType === PenaltyType.YELLOW_CARD) {
                    duration = yellowCardDuration;
                }
                onAddPenalty(player, penaltyType, duration);
            } else if (eventType === 'substitution') {
                if (selectedPlayerOff === selectedPlayerOn) {
                    alert("Player cannot substitute themselves.");
                    return;
                }
                const playerOff = team.players.find(p => p.id.toString() === selectedPlayerOff);
                const playerOn = team.players.find(p => p.id.toString() === selectedPlayerOn);
                if (!playerOff || !playerOn) return;
                onAddSubstitution(playerOff, playerOn);
            }
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit' : 'Add'} Event for {team.name}</h2>
                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Event Type</label>
                    <select
                        value={eventType}
                        onChange={e => setEventType(e.target.value as 'goal' | 'penalty' | 'substitution')}
                        className="w-full bg-gray-700 p-2 rounded disabled:opacity-50"
                        disabled={isEditing}
                    >
                        <option value="goal">Goal</option>
                        <option value="penalty">Penalty Card</option>
                        <option value="substitution">Substitution</option>
                    </select>
                </div>
                
                {eventType === 'goal' && (
                    <>
                        {goalStep === 'location' && !isEditing && (
                           <HockeyField onLocationSelect={handleLocationSelect} />
                        )}
                        {goalStep === 'details' && goalLocation && (
                             <>
                                <div className="flex justify-between items-center mb-4 p-2 bg-gray-700/50 rounded-md">
                                    <p className="text-sm text-gray-300">Location: <span className="font-semibold text-green-400">{goalLocation}</span></p>
                                    {!isEditing && <button onClick={handleGoBackToLocation} className="text-sm text-cyan-400 hover:underline">Change Location</button>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-400 mb-2">Scorer</label>
                                    <select
                                        value={selectedPlayer}
                                        onChange={e => setSelectedPlayer(e.target.value)}
                                        className="w-full bg-gray-700 p-2 rounded"
                                    >
                                        {team.players.map(p => <option key={p.id} value={p.id}>{p.number} - {p.name}</option>)}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-400 mb-2">Goal Type</label>
                                    <select
                                        value={goalType}
                                        onChange={e => setGoalType(e.target.value as 'FG' | 'PC' | 'PS')}
                                        className="w-full bg-gray-700 p-2 rounded"
                                    >
                                        <option value="FG">Field Goal (FG)</option>
                                        <option value="PC">Penalty Corner (PC)</option>
                                        <option value="PS">Penalty Stroke (PS)</option>
                                    </select>
                                </div>
                                {goalType === 'FG' && (
                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-2">Assist (Optional)</label>
                                        <select
                                            value={assistPlayerId}
                                            onChange={e => setAssistPlayerId(e.target.value)}
                                            className="w-full bg-gray-700 p-2 rounded"
                                        >
                                            <option value="">No Assist</option>
                                            {team.players
                                                .filter(p => p.id.toString() !== selectedPlayer)
                                                .map(p => <option key={p.id} value={p.id}>{p.number} - {p.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}


                {eventType === 'penalty' && (
                     <>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Player</label>
                            <select
                                value={selectedPlayer}
                                onChange={e => setSelectedPlayer(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded"
                            >
                                {team.players.map(p => <option key={p.id} value={p.id}>{p.number} - {p.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Card</label>
                            <select
                                value={penaltyType}
                                onChange={e => setPenaltyType(e.target.value as PenaltyType)}
                                className="w-full bg-gray-700 p-2 rounded"
                            >
                                <option value={PenaltyType.GREEN_CARD}>Green Card</option>
                                <option value={PenaltyType.YELLOW_CARD}>Yellow Card</option>
                                <option value={PenaltyType.RED_CARD}>Red Card</option>
                            </select>
                        </div>
                        {penaltyType === PenaltyType.YELLOW_CARD && (
                            <div className="mb-4">
                                <label className="block text-gray-400 mb-2">Suspension Duration</label>
                                <select
                                    value={yellowCardDuration}
                                    onChange={e => setYellowCardDuration(parseInt(e.target.value, 10) as 5 | 10)}
                                    className="w-full bg-gray-700 p-2 rounded"
                                >
                                    <option value={5}>5 minutes</option>
                                    <option value={10}>10 minutes</option>
                                </select>
                            </div>
                        )}
                    </>
                )}

                {eventType === 'substitution' && (
                    <>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Player Leaving Field (OUT)</label>
                            <select
                                value={selectedPlayerOff}
                                onChange={e => setSelectedPlayerOff(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded"
                            >
                                {team.players.map(p => <option key={`off-${p.id}`} value={p.id}>{p.number} - {p.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Player Entering Field (IN)</label>
                            <select
                                value={selectedPlayerOn}
                                onChange={e => setSelectedPlayerOn(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded"
                            >
                                {team.players.map(p => <option key={`on-${p.id}`} value={p.id}>{p.number} - {p.name}</option>)}
                            </select>
                        </div>
                    </>
                )}
                
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded">Cancel</button>
                    {!(eventType === 'goal' && goalStep === 'location' && !isEditing) &&
                        <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded">{isEditing ? 'Update Event' : 'Add Event'}</button>
                    }
                </div>
            </div>
        </div>
    );
};

export const MatchScreen: React.FC<MatchScreenProps> = ({ match, onAddGoal, onAddPenalty, onAddSubstitution, onUpdateEvent, onDeleteEvent, onMatchEnd, onTimeUpdate, onSetTime, currentTime, activePenalties, matchPeriod, onSetPeriod }) => {
    const [timerIsRunning, setTimerIsRunning] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [modalTeam, setModalTeam] = useState<'home' | 'away' | null>(null);
    const [eventToEdit, setEventToEdit] = useState<EventObject | null>(null);
    const [eventToDelete, setEventToDelete] = useState<EventObject | null>(null);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [customTime, setCustomTime] = useState(formatTime(currentTime));

    useEffect(() => {
        if (isTimeModalOpen) {
            setCustomTime(formatTime(currentTime));
        }
    }, [isTimeModalOpen, currentTime]);
    
    const openEventModalForTeam = (team: 'home' | 'away') => {
        setModalTeam(team);
        setEventToEdit(null);
        setIsEventModalOpen(true);
    };

    const handleEditEvent = (event: EventObject) => {
        setModalTeam(event.teamName === match.homeTeam.name ? 'home' : 'away');
        setEventToEdit(event);
        setIsEventModalOpen(true);
    };

    const closeEventModal = () => {
        setIsEventModalOpen(false);
        setEventToEdit(null);
        setModalTeam(null);
    };

    const allEvents = [...match.goals, ...match.penalties, ...(match.substitutions || [])].sort((a, b) => b.time - a.time);

    const handleSetCustomTime = () => {
        const parts = customTime.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10);
            const seconds = parseInt(parts[1], 10);
            if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60) {
                const totalSeconds = minutes * 60 + seconds;
                onSetTime(totalSeconds);
                setIsTimeModalOpen(false);
                return;
            }
        }
        alert('Invalid time format. Please use MM:SS.');
    };

    const handleAddGoal = (scorer: Player, type: 'FG' | 'PC' | 'PS', location: string, assist?: Player) => {
        if (!modalTeam) return;
        const teamName = modalTeam === 'home' ? match.homeTeam.name : match.awayTeam.name;
        const goal: Goal = {
            id: `goal-${Date.now()}`,
            teamName,
            scorer,
            time: currentTime,
            type,
            location,
            assist,
        };
        onAddGoal(goal);
    };

    const handleAddPenalty = (player: Player, card: PenaltyType, duration?: number) => {
        if (!modalTeam) return;
        const teamName = modalTeam === 'home' ? match.homeTeam.name : match.awayTeam.name;
        const penalty: Penalty = {
            id: `penalty-${Date.now()}`,
            teamName,
            player,
            card,
            time: currentTime,
            duration,
        };
        onAddPenalty(penalty);
    };

    const handleAddSubstitution = (playerOff: Player, playerOn: Player) => {
        if (!modalTeam) return;
        const teamName = modalTeam === 'home' ? match.homeTeam.name : match.awayTeam.name;
        const substitution: Substitution = {
            id: `sub-${Date.now()}`,
            teamName,
            playerOff,
            playerOn,
            time: currentTime
        };
        onAddSubstitution(substitution);
    };
    
    const handleAdvancePeriod = () => {
        setTimerIsRunning(false);
        switch (matchPeriod) {
            case 'Q1': onSetPeriod('Q2'); break;
            case 'Q2': onSetPeriod('HT'); break;
            case 'HT': onSetPeriod('Q3'); break;
            case 'Q3': onSetPeriod('Q4'); break;
            case 'Q4':
                onSetPeriod('FT');
                onMatchEnd();
                break;
        }
    };
    
    const handleDeleteConfirm = () => {
        if (eventToDelete) {
            onDeleteEvent(eventToDelete.id);
            setEventToDelete(null);
        }
    };

    const getPeriodButtonText = () => {
        switch (matchPeriod) {
            case 'Q1': return 'End Quarter 1';
            case 'Q2': return 'Start Half Time';
            case 'HT': return 'Start Quarter 3';
            case 'Q3': return 'End Quarter 3';
            case 'Q4': return 'Finish Match';
            case 'FT': return 'Match Finished';
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-900 min-h-screen">
             {isEventModalOpen && modalTeam && (
                <AddEventModal
                    team={modalTeam === 'home' ? match.homeTeam : match.awayTeam}
                    onClose={closeEventModal}
                    onAddGoal={handleAddGoal}
                    onAddPenalty={handleAddPenalty}
                    onAddSubstitution={handleAddSubstitution}
                    onUpdate={onUpdateEvent}
                    eventToEdit={eventToEdit}
                />
            )}
            {eventToDelete && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-8 w-full max-w-sm shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
                        <p className="text-gray-400 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setEventToDelete(null)} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            {isTimeModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-8 w-full max-w-sm shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">Set Match Time</h2>
                        <p className="text-gray-400 mb-4">Enter the new match time in MM:SS format.</p>
                        <input
                            type="text"
                            value={customTime}
                            onChange={e => setCustomTime(e.target.value)}
                            className="w-full bg-gray-700 p-3 rounded-md mb-6 text-center font-mono text-2xl"
                            placeholder="MM:SS"
                        />
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setIsTimeModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded">Cancel</button>
                            <button onClick={handleSetCustomTime} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded">Set Time</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {/* Scoreboard and Timer Column */}
                <div className="lg:col-span-3 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-800/50 p-6 rounded-xl shadow-2xl">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        <h2 className="text-3xl font-bold text-cyan-400">{match.homeTeam.name}</h2>
                        <p className="text-8xl font-black">{match.homeTeam.score}</p>
                        <button onClick={() => openEventModalForTeam('home')} className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-semibold transition-transform transform hover:scale-105">+ Add Event</button>
                    </div>

                    {/* Timer and Controls */}
                    <div className="flex-1 flex flex-col items-center">
                         <Timer isRunning={timerIsRunning} onTimeUpdate={onTimeUpdate} initialTime={currentTime} period={matchPeriod} />
                         <div className="flex space-x-4 mt-4">
                            <button onClick={() => setTimerIsRunning(!timerIsRunning)} className={`px-6 py-2 rounded-lg font-bold text-lg w-32 ${timerIsRunning ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-green-600 hover:bg-green-500'}`}>
                                {timerIsRunning ? 'Pause' : 'Start'}
                            </button>
                             <button 
                                onClick={() => setIsTimeModalOpen(true)} 
                                className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg font-bold transition-transform transform hover:scale-105"
                                aria-label="Edit match time"
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </div>
                         <div className="mt-4">
                            <button
                                onClick={handleAdvancePeriod}
                                disabled={matchPeriod === 'FT'}
                                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold text-base disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors w-48 text-center"
                            >
                                {getPeriodButtonText()}
                            </button>
                        </div>
                    </div>
                    
                    {/* Away Team */}
                    <div className="flex-1 text-center">
                         <h2 className="text-3xl font-bold text-rose-400">{match.awayTeam.name}</h2>
                         <p className="text-8xl font-black">{match.awayTeam.score}</p>
                         <button onClick={() => openEventModalForTeam('away')} className="mt-4 bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-semibold transition-transform transform hover:scale-105">+ Add Event</button>
                    </div>
                </div>

                {/* Container for Log and Suspensions */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Event Log */}
                    <div className="md:col-span-3 bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Event Log</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {allEvents.length > 0 ? allEvents.map(event => (
                                <div key={event.id} className={`group flex items-center justify-between p-3 rounded-md ${event.teamName === match.homeTeam.name ? 'bg-cyan-900/40' : 'bg-rose-900/40'}`}>
                                    <div className="flex items-center space-x-3">
                                        <span className="font-mono text-gray-400 text-sm">{formatTime(event.time)}</span>
                                        {'scorer' in event ? (
                                            <>
                                                <HockeyStickIcon className="text-green-400" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        Goal - {event.type}
                                                        {(event as Goal).location && <span className="text-gray-400 font-normal"> from {(event as Goal).location}</span>}
                                                    </span>
                                                    <span className="text-sm text-gray-300">{(event as Goal).scorer.name} (#{ (event as Goal).scorer.number})</span>
                                                    {(event as Goal).assist && (
                                                        <span className="text-xs text-gray-400 mt-1">Assist: {(event as Goal).assist.name} (#{(event as Goal).assist.number})</span>
                                                    )}
                                                </div>
                                            </>
                                        ) : 'card' in event ? (
                                            <>
                                                <CardIcon card={(event as Penalty).card} />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        {PENALTY_NAMES[(event as Penalty).card]}
                                                        {(event as Penalty).duration && ` (${(event as Penalty).duration} min)`}
                                                    </span>
                                                    <span className="text-sm text-gray-300">{(event as Penalty).player.name} (#{(event as Penalty).player.number})</span>
                                                </div>
                                            </>
                                        ) : 'playerOff' in event ? (
                                          <>
                                              <SubstitutionIcon className="text-blue-400" />
                                              <div className="flex flex-col">
                                                  <span className="font-semibold">Substitution</span>
                                                  <span className="text-sm text-gray-300">
                                                      <span className="font-semibold text-red-400">OUT:</span> {(event as Substitution).playerOff.name} (#{(event as Substitution).playerOff.number})
                                                  </span>
                                                  <span className="text-sm text-gray-300">
                                                      <span className="font-semibold text-green-400">IN:</span> {(event as Substitution).playerOn.name} (#{(event as Substitution).playerOn.number})
                                                  </span>
                                              </div>
                                          </>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-sm">{event.teamName}</span>
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditEvent(event)} className="p-1 rounded-full hover:bg-gray-600"><PencilIcon className="w-4 h-4 text-yellow-400" /></button>
                                            <button onClick={() => setEventToDelete(event)} className="p-1 rounded-full hover:bg-gray-600"><TrashIcon className="w-4 h-4 text-red-500" /></button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center py-4">No events recorded yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Active Suspensions */}
                    <div className="md:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2 flex items-center">
                            <ClockIcon className="w-6 h-6 mr-3 text-yellow-400"/>
                            Active Suspensions
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                             {activePenalties.length > 0 ? activePenalties.map(penalty => {
                                const remainingTime = penalty.endTime - currentTime;
                                if (remainingTime <= 0) return null; 

                                return (
                                    <div key={penalty.penaltyId} className={`flex items-center justify-between p-3 rounded-md animate-pulse-slow ${penalty.teamName === match.homeTeam.name ? 'bg-cyan-900/50 border-l-4 border-cyan-400' : 'bg-rose-900/50 border-l-4 border-rose-400'}`}>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{penalty.player.name}</span>
                                            <span className="text-sm text-gray-300">#{penalty.player.number}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-2xl font-bold text-yellow-400">
                                                {formatTime(remainingTime)}
                                            </span>
                                            <p className="text-xs text-gray-400">{penalty.teamName}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-gray-500 text-center py-4">No active suspensions.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
