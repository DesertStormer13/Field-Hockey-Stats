import React from 'react';

export const SubstitutionIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
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
    <path d="M8 10l-5 5 5 5" />
    <path d="M3 15h18" />
    <path d="M16 4l5 5-5 5" />
    <path d="M21 9H3" />
  </svg>
);