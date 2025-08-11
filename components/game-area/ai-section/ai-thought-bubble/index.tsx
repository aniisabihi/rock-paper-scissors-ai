'use client';

import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BubbleHeader from './BubbleHeader';
import PredictionBars from './PredictionBars';
import TopPrediction from './TopPrediction';
import type { AIConfidence } from '@/lib/game/adaptive-ai';

interface AIThoughtBubbleProps {
  prediction: AIConfidence | null;
  isVisible: boolean;
  isThinking: boolean;
  adaptiveAI: { getTrainingProgress: () => { gamesPlayed: number } } | null;
  isLoading?: boolean;
}

const AIThoughtBubble: FC<AIThoughtBubbleProps> = ({ prediction, isVisible, adaptiveAI, isLoading = false }) => {
  if (!isVisible || !prediction) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="absolute top-[-220px] left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-2xl border-2 border-white/20 min-w-[200px] max-w-[300px] z-30"
      >
        <BubbleHeader prediction={prediction} adaptiveAI={adaptiveAI} isLoading={isLoading} />
        {/* <PredictionBars prediction={prediction} /> */}
        <TopPrediction prediction={prediction} />
      </motion.div>
    </AnimatePresence>
  );
};

export default AIThoughtBubble;
export { BubbleHeader, PredictionBars, TopPrediction };
