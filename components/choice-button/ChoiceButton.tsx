"use client";

import type { FC } from "react";

interface Props {
  readonly label: string;
  readonly value: "rock" | "paper" | "scissors";
  readonly onClick: (value: Props["value"]) => void;
}

export const ChoiceButton: FC<Props> = ({ label, value, onClick }) => {
  return (
    <button
      type='button'
      aria-label={`Choose ${value}`}
      onClick={() => onClick(value)}
      className='bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl px-3 py-3 md:px-6 md:py-4 text-lg md:text-xl lg:text-2xl font-medium hover:scale-105 hover:bg-white/30 hover:border-white/50 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 shadow-lg min-w-[64px] min-h-[64px] md:min-w-[80px] md:min-h-[80px] flex items-center justify-center flex-shrink-0'
    >
      <span className='drop-shadow-sm'>{label}</span>
    </button>
  );
};
