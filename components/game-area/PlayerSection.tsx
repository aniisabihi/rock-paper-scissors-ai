'use client';

import type { FC } from 'react';
import { ChoiceButton } from '@/components/ChoiceButton';
import type { Choice } from '@/lib/game/logic';

interface PlayerSectionProps {
  onPlayerChoice: (choice: Choice) => void;
}

const PlayerSection: FC<PlayerSectionProps> = ({ onPlayerChoice }) => {
  return (
    <section className="flex flex-col items-center gap-2 w-full order-1 md:order-1 group" aria-label="Player controls">
      <div className="text-center space-y-1">
        <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
          You
        </h2>
      </div>
      <div className="flex flex-row gap-2 md:gap-3 justify-center p-2">
        <ChoiceButton label="🪨" value="rock" onClick={onPlayerChoice} />
        <ChoiceButton label="📄" value="paper" onClick={onPlayerChoice} />
        <ChoiceButton label="✂️" value="scissors" onClick={onPlayerChoice} />
      </div>
    </section>
  );
};

export default PlayerSection;
