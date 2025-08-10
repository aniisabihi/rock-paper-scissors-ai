'use client';

import type { FC } from 'react';
import { motion } from 'framer-motion';
import type { AIConfidence } from '@/lib/game/adaptive-ai';

interface PredictionBarsProps {
  prediction: AIConfidence;
}

const PredictionBars: FC<PredictionBarsProps> = ({ prediction }) => {
  const formatPercentage = (value: number): number => Math.round(value * 100);

  const probabilities = [
    { choice: 'rock', probability: prediction.rockProbability, emoji: '🪨' },
    { choice: 'paper', probability: prediction.paperProbability, emoji: '📄' },
    { choice: 'scissors', probability: prediction.scissorsProbability, emoji: '✂️' },
  ].sort((a, b) => b.probability - a.probability);

  const topPrediction = probabilities[0];

  return (
    <div className="space-y-2 mb-3">
      <h4 className="text-white/90 text-xs font-semibold mb-2 flex items-center gap-1.5">
        <span>📊</span> Move Predictions
      </h4>
      {probabilities.map((item, index) => (
        <motion.div
          key={item.choice}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10"
        >
          <span className="text-lg p-1.5 bg-white/10 rounded-md">{item.emoji}</span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/95 text-xs font-medium capitalize">{item.choice}</span>
              <span className="text-white/80 text-xs font-bold">{formatPercentage(item.probability)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${formatPercentage(item.probability)}%` }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                className={`h-2 rounded-full shadow-inner ${
                  item === topPrediction
                    ? 'bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PredictionBars;
