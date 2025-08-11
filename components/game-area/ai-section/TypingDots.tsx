'use client';

import type { FC } from 'react';
import { motion } from 'framer-motion';

// Constants outside component to avoid recreation
const DOT_INDICES = [0, 1, 2] as const;

const TypingDots: FC = () => {
  return (
    <div className="flex items-center gap-1.5">
      {DOT_INDICES.map((i) => (
        <motion.span
          key={i}
          className="w-2.5 h-2.5 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full shadow-lg"
          animate={{
            y: [0, -6, 0],
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default TypingDots;
