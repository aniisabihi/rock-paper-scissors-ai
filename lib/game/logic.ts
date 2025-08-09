export type Choice = 'rock' | 'paper' | 'scissors';
export type Result = 'win' | 'lose' | 'draw';
export type AIMode = 'random' | 'pattern' | 'adaptive';

const choices: readonly Choice[] = ['rock', 'paper', 'scissors'] as const;
const playerHistory: Choice[] = [];

export const getRandomChoice = (): Choice => {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
};

export const determineResult = (player: Choice, ai: Choice): Result => {
  if (player === ai) return 'draw';

  const winConditions: Record<Choice, Choice> = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
  };

  return winConditions[player] === ai ? 'win' : 'lose';
};

export const recordPlayerChoice = (choice: Choice): void => {
  playerHistory.push(choice);
};

export const predictNextMove = (): Choice => {
  if (playerHistory.length === 0) {
    return getRandomChoice();
  }

  // For small histories, use frequency analysis
  if (playerHistory.length < 3) {
    const counts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
    playerHistory.forEach((choice) => {
      counts[choice]++;
    });

    // Find most frequent choice
    const predicted = (Object.keys(counts) as Choice[]).reduce((a, b) => (counts[a] > counts[b] ? a : b));
    return predicted;
  }

  // For longer histories, use simple Markov chain (last choice -> next choice pattern)
  return predictWithMarkovChain();
};

// Simple Markov chain: analyze what player typically chooses after their last choice
const predictWithMarkovChain = (): Choice => {
  const lastChoice = playerHistory[playerHistory.length - 1];
  const transitions: Record<Choice, Record<Choice, number>> = {
    rock: { rock: 0, paper: 0, scissors: 0 },
    paper: { rock: 0, paper: 0, scissors: 0 },
    scissors: { rock: 0, paper: 0, scissors: 0 },
  };

  // Analyze patterns: what does player choose after each choice?
  for (let i = 0; i < playerHistory.length - 1; i++) {
    const current = playerHistory[i];
    const next = playerHistory[i + 1];
    transitions[current][next]++;
  }

  // Find most likely next choice after the last choice
  const possibleNext = transitions[lastChoice];
  const mostLikely = (Object.keys(possibleNext) as Choice[]).reduce((a, b) =>
    possibleNext[a] > possibleNext[b] ? a : b
  );

  // If no clear pattern found, fall back to frequency analysis
  if (possibleNext[mostLikely] === 0) {
    const counts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
    playerHistory.forEach((choice) => {
      counts[choice]++;
    });
    return (Object.keys(counts) as Choice[]).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  }

  return mostLikely;
};

export const getSmartChoice = (): Choice => {
  const predicted = predictNextMove();
  const counterchoices: Record<Choice, Choice> = {
    rock: 'paper',
    paper: 'scissors',
    scissors: 'rock',
  };

  return counterchoices[predicted];
};

export const getAdaptiveChoice = async (adaptiveAI: {
  predictNextMove: () => Promise<{ rockProbability: number; paperProbability: number; scissorsProbability: number }>;
}): Promise<Choice> => {
  try {
    const prediction = await adaptiveAI.predictNextMove();
    const probabilities = [
      { choice: 'rock' as Choice, probability: prediction.rockProbability },
      { choice: 'paper' as Choice, probability: prediction.paperProbability },
      { choice: 'scissors' as Choice, probability: prediction.scissorsProbability },
    ];

    // Find the most likely player choice
    const predictedPlayerChoice = probabilities.reduce((a, b) => (a.probability > b.probability ? a : b)).choice;

    // Counter the predicted choice
    const counterchoices: Record<Choice, Choice> = {
      rock: 'paper',
      paper: 'scissors',
      scissors: 'rock',
    };

    return counterchoices[predictedPlayerChoice];
  } catch (error) {
    console.error('Adaptive AI error, falling back to smart choice:', error);
    return getSmartChoice();
  }
};

export const getChoiceForMode = async (
  mode: AIMode,
  adaptiveAI?: {
    predictNextMove: () => Promise<{ rockProbability: number; paperProbability: number; scissorsProbability: number }>;
  } | null
): Promise<Choice> => {
  switch (mode) {
    case 'random':
      return getRandomChoice();
    case 'pattern':
      return getSmartChoice();
    case 'adaptive':
      if (adaptiveAI) {
        return await getAdaptiveChoice(adaptiveAI);
      }
      return getSmartChoice();
    default:
      return getRandomChoice();
  }
};
