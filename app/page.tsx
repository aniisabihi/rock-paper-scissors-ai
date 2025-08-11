'use client';

import type { FC } from 'react';
import { useState } from 'react';
import GameHeader from '@/components/game-header';
import GameArea from '@/components/game-area';
import GameResults from '@/components/game-results';
import InfoButton from '@/components/game-header/InfoButton';
import InfoModal from '@/components/game-header/InfoModal';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAdaptiveAI } from '@/lib/context/adaptive-ai-context';

const Home: FC = () => {
  const {
    difficulty,
    playerChoice,
    aiChoice,
    aiPrediction,
    isThinking,
    result,
    adaptivePrediction,
    handlePlayerChoice,
    handleDifficultyChange,
  } = useGameLogic();

  const { adaptiveAI, isLoading } = useAdaptiveAI();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handleInfoToggle = () => {
    setIsInfoOpen(!isInfoOpen);
  };

  const handleInfoClose = () => {
    setIsInfoOpen(false);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-dark-900 via-dark-800 to-dark-950 p-3 md:p-4 text-white relative overflow-hidden"
      role="main"
      aria-label="Rock Paper Scissors Game"
    >
      {/* Ambient background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(22,163,74,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent-500/5 to-transparent pointer-events-none" />

      {/* Info Button - Fixed in top right corner */}
      <InfoButton isOpen={isInfoOpen} onToggle={handleInfoToggle} />
      <InfoModal isOpen={isInfoOpen} onClose={handleInfoClose} />

      {/* Game Header */}
      <GameHeader difficulty={difficulty} onDifficultyChange={handleDifficultyChange} adaptiveAI={adaptiveAI} />

      {/* Game Area */}
      <GameArea
        difficulty={difficulty}
        aiPrediction={aiPrediction}
        isThinking={isThinking}
        result={result}
        adaptivePrediction={adaptivePrediction}
        onPlayerChoice={handlePlayerChoice}
        adaptiveAI={adaptiveAI}
        isLoading={isLoading}
      />

      {/* Game Results */}
      <GameResults result={result} playerChoice={playerChoice} aiChoice={aiChoice} />
    </main>
  );
};

export default Home;
