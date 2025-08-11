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
  'group relative bg-gradient-to-br from-accent-500/20 via-accent-500/15 to-accent-500/10',
  'backdrop-blur-md border-2 border-accent-400/40 text-white rounded-xl',
  'px-3 py-3 md:px-4 md:py-4 min-w-[56px] min-h-[56px] md:min-w-[64px] md:min-h-[64px]',
  'text-lg md:text-xl lg:text-2xl font-medium',
  'hover:scale-110 hover:shadow-2xl hover:shadow-accent-500/25 hover:border-accent-400/60',
  'hover:bg-gradient-to-br hover:from-accent-500/35 hover:via-accent-500/30 hover:to-accent-500/20',
  'active:scale-95 active:shadow-inner',
  'transition-all duration-300 ease-out',
  'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/50',
  'flex items-center justify-center flex-shrink-0',
  'shadow-xl shadow-black/20',
  'before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent-500/10 before:to-transparent before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300',
  'hover:before:opacity-100',
].join(' ');

export const ChoiceButton: FC<ChoiceButtonProps> = ({ label, value, onClick }) => {
  const handleClick = useCallback(() => onClick(value), [onClick, value]);

  return (
    <button
      type="button"
      aria-label={`Choose ${value} to play against the AI`}
      onClick={handleClick}
      className={BUTTON_STYLES}
      role="button"
      tabIndex={0}
    >
      <span className="drop-shadow-sm" aria-hidden="true">
        {label}
      </span>
      <span className="sr-only">{value}</span>
    </button>
  );
};
