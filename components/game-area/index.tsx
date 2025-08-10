'use client';

import type { FC } from 'react';
import PlayerSection from './player-section';
import VSDivider from './VSDivider';
import AISection from './ai-section';
import type { Choice, Result } from '@/lib/game/logic';
import type { AIConfidence } from '@/lib/game/adaptive-ai';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface GameAreaProps {
  difficulty: Difficulty;
  aiPrediction: Choice | null;
  isThinking: boolean;
  result: Result | null;
  adaptivePrediction: AIConfidence | null;
  onPlayerChoice: (choice: Choice) => void;
}

const GameArea: FC<GameAreaProps> = ({
  difficulty,
  aiPrediction,
  isThinking,
  result,
  adaptivePrediction,
  onPlayerChoice,
}) => {
  return (
    <section className="w-full max-w-5xl mx-auto mt-8 md:mt-10 px-3 relative z-10" aria-label="Game area">
      <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-4 lg:gap-6">
        <PlayerSection onPlayerChoice={onPlayerChoice} />
        <VSDivider />
        <AISection
          difficulty={difficulty}
          aiPrediction={aiPrediction}
          isThinking={isThinking}
          result={result}
          adaptivePrediction={adaptivePrediction}
        />
      </div>
    </section>
  );
};

export default GameArea;
export { PlayerSection, VSDivider, AISection };
