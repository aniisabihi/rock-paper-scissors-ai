'use client';

import type { FC } from 'react';
import ResultDisplay from './ResultDisplay';
import GameDetails from './GameDetails';
import type { Choice, Result } from '@/lib/game/logic';

interface GameResultsProps {
  result: Result | null;
  playerChoice: Choice | null;
  aiChoice: Choice | null;
}

const GameResults: FC<GameResultsProps> = ({ result, playerChoice, aiChoice }) => {
  return (
    <section
      className="w-full max-w-4xl mt-4 -mb-8 md:-mb-12 text-center relative z-10"
      aria-label="Game results"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Fixed height container to prevent layout shifts */}
      <ResultDisplay result={result} />

      {/* Game details with stable height */}
      <div className="min-h-[120px] md:min-h-[140px] flex flex-col justify-start">
        <GameDetails result={result} playerChoice={playerChoice} aiChoice={aiChoice} />
      </div>
    </section>
  );
};

export default GameResults;
export { ResultDisplay, GameDetails };
