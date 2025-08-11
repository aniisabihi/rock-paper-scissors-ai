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
      className="fixed top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20 z-50 flex items-center justify-center"
      aria-label="Toggle game information"
      aria-expanded={isOpen}
    >
      <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
    </button>
  );
};

export default InfoButton;
