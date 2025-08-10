import { useState, useCallback } from 'react';

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
import { type AIConfidence } from '@/lib/game/adaptive-ai';
import { useAdaptiveAI } from '@/lib/context/adaptive-ai-context';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const AI_MODES: Record<Difficulty, AIMode> = {
  Easy: 'random',
  Medium: 'pattern',
  Hard: 'adaptive',
};

const AI_THINKING_DELAY = 1500; // milliseconds

export const useGameLogic = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [aiPrediction, setAiPrediction] = useState<Choice | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [adaptivePrediction, setAdaptivePrediction] = useState<AIConfidence | null>(null);
  const { adaptiveAI } = useAdaptiveAI();

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
      } else if (currentMode === 'adaptive' && adaptiveAI) {
        try {
          // Get AI prediction before the player's move is recorded
          const prediction = await adaptiveAI.predictNextMove();
          setAdaptivePrediction(prediction);
          console.log('🤖 Adaptive AI prediction:', prediction);
        } catch (error) {
          console.error('❌ Adaptive AI prediction failed:', error);
          // Fallback to pattern prediction
          setAiPrediction(predictNextMove());
        }
      } else if (currentMode === 'adaptive' && !adaptiveAI) {
        // Adaptive AI not ready yet, fallback to pattern
        setAiPrediction(predictNextMove());
        recordPlayerChoice(choice);
      }

      // Simulate AI "thinking"
      setTimeout(async () => {
        try {
          const ai = await getChoiceForMode(currentMode, adaptiveAI);
          const gameResult = determineResult(choice, ai);

          setAiChoice(ai);
          setResult(gameResult);

          // Record the game for adaptive learning
          if (currentMode === 'adaptive' && adaptiveAI) {
            try {
              adaptiveAI.recordGame(choice, ai, gameResult);
              console.log('📝 Game recorded for adaptive learning');
            } catch (error) {
              console.error('❌ Failed to record game for adaptive learning:', error);
            }
          } else if (currentMode === 'pattern') {
            // Already recorded above for pattern mode
          } else if (currentMode === 'adaptive' && !adaptiveAI) {
            // Adaptive AI not ready yet, record for pattern mode
            recordPlayerChoice(choice);
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
    [adaptiveAI, difficulty]
  );

  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      setDifficulty(newDifficulty);
      // Reset adaptive AI when switching modes
      if (newDifficulty !== 'Hard' && adaptiveAI) {
        adaptiveAI.reset();
      }
    },
    [adaptiveAI]
  );

  return {
    // State
    difficulty,
    playerChoice,
    aiChoice,
    aiPrediction,
    isThinking,
    result,
    adaptivePrediction,
    adaptiveAI: adaptiveAI,

    // Actions
    handlePlayerChoice,
    handleDifficultyChange,
  };
};
