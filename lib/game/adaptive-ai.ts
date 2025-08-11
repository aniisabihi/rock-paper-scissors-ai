import { Choice, Result } from './logic';

// Type definitions for ml5 to avoid 'any' types
interface ML5NeuralNetwork {
  addData: (inputs: number[], outputs: number[]) => void;
  train: (options: { epochs: number; batchSize: number }) => Promise<void>;
  predict: (inputs: number[]) => Promise<Array<{ value: number }>>;
}

interface ML5Module {
  neuralNetwork: (options: {
    task: 'regression' | 'classification';
    debug: boolean;
    layers: Array<{
      type: string;
      units: number;
      activation: string;
    }>;
  }) => ML5NeuralNetwork;
}

// Alternative interface for when ml5 exports neuralNetwork as a top-level function
interface ML5TopLevel {
  neuralNetwork: (options: {
    task: 'regression' | 'classification';
    debug: boolean;
    layers: Array<{
      type: string;
      units: number;
      activation: string;
    }>;
  }) => ML5NeuralNetwork;
}

export interface GameEvent {
  playerChoice: Choice;
  aiChoice: Choice;
  result: Result;
  timestamp: number;
  roundNumber: number;
}

export interface PlayerPattern {
  sequenceLength: number;
  choiceFrequency: Record<Choice, number>;
  transitionMatrix: Record<Choice, Record<Choice, number>>;
  winLossReaction: {
    afterWin: Record<Choice, number>;
    afterLoss: Record<Choice, number>;
    afterDraw: Record<Choice, number>;
  };
  streakBehavior: {
    tendencyToSwitch: number; // 0-1 scale
    tendencyToRepeat: number; // 0-1 scale
  };
  timePatterns: {
    recentBias: Record<Choice, number>; // Weighted towards recent moves
  };
}

export interface AIConfidence {
  rockProbability: number;
  paperProbability: number;
  scissorsProbability: number;
  confidence: number; // Overall confidence in prediction (0-1)
  reasoning: string[];
}

export class AdaptiveAI {
  private history: GameEvent[] = [];
  private neuralNetwork: ML5NeuralNetwork | null = null;
  private isTraining = false;
  private modelReady = false;
  private lastPrediction: AIConfidence | null = null;
  private trainingData: Array<{ inputs: number[]; outputs: number[] }> = [];
  private modelVersion = '1.0.0';
  private ml5: ML5Module | ML5TopLevel | null = null; // Store ml5 instance

  // Static instance to prevent multiple initializations
  private static instance: AdaptiveAI | null = null;
  private static isInitializing = false;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      // Use a try-catch to prevent constructor errors from crashing the app
      try {
        this.initializeNeuralNetwork().catch((error) => {
          console.error('❌ Neural network initialization failed in constructor:', error);
          // Force fallback mode
          this.forcePatternBasedMode();
        });
      } catch (error) {
        console.error('❌ Constructor error during neural network initialization:', error);
        // Force fallback mode
        this.forcePatternBasedMode();
      }
    }
  }

  // Static method to get singleton instance
  public static getInstance(): AdaptiveAI {
    if (!AdaptiveAI.instance) {
      AdaptiveAI.instance = new AdaptiveAI();
    }
    return AdaptiveAI.instance;
  }

  // Static method to reset singleton instance (useful for testing)
  public static resetInstance(): void {
    AdaptiveAI.instance = null;
    AdaptiveAI.isInitializing = false;
  }

  // Get current initialization status
  public static getInitializationStatus(): {
    hasInstance: boolean;
    isInitializing: boolean;
    hasGlobalML5: boolean;
  } {
    return {
      hasInstance: !!AdaptiveAI.instance,
      isInitializing: AdaptiveAI.isInitializing,
      hasGlobalML5: AdaptiveAI.instance ? AdaptiveAI.instance.isML5GloballyAvailable() : false,
    };
  }

  // Check if neural network is properly built and ready
  public isNeuralNetworkReady(): boolean {
    if (!this.modelReady || !this.neuralNetwork) {
      return false;
    }

    // Check if the neural network has the required methods
    if (
      typeof this.neuralNetwork.predict !== 'function' ||
      typeof this.neuralNetwork.addData !== 'function' ||
      typeof this.neuralNetwork.train !== 'function'
    ) {
      return false;
    }

    return true;
  }

  // Force fallback to pattern-based prediction
  public forcePatternBasedMode(): void {
    console.log('🧠 Forcing pattern-based prediction mode');
    this.neuralNetwork = null;
    this.modelReady = false;
    this.isTraining = false;
    this.ml5 = null; // Clear ml5 reference to prevent further attempts
  }

  // Check if we should attempt ml5 initialization
  private shouldAttemptML5Initialization(): boolean {
    // Don't attempt if we've already failed or if we're in fallback mode
    if (this.ml5 === null) {
      return false;
    }

    // Don't attempt if we're already in pattern-based mode
    if (!this.modelReady && !this.neuralNetwork) {
      return false;
    }

    return true;
  }

  // Safe method to get prediction that won't crash the app
  public async safePredictNextMove(): Promise<AIConfidence> {
    try {
      return await this.predictNextMove();
    } catch (error) {
      console.error('❌ Prediction failed, using fallback:', error);
      // Force fallback mode and return pattern-based prediction
      this.forcePatternBasedMode();
      return this.getPatternBasedPrediction();
    }
  }

  // Get detailed debug information
  public getDebugInfo(): {
    hasML5: boolean;
    hasNeuralNetwork: boolean;
    modelReady: boolean;
    isTraining: boolean;
    neuralNetworkMethods: string[];
    ml5Methods: string[];
    historyLength: number;
    trainingDataLength: number;
  } {
    const neuralNetworkMethods = this.neuralNetwork
      ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.neuralNetwork)).filter(
          (name) => typeof (this.neuralNetwork as ML5NeuralNetwork)[name as keyof ML5NeuralNetwork] === 'function'
        )
      : [];

    const ml5Methods = this.ml5
      ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.ml5)).filter(
          (name) => typeof (this.ml5 as ML5Module)[name as keyof ML5Module] === 'function'
        )
      : [];

    return {
      hasML5: !!this.ml5,
      hasNeuralNetwork: !!this.neuralNetwork,
      modelReady: this.modelReady,
      isTraining: this.isTraining,
      neuralNetworkMethods,
      ml5Methods,
      historyLength: this.history.length,
      trainingDataLength: this.trainingData.length,
    };
  }

  // Method to ensure ml5 is initialized when needed
  private async ensureML5Initialized(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    if (this.ml5) {
      return true;
    }

    try {
      await this.initializeNeuralNetwork();
      return this.ml5 !== null;
    } catch (error) {
      console.error('Failed to initialize ml5:', error);
      // Fallback to pattern-based mode
      this.forcePatternBasedMode();
      return false;
    }
  }

  // Check if ml5 is already available globally
  private isML5GloballyAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const windowWithML5 = window as Window & { ml5?: ML5Module | ML5TopLevel };
      return !!(windowWithML5.ml5 && typeof windowWithML5.ml5.neuralNetwork === 'function');
    } catch (error) {
      console.warn('Error checking global ml5 availability:', error);
      return false;
    }
  }

  // Get global ml5 instance if available
  private getGlobalML5(): ML5Module | ML5TopLevel | null {
    if (typeof window === 'undefined') return null;
    try {
      const windowWithML5 = window as Window & { ml5?: ML5Module | ML5TopLevel };
      return windowWithML5.ml5 && typeof windowWithML5.ml5.neuralNetwork === 'function' ? windowWithML5.ml5 : null;
    } catch (error) {
      console.warn('Error getting global ml5 instance:', error);
      return null;
    }
  }

  // Check ml5.js version and compatibility
  private checkML5Compatibility(): void {
    if (!this.ml5) return;

    try {
      // Try to access ml5 version info if available
      const ml5WithVersion = this.ml5 as ML5Module & { version?: string };
      if (ml5WithVersion.version) {
        console.log('🧠 ml5.js version:', ml5WithVersion.version);
      }

      // Check if neuralNetwork method exists
      if (typeof this.ml5.neuralNetwork === 'function') {
        console.log('🧠 ml5.js neuralNetwork method available');
      } else {
        console.warn('⚠️ ml5.js neuralNetwork method not available');
      }
    } catch (error) {
      console.warn('⚠️ Could not check ml5.js compatibility:', error);
    }
  }

  private async initializeNeuralNetwork(): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (AdaptiveAI.isInitializing) {
      console.log('🧠 Neural network initialization already in progress, waiting...');
      // Wait for existing initialization to complete
      while (AdaptiveAI.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      AdaptiveAI.isInitializing = true;
      console.log('🧠 Starting neural network initialization...');

      // Check if ml5 is already available globally (prevent multiple imports)
      if (typeof window !== 'undefined' && !this.ml5) {
        // Check if ml5 is already loaded globally
        if (this.isML5GloballyAvailable()) {
          console.log('🧠 Using globally available ml5 instance (prevents TensorFlow.js warnings)');
          this.ml5 = this.getGlobalML5();
        } else {
          // Only import if not already available
          console.log('🧠 Importing ml5 module (first time only)...');
          try {
            const ml5Module = await import('ml5');
            console.log('🧠 ml5 module imported:', ml5Module);

            // ml5 0.12.2 exports neuralNetwork as a top-level function
            if (ml5Module && typeof ml5Module.neuralNetwork === 'function') {
              this.ml5 = ml5Module as ML5TopLevel;
              console.log('✅ Using top-level neuralNetwork export');
            } else if (ml5Module.default && typeof ml5Module.default.neuralNetwork === 'function') {
              this.ml5 = ml5Module.default as ML5Module;
              console.log('✅ Using default export neuralNetwork');
            } else {
              // Based on debug output, neuralNetwork should be available directly
              console.error('❌ neuralNetwork not found in expected locations');
              console.log('🔍 ml5Module structure:', ml5Module);
              throw new Error('Could not find neuralNetwork function in ml5 module');
            }

            // Store globally to prevent multiple imports
            (window as Window & { ml5?: ML5Module | ML5TopLevel }).ml5 = this.ml5 || undefined;
            console.log('🧠 ml5 stored globally to prevent duplicate imports');
          } catch (importError) {
            console.error('❌ Failed to import ml5 module:', importError);
            throw new Error(`ml5 import failed: ${importError}`);
          }
        }
      } else if (this.ml5) {
        console.log('🧠 Using existing ml5 instance');
      }

      if (!this.ml5) {
        console.warn('⚠️ ml5 not available, falling back to pattern-based prediction');
        this.modelReady = false;
        return;
      }

      // Verify ml5 has the required neuralNetwork method
      if (typeof this.ml5.neuralNetwork !== 'function') {
        console.error('❌ ml5.neuralNetwork is not a function:', this.ml5);
        throw new Error('ml5.neuralNetwork method not available');
      }

      // Check ml5.js compatibility
      this.checkML5Compatibility();

      // Ensure TensorFlow.js is ready before creating neural network
      console.log('🧠 Ensuring TensorFlow.js is ready...');
      if (typeof window !== 'undefined') {
        const windowWithTF = window as Window & { tf?: { version: string } };
        if (windowWithTF.tf) {
          console.log('✅ TensorFlow.js found on window, version:', windowWithTF.tf.version);
        } else {
          console.log('⚠️ TensorFlow.js not found on window, waiting for ml5 to initialize it...');
          // Give ml5 time to initialize TensorFlow.js
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if TensorFlow.js is now available
          const tfAfterWait = (window as Window & { tf?: { version: string } }).tf;
          if (tfAfterWait) {
            console.log('✅ TensorFlow.js now available on window, version:', tfAfterWait.version);
          } else {
            console.log('⚠️ TensorFlow.js still not on window, trying to expose it from ml5...');
            // Try to expose TensorFlow.js from ml5 to window
            if (this.ml5 && (this.ml5 as ML5Module & { tf?: { version: string } }).tf) {
              (window as Window & { tf?: { version: string } }).tf = (
                this.ml5 as ML5Module & { tf?: { version: string } }
              ).tf;
              console.log('✅ TensorFlow.js exposed to window from ml5');
            }
          }
        }
      }

      // Create neural network with ml5.js
      console.log('🧠 Creating neural network...');

      try {
        // Wrap the neural network creation in a try-catch to handle function call errors
        let neuralNetworkInstance: ML5NeuralNetwork | null = null;

        try {
          console.log('🧠 Attempting to create neural network with ml5...');
          neuralNetworkInstance = this.ml5.neuralNetwork({
            task: 'regression',
            debug: true, // Enable debug to see what's happening
            layers: [
              {
                type: 'dense',
                units: 32,
                activation: 'relu',
              },
              {
                type: 'dense',
                units: 16,
                activation: 'relu',
              },
              {
                type: 'dense',
                units: 3,
                activation: 'softmax',
              },
            ],
          });
          console.log('🧠 Neural network creation call completed');
        } catch (creationError) {
          console.error('❌ Neural network creation failed:', creationError);
          console.log('🧠 This is likely a ml5 internal error, falling back to pattern-based prediction');
          throw new Error(`Neural network creation failed: ${creationError}`);
        }

        if (!neuralNetworkInstance) {
          throw new Error('Neural network creation failed - null returned');
        }

        this.neuralNetwork = neuralNetworkInstance;

        // Verify the neural network was created properly
        if (!this.neuralNetwork) {
          throw new Error('Neural network creation failed - null returned');
        }

        // Test if the neural network is properly initialized by checking its methods
        if (typeof this.neuralNetwork.addData !== 'function' || typeof this.neuralNetwork.predict !== 'function') {
          throw new Error('Neural network methods not available - improper initialization');
        }

        console.log('🧠 Neural network created successfully, verifying initialization...');

        // Add some dummy data to ensure the model is built
        console.log('🧠 Adding initial training data to build the model...');
        try {
          this.neuralNetwork.addData([0, 0, 0, 0, 0, 0, 0, 0, 0], [0.33, 0.33, 0.34]);
        } catch (addDataError) {
          console.error('❌ Failed to add initial training data:', addDataError);
          throw new Error(`Failed to add training data: ${addDataError}`);
        }

        // Train for a few epochs to build the model
        console.log('🧠 Training model for initial build...');
        try {
          await this.neuralNetwork.train({
            epochs: 1,
            batchSize: 1,
          });
        } catch (trainingError) {
          console.error('❌ Initial training failed:', trainingError);
          throw new Error(`Initial training failed: ${trainingError}`);
        }

        // Test the neural network to ensure it's working
        console.log('🧠 Testing neural network with sample prediction...');
        try {
          const testFeatures = [0, 0, 0, 0, 0, 0, 0, 0, 0];
          const testResult = await this.neuralNetwork.predict(testFeatures);
          console.log('🧠 Test prediction successful:', testResult);
        } catch (testError) {
          console.warn('⚠️ Test prediction failed, but continuing:', testError);
        }

        this.modelReady = true;
        console.log('✅ Neural network initialized and built successfully');
      } catch (neuralNetworkError) {
        console.error('❌ Neural network creation/training failed:', neuralNetworkError);

        // Check if this is the specific ml5 internal error
        if (neuralNetworkError instanceof Error && neuralNetworkError.message.includes('e is not a function')) {
          console.log('🧠 Detected ml5 internal error "e is not a function"');
          console.log('🧠 This is a known compatibility issue with ml5 0.12.2 + TensorFlow.js 1.7.4');
          console.log('🧠 Falling back to enhanced pattern-based prediction mode');
        } else {
          console.log('🧠 Neural network failed for other reasons, falling back to pattern-based prediction');
        }

        this.neuralNetwork = null;
        this.modelReady = false;

        // Don't throw the error, just log it and continue without neural network
        // This allows the AI to work with pattern-based prediction
        return;
      } finally {
        AdaptiveAI.isInitializing = false;
      }
    } catch (error) {
      console.error('❌ Neural network initialization failed:', error);
      this.neuralNetwork = null;
      this.modelReady = false;
      AdaptiveAI.isInitializing = false;
      throw error;
    }
  }

  public recordGame(playerChoice: Choice, aiChoice: Choice, result: Result): void {
    const gameEvent: GameEvent = {
      playerChoice,
      aiChoice,
      result,
      timestamp: Date.now(),
      roundNumber: this.history.length + 1,
    };

    this.history.push(gameEvent);

    // Prepare training data for this game
    if (this.history.length >= 2) {
      this.prepareTrainingData();
    }

    // Trigger incremental learning after sufficient data
    if (this.history.length >= 5 && this.modelReady && !this.isTraining) {
      this.performIncrementalLearning();
    }
  }

  private extractFeatures(): number[] {
    if (this.history.length === 0) {
      return new Array(20).fill(0);
    }

    const patterns = this.analyzePlayerPatterns();
    const lastGame = this.history[this.history.length - 1];
    const recentGames = this.history.slice(-5);

    // Enhanced feature vector with 20 features
    const features = [
      // Choice frequencies (normalized)
      patterns.choiceFrequency.rock / this.history.length,
      patterns.choiceFrequency.paper / this.history.length,
      patterns.choiceFrequency.scissors / this.history.length,

      // Transition probabilities from last choice
      this.getTransitionProbability(lastGame.playerChoice, 'rock'),
      this.getTransitionProbability(lastGame.playerChoice, 'paper'),
      this.getTransitionProbability(lastGame.playerChoice, 'scissors'),

      // Reaction to last result
      this.getReactionTendency(lastGame.result, 'rock'),
      this.getReactionTendency(lastGame.result, 'paper'),
      this.getReactionTendency(lastGame.result, 'scissors'),

      // Streak behavior
      patterns.streakBehavior.tendencyToSwitch,
      patterns.streakBehavior.tendencyToRepeat,

      // Recent game bias (last 5 games)
      patterns.timePatterns.recentBias.rock,
      patterns.timePatterns.recentBias.paper,
      patterns.timePatterns.recentBias.scissors,

      // Win/loss ratio
      this.history.filter((g) => g.result === 'win').length / this.history.length,
      this.history.filter((g) => g.result === 'lose').length / this.history.length,
      this.history.filter((g) => g.result === 'draw').length / this.history.length,

      // Recent choice bias (last 3 games)
      recentGames.filter((g) => g.playerChoice === 'rock').length / Math.min(recentGames.length, 3),
      recentGames.filter((g) => g.playerChoice === 'paper').length / Math.min(recentGames.length, 3),
      recentGames.filter((g) => g.playerChoice === 'scissors').length / Math.min(recentGames.length, 3),

      // Game count (normalized)
      Math.min(this.history.length / 30, 1), // Cap at 30 games
    ];

    return features;
  }

  private analyzePlayerPatterns(): PlayerPattern {
    const pattern: PlayerPattern = {
      sequenceLength: this.history.length,
      choiceFrequency: { rock: 0, paper: 0, scissors: 0 },
      transitionMatrix: {
        rock: { rock: 0, paper: 0, scissors: 0 },
        paper: { rock: 0, paper: 0, scissors: 0 },
        scissors: { rock: 0, paper: 0, scissors: 0 },
      },
      winLossReaction: {
        afterWin: { rock: 0, paper: 0, scissors: 0 },
        afterLoss: { rock: 0, paper: 0, scissors: 0 },
        afterDraw: { rock: 0, paper: 0, scissors: 0 },
      },
      streakBehavior: {
        tendencyToSwitch: 0,
        tendencyToRepeat: 0,
      },
      timePatterns: {
        recentBias: { rock: 0, paper: 0, scissors: 0 },
      },
    };

    // Analyze choice frequencies
    this.history.forEach((game) => {
      pattern.choiceFrequency[game.playerChoice]++;
    });

    // Analyze transitions
    for (let i = 0; i < this.history.length - 1; i++) {
      const current = this.history[i].playerChoice;
      const next = this.history[i + 1].playerChoice;
      pattern.transitionMatrix[current][next]++;
    }

    // Analyze reactions to results
    for (let i = 0; i < this.history.length - 1; i++) {
      const currentResult = this.history[i].result;
      const nextChoice = this.history[i + 1].playerChoice;

      if (currentResult === 'win') {
        pattern.winLossReaction.afterWin[nextChoice]++;
      } else if (currentResult === 'lose') {
        pattern.winLossReaction.afterLoss[nextChoice]++;
      } else {
        pattern.winLossReaction.afterDraw[nextChoice]++;
      }
    }

    // Analyze streak behavior
    let switches = 0;
    let repeats = 0;
    for (let i = 1; i < this.history.length; i++) {
      if (this.history[i].playerChoice !== this.history[i - 1].playerChoice) {
        switches++;
      } else {
        repeats++;
      }
    }
    const totalTransitions = switches + repeats;
    if (totalTransitions > 0) {
      pattern.streakBehavior.tendencyToSwitch = switches / totalTransitions;
      pattern.streakBehavior.tendencyToRepeat = repeats / totalTransitions;
    }

    // Analyze recent bias (last 5 games weighted more heavily)
    const recentGames = this.history.slice(-5);
    recentGames.forEach((game, index) => {
      const weight = (index + 1) / recentGames.length; // More recent = higher weight
      pattern.timePatterns.recentBias[game.playerChoice] += weight;
    });

    // Normalize recent bias
    const total = Object.values(pattern.timePatterns.recentBias).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(pattern.timePatterns.recentBias).forEach((choice) => {
        pattern.timePatterns.recentBias[choice as Choice] /= total;
      });
    }

    return pattern;
  }

  private getTransitionProbability(fromChoice: Choice, toChoice: Choice): number {
    const transitions = this.analyzePlayerPatterns().transitionMatrix[fromChoice];
    const total = Object.values(transitions).reduce((sum, count) => sum + count, 0);
    return total > 0 ? transitions[toChoice] / total : 0.33;
  }

  private getReactionTendency(result: Result, choice: Choice): number {
    const reactions = this.analyzePlayerPatterns().winLossReaction;
    let targetReactions: Record<Choice, number>;

    switch (result) {
      case 'win':
        targetReactions = reactions.afterWin;
        break;
      case 'lose':
        targetReactions = reactions.afterLoss;
        break;
      default:
        targetReactions = reactions.afterDraw;
    }

    const total = Object.values(targetReactions).reduce((sum, count) => sum + count, 0);
    return total > 0 ? targetReactions[choice] / total : 0.33;
  }

  private prepareTrainingData(): void {
    if (this.history.length < 2) return;

    // Clear old training data
    this.trainingData = [];

    // Use sliding window approach for the last few games
    const windowSize = Math.min(this.history.length - 1, 10);
    for (let i = this.history.length - windowSize; i < this.history.length - 1; i++) {
      const currentHistory = this.history.slice(0, i + 1);
      const features = this.extractFeaturesFromHistory(currentHistory);
      const nextChoice = this.history[i + 1].playerChoice;

      // Convert choice to one-hot encoding
      const outputs = [0, 0, 0];
      const choiceIndex = ['rock', 'paper', 'scissors'].indexOf(nextChoice);
      outputs[choiceIndex] = 1;

      this.trainingData.push({
        inputs: features,
        outputs,
      });
    }
  }

  private extractFeaturesFromHistory(historySubset: GameEvent[]): number[] {
    if (historySubset.length === 0) {
      return new Array(20).fill(0);
    }

    // Create a temporary AI instance to analyze this subset
    const tempAI = new AdaptiveAI();
    tempAI.history = historySubset;

    try {
      return tempAI.extractFeatures();
    } catch {
      // Fallback to basic features
      const choiceCount = { rock: 0, paper: 0, scissors: 0 };
      historySubset.forEach((game) => {
        choiceCount[game.playerChoice]++;
      });

      const total = historySubset.length;
      const features = [
        choiceCount.rock / total,
        choiceCount.paper / total,
        choiceCount.scissors / total,
        ...new Array(17).fill(0),
      ];

      return features;
    }
  }

  private async performIncrementalLearning(): Promise<void> {
    if (!this.modelReady || this.isTraining || this.trainingData.length === 0) {
      return;
    }

    // Additional safety check for neural network
    if (
      !this.neuralNetwork ||
      typeof this.neuralNetwork.addData !== 'function' ||
      typeof this.neuralNetwork.train !== 'function'
    ) {
      console.warn('⚠️ Neural network not properly initialized for training, skipping incremental learning');
      return;
    }

    this.isTraining = true;
    console.log('🧠 Starting incremental learning with', this.trainingData.length, 'training samples');

    try {
      // Add training data
      this.trainingData.forEach((data) => {
        this.neuralNetwork!.addData(data.inputs, data.outputs);
      });

      // Train the model
      await this.neuralNetwork!.train({
        epochs: 50,
        batchSize: Math.min(this.trainingData.length, 8),
      });

      console.log('✅ Training completed successfully');
    } catch (error) {
      console.error('❌ Training error:', error);
      console.warn('⚠️ Falling back to pattern-based prediction due to training failure');
    } finally {
      this.isTraining = false;
    }
  }

  public async predictNextMove(): Promise<AIConfidence> {
    if (!this.isNeuralNetworkReady() || this.isTraining) {
      console.log('🧠 Neural network not ready, using pattern-based prediction');
      // Fallback to pattern-based prediction when neural network isn't ready
      return this.getPatternBasedPrediction();
    }

    if (this.history.length === 0) {
      console.log('🧠 No game history, using random prediction');
      // Fallback to random prediction
      return {
        rockProbability: 0.33,
        paperProbability: 0.33,
        scissorsProbability: 0.34,
        confidence: 0.1,
        reasoning: ['No training data available', 'Using random prediction'],
      };
    }

    try {
      // Additional safety check for neural network
      if (!this.neuralNetwork || typeof this.neuralNetwork.predict !== 'function') {
        console.warn('⚠️ Neural network not properly initialized, falling back to pattern-based prediction');
        return this.getPatternBasedPrediction();
      }

      const features = this.extractFeatures();
      console.log('🧠 Extracted features for prediction:', features);

      console.log('🧠 Using neural network for prediction...');
      // Use the trained model to predict
      const results = await this.neuralNetwork.predict(features);
      console.log('🧠 Neural network prediction results:', results);

      let probabilities = [0.33, 0.33, 0.34]; // Default
      if (results && results.length >= 3) {
        probabilities = [results[0].value, results[1].value, results[2].value];
      }

      // Ensure probabilities sum to 1 and are non-negative
      probabilities = probabilities.map((p) => Math.max(0, p));
      const sum = probabilities.reduce((acc, val) => acc + val, 0);
      if (sum > 0) {
        probabilities = probabilities.map((p) => p / sum);
      } else {
        probabilities = [0.33, 0.33, 0.34];
      }

      const confidence = Math.max(...probabilities) - 0.33; // Above random chance
      const reasoning = this.generateReasoning();

      this.lastPrediction = {
        rockProbability: probabilities[0],
        paperProbability: probabilities[1],
        scissorsProbability: probabilities[2],
        confidence: Math.max(0, Math.min(1, confidence)),
        reasoning,
      };

      console.log('🧠 Prediction completed successfully:', this.lastPrediction);
      return this.lastPrediction;
    } catch (error) {
      console.error('❌ Prediction error:', error);
      console.log('🧠 Falling back to pattern-based prediction due to error');
      // Fallback to pattern-based prediction
      return this.getPatternBasedPrediction();
    }
  }

  private generateReasoning(): string[] {
    const reasoning: string[] = [];
    const patterns = this.analyzePlayerPatterns();

    if (this.history.length === 0) {
      return ['No game history available'];
    }

    const lastGame = this.history[this.history.length - 1];

    // Analyze most frequent choice
    const mostFrequent = Object.entries(patterns.choiceFrequency).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as Choice;
    reasoning.push(
      `Player favors ${mostFrequent} (${Math.round((patterns.choiceFrequency[mostFrequent] / this.history.length) * 100)}% of the time)`
    );

    // Analyze reaction to last result
    if (lastGame.result === 'win') {
      reasoning.push('Player won last round - analyzing post-win behavior');
    } else if (lastGame.result === 'lose') {
      reasoning.push('Player lost last round - analyzing post-loss behavior');
    } else {
      reasoning.push('Last round was a draw - analyzing post-draw behavior');
    }

    // Analyze streak behavior
    if (patterns.streakBehavior.tendencyToSwitch > 0.6) {
      reasoning.push('Player tends to switch choices frequently');
    } else if (patterns.streakBehavior.tendencyToRepeat > 0.6) {
      reasoning.push('Player tends to repeat choices');
    }

    // Recent bias
    const recentFavorite = Object.entries(patterns.timePatterns.recentBias).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as Choice;
    reasoning.push(`Recent games show bias toward ${recentFavorite}`);

    // Add ML-specific reasoning if available
    if (this.modelReady && !this.isTraining) {
      reasoning.push('Using neural network predictions');
    } else {
      reasoning.push('Using enhanced pattern analysis');
    }

    return reasoning;
  }

  public getLastPrediction(): AIConfidence | null {
    return this.lastPrediction;
  }

  public getTrainingProgress(): {
    gamesPlayed: number;
    modelReady: boolean;
    isTraining: boolean;
    ml5Available: boolean;
    trainingDataSize: number;
  } {
    return {
      gamesPlayed: this.history.length,
      modelReady: this.isNeuralNetworkReady(),
      isTraining: this.isTraining,
      ml5Available: typeof this.ml5 !== 'undefined',
      trainingDataSize: this.trainingData.length,
    };
  }

  public getStatus(): {
    isWorking: boolean;
    status: string;
    details: string[];
    mode: 'Neural Network' | 'Enhanced Pattern' | 'Basic Pattern' | 'Learning' | 'Limited';
    confidence: number;
    capabilities: string[];
  } {
    const progress = this.getTrainingProgress();
    const details: string[] = [];
    const capabilities: string[] = [];
    let mode = 'Limited' as 'Neural Network' | 'Enhanced Pattern' | 'Basic Pattern' | 'Learning' | 'Limited';
    let confidence = 0;

    // Check ML5 availability
    if (!progress.ml5Available) {
      details.push('ML5.js library not loaded');
      mode = 'Limited';
    } else {
      capabilities.push('ML5.js available');
    }

    // Check neural network status
    if (!progress.modelReady) {
      details.push('Neural network not initialized');
    } else {
      capabilities.push('Neural network ready');
    }

    // Check training status
    if (progress.isTraining) {
      details.push('Currently training neural network');
      mode = 'Learning';
    }

    // Determine operational mode and confidence based on available data
    if (progress.gamesPlayed < 3) {
      details.push('Need at least 3 games for learning');
      mode = 'Limited';
      confidence = 0;
    } else if (progress.modelReady && !progress.isTraining && progress.trainingDataSize > 0) {
      // Neural network is ready and has training data
      mode = 'Neural Network';
      confidence = Math.min(0.9, 0.3 + progress.gamesPlayed * 0.1);
      capabilities.push('Deep learning predictions');
      capabilities.push('Pattern recognition');
      capabilities.push('Behavioral analysis');
    } else if (progress.gamesPlayed >= 10) {
      // Enhanced pattern analysis with substantial data
      mode = 'Enhanced Pattern';
      confidence = Math.min(0.8, 0.4 + progress.gamesPlayed * 0.05);
      capabilities.push('Advanced pattern recognition');
      capabilities.push('Transition probability analysis');
      capabilities.push('Streak behavior detection');
      capabilities.push('Win/loss reaction analysis');
    } else if (progress.gamesPlayed >= 3) {
      // Basic pattern analysis
      mode = 'Basic Pattern';
      confidence = Math.min(0.6, 0.2 + progress.gamesPlayed * 0.1);
      capabilities.push('Basic pattern recognition');
      capabilities.push('Choice frequency analysis');
    } else {
      mode = 'Limited';
      confidence = 0;
    }

    // Add performance metrics
    if (progress.gamesPlayed > 0) {
      const patterns = this.analyzePlayerPatterns();
      const patternQuality = this.assessPatternQuality(patterns);

      if (patternQuality > 0.7) {
        capabilities.push('High-quality pattern detection');
      } else if (patternQuality > 0.4) {
        capabilities.push('Moderate pattern detection');
      }

      details.push(`Pattern quality: ${Math.round(patternQuality * 100)}%`);
    }

    // Determine overall working status
    const isWorking = mode !== 'Limited' && progress.gamesPlayed >= 3;

    // Generate status description
    let status: string;
    switch (mode) {
      case 'Neural Network':
        status = `AI Enhanced (${Math.round(confidence * 100)}% confidence)`;
        break;
      case 'Enhanced Pattern':
        status = `Smart Learning (${Math.round(confidence * 100)}% confidence)`;
        break;
      case 'Basic Pattern':
        status = `Learning (${Math.round(confidence * 100)}% confidence)`;
        break;

      case 'Limited':
      default:
        status = 'Limited functionality';
        break;
    }

    return {
      isWorking,
      status,
      details,
      mode,
      confidence,
      capabilities,
    };
  }

  private getPatternBasedPrediction(): AIConfidence {
    if (this.history.length === 0) {
      return {
        rockProbability: 0.33,
        paperProbability: 0.33,
        scissorsProbability: 0.34,
        confidence: 0.1,
        reasoning: ['No training data available', 'Using random prediction'],
      };
    }

    const patterns = this.analyzePlayerPatterns();

    // Enhanced pattern analysis with recent bias and transition probabilities
    let rockProb = patterns.choiceFrequency.rock / this.history.length;
    let paperProb = patterns.choiceFrequency.paper / this.history.length;
    let scissorsProb = patterns.choiceFrequency.scissors / this.history.length;

    // Apply recent bias (last 3-5 games weighted more heavily)
    if (this.history.length >= 3) {
      const recentGames = this.history.slice(-3);
      const recentRock = recentGames.filter((g) => g.playerChoice === 'rock').length;
      const recentPaper = recentGames.filter((g) => g.playerChoice === 'paper').length;
      const recentScissors = recentGames.filter((g) => g.playerChoice === 'scissors').length;

      // Weight recent games more heavily (70% recent, 30% overall)
      const recentWeight = 0.7;
      const overallWeight = 0.3;

      rockProb = (recentWeight * recentRock) / 3 + overallWeight * rockProb;
      paperProb = (recentWeight * recentPaper) / 3 + overallWeight * paperProb;
      scissorsProb = (recentWeight * recentScissors) / 3 + overallWeight * scissorsProb;
    }

    // Apply transition probability from last choice
    if (this.history.length >= 2) {
      const lastChoice = this.history[this.history.length - 1].playerChoice;
      const transitions = patterns.transitionMatrix[lastChoice];
      const totalTransitions = Object.values(transitions).reduce((sum, count) => sum + count, 0);

      if (totalTransitions > 0) {
        // Blend transition probability with frequency probability
        const transitionWeight = 0.4;
        const frequencyWeight = 0.6;

        rockProb = frequencyWeight * rockProb + (transitionWeight * transitions.rock) / totalTransitions;
        paperProb = frequencyWeight * paperProb + (transitionWeight * transitions.paper) / totalTransitions;
        scissorsProb = frequencyWeight * scissorsProb + (transitionWeight * transitions.scissors) / totalTransitions;
      }
    }

    // Normalize probabilities
    const sum = rockProb + paperProb + scissorsProb;
    if (sum > 0) {
      rockProb /= sum;
      paperProb /= sum;
      scissorsProb /= sum;
    } else {
      // Fallback to equal probabilities
      rockProb = paperProb = scissorsProb = 0.33;
    }

    const confidence = Math.max(rockProb, paperProb, scissorsProb) - 0.33;
    const reasoning = this.generateReasoning();

    return {
      rockProbability: rockProb,
      paperProbability: paperProb,
      scissorsProbability: scissorsProb,
      confidence: Math.max(0, Math.min(1, confidence)),
      reasoning: [...reasoning, 'Using enhanced pattern analysis'],
    };
  }

  private assessPatternQuality(patterns: PlayerPattern): number {
    if (this.history.length === 0) return 0;

    let quality = 0;

    // Assess choice frequency distribution
    const frequencies = Object.values(patterns.choiceFrequency);
    const maxFreq = Math.max(...frequencies);
    const minFreq = Math.min(...frequencies);
    const frequencyVariation = (maxFreq - minFreq) / this.history.length;
    quality += frequencyVariation * 0.3;

    // Assess transition matrix quality
    let transitionQuality = 0;
    Object.values(patterns.transitionMatrix).forEach((transitions) => {
      const total = Object.values(transitions).reduce((sum, count) => sum + count, 0);
      if (total > 0) {
        const maxTransition = Math.max(...Object.values(transitions));
        transitionQuality += maxTransition / total;
      }
    });
    quality += (transitionQuality / 3) * 0.3;

    // Assess streak behavior clarity
    const streakClarity = Math.abs(patterns.streakBehavior.tendencyToSwitch - patterns.streakBehavior.tendencyToRepeat);
    quality += streakClarity * 0.2;

    // Assess recent bias strength
    const recentBiasValues = Object.values(patterns.timePatterns.recentBias);
    const recentBiasStrength = Math.max(...recentBiasValues) - Math.min(...recentBiasValues);
    quality += recentBiasStrength * 0.2;

    return Math.min(1, Math.max(0, quality));
  }

  public reset(): void {
    this.history = [];
    this.lastPrediction = null;
    this.trainingData = [];
    this.isTraining = false;
    this.initializeNeuralNetwork();
  }

  public getPerformanceMetrics(): {
    winRate: number;
    gamesPlayed: number;
    predictionAccuracy: number;
    learningProgress: number;
    patternStrength: number;
    neuralNetworkStatus: 'Ready' | 'Training' | 'Unavailable';
  } {
    const progress = this.getTrainingProgress();
    const totalGames = this.history.length;

    if (totalGames === 0) {
      return {
        winRate: 0,
        gamesPlayed: 0,
        predictionAccuracy: 0,
        learningProgress: 0,
        patternStrength: 0,
        neuralNetworkStatus: progress.modelReady ? 'Ready' : 'Unavailable',
      };
    }

    // Calculate win rate
    const wins = this.history.filter((game) => game.result === 'win').length;
    const winRate = wins / totalGames;

    // Calculate prediction accuracy (how often the AI's choice beats the player's choice)
    const correctPredictions = this.history.filter((game) => {
      const aiChoice = game.aiChoice;
      const playerChoice = game.playerChoice;
      return (
        (aiChoice === 'rock' && playerChoice === 'scissors') ||
        (aiChoice === 'paper' && playerChoice === 'rock') ||
        (aiChoice === 'scissors' && playerChoice === 'paper')
      );
    }).length;
    const predictionAccuracy = correctPredictions / totalGames;

    // Calculate learning progress based on games played and pattern quality
    let learningProgress = 0;
    if (totalGames >= 3) {
      const patterns = this.analyzePlayerPatterns();
      const patternQuality = this.assessPatternQuality(patterns);
      learningProgress = Math.min(1, (totalGames / 30) * 0.6 + patternQuality * 0.4);
    }

    // Get pattern strength
    const patterns = this.analyzePlayerPatterns();
    const patternStrength = this.assessPatternQuality(patterns);

    // Determine neural network status
    let neuralNetworkStatus: 'Ready' | 'Training' | 'Unavailable';
    if (progress.isTraining) {
      neuralNetworkStatus = 'Training';
    } else if (progress.modelReady) {
      neuralNetworkStatus = 'Ready';
    } else {
      neuralNetworkStatus = 'Unavailable';
    }

    return {
      winRate: Math.round(winRate * 100) / 100,
      gamesPlayed: totalGames,
      predictionAccuracy: Math.round(predictionAccuracy * 100) / 100,
      learningProgress: Math.round(learningProgress * 100) / 100,
      patternStrength: Math.round(patternStrength * 100) / 100,
      neuralNetworkStatus,
    };
  }

  public getLearningInsights(): {
    playerPatterns: string[];
    adaptationStrategies: string[];
    learningFocus: string[];
    recentImprovements: string[];
  } {
    if (this.history.length < 3) {
      return {
        playerPatterns: ['Not enough data yet'],
        adaptationStrategies: ['Waiting for more games'],
        learningFocus: ['Basic pattern recognition'],
        recentImprovements: ['None yet'],
      };
    }

    const patterns = this.analyzePlayerPatterns();
    const insights = {
      playerPatterns: [] as string[],
      adaptationStrategies: [] as string[],
      learningFocus: [] as string[],
      recentImprovements: [] as string[],
    };

    // Analyze player patterns
    const mostFrequent = Object.entries(patterns.choiceFrequency).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as Choice;
    const frequency = Math.round((patterns.choiceFrequency[mostFrequent] / this.history.length) * 100);

    if (frequency > 50) {
      insights.playerPatterns.push(`Player heavily favors ${mostFrequent} (${frequency}% of moves)`);
    } else if (frequency > 40) {
      insights.playerPatterns.push(`Player shows preference for ${mostFrequent} (${frequency}% of moves)`);
    } else {
      insights.playerPatterns.push('Player shows balanced choice distribution');
    }

    // Analyze streak behavior
    if (patterns.streakBehavior.tendencyToSwitch > 0.7) {
      insights.playerPatterns.push('Player frequently switches choices between rounds');
    } else if (patterns.streakBehavior.tendencyToRepeat > 0.7) {
      insights.playerPatterns.push('Player tends to repeat choices in streaks');
    } else {
      insights.playerPatterns.push('Player shows mixed streak behavior');
    }

    // Analyze transition patterns
    const lastChoice = this.history[this.history.length - 1].playerChoice;
    const transitions = patterns.transitionMatrix[lastChoice];
    const mostLikelyNext = Object.entries(transitions).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as Choice;

    if (transitions[mostLikelyNext] > 0) {
      const transitionProb = Math.round(
        (transitions[mostLikelyNext] / Object.values(transitions).reduce((sum, count) => sum + count, 0)) * 100
      );
      if (transitionProb > 60) {
        insights.playerPatterns.push(
          `Strong tendency to choose ${mostLikelyNext} after ${lastChoice} (${transitionProb}% probability)`
        );
      }
    }

    // Adaptation strategies
    if (this.history.length >= 5) {
      const recentGames = this.history.slice(-5);
      const recentWins = recentGames.filter((g) => g.result === 'win').length;
      const recentLosses = recentGames.filter((g) => g.result === 'lose').length;

      if (recentWins > recentLosses) {
        insights.adaptationStrategies.push('Player is winning recently - focusing on counter-strategies');
      } else if (recentLosses > recentWins) {
        insights.adaptationStrategies.push('Player is losing recently - analyzing defensive patterns');
      } else {
        insights.adaptationStrategies.push('Balanced recent performance - monitoring for changes');
      }
    }

    // Learning focus areas
    if (this.history.length >= 10) {
      insights.learningFocus.push('Advanced pattern recognition');
      insights.learningFocus.push('Behavioral prediction models');
      insights.learningFocus.push('Adaptive counter-strategies');
    } else if (this.history.length >= 5) {
      insights.learningFocus.push('Pattern frequency analysis');
      insights.learningFocus.push('Transition probability mapping');
    } else {
      insights.learningFocus.push('Basic choice frequency');
      insights.learningFocus.push('Simple pattern detection');
    }

    // Recent improvements
    if (this.history.length >= 3) {
      const patternQuality = this.assessPatternQuality(patterns);
      if (patternQuality > 0.7) {
        insights.recentImprovements.push('High-quality pattern detection achieved');
      } else if (patternQuality > 0.4) {
        insights.recentImprovements.push('Moderate pattern quality - continuing to learn');
      }

      if (this.history.length >= 5) {
        insights.recentImprovements.push('Enhanced behavioral analysis enabled');
      }
    }

    return insights;
  }

  public getPredictionInsights(): {
    currentConfidence: number;
    predictionReasoning: string[];
    uncertaintyFactors: string[];
    nextMovePrediction: string;
    confidenceTrend: 'Increasing' | 'Stable' | 'Decreasing';
  } {
    if (this.history.length === 0) {
      return {
        currentConfidence: 0,
        predictionReasoning: ['No game history available'],
        uncertaintyFactors: ['Insufficient data for prediction'],
        nextMovePrediction: 'Random (no data)',
        confidenceTrend: 'Stable',
      };
    }

    const lastPrediction = this.getLastPrediction();
    const patterns = this.analyzePlayerPatterns();
    const currentConfidence = lastPrediction?.confidence || 0;

    const insights = {
      currentConfidence,
      predictionReasoning: [] as string[],
      uncertaintyFactors: [] as string[],
      nextMovePrediction: '',
      confidenceTrend: 'Stable' as 'Increasing' | 'Stable' | 'Decreasing',
    };

    // Analyze prediction reasoning
    if (lastPrediction) {
      const maxProb = Math.max(
        lastPrediction.rockProbability,
        lastPrediction.paperProbability,
        lastPrediction.scissorsProbability
      );
      const choice =
        maxProb === lastPrediction.rockProbability
          ? 'rock'
          : maxProb === lastPrediction.paperProbability
            ? 'paper'
            : 'scissors';

      insights.nextMovePrediction = `${choice} (${Math.round(maxProb * 100)}% confidence)`;

      // Add reasoning from the last prediction
      insights.predictionReasoning.push(...lastPrediction.reasoning);
    }

    // Analyze uncertainty factors
    if (this.history.length < 5) {
      insights.uncertaintyFactors.push('Limited historical data');
    }

    if (this.history.length < 10) {
      insights.uncertaintyFactors.push('Pattern analysis still developing');
    }

    // Check for inconsistent player behavior
    const choiceVariation =
      Math.max(...Object.values(patterns.choiceFrequency)) - Math.min(...Object.values(patterns.choiceFrequency));
    if (choiceVariation < 0.2) {
      insights.uncertaintyFactors.push('Player shows very balanced choices');
    }

    // Check transition matrix consistency
    let transitionConsistency = 0;
    Object.values(patterns.transitionMatrix).forEach((transitions) => {
      const total = Object.values(transitions).reduce((sum, count) => sum + count, 0);
      if (total > 0) {
        const maxTransition = Math.max(...Object.values(transitions));
        transitionConsistency += maxTransition / total;
      }
    });

    if (transitionConsistency < 0.4) {
      insights.uncertaintyFactors.push('Player shows unpredictable transitions');
    }

    // Determine confidence trend based on recent games
    if (this.history.length >= 6) {
      const recentGames = this.history.slice(-6);
      const olderGames = this.history.slice(-12, -6);

      if (recentGames.length >= 3 && olderGames.length >= 3) {
        const recentConfidence = this.calculateConfidenceForGames(recentGames);
        const olderConfidence = this.calculateConfidenceForGames(olderGames);

        if (recentConfidence > olderConfidence + 0.1) {
          insights.confidenceTrend = 'Increasing';
        } else if (recentConfidence < olderConfidence - 0.1) {
          insights.confidenceTrend = 'Decreasing';
        } else {
          insights.confidenceTrend = 'Stable';
        }
      }
    }

    // Add confidence-based insights
    if (currentConfidence > 0.7) {
      insights.predictionReasoning.push('High confidence in prediction based on strong patterns');
    } else if (currentConfidence > 0.4) {
      insights.predictionReasoning.push('Moderate confidence with some uncertainty');
    } else {
      insights.predictionReasoning.push('Low confidence - patterns are unclear');
    }

    return insights;
  }

  private calculateConfidenceForGames(games: GameEvent[]): number {
    if (games.length === 0) return 0;

    // Calculate how well the AI performed in these games
    const wins = games.filter((g) => g.result === 'win').length;
    return wins / games.length;
  }

  // Add method to access history for testing
  public getHistory(): GameEvent[] {
    return [...this.history];
  }

  // Add method to set history for testing
  public setHistory(history: GameEvent[]): void {
    this.history = [...history];
  }
}
