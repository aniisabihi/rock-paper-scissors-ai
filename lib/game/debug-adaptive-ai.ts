import { AdaptiveAI } from './adaptive-ai';

/**
 * Debug utility for testing Adaptive AI functionality
 * Run this in the browser console to diagnose issues
 */
export class AdaptiveAIDebugger {
  private ai: AdaptiveAI;

  constructor() {
    this.ai = new AdaptiveAI();
  }

  /**
   * Test basic AI initialization
   */
  async testInitialization(): Promise<void> {
    console.log('🔍 Testing Adaptive AI Initialization...');

    try {
      // Check if ml5 is available
      if (typeof window !== 'undefined') {
        console.log('🌐 Window object available:', !!window);

        // Type assertion for window with ml5
        const windowWithML5 = window as Window & { ml5?: unknown };
        console.log('🧠 ML5 available:', !!windowWithML5.ml5);

        if (windowWithML5.ml5) {
          console.log('✅ ML5 loaded successfully');
          console.log('📊 ML5 version:', windowWithML5.ml5);
        } else {
          console.log('❌ ML5 not loaded - this is the main issue!');
        }
      } else {
        console.log('❌ Window object not available (SSR)');
      }

      // Check AI state
      const progress = this.ai.getTrainingProgress();
      console.log('🤖 AI Training Progress:', progress);

      // Test prediction without training
      const initialPrediction = await this.ai.predictNextMove();
      console.log('🎯 Initial Prediction (no training):', initialPrediction);
    } catch (error) {
      console.error('💥 Error during initialization test:', error);
    }
  }

  /**
   * Test AI learning with simple patterns
   */
  async testLearning(): Promise<void> {
    console.log('\n🧪 Testing AI Learning...');

    try {
      // Simulate a simple pattern: player always chooses rock
      for (let i = 0; i < 5; i++) {
        this.ai.recordGame('rock', 'paper', 'lose');
        console.log(`📝 Recorded game ${i + 1}: Player=rock, AI=paper, Result=lose`);
      }

      // Check if AI learned the pattern
      const prediction = await this.ai.predictNextMove();
      console.log('🎯 Prediction after learning:', prediction);

      // Check training progress
      const progress = this.ai.getTrainingProgress();
      console.log('📊 Training Progress:', progress);
    } catch (error) {
      console.error('💥 Error during learning test:', error);
    }
  }

  /**
   * Test neural network functionality
   */
  async testNeuralNetwork(): Promise<void> {
    console.log('\n🧠 Testing Neural Network...');

    try {
      // Check if neural network is ready
      const progress = this.ai.getTrainingProgress();
      console.log('🤖 Model Ready:', progress.modelReady);

      if (progress.modelReady) {
        console.log('✅ Neural network initialized');

        // Test with some data
        this.ai.recordGame('rock', 'paper', 'lose');
        this.ai.recordGame('rock', 'scissors', 'win');
        this.ai.recordGame('rock', 'paper', 'lose');

        const prediction = await this.ai.predictNextMove();
        console.log('🎯 Neural Network Prediction:', prediction);
      } else {
        console.log('❌ Neural network not ready');
      }
    } catch (error) {
      console.error('💥 Error during neural network test:', error);
    }
  }

  /**
   * Run comprehensive diagnostic
   */
  async runDiagnostic(): Promise<void> {
    console.log('🚀 Starting Comprehensive Adaptive AI Diagnostic...\n');

    await this.testInitialization();
    await this.testLearning();
    await this.testNeuralNetwork();

    console.log('\n🏁 Diagnostic Complete!');
    console.log('💡 If you see errors above, they indicate the specific issues.');
  }

  /**
   * Get the AI instance for manual testing
   */
  getAI(): AdaptiveAI {
    return this.ai;
  }

  /**
   * Reset the AI for fresh testing
   */
  reset(): void {
    this.ai.reset();
    console.log('🔄 AI Reset - Ready for new tests');
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).AdaptiveAIDebugger = AdaptiveAIDebugger;
  console.log('🔧 AdaptiveAIDebugger loaded! Run: new AdaptiveAIDebugger().runDiagnostic()');
}
