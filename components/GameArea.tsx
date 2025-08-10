'use client';

import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ChoiceButton } from '@/components/ChoiceButton';
import TypingDots from '@/components/TypingDots';
import AiAvatar from '@/components/AiAvatar';
import AIThoughtBubble from '@/components/AIThoughtBubble';

import type { Choice, Result } from '@/lib/game/logic';
import type { AIConfidence } from '@/lib/game/adaptive-ai';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type AIMode = 'random' | 'pattern' | 'adaptive';

interface GameAreaProps {
  difficulty: Difficulty;
  aiPrediction: Choice | null;
  isThinking: boolean;
  result: Result | null;
  adaptivePrediction: AIConfidence | null;
  onPlayerChoice: (choice: Choice) => void;
}

const AI_MODES: Record<Difficulty, AIMode> = {
  Easy: 'random',
  Medium: 'pattern',
  Hard: 'adaptive',
};

const GameArea: FC<GameAreaProps> = ({
  difficulty,
  aiPrediction,
  isThinking,
  result,
  adaptivePrediction,
  onPlayerChoice,
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
    <section className="w-full max-w-5xl mx-auto mt-8 md:mt-10 px-3 relative z-10" aria-label="Game area">
      <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-4 lg:gap-6">
        {/* Player Section */}
        <section
          className="flex flex-col items-center gap-2 w-full order-1 md:order-1 group"
          aria-label="Player controls"
        >
          <div className="text-center space-y-1">
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              You
            </h2>
            <p className="text-white/70 text-xs font-medium">Choose your move</p>
          </div>
          <div className="flex flex-row gap-2 md:gap-3 justify-center p-2">
            <ChoiceButton label="🪨" value="rock" onClick={onPlayerChoice} />
            <ChoiceButton label="📄" value="paper" onClick={onPlayerChoice} />
            <ChoiceButton label="✂️" value="scissors" onClick={onPlayerChoice} />
          </div>
        </section>

        {/* VS Divider */}
        <div className="flex justify-center order-2 md:order-2 relative">
          <div className="text-2xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 text-transparent bg-clip-text animate-pulse">
            VS
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-red-400/20 to-pink-400/20 rounded-full blur-xl scale-150 animate-pulse" />
        </div>

        {/* AI Section */}
        <section
          className="flex flex-col items-center gap-2 w-full relative order-3 md:order-3 group"
          aria-label="AI opponent"
        >
          <div className="text-center space-y-1">
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              AI Opponent
            </h2>
            <p className="text-white/70 text-xs font-medium capitalize">
              {difficulty} Mode • {AI_MODES[difficulty]} Strategy
            </p>
          </div>
          <div className="flex items-center justify-center relative p-2">
            <AiAvatar mood={getAiMood()} />

            {/* Adaptive AI Thought Bubble */}
            <AIThoughtBubble
              prediction={adaptivePrediction}
              isVisible={difficulty === 'Hard' && (isThinking || !!adaptivePrediction)}
              isThinking={isThinking}
            />

            {/* Simple Thought bubble for Medium difficulty */}
            <AnimatePresence>
              {isThinking && aiPrediction && difficulty === 'Medium' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-[-160px] left-1/2 transform -translate-x-1/2 bg-white/20 px-4 py-3 rounded-2xl shadow text-sm backdrop-blur-sm min-w-[200px] max-w-[400px] whitespace-nowrap z-10"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <span className="font-medium">🤖:</span>
                    <TypingDots />
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-1 italic text-white/70 text-center"
                  >
                    &quot;I bet you&apos;ll pick {aiPrediction}!&quot;
                  </motion.div>
                  {/* Speech bubble tail */}
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white/20"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </section>
  );
};

export default GameArea;
