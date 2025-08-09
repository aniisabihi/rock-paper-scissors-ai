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
        className="absolute top-[-280px] left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20 min-w-[320px] max-w-[400px] z-20"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
          <span className="text-2xl">🤖</span>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">AI Neural Network</h3>
            <p className={`text-xs ${getConfidenceColor(prediction.confidence)}`}>
              {getConfidenceText(prediction.confidence)} ({formatPercentage(prediction.confidence)}%)
            </p>
          </div>
        </div>

        {/* Prediction Bars */}
        <div className="space-y-2 mb-3">
          <h4 className="text-white/80 text-xs font-medium mb-2">Move Predictions:</h4>
          {probabilities.map((item) => (
            <div key={item.choice} className="flex items-center gap-2">
              <span className="text-lg">{item.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/90 text-xs capitalize">{item.choice}</span>
                  <span className="text-white/70 text-xs">{formatPercentage(item.probability)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${formatPercentage(item.probability)}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`h-2 rounded-full ${
                      item === topPrediction
                        ? 'bg-gradient-to-r from-blue-400 to-purple-400'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Prediction */}
        <div className="bg-white/10 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{topPrediction.emoji}</span>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">Predicting: {topPrediction.choice.toUpperCase()}</p>
              <p className="text-white/70 text-xs">{formatPercentage(topPrediction.probability)}% probability</p>
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-1">
          <h4 className="text-white/80 text-xs font-medium mb-1">Analysis:</h4>
          <div className="max-h-20 overflow-y-auto">
            {prediction.reasoning.slice(0, 3).map((reason, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="text-white/60 text-xs leading-relaxed"
              >
                • {reason}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Thinking indicator */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <div className="flex items-center gap-2 text-white/80">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 bg-blue-400 rounded-full"
                  />
                ))}
              </div>
              <span className="text-sm">Processing...</span>
            </div>
          </motion.div>
        )}

        {/* Speech bubble tail */}
        <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-900/95"></div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIThoughtBubble;
