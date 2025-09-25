
import React from 'react';
import { PenaltyType } from '../../types';
import { PENALTY_COLORS } from '../../constants';

interface CardIconProps {
  card: PenaltyType;
  className?: string;
}

export const CardIcon: React.FC<CardIconProps> = ({ card, className = 'w-4 h-6' }) => (
  <div className={`${PENALTY_COLORS[card]} ${className} rounded-sm border border-black/20`}></div>
);
