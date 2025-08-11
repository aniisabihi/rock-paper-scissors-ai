'use client';

import type { FC } from 'react';
import { motion, type Easing } from 'framer-motion';
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
        scale: mood === 'win' ? 1.3 : mood === 'idle' ? [1, 1.05, 1] : 1,
        rotate: mood === 'lose' ? [0, -8, 8, -5, 5, 0] : 0,
        y: mood === 'win' ? [0, -10, 0] : 0,
      },
      transition: {
        duration: mood === 'win' ? 0.8 : mood === 'lose' ? 1.2 : 3,
        repeat: mood === 'lose' ? 1 : mood === 'idle' ? Infinity : 0,
        ease: mood === 'win' ? ([0.25, 0.1, 0.25, 1] as Easing) : ([0.42, 0, 0.58, 1] as Easing),
      },
    }),
    [mood]
  );

  return (
    <div className="relative">
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl opacity-60"
        animate={{
          background:
            mood === 'win'
              ? 'radial-gradient(circle, #10b981, #059669)'
              : mood === 'lose'
                ? 'radial-gradient(circle, #ef4444, #dc2626)'
                : mood === 'draw'
                  ? 'radial-gradient(circle, #f59e0b, #d97706)'
                  : 'radial-gradient(circle, #6366f1, #4f46e5)',
          scale: mood === 'win' ? 1.5 : mood === 'lose' ? 1.2 : 1,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Main avatar */}
      <motion.div
        className="relative text-5xl lg:text-6xl transform-gpu drop-shadow-2xl"
        {...animationProps}
        style={{
          transformOrigin: 'center center',
          filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))',
        }}
        role="img"
        aria-label={`AI is feeling ${mood === 'idle' ? 'neutral' : mood === 'win' ? 'confident' : mood === 'lose' ? 'disappointed' : 'neutral'}`}
      >
        <span aria-hidden="true">{face}</span>
      </motion.div>

      {/* Particles for win state */}
      {mood === 'win' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              style={{
                left: '50%',
                top: '50%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AiAvatar;
