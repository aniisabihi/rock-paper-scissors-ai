'use client';

// React imports
import type { FC } from 'react';

// Local component imports
import GameHeader from '@/components/game-header';
import GameArea from '@/components/game-area';
import GameResults from '@/components/game-results';

// Custom hook import
import { useGameLogic } from '@/hooks/useGameLogic';

const Home: FC = () => {
  const {
    difficulty,
    playerChoice,
    aiChoice,
    aiPrediction,
    isThinking,
    result,
    adaptivePrediction,
    adaptiveAI,
    handlePlayerChoice,
    handleDifficultyChange,
  } = useGameLogic();

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 md:p-4 text-white relative overflow-hidden"
      role="main"
      aria-label="Rock Paper Scissors Game"
    >
      {/* Ambient background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,119,198,0.3),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Game Header */}
      <GameHeader difficulty={difficulty} onDifficultyChange={handleDifficultyChange} />

      {/* Game Area */}
      <GameArea
        difficulty={difficulty}
        aiPrediction={aiPrediction}
        isThinking={isThinking}
        result={result}
        adaptivePrediction={adaptivePrediction}
        onPlayerChoice={handlePlayerChoice}
      />

      {/* Game Results */}
      <GameResults
        result={result}
        playerChoice={playerChoice}
        aiChoice={aiChoice}
        difficulty={difficulty}
        adaptivePrediction={adaptivePrediction}
        adaptiveAI={adaptiveAI}
      />
    </main>
  );
};

export default Home;
