import { AdaptiveAI } from './adaptive-ai';
import { Choice, Result } from './logic';

/**
 * Simple test suite for Adaptive AI functionality
 * This can be run in the browser console to verify the AI is learning
 */
export class AdaptiveAITester {
  private ai: AdaptiveAI;

  constructor() {
    this.ai = new AdaptiveAI();
  }

  /**
   * Simulate a series of games with known patterns
   */
  async runPatternTest(): Promise<void> {
    console.log('🧪 Starting Adaptive AI Pattern Test...');

    // Pattern 1: Player always plays rock after losing
    console.log('\n📊 Testing Pattern: Player plays rock after losing');

    // First few games to establish a losing pattern
    await this.simulateGame('rock', 'paper', 'lose'); // Player loses
    await this.simulateGame('rock', 'paper', 'lose'); // Player chooses rock again after losing
    await this.simulateGame('rock', 'paper', 'lose'); // Pattern established

    // Now test if AI can predict the next rock
    const prediction1 = await this.ai.predictNextMove();
    console.log('🤖 AI Prediction after loss pattern:', prediction1);
    console.log(`Expected: High rock probability. Actual: Rock=${Math.round(prediction1.rockProbability * 100)}%`);

    // Pattern 2: Player alternates after draws
    console.log('\n📊 Testing Pattern: Player alternates after draws');
    await this.simulateGame('scissors', 'scissors', 'draw'); // Draw
    await this.simulateGame('paper', 'rock', 'win'); // Player switches to paper
    await this.simulateGame('rock', 'rock', 'draw'); // Draw
    await this.simulateGame('scissors', 'paper', 'win'); // Player switches to scissors

    const prediction2 = await this.ai.predictNextMove();
    console.log('🤖 AI Prediction after alternating pattern:', prediction2);

    // Test confidence levels
    console.log('\n📈 Training Progress:', this.ai.getTrainingProgress());
    console.log('✅ Pattern test completed!');
  }

  /**
   * Test the AI's reasoning capabilities
   */
  async testReasoning(): Promise<void> {
    console.log('\n🧠 Testing AI Reasoning...');

    // Create a strong bias toward one choice
    for (let i = 0; i < 5; i++) {
      await this.simulateGame('rock', 'paper', 'lose');
    }

    const prediction = await this.ai.predictNextMove();
    console.log('🎯 Final Prediction:', prediction);
    console.log('💭 AI Reasoning:');
    prediction.reasoning.forEach((reason, index) => {
      console.log(`   ${index + 1}. ${reason}`);
    });
  }

  /**
   * Simulate a game between player and AI
   */
  private async simulateGame(playerChoice: Choice, aiChoice: Choice, result: Result): Promise<void> {
    this.ai.recordGame(playerChoice, aiChoice, result);

    // Small delay to simulate real gameplay
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  /**
   * Reset the AI for fresh testing
   */
  reset(): void {
    this.ai.reset();
    console.log('🔄 AI Reset - Ready for new tests');
  }

  /**
   * Get the AI instance for manual testing
   */
  getAI(): AdaptiveAI {
    return this.ai;
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as unknown as { AdaptiveAITester: typeof AdaptiveAITester }).AdaptiveAITester = AdaptiveAITester;
}
