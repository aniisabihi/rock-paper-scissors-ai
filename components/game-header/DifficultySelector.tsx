'use client';

import type { FC } from 'react';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

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

const DifficultySelector: FC<DifficultySelectorProps> = ({ difficulty, onDifficultyChange }) => {
  return (
    <>
      <nav
        className="flex gap-2 sm:gap-3 bg-dark-800/80 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-accent-400/30"
        aria-label="Difficulty selection"
      >
        {DIFFICULTIES.map((level) => (
          <button
            key={level}
            onClick={() => onDifficultyChange(level)}
            className={`group px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              difficulty === level
                ? 'bg-accent-500 text-dark-900 shadow-lg scale-105 transform'
                : 'text-white hover:bg-accent-500/20 hover:scale-102 transform'
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
    </>
  );
};

export default DifficultySelector;
