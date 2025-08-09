'use client';

import type { FC } from 'react';
import { useCallback } from 'react';
import type { Choice } from '@/lib/game/logic';

interface ChoiceButtonProps {
  readonly label: string;
  readonly value: Choice;
  readonly onClick: (value: Choice) => void;
}

// Constants outside component to avoid recreation
const BUTTON_STYLES = [
  'bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl',
  'px-3 py-3 md:px-6 md:py-4 min-w-[64px] min-h-[64px] md:min-w-[80px] md:min-h-[80px]',
  'text-lg md:text-xl lg:text-2xl font-medium',
  'hover:scale-105 hover:bg-white/30 hover:border-white/50 active:scale-95',
  'transition-all duration-200',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
  'flex items-center justify-center flex-shrink-0 shadow-lg',
].join(' ');

export const ChoiceButton: FC<ChoiceButtonProps> = ({ label, value, onClick }) => {
  const handleClick = useCallback(() => onClick(value), [onClick, value]);

  return (
    <button type="button" aria-label={`Choose ${value}`} onClick={handleClick} className={BUTTON_STYLES}>
      <span className="drop-shadow-sm">{label}</span>
    </button>
  );
};
