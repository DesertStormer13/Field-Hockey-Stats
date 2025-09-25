
import React from 'react';

export const HockeyStickIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 14.5L21 21" />
    <path d="M12 21a9 9 0 1 1 6.18-2.82" />
  </svg>
);
