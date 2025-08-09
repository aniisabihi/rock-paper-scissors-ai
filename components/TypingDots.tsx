'use client';

import type { FC } from 'react';
import { motion } from 'framer-motion';

// Constants outside component to avoid recreation
const DOT_INDICES = [0, 1, 2] as const;

const TypingDots: FC = () => {
  return (
    <div className="flex items-center gap-1">
      {DOT_INDICES.map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-gray-500 rounded-full"
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};

export default TypingDots;
