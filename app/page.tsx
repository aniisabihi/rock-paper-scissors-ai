'use client';

// React imports
import type { FC } from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';

// Third-party imports
import { motion, AnimatePresence } from 'framer-motion';

// Local component imports
import { ChoiceButton } from '@/components/ChoiceButton';
import TypingDots from '@/components/TypingDots';
import AiAvatar from '@/components/AiAvatar';

// Game logic imports
import {
  getRandomChoice,
  recordPlayerChoice,
  determineResult,
  predictNextMove,
  getChoiceForMode,
  type Choice,
  type Result,
  type AIMode,
} from '@/lib/game/logic';
import { AdaptiveAI, type AIConfidence } from '@/lib/game/adaptive-ai';
import AIThoughtBubble from '@/components/AIThoughtBubble';

// Types
type Difficulty = (typeof DIFFICULTIES)[number];

// Constants
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const AI_MODES: Record<Difficulty, AIMode> = {
  Easy: 'random',
  Medium: 'pattern',
  Hard: 'adaptive',
};
const AI_THINKING_DELAY = 1500; // milliseconds

const Home: FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [aiPrediction, setAiPrediction] = useState<Choice | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [adaptivePrediction, setAdaptivePrediction] = useState<AIConfidence | null>(null);
  const adaptiveAI = useRef<AdaptiveAI | null>(null);

  // Initialize adaptive AI
  useEffect(() => {
    adaptiveAI.current = new AdaptiveAI();
  }, []);

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
    async (choice: Choice) => {
      setIsThinking(true);
      setResult(null);
      setAiChoice(null);
      setPlayerChoice(choice);
      setAdaptivePrediction(null);

      const currentMode = AI_MODES[difficulty];

      // Get prediction before recording the choice
      if (currentMode === 'pattern') {
        setAiPrediction(predictNextMove());
        recordPlayerChoice(choice);
      } else if (currentMode === 'adaptive' && adaptiveAI.current) {
        // Get AI prediction before the player's move is recorded
        const prediction = await adaptiveAI.current.predictNextMove();
        setAdaptivePrediction(prediction);
      }

      // Simulate AI "thinking"
      setTimeout(async () => {
        try {
          const ai = await getChoiceForMode(currentMode, adaptiveAI.current);
          const gameResult = determineResult(choice, ai);

          setAiChoice(ai);
          setResult(gameResult);

          // Record the game for adaptive learning
          if (currentMode === 'adaptive' && adaptiveAI.current) {
            adaptiveAI.current.recordGame(choice, ai, gameResult);
          } else if (currentMode === 'pattern') {
            // Already recorded above for pattern mode
          }

          setIsThinking(false);
        } catch (error) {
          console.error('Error in AI choice generation:', error);
          // Fallback
          const ai = getRandomChoice();
          setAiChoice(ai);
          setResult(determineResult(choice, ai));
          setIsThinking(false);
        }
      }, AI_THINKING_DELAY);
    },
    [difficulty]
  );

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 md:p-4 text-white relative overflow-hidden"
      role="main"
      aria-label="Rock Paper Scissors Game"
    >
      {/* Ambient background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,119,198,0.3),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-3xl flex flex-col items-center gap-2 text-center relative z-10">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl px-2 tracking-tight">
          Rock Paper Scissors
        </h1>
        <p className="text-xs sm:text-sm text-white/80 font-medium max-w-lg leading-relaxed">
          Challenge our AI with adaptive learning across three difficulty modes
        </p>

        {/* Difficulty Selector */}
        <nav
          className="flex gap-2 sm:gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-white/20"
          aria-label="Difficulty selection"
        >
          {DIFFICULTIES.map((level) => {
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
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  // Reset adaptive AI when switching modes
                  if (level !== 'Hard' && adaptiveAI.current) {
                    adaptiveAI.current.reset();
                  }
                }}
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
            );
          })}
        </nav>

        {/* Hidden descriptions for screen readers */}
        <div className="sr-only">
          <div id="mode-easy-description">Easy mode uses random AI choices</div>
          <div id="mode-medium-description">Medium mode uses pattern recognition to predict your moves</div>
          <div id="mode-hard-description">Hard mode uses adaptive neural network learning</div>
        </div>
      </header>

      {/* Game Area - Enhanced responsive design */}
      <section className="w-full max-w-5xl mx-auto mt-3 md:mt-4 px-3 relative z-10" aria-label="Game area">
        <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-4 lg:gap-6">
          {/* Player Section */}
          <section
            className="flex flex-col items-center gap-2 w-full order-1 md:order-1 group"
            aria-label="Player controls"
          >
            <div className="text-center space-y-1">
              <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                You
              </h2>
              <p className="text-white/70 text-xs font-medium">Choose your move</p>
            </div>
            <div className="flex flex-row gap-2 md:gap-3 justify-center p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <ChoiceButton label="🪨" value="rock" onClick={handlePlayerChoice} />
              <ChoiceButton label="📄" value="paper" onClick={handlePlayerChoice} />
              <ChoiceButton label="✂️" value="scissors" onClick={handlePlayerChoice} />
            </div>
          </section>

          {/* VS Divider */}
          <div className="flex justify-center order-2 md:order-2 relative">
            <div className="text-2xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 text-transparent bg-clip-text animate-pulse">
              VS
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-red-400/20 to-pink-400/20 rounded-full blur-xl scale-150 animate-pulse" />
          </div>

          {/* AI Section */}
          <section
            className="flex flex-col items-center gap-2 w-full relative order-3 md:order-3 group"
            aria-label="AI opponent"
          >
            <div className="text-center space-y-1">
              <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                AI Opponent
              </h2>
              <p className="text-white/70 text-xs font-medium capitalize">
                {difficulty} Mode • {AI_MODES[difficulty]} Strategy
              </p>
            </div>
            <div className="flex items-center justify-center relative p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <AiAvatar mood={getAiMood()} />

              {/* Adaptive AI Thought Bubble */}
              <AIThoughtBubble
                prediction={adaptivePrediction}
                isVisible={difficulty === 'Hard' && (isThinking || !!adaptivePrediction)}
                isThinking={isThinking}
              />

              {/* Simple Thought bubble for Medium difficulty */}
              <AnimatePresence>
                {isThinking && aiPrediction && difficulty === 'Medium' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 bg-white/20 px-4 py-3 rounded-2xl shadow text-sm backdrop-blur-sm min-w-[200px] max-w-[400px] whitespace-nowrap z-10"
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
                    {/* Speech bubble tail */}
                    <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white/20"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </section>

      {/* Result Section - Enhanced with better visual hierarchy */}
      <section
        className="w-full max-w-4xl mt-4 md:mt-6 text-center min-h-[80px] md:min-h-[100px] flex flex-col justify-start px-3 relative z-10"
        aria-label="Game results"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="h-8 md:h-10 flex items-center justify-center">
          <AnimatePresence>
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                className="text-lg md:text-2xl lg:text-3xl font-black drop-shadow-2xl"
              >
                {result === 'win' && (
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    🎉 Victory!
                  </span>
                )}
                {result === 'lose' && (
                  <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    💀 Defeated!
                  </span>
                )}
                {result === 'draw' && (
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    🤝 Draw!
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3 md:mt-4 min-h-[60px] flex flex-col justify-start">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base md:text-lg">
                <div className="flex items-center justify-center gap-2 p-2 bg-white/10 rounded-lg">
                  <span className="text-xl">
                    {playerChoice === 'rock' ? '🪨' : playerChoice === 'paper' ? '📄' : '✂️'}
                  </span>
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
              {difficulty === 'Hard' && adaptiveAI.current && (
                <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-300/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm">🧠</span>
                    <h3 className="text-white font-semibold text-sm">AI Learning Progress</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-white/80">
                    <p className="flex items-center gap-1.5">
                      <span>📚</span> Games: {adaptiveAI.current.getTrainingProgress().gamesPlayed}
                    </p>
                    {adaptivePrediction && (
                      <p className="flex items-center gap-1.5">
                        <span>📊</span> Confidence: {Math.round(adaptivePrediction.confidence * 100)}%
                      </p>
                    )}
                    {adaptiveAI.current.getTrainingProgress().gamesPlayed >= 10 && (
                      <p className="flex items-center gap-1.5 text-green-300">
                        <span>🎯</span> Neural network active!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;
