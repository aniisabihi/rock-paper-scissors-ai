export type Choice = "rock" | "paper" | "scissors";
export type Result = "win" | "lose" | "draw";

const choices: readonly Choice[] = ["rock", "paper", "scissors"] as const;
const playerHistory: Choice[] = [];

export const getRandomChoice = (): Choice => {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
};

export const determineResult = (player: Choice, ai: Choice): Result => {
  if (player === ai) return "draw";

  const winConditions: Record<Choice, Choice> = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };

  return winConditions[player] === ai ? "win" : "lose";
};

export const recordPlayerChoice = (choice: Choice): void => {
  playerHistory.push(choice);
};

export const predictNextMove = (): Choice => {
  if (playerHistory.length === 0) {
    return getRandomChoice();
  }

  const counts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
  playerHistory.forEach((choice) => {
    counts[choice]++;
  });

  const predicted = (Object.keys(counts) as Choice[]).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );

  return predicted;
};

export const getSmartChoice = (): Choice => {
  const predicted = predictNextMove();
  const counterchoices: Record<Choice, Choice> = {
    rock: "paper",
    paper: "scissors",
    scissors: "rock",
  };

  return counterchoices[predicted];
};
