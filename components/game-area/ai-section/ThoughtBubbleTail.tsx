'use client';

import type { FC } from 'react';

interface ThoughtBubbleTailProps {
  className?: string;
}

const ThoughtBubbleTail: FC<ThoughtBubbleTailProps> = ({ className = '' }) => {
  return (
    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${className}`}>
      {/* Main tail shape */}
      <div className="w-4 h-4 bg-dark-800/90 backdrop-blur-md border-2 border-accent-400/30 transform rotate-45 translate-y-2" />
      {/* Small connecting circle */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-dark-800/90 backdrop-blur-md border-2 border-accent-400/30 rounded-full translate-y-1" />
    </div>
  );
};

export default ThoughtBubbleTail;
