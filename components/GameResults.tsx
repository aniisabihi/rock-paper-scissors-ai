'use client';

import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { Choice, Result } from '@/lib/game/logic';
import type { AIConfidence } from '@/lib/game/adaptive-ai';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface GameResultsProps {
  result: Result | null;
  playerChoice: Choice | null;
  aiChoice: Choice | null;
  difficulty: Difficulty;
  adaptivePrediction: AIConfidence | null;
  adaptiveAI: { getTrainingProgress: () => { gamesPlayed: number } } | null;
}

const GameResults: FC<GameResultsProps> = ({
  result,
  playerChoice,
  aiChoice,
  difficulty,
  adaptivePrediction,
  adaptiveAI,
}) => {
  return (
    <section
      className="w-full max-w-4xl mt-4 md:mt-6 text-center relative z-10"
      aria-label="Game results"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Fixed height container to prevent layout shifts */}
      <div className="h-[120px] md:h-[140px] flex flex-col justify-center">
        <AnimatePresence>
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="text-lg md:text-2xl lg:text-3xl font-black drop-shadow-2xl"
            >
              {result === 'win' && (
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  🎉 Victory!
                </span>
              )}
              {result === 'lose' && (
                <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  💀 Defeated!
                </span>
              )}
              {result === 'draw' && (
                <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  🤝 Draw!
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {!result && <div className="h-[120px] md:h-[140px]" />}
      </div>

      {/* Game details with stable height */}
      <div className="min-h-[120px] md:min-h-[140px] flex flex-col justify-start">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base md:text-lg">
              <div className="flex items-center justify-center gap-2 p-2 bg-white/10 rounded-lg">
                <span className="text-xl">
                  {playerChoice === 'rock' ? '🪨' : playerChoice === 'paper' ? '📄' : '✂️'}
                </span>
                <div>
                  <p className="text-white/70 text-xs font-medium">You chose</p>
                  <p className="font-bold capitalize text-blue-200 text-sm">{playerChoice}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 p-2 bg-white/10 rounded-lg">
                <span className="text-xl">{aiChoice === 'rock' ? '🪨' : aiChoice === 'paper' ? '📄' : '✂️'}</span>
                <div>
                  <p className="text-white/70 text-xs font-medium">AI chose</p>
                  <p className="font-bold capitalize text-purple-200 text-sm">{aiChoice}</p>
                </div>
              </div>
            </div>
            {difficulty === 'Hard' && adaptiveAI && (
              <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-300/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🧠</span>
                  <h3 className="text-white font-semibold text-sm">AI Learning Progress</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-white/80">
                  <p className="flex items-center gap-1.5">
                    <span>📚</span> Games: {adaptiveAI.getTrainingProgress().gamesPlayed}
                  </p>
                  {adaptivePrediction && (
                    <p className="flex items-center gap-1.5">
                      <span>📊</span> Confidence: {Math.round(adaptivePrediction.confidence * 100)}%
                    </p>
                  )}
                  {adaptiveAI.getTrainingProgress().gamesPlayed >= 10 && (
                    <p className="flex items-center gap-1.5 text-green-300">
                      <span>🎯</span> Neural network active!
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
        {!result && <div className="h-[120px] md:h-[140px]" />}
      </div>
    </section>
  );
};

export default GameResults;
