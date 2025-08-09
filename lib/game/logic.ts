export type Choice = "rock" | "paper" | "scissors";
export type Result = "win" | "lose" | "draw";

const playerHistory: Choice[] = [];

export const getRandomChoice = (): Choice => {
  const choices: Choice[] = ["rock", "paper", "scissors"];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
};

export const determineResult = (player: Choice, ai: Choice): Result => {
  if (player === ai) return "draw";
  if (
    (player === "rock" && ai === "scissors") ||
    (player === "paper" && ai === "rock") ||
    (player === "scissors" && ai === "paper")
  ) {
    return "win";
  }
  return "lose";
};

export const recordPlayerChoice = (choice: Choice) => {
  playerHistory.push(choice);
};

export const predictNextMove = (): Choice => {
  if (playerHistory.length === 0) {
    return getRandomChoice();
  }
  const counts = { rock: 0, paper: 0, scissors: 0 };
  playerHistory.forEach((choice) => counts[choice]++);
  const predicted = (Object.keys(counts) as Choice[]).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );
  return predicted;
};

export const getSmartChoice = (): Choice => {
  const predicted = predictNextMove();
  if (predicted === "rock") return "paper";
  if (predicted === "paper") return "scissors";
  return "rock";
};
