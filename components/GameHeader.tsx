'use client';

import type { FC } from 'react';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface GameHeaderProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const GameHeader: FC<GameHeaderProps> = ({ difficulty, onDifficultyChange }) => {
  const modeLabels: Record<Difficulty, string> = {
    Easy: 'Easy (Random)',
    Medium: 'Medium (Pattern)',
    Hard: 'Hard (Adaptive AI)',
  };

  const modeIcons: Record<Difficulty, string> = {
    Easy: '🎲',
    Medium: '🧩',
    Hard: '🧠',
  };

  return (
    <header className="w-full max-w-3xl flex flex-col items-center gap-2 text-center relative z-10">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl px-2 tracking-tight">
        Rock Paper Scissors
      </h1>

      {/* Difficulty Selector */}
      <nav
        className="flex gap-2 sm:gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-white/20"
        aria-label="Difficulty selection"
      >
        {DIFFICULTIES.map((level) => (
          <button
            key={level}
            onClick={() => onDifficultyChange(level)}
            className={`group px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              difficulty === level
                ? 'bg-white text-indigo-600 shadow-lg scale-105 transform'
                : 'text-white hover:bg-white/20 hover:scale-102 transform'
            }`}
            title={modeLabels[level]}
            aria-describedby={`mode-${level.toLowerCase()}-description`}
          >
            <span className="text-sm">{modeIcons[level]}</span>
            <span>{level}</span>
          </button>
        ))}
      </nav>

      {/* Hidden descriptions for screen readers */}
      <div className="sr-only">
        <div id="mode-easy-description">Easy mode uses random AI choices</div>
        <div id="mode-medium-description">Medium mode uses pattern recognition to predict your moves</div>
        <div id="mode-hard-description">Hard mode uses adaptive neural network learning</div>
      </div>
    </header>
  );
};

export default GameHeader;
