'use client';

import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Result } from '@/lib/game/logic';

interface ResultDisplayProps {
  result: Result | null;
}

const ResultDisplay: FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div className="h-[60px] md:h-[80px] flex flex-col justify-center">
      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="text-2xl lg:text-3xl font-black drop-shadow-2xl"
          >
            {result === 'win' && (
              <span className="bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent">
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
  );
};

export default ResultDisplay;
