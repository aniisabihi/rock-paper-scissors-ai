'use client';

import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface AiAvatarProps {
  readonly mood: 'idle' | 'win' | 'lose' | 'draw';
}

// Constants outside component to avoid recreation
const MOOD_FACES = {
  win: '😎',
  lose: '😭',
  draw: '😐',
  idle: '🤖',
} as const;

const AiAvatar: FC<AiAvatarProps> = ({ mood }) => {
  const face = MOOD_FACES[mood];

  const animationProps = useMemo(
    () => ({
      animate: {
        scale: mood === 'win' ? 1.2 : 1,
        rotate: mood === 'lose' ? [0, -5, 5, 0] : 0,
      },
      transition: {
        duration: 0.5,
        repeat: mood === 'lose' ? 2 : 0,
      },
    }),
    [mood]
  );

  return (
    <motion.div
      className="text-6xl transform-gpu"
      {...animationProps}
      style={{
        transformOrigin: 'center center',
      }}
    >
      {face}
    </motion.div>
  );
};

export default AiAvatar;
