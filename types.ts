export type MatchPeriod = 'Q1' | 'Q2' | 'HT' | 'Q3' | 'Q4' | 'FT';

export enum GameState {
  SETUP = 'SETUP',
  IN_PROGRESS = 'IN_PROGRESS',
  SUMMARY = 'SUMMARY',
}

export enum PenaltyType {
  GREEN_CARD = 'GREEN_CARD', // 2 min suspension
  YELLOW_CARD = 'YELLOW_CARD', // 5 or 10 min suspension
  RED_CARD = 'RED_CARD', // Permanent suspension
}

export interface Player {
  id: number;
  name: string;
  number: number;
}

export interface Team {
  name: string;
  players: Player[];
  score: number;
}

export interface Goal {
  id: string;
  teamName: string;
  scorer: Player;
  time: number; // in seconds from match start
  type: 'FG' | 'PC' | 'PS'; // Field Goal, Penalty Corner, Penalty Stroke
  assist?: Player;
  location?: string; // e.g., 'Top of the D', 'Left Post'
}

export interface Penalty {
  id: string;
  teamName: string;
  player: Player;
  card: PenaltyType;
  time: number; // in seconds from match start
  duration?: number; // Suspension duration in minutes
}

export interface ActivePenalty {
  penaltyId: string;
  player: Player;
  teamName: string;
  endTime: number; // match time in seconds when suspension ends
}

export interface Substitution {
  id: string;
  teamName: string;
  playerOff: Player;
  playerOn: Player;
  time: number; // in seconds from match start
}

export interface Match {
  id:string;
  homeTeam: Team;
  awayTeam: Team;
  venue: string;
  date: string;
  goals: Goal[];
  penalties: Penalty[];
  substitutions: Substitution[];
}