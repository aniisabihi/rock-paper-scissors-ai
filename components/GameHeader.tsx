'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Info } from 'lucide-react';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface GameHeaderProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const GameHeader: FC<GameHeaderProps> = ({ difficulty, onDifficultyChange }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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

  const handleInfoToggle = () => {
    setIsInfoOpen(!isInfoOpen);
  };

  return (
    <header className="w-full max-w-3xl flex flex-col items-center gap-4 text-center relative z-50">
      {/* Info Button - Top Right */}
      <button
        onClick={handleInfoToggle}
        className="absolute top-0 right-0 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20 z-50 flex items-center justify-center"
        aria-label="Toggle game information"
        aria-expanded={isInfoOpen}
      >
        <Info className="w-5 h-5" />
      </button>

      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl px-2 tracking-tight">
        Rock Paper Scissors
      </h1>

      {/* Collapsible Info Section */}
      {isInfoOpen && (
        <>
          {/* Dimmed Background Overlay */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" onClick={handleInfoToggle} />

          {/* Info Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
            <div className="w-full max-w-[600px] bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 pointer-events-auto relative">
              {/* Close Button */}
              <button
                onClick={handleInfoToggle}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                aria-label="Close modal"
              >
                <span className="text-lg font-bold">×</span>
              </button>
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">🎮 How to Play</h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Choose Rock, Paper, or Scissors to play against the AI. Rock crushes Scissors, Scissors cuts
                      Paper, and Paper covers Rock. The AI will adapt its strategy based on your difficulty choice.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">🤖 AI Difficulties</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">🎲</span>
                        <div>
                          <span className="font-semibold text-white">Easy Mode:</span>
                          <span className="text-white/90 text-sm block">Random choices</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">🧩</span>
                        <div>
                          <span className="font-semibold text-white">Medium Mode:</span>
                          <span className="text-white/90 text-sm block">
                            Pattern recognition - learns from your moves
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">🧠</span>
                        <div>
                          <span className="font-semibold text-white">Hard Mode:</span>
                          <span className="text-white/90 text-sm block">
                            Adaptive neural network - constantly evolves its strategy
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">🧠 AI Learning</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    The AI analyzes your playing patterns and adapts its strategy in real-time. In Hard mode, it uses a
                    neural network that continuously learns and improves, making each game more challenging than the
                    last!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
