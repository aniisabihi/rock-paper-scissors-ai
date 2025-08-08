export type Choice = "rock" | "paper" | "scissors";

export function getRandomChoice(): Choice {
  const choices: readonly Choice[] = ["rock", "paper", "scissors"];
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export function determineResult(
  player: Choice,
  ai: Choice
): "win" | "lose" | "draw" {
  if (player === ai) return "draw";

  const winsAgainst = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  } as const;

  return winsAgainst[player] === ai ? "win" : "lose";
}
