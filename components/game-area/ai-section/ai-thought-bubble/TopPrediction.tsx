'use client';

import type { FC } from 'react';
import { motion } from 'framer-motion';
import type { AIConfidence } from '@/lib/game/adaptive-ai';

interface TopPredictionProps {
  prediction: AIConfidence;
}

const TopPrediction: FC<TopPredictionProps> = ({ prediction }) => {
  const formatPercentage = (value: number): number => Math.round(value * 100);

  const probabilities = [
    { choice: 'rock', probability: prediction.rockProbability, emoji: '🪨' },
    { choice: 'paper', probability: prediction.paperProbability, emoji: '📄' },
    { choice: 'scissors', probability: prediction.scissorsProbability, emoji: '✂️' },
  ].sort((a, b) => b.probability - a.probability);

  const topPrediction = probabilities[0];

  if (!topPrediction) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-3 border border-purple-400/30"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎯</span>
        <h4 className="text-white font-semibold text-sm">Top Prediction</h4>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{topPrediction.emoji}</span>
        <div className="flex-1">
          <p className="text-white/90 text-xs">
            I&apos;m <span className="font-bold text-purple-300">{formatPercentage(topPrediction.probability)}%</span>{' '}
            confident you&apos;ll choose{' '}
            <span className="font-bold text-blue-300 capitalize">{topPrediction.choice}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TopPrediction;
