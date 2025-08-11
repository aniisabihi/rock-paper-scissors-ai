'use client';

import type { FC } from 'react';
import AiAvatar from '@/components/game-area/ai-section/AiAvatar';
import AIThoughtBubble from '@/components/game-area/ai-section/ai-thought-bubble';
import ThoughtBubbleTail from '@/components/game-area/ai-section/ThoughtBubbleTail';
import type { Choice, Result } from '@/lib/game/logic';
import type { AIConfidence, AdaptiveAI } from '@/lib/game/adaptive-ai';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface AISectionProps {
  difficulty: Difficulty;
  aiPrediction: Choice | null;
  isThinking: boolean;
  result: Result | null;
  adaptivePrediction: AIConfidence | null;
  adaptiveAI: AdaptiveAI | null;
  onOpenInfoModal: () => void;
}

const AISection: FC<AISectionProps> = ({
  difficulty,
  aiPrediction,
  isThinking,
  result,
  adaptivePrediction,
  adaptiveAI,
  onOpenInfoModal,
}) => {
  const getAiMood = (): 'idle' | 'win' | 'lose' | 'draw' => {
    if (isThinking || !result) return 'idle';

    const moodMap: Record<Result, 'win' | 'lose' | 'draw'> = {
      win: 'lose', // Player wins, AI loses
      lose: 'win', // Player loses, AI wins
      draw: 'draw',
    };

    return moodMap[result] || 'idle';
  };

  return (
    <section className="flex flex-col items-center gap-2 w-full relative group" aria-label="AI opponent">
      <div className="text-center space-y-1">
        <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-accent-200 to-accent-300 bg-clip-text text-transparent">
          AI
        </h2>
      </div>
      <div className="flex items-center justify-center relative p-2">
        <AiAvatar mood={getAiMood()} />

        {/* Adaptive AI Thought Bubble */}
        <AIThoughtBubble
          prediction={adaptivePrediction}
          isVisible={difficulty === 'Hard' && (isThinking || !!adaptivePrediction)}
          adaptiveAI={adaptiveAI}
          onOpenInfoModal={onOpenInfoModal}
        />

        {/* Pattern Recognition Prediction */}
        {difficulty === 'Medium' && (aiPrediction || isThinking) && (
          <div className="absolute top-[-150px] left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-dark-800/95 to-dark-700/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border-2 border-accent-400/30 min-w-[200px] text-center z-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{isThinking ? '🤔' : '🧩'}</span>
              <h3 className="text-accent-200 font-bold text-sm">{isThinking ? 'AI Thinking' : 'Pattern Detected'}</h3>
            </div>
            <p className="text-white/90 text-xs mb-2">
              {isThinking ? 'Analyzing your patterns...' : `I think you'll choose ${aiPrediction}`}
            </p>
            <ThoughtBubbleTail className="border-accent-400/30" />
          </div>
        )}
      </div>
    </section>
  );
};

export default AISection;
