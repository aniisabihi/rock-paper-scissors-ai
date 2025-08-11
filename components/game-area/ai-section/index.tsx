'use client';

import type { FC } from 'react';
import AiAvatar from '@/components/game-area/ai-section/AiAvatar';
import AIThoughtBubble from '@/components/game-area/ai-section/ai-thought-bubble';
import type { Choice, Result } from '@/lib/game/logic';
import type { AIConfidence } from '@/lib/game/adaptive-ai';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface AISectionProps {
  difficulty: Difficulty;
  aiPrediction: Choice | null;
  isThinking: boolean;
  result: Result | null;
  adaptivePrediction: AIConfidence | null;
  adaptiveAI: { getTrainingProgress: () => { gamesPlayed: number } } | null;
  isLoading?: boolean;
}

const AISection: FC<AISectionProps> = ({
  difficulty,
  aiPrediction,
  isThinking,
  result,
  adaptivePrediction,
  adaptiveAI,
  isLoading = false,
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
    <section
      className="flex flex-col items-center gap-2 w-full relative order-3 md:order-3 group"
      aria-label="AI opponent"
    >
      <div className="text-center space-y-1">
        <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
          AI
        </h2>
      </div>
      <div className="flex items-center justify-center relative p-2">
        <AiAvatar mood={getAiMood()} />

        {/* Adaptive AI Thought Bubble */}
        <AIThoughtBubble
          prediction={adaptivePrediction}
          isVisible={difficulty === 'Hard' && (isThinking || !!adaptivePrediction)}
          isThinking={isThinking}
          adaptiveAI={adaptiveAI}
          isLoading={isLoading}
        />

        {/* Pattern Recognition Prediction */}
        {difficulty === 'Medium' && aiPrediction && (
          <div className="absolute top-[-80px] left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-blue-400/30 min-w-[200px] text-center z-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧩</span>
              <h3 className="text-blue-200 font-bold text-sm">Pattern Detected</h3>
            </div>
            <p className="text-white/90 text-xs">
              I think you&apos;ll choose <span className="font-bold text-blue-300 capitalize">{aiPrediction}</span>
            </p>
          </div>
        )}

        {/* Thinking State */}
        {isThinking && difficulty === 'Medium' && (
          <div className="absolute top-[-80px] left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-purple-400/30 min-w-[200px] text-center z-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🤔</span>
              <h3 className="text-purple-200 font-bold text-sm">AI Thinking</h3>
            </div>
            <p className="text-white/90 text-xs">Analyzing your patterns...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AISection;
