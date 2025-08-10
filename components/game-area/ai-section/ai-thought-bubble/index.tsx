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
}

const AIThoughtBubble: FC<AIThoughtBubbleProps> = ({ prediction, isVisible }) => {
  if (!isVisible || !prediction) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="absolute top-[-220px] left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-gray-900/98 via-slate-800/95 to-gray-900/98 backdrop-blur-md rounded-2xl p-3 shadow-2xl border-2 border-purple-400/30 min-w-[280px] max-w-[320px] z-30"
      >
        <BubbleHeader prediction={prediction} />
        <PredictionBars prediction={prediction} />
        <TopPrediction prediction={prediction} />
      </motion.div>
    </AnimatePresence>
  );
};

export default AIThoughtBubble;
export { BubbleHeader, PredictionBars, TopPrediction };
