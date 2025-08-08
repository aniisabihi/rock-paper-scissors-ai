"use client";

import { useState } from "react";
import { ChoiceButton } from "@/components/choice-button/ChoiceButton";
import {
  getRandomChoice,
  determineResult,
  type Choice,
} from "@/lib/game/logic";

export default function Home() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);

  const handlePlayerChoice = (choice: Choice) => {
    const ai = getRandomChoice();
    const outcome = determineResult(choice, ai);

    setPlayerChoice(choice);
    setAiChoice(ai);
    setResult(outcome);
  };

  return (
    <main className='min-h-screen flex flex-col items-center justify-center gap-6 p-4'>
      <h1 className='text-3xl font-bold text-center'>Rock Paper Scissors</h1>

      <div className='flex gap-4'>
        <ChoiceButton
          label='🪨 Rock'
          value='rock'
          onClick={handlePlayerChoice}
        />
        <ChoiceButton
          label='📄 Paper'
          value='paper'
          onClick={handlePlayerChoice}
        />
        <ChoiceButton
          label='✂️ Scissors'
          value='scissors'
          onClick={handlePlayerChoice}
        />
      </div>

      {result && (
        <div className='text-center mt-6 space-y-2'>
          <p className='text-xl'>
            You chose: <strong>{playerChoice}</strong>
          </p>
          <p className='text-xl'>
            AI chose: <strong>{aiChoice}</strong>
          </p>
          <p className='text-2xl font-semibold'>
            Result: <span className='capitalize'>{result}</span>
          </p>
        </div>
      )}
    </main>
  );
}
