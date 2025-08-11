'use client';

import type { FC } from 'react';
import { motion } from 'framer-motion';
import type { Choice, Result } from '@/lib/game/logic';

interface GameDetailsProps {
  result: Result | null;
  playerChoice: Choice | null;
  aiChoice: Choice | null;
}

const GameDetails: FC<GameDetailsProps> = ({ result, playerChoice, aiChoice }) => {
  if (!result) return <div className="h-[120px] md:h-[140px]" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl"
    >
      <div className="grid grid-cols-2 gap-3 text-base md:text-lg">
        <div className="flex items-center justify-center gap-2 p-2 bg-white/10 rounded-lg">
          <span className="text-xl">{playerChoice === 'rock' ? '🪨' : playerChoice === 'paper' ? '📄' : '✂️'}</span>
          <div>
            <p className="text-white/70 text-xs font-medium">You chose</p>
            <p className="font-bold capitalize text-blue-200 text-sm">{playerChoice}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 p-2 bg-white/10 rounded-lg">
          <span className="text-xl">{aiChoice === 'rock' ? '🪨' : aiChoice === 'paper' ? '📄' : '✂️'}</span>
          <div>
            <p className="text-white/70 text-xs font-medium">AI chose</p>
            <p className="font-bold capitalize text-purple-200 text-sm">{aiChoice}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameDetails;
