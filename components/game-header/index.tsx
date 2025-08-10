'use client';

import type { FC } from 'react';
import { useState } from 'react';

import InfoButton from './InfoButton';
import InfoModal from './InfoModal';
import DifficultySelector from './DifficultySelector';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface GameHeaderProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const GameHeader: FC<GameHeaderProps> = ({ difficulty, onDifficultyChange }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handleInfoToggle = () => {
    setIsInfoOpen(!isInfoOpen);
  };

  const handleInfoClose = () => {
    setIsInfoOpen(false);
  };

  return (
    <header className="w-full max-w-3xl flex flex-col items-center gap-4 text-center relative z-50">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl px-2 tracking-tight">
        Rock Paper Scissors
      </h1>
      <InfoButton isOpen={isInfoOpen} onToggle={handleInfoToggle} />
      <InfoModal isOpen={isInfoOpen} onClose={handleInfoClose} />
      <DifficultySelector difficulty={difficulty} onDifficultyChange={onDifficultyChange} />
    </header>
  );
};

export default GameHeader;
export { InfoButton, InfoModal, DifficultySelector };
