
import { PenaltyType } from './types';

export const MATCH_DURATION_SECONDS = 4 * 15 * 60; // 4 quarters of 15 minutes
export const QUARTER_DURATION_SECONDS = 15 * 60;

export const PENALTY_COLORS: Record<PenaltyType, string> = {
  [PenaltyType.GREEN_CARD]: 'bg-green-500',
  [PenaltyType.YELLOW_CARD]: 'bg-yellow-400',
  [PenaltyType.RED_CARD]: 'bg-red-600',
};

export const PENALTY_NAMES: Record<PenaltyType, string> = {
  [PenaltyType.GREEN_CARD]: 'Green Card',
  [PenaltyType.YELLOW_CARD]: 'Yellow Card',
  [PenaltyType.RED_CARD]: 'Red Card',
};
