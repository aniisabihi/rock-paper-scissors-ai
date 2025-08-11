'use client';

import type { FC } from 'react';
import PlayerSection from './player-section';
import VSDivider from './VSDivider';
import AISection from './ai-section';
import type { Choice, Result } from '@/lib/game/logic';
import type { AIConfidence, AdaptiveAI } from '@/lib/game/adaptive-ai';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface GameAreaProps {
  difficulty: Difficulty;
  aiPrediction: Choice | null;
  isThinking: boolean;
  result: Result | null;
  adaptivePrediction: AIConfidence | null;
  onPlayerChoice: (choice: Choice) => void;
  adaptiveAI: AdaptiveAI | null;
  onOpenInfoModal: () => void;
}

const GameArea: FC<GameAreaProps> = ({
  difficulty,
  aiPrediction,
  isThinking,
  result,
  adaptivePrediction,
  onPlayerChoice,
  adaptiveAI,
  onOpenInfoModal,
}) => {
  return (
    <section className="w-full max-w-5xl mx-auto mt-50 md:mt-10 px-3 relative z-10" aria-label="Game area">
      <div className="flex flex-col md:grid grid-cols-3 items-center gap-3 md:gap-4 lg:gap-6">
        <AISection
          difficulty={difficulty}
          aiPrediction={aiPrediction}
          isThinking={isThinking}
          result={result}
          adaptivePrediction={adaptivePrediction}
          adaptiveAI={adaptiveAI}
          onOpenInfoModal={onOpenInfoModal}
        />
        <VSDivider />
        <PlayerSection onPlayerChoice={onPlayerChoice} />
      </div>
    </section>
  );
};

export default GameArea;
export { PlayerSection, VSDivider, AISection };
