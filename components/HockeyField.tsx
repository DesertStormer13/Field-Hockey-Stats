import React from 'react';

interface HockeyFieldProps {
  onLocationSelect: (location: string) => void;
}

export const HockeyField: React.FC<HockeyFieldProps> = ({ onLocationSelect }) => {
  const zoneBaseStyle = "stroke-green-400 stroke-1 opacity-0 hover:opacity-100 fill-green-400/40 cursor-pointer transition-opacity";

  return (
    <div className="relative">
      <svg viewBox="0 0 320 250" className="w-full bg-green-700 rounded-lg border-2 border-green-500">
        {/* Goal */}
        <rect x="140" y="245" width="40" height="5" fill="#e2e8f0" />
        
        {/* Shooting Circle (D) */}
        <path d="M 110 245 A 50 50 0 0 1 210 245" stroke="white" strokeWidth="2" fill="none" />
        <line x1="110" y1="195" x2="110" y2="245" stroke="white" strokeWidth="2" />
        <line x1="210" y1="195" x2="210" y2="245" stroke="white" strokeWidth="2" />
        <line x1="110" y1="195" x2="210" y2="195" stroke="white" strokeWidth="2" />

        {/* Penalty Spot */}
        <circle cx="160" cy="220" r="2" fill="white" />
        
        {/* 23m line (dashed) */}
        <line x1="0" y1="100" x2="320" y2="100" stroke="white" strokeWidth="2" strokeDasharray="5,5" />

        {/* Clickable Zones */}
        <g onClick={(e) => e.stopPropagation()}>
          {/* Top of D */}
          <path d="M 110 195 L 210 195 L 210 215 A 30 30 0 0 0 110 215 Z" className={zoneBaseStyle} onClick={() => onLocationSelect('Top of the D')} />
          {/* Left Post */}
          <rect x="110" y="215" width="45" height="30" className={zoneBaseStyle} onClick={() => onLocationSelect('Left Post')} />
          {/* Right Post */}
          <rect x="165" y="215" width="45" height="30" className={zoneBaseStyle} onClick={() => onLocationSelect('Right Post')} />

          {/* Left Wing */}
          <path d="M 60 195 L 110 195 L 110 245 L 60 245 Z" className={zoneBaseStyle} onClick={() => onLocationSelect('Left Wing')} />
          {/* Right Wing */}
          <path d="M 210 195 L 260 195 L 260 245 L 210 245 Z" className={zoneBaseStyle} onClick={() => onLocationSelect('Right Wing')} />
        
          {/* Top Left */}
          <rect x="60" y="100" width="100" height="95" className={zoneBaseStyle} onClick={() => onLocationSelect('Top Left')} />
          {/* Top Right */}
          <rect x="160" y="100" width="100" height="95" className={zoneBaseStyle} onClick={() => onLocationSelect('Top Right')} />
        </g>
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-center pointer-events-none">
        <h4 className="font-bold text-lg">Select Shot Location</h4>
        <p className="text-sm">(Hover over areas to see zones)</p>
      </div>
    </div>
  );
};