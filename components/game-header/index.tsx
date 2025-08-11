'use client';

import type { FC } from 'react';

import DifficultySelector from './DifficultySelector';
import type { AdaptiveAI } from '@/lib/game/adaptive-ai';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface GameHeaderProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  adaptiveAI?: AdaptiveAI | null;
}

const GameHeader: FC<GameHeaderProps> = ({ difficulty, onDifficultyChange, adaptiveAI }) => {
  const getAdaptiveAIStatus = () => {
    if (difficulty !== 'Hard' || !adaptiveAI) return null;

    const status = adaptiveAI.getStatus();

    const getStatusColor = () => {
      switch (status.mode) {
        case 'Neural Network':
          return 'bg-emerald-600/80 text-emerald-100';
        case 'Enhanced Pattern':
          return 'bg-blue-600/80 text-blue-100';
        case 'Basic Pattern':
          return 'bg-amber-600/80 text-amber-100';
        case 'Limited':
        default:
          return 'bg-yellow-600/80 text-yellow-100';
      }
    };

    const getModeIcon = () => {
      switch (status.mode) {
        case 'Neural Network':
          return '🧠';
        case 'Enhanced Pattern':
          return '🔍';
        case 'Basic Pattern':
          return '📊';
        case 'Limited':
        default:
          return '🤖';
      }
    };

    return (
      <div className="mt-2 text-xs max-w-md text-center">
        {/* Main Status Badge */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`px-3 py-1.5 rounded-full font-medium ${getStatusColor()}`}>
            {getModeIcon()} {status.status}
          </span>
        </div>

        {/* Basic Info */}
        <div className="text-accent-200/80 text-[10px]">
          Click the info icon in the AI thought bubble for detailed insights
        </div>
      </div>
    );
  };

  return (
    <header className="w-full max-w-3xl flex flex-col items-center gap-4 mt-4 text-center relative z-50 h-[140px]">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-accent-200 to-accent-300 bg-clip-text text-transparent drop-shadow-2xl px-2 tracking-tight">
        Rock Paper Scissors
      </h1>
      <DifficultySelector difficulty={difficulty} onDifficultyChange={onDifficultyChange} />
      <div className="h-[40px] flex items-center justify-center">
        {difficulty === 'Hard' && adaptiveAI ? getAdaptiveAIStatus() : <div className="h-[40px]" />}
      </div>
    </header>
  );
};

export default GameHeader;
export { DifficultySelector };
