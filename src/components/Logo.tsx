import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 40 }) => {
  return (
    <div 
      className={cn("relative flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950 shadow-xl", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[80%] h-[80%]"
      >
        {/* Style inspired by the user's uploaded logo */}
        {/* Main White Shape (Lightning/S-like) */}
        <path
          d="M15 40 L35 25 L45 42 L35 42 L42 58 L15 58 L15 40 Z"
          fill="white"
        />
        {/* Main Red T Shape */}
        <path
          d="M38 35 H75 L80 42 L65 55 L58 42 L38 42 L38 35 Z"
          fill="#ef4444"
        />
        <path
          d="M58 42 L58 85 L45 85 L45 42 L58 42 Z"
          fill="#ef4444"
        />
      </svg>
    </div>
  );
};
