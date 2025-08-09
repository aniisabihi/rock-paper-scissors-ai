'use client';

import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIConfidence } from '@/lib/game/adaptive-ai';

interface AIThoughtBubbleProps {
  prediction: AIConfidence | null;
  isVisible: boolean;
  isThinking: boolean;
}

const AIThoughtBubble: FC<AIThoughtBubbleProps> = ({ prediction, isVisible, isThinking }) => {
  if (!isVisible || !prediction) return null;

  // Removed unused getChoiceEmoji function - emojis are directly defined in probabilities array

  const formatPercentage = (value: number): number => Math.round(value * 100);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.7) return 'text-green-300';
    if (confidence > 0.4) return 'text-yellow-300';
    return 'text-red-300';
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence > 0.7) return 'Very Confident';
    if (confidence > 0.4) return 'Moderately Confident';
    return 'Low Confidence';
  };

  const probabilities = [
    { choice: 'rock', probability: prediction.rockProbability, emoji: '🪨' },
    { choice: 'paper', probability: prediction.paperProbability, emoji: '📄' },
    { choice: 'scissors', probability: prediction.scissorsProbability, emoji: '✂️' },
  ].sort((a, b) => b.probability - a.probability);

  const topPrediction = probabilities[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="absolute top-[-240px] left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-gray-900/98 via-slate-800/95 to-gray-900/98 backdrop-blur-md rounded-2xl p-3 shadow-2xl border-2 border-purple-400/30 min-w-[280px] max-w-[320px] z-20"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-300/30">
          <div className="text-xl p-1.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-400/30">
            🧠
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              AI Neural Network
            </h3>
            <p className={`text-xs font-semibold ${getConfidenceColor(prediction.confidence)}`}>
              {getConfidenceText(prediction.confidence)} • {formatPercentage(prediction.confidence)}%
            </p>
          </div>
        </div>

        {/* Prediction Bars */}
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

        {/* Top Prediction */}
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-3 mb-3 border border-purple-300/30">
          <div className="flex items-center justify-center gap-2">
            <div className="text-2xl p-2 bg-white/10 rounded-lg animate-pulse">{topPrediction.emoji}</div>
            <div className="text-center">
              <p className="font-bold text-sm bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                Predicting: {topPrediction.choice.toUpperCase()}
              </p>
              <p className="text-purple-200 text-xs font-semibold">
                {formatPercentage(topPrediction.probability)}% confidence
              </p>
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-1.5">
          <h4 className="text-white/90 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
            <span>🔍</span> Analysis
          </h4>
          <div className="max-h-16 overflow-y-auto space-y-1.5">
            {prediction.reasoning.slice(0, 3).map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * index }}
                className="flex items-start gap-1.5 p-1.5 bg-white/5 rounded-md"
              >
                <span className="text-blue-300 text-xs mt-0.5">▪</span>
                <p className="text-white/75 text-xs leading-tight flex-1">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Thinking indicator */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-purple-900/60 to-gray-900/80 backdrop-blur-md rounded-3xl flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3 text-white/90">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 1, 0.4],
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                    className="w-3 h-3 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full shadow-lg"
                  />
                ))}
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                🧠 Neural network thinking...
              </span>
            </div>
          </motion.div>
        )}

        {/* Speech bubble tail */}
        <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-gray-900/95"></div>
          <div className="absolute top-[-1px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-purple-400/30"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIThoughtBubble;
