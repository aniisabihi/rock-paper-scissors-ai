'use client';

import type { FC } from 'react';
import { Info } from 'lucide-react';

interface InfoButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

const InfoButton: FC<InfoButtonProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="absolute top-0 right-0 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20 z-50 flex items-center justify-center"
      aria-label="Toggle game information"
      aria-expanded={isOpen}
    >
      <Info className="w-5 h-5" />
    </button>
  );
};

export default InfoButton;
