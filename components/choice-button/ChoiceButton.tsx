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
      className='bg-primary text-primary-foreground rounded-lg px-4 py-2 text-lg font-medium hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 ring-ring'
    >
      {label}
    </button>
  );
};
