'use client';

// React imports
import type { FC } from 'react';
import { useState, useCallback } from 'react';

// Third-party imports
import { motion, AnimatePresence } from 'framer-motion';

// Local component imports
import { ChoiceButton } from '@/components/ChoiceButton';
import TypingDots from '@/components/TypingDots';
import AiAvatar from '@/components/AiAvatar';

// Game logic imports
import {
  getRandomChoice,
  getSmartChoice,
  recordPlayerChoice,
  determineResult,
  predictNextMove,
  type Choice,
  type Result,
} from '@/lib/game/logic';

// Types
type Difficulty = (typeof DIFFICULTIES)[number];

// Constants
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const AI_THINKING_DELAY = 1500; // milliseconds

const Home: FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [aiPrediction, setAiPrediction] = useState<Choice | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const getAiMood = (): 'idle' | 'win' | 'lose' | 'draw' => {
    if (isThinking || !result) return 'idle';

    const moodMap: Record<Result, 'win' | 'lose' | 'draw'> = {
      win: 'lose', // Player wins, AI loses
      lose: 'win', // Player loses, AI wins
      draw: 'draw',
    };

    return moodMap[result] || 'idle';
  };

  const handlePlayerChoice = useCallback(
    (choice: Choice) => {
      setIsThinking(true);
      setResult(null);
      setAiChoice(null);
      setPlayerChoice(choice);

      // Pattern Prediction (Medium difficulty)
      if (difficulty === 'Medium') {
        recordPlayerChoice(choice);
        setAiPrediction(predictNextMove());
      }

      // Simulate AI "thinking"
      setTimeout(() => {
        let ai: Choice;
        if (difficulty === 'Easy') {
          ai = getRandomChoice();
        } else if (difficulty === 'Medium') {
          ai = getSmartChoice();
        } else {
          // Adaptive AI placeholder for now
          ai = getSmartChoice();
        }
        setAiChoice(ai);
        setResult(determineResult(choice, ai));
        setIsThinking(false);
      }, AI_THINKING_DELAY);
    },
    [difficulty]
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-indigo-500 to-purple-700 p-4 md:p-6 text-white">
      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-md px-4">Rock Paper Scissors</h1>

        {/* Difficulty Selector */}
        <nav
          className="flex gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-full"
          aria-label="Difficulty selection"
        >
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-3 py-1 sm:px-4 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition ${
                difficulty === level ? 'bg-white text-indigo-600' : 'text-white hover:bg-white/20'
              }`}
            >
              {level}
            </button>
          ))}
        </nav>
      </header>

      {/* Game Area - True mobile-first responsive design */}
      <section className="w-full max-w-6xl mx-auto mt-6 px-4" aria-label="Game area">
        <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-6 md:gap-8 lg:gap-12">
          {/* Player Section */}
          <section className="flex flex-col items-center gap-4 w-full order-1 md:order-1" aria-label="Player controls">
            <p className="text-lg font-semibold">You</p>
            <div className="flex flex-row gap-2 md:gap-3 justify-center">
              <ChoiceButton label="🪨" value="rock" onClick={handlePlayerChoice} />
              <ChoiceButton label="📄" value="paper" onClick={handlePlayerChoice} />
              <ChoiceButton label="✂️" value="scissors" onClick={handlePlayerChoice} />
            </div>
          </section>

          {/* VS Divider */}
          <div className="flex justify-center order-2 md:order-2">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold bg-white/10 rounded-full w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center backdrop-blur-sm">
              VS
            </div>
          </div>

          {/* AI Section */}
          <section
            className="flex flex-col items-center gap-4 w-full relative order-3 md:order-3"
            aria-label="AI opponent"
          >
            <h2 className="text-lg font-semibold">AI</h2>
            <div className="flex items-center justify-center">
              <AiAvatar mood={getAiMood()} />
            </div>

            {/* Thought bubble - responsive positioning */}
            <div className="w-full max-w-xs md:w-auto">
              <AnimatePresence>
                {isThinking && aiPrediction && difficulty === 'Medium' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/20 px-4 py-3 rounded-2xl shadow text-sm backdrop-blur-sm mx-auto relative max-w-[280px]"
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <span className="font-medium">🤖:</span>
                      <TypingDots />
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="mt-1 italic text-white/70 text-center"
                    >
                      &quot;I bet you&apos;ll pick {aiPrediction}!&quot;
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </section>

      {/* Result Section - Responsive and stable */}
      <section
        className="w-full max-w-4xl mt-6 md:mt-8 text-center min-h-[100px] md:min-h-[120px] flex flex-col justify-start px-4"
        aria-label="Game results"
      >
        <div className="h-8 md:h-10 flex items-center justify-center">
          <AnimatePresence>
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xl md:text-2xl font-bold drop-shadow-lg"
              >
                {result === 'win' && '🎉 You Win!'}
                {result === 'lose' && '💀 You Lose!'}
                {result === 'draw' && "🤝 It's a Draw!"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3 md:mt-4 min-h-[60px] flex flex-col justify-start">
          {result && (
            <div className="space-y-1 text-base md:text-lg">
              <p>
                You chose: <strong>{playerChoice}</strong>
              </p>
              <p>
                AI chose: <strong>{aiChoice}</strong>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;
