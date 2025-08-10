import { useState, useCallback, useRef, useEffect } from 'react';

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
  const adaptiveAI = useRef<AdaptiveAI | null>(null);

  // Initialize adaptive AI
  useEffect(() => {
    adaptiveAI.current = new AdaptiveAI();
  }, []);

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

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    // Reset adaptive AI when switching modes
    if (newDifficulty !== 'Hard' && adaptiveAI.current) {
      adaptiveAI.current.reset();
    }
  }, []);

  return {
    // State
    difficulty,
    playerChoice,
    aiChoice,
    aiPrediction,
    isThinking,
    result,
    adaptivePrediction,
    adaptiveAI: adaptiveAI.current,

    // Actions
    handlePlayerChoice,
    handleDifficultyChange,
  };
};
