import React, { useState, useEffect, useCallback } from 'react';
import { QUARTER_DURATION_SECONDS } from '../constants';
import { ClockIcon } from './icons/ClockIcon';
import { MatchPeriod } from '../types';

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate: (time: number) => void;
  initialTime: number;
  period: MatchPeriod;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const Timer: React.FC<TimerProps> = ({ isRunning, onTimeUpdate, initialTime, period }) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, onTimeUpdate]);

  const getPeriodDisplay = () => {
    if (period === 'HT') return 'Half Time';
    if (period === 'FT') return 'Full Time';
    
    const quarterNumber = parseInt(period.replace('Q', ''), 10);
    const quarterStartTime = (quarterNumber - 1) * QUARTER_DURATION_SECONDS;
    const timeInQuarter = time - quarterStartTime;

    return `Quarter ${quarterNumber} - ${formatTime(timeInQuarter >= 0 ? timeInQuarter : 0)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2 text-gray-400 text-sm">
        <ClockIcon className="w-4 h-4" />
        <span>MATCH TIME</span>
      </div>
      <div className="text-6xl font-mono font-bold tracking-widest text-green-400">
        {formatTime(time)}
      </div>
      <div className="text-sm text-gray-400 mt-1">
        {getPeriodDisplay()}
      </div>
    </div>
  );
};
