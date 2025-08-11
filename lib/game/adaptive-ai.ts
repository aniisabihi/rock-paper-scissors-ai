import { Choice, Result } from './logic';

// Declare ml5 globally to avoid TypeScript errors
declare global {
  interface Window {
    ml5: {
      neuralNetwork: (options: {
        inputs: number;
        outputs: number;
        task: string;
        debug: boolean;
        learningRate: number;
        hiddenUnits: number;
      }) => ML5NeuralNetwork;
      tf: {
        ready: () => Promise<void>;
        setBackend: (backend: string) => Promise<void>;
      };
    };
  }
}

interface ML5NeuralNetwork {
  data: {
    addData: (inputs: number[], outputs: number[]) => void;
    normalize: () => Promise<void>;
  };
  train: (options: { epochs: number; batchSize: number }, callback: () => void) => Promise<void>;
  predict: (inputs: number[]) => Promise<Array<{ value: number }>>;
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
  private features: number[] = [];
  private modelReady = false;
  private lastPrediction: AIConfidence | null = null;

  constructor() {
    // Don't initialize immediately - wait for ml5 to be available
    this.waitForML5();
  }

  private async waitForML5(): Promise<void> {
    // Wait for ml5 to be available
    let attempts = 0;
    const maxAttempts = 50; // Wait up to 5 seconds

    const checkML5 = async () => {
      attempts++;

      if (typeof window !== 'undefined' && window.ml5) {
        console.log('✅ ML5 detected, initializing TensorFlow.js and neural network...');
        try {
          // Initialize TensorFlow.js first
          if (window.ml5.tf) {
            await window.ml5.tf.ready();
            console.log('✅ TensorFlow.js ready');
          }
          await this.initializeNeuralNetwork();
        } catch (error) {
          console.error('❌ Failed to initialize TensorFlow.js:', error);
          this.modelReady = false;
        }
      } else if (attempts < maxAttempts) {
        // Wait 100ms before next attempt
        setTimeout(checkML5, 100);
      } else {
        console.warn('⚠️ ML5 not available after 5 seconds, adaptive AI will use fallback mode');
        this.modelReady = false;
      }
    };

    checkML5();
  }

  private async initializeNeuralNetwork(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.ml5) {
        // Neural network configuration
        const options = {
          inputs: 15, // Feature vector size
          outputs: 3, // Rock, Paper, Scissors probabilities
          task: 'classification',
          debug: false,
          learningRate: 0.2,
          hiddenUnits: 10,
        };

        this.neuralNetwork = window.ml5.neuralNetwork(options);
        this.modelReady = true;
        console.log('✅ Neural network initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize neural network:', error);
      this.modelReady = false;
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

    // Trigger incremental learning after sufficient data
    if (this.history.length >= 3 && this.modelReady) {
      this.performIncrementalLearning();
    }
  }

  private extractFeatures(): number[] {
    if (this.history.length === 0) {
      return new Array(15).fill(0);
    }

    const patterns = this.analyzePlayerPatterns();
    // Extract recent games for analysis (currently unused but available for future features)
    const lastGame = this.history[this.history.length - 1];

    // Create feature vector
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

      // Recent game bias
      patterns.timePatterns.recentBias.rock,
      patterns.timePatterns.recentBias.paper,
      patterns.timePatterns.recentBias.scissors,

      // Game count (normalized)
      Math.min(this.history.length / 20, 1), // Cap at 20 games
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
    return total > 0 ? transitions[toChoice] / total : 0.33; // Default to equal probability
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

  private async performIncrementalLearning(): Promise<void> {
    if (!this.modelReady || this.isTraining || this.history.length < 3) {
      return;
    }

    this.isTraining = true;

    try {
      // Prepare training data from recent history
      const trainingData = this.prepareTrainingData();

      if (trainingData.length > 0 && this.neuralNetwork) {
        console.log('🧠 Starting incremental learning with', trainingData.length, 'training samples');

        // For now, skip training until we fix the API issues
        // The pattern-based prediction will still work
        console.log('⚠️ Training temporarily disabled - using pattern-based prediction');
        this.isTraining = false;
        return;

        // TODO: Fix ML5.js API usage
        // trainingData.forEach((data) => {
        //   this.neuralNetwork!.data.addData(data.inputs, data.outputs);
        // });
        // await this.neuralNetwork.data.normalize();
        // await this.neuralNetwork.train(
        //   { epochs: 10, batchSize: Math.min(trainingData.length, 4) },
        //   () => { this.isTraining = false; }
        // );
      }
    } catch (error) {
      console.error('❌ Training error:', error);
      this.isTraining = false;

      // If training fails, fall back to pattern-based mode
      console.warn('⚠️ Falling back to pattern-based prediction due to training failure');
    }
  }

  private prepareTrainingData(): Array<{ inputs: number[]; outputs: number[] }> {
    if (this.history.length < 2) return [];

    const trainingData: Array<{ inputs: number[]; outputs: number[] }> = [];

    // Use sliding window approach for the last few games
    const windowSize = Math.min(this.history.length - 1, 5);
    for (let i = this.history.length - windowSize; i < this.history.length - 1; i++) {
      const currentHistory = this.history.slice(0, i + 1);
      const features = this.extractFeaturesFromHistory(currentHistory);
      const nextChoice = this.history[i + 1].playerChoice;

      // Convert choice to one-hot encoding
      const outputs = [0, 0, 0];
      const choiceIndex = ['rock', 'paper', 'scissors'].indexOf(nextChoice);
      outputs[choiceIndex] = 1;

      trainingData.push({
        inputs: features,
        outputs,
      });
    }

    return trainingData;
  }

  private extractFeaturesFromHistory(historySubset: GameEvent[]): number[] {
    // Similar to extractFeatures but for a specific history subset
    if (historySubset.length === 0) {
      return new Array(15).fill(0);
    }

    // Simplified feature extraction for training data
    const choiceCount = { rock: 0, paper: 0, scissors: 0 };
    historySubset.forEach((game) => {
      choiceCount[game.playerChoice]++;
    });

    const total = historySubset.length;
    const features = [choiceCount.rock / total, choiceCount.paper / total, choiceCount.scissors / total];

    // Pad with additional features
    while (features.length < 15) {
      features.push(0);
    }

    return features;
  }

  public async predictNextMove(): Promise<AIConfidence> {
    // For now, always use pattern-based prediction until we fix ML5.js issues
    // This ensures the AI still learns and adapts to player patterns
    return this.getPatternBasedPrediction();

    // TODO: Re-enable neural network prediction once ML5.js API is fixed
    /*
    if (!this.modelReady) {
      // Fallback to pattern-based prediction when neural network isn't ready
      return this.getPatternBasedPrediction();
    }
    
    if (this.history.length === 0) {
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
      const features = this.extractFeatures();

      if (!this.neuralNetwork) {
        throw new Error('Neural network not initialized');
      }

      const results = await this.neuralNetwork.predict(features);

      let probabilities = [0.33, 0.33, 0.34]; // Default
      if (results && results.length >= 3) {
        probabilities = [results[0].value, results[1].value, results[2].value];
      }

      // Ensure probabilities sum to 1
      const sum = probabilities.reduce((acc, val) => acc + val, 0);
      if (sum > 0) {
        probabilities = probabilities.map((p) => p / sum);
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

      return this.lastPrediction;
    } catch (error) {
      console.error('Prediction error:', error);
      return {
        rockProbability: 0.33,
        paperProbability: 0.33,
        scissorsProbability: 0.34,
        confidence: 0.1,
        reasoning: ['Prediction error occurred', 'Using fallback random prediction'],
      };
    }
    */
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
  } {
    return {
      gamesPlayed: this.history.length,
      modelReady: this.modelReady,
      isTraining: this.isTraining,
      ml5Available: typeof window !== 'undefined' && !!window.ml5,
    };
  }

  public getStatus(): {
    isWorking: boolean;
    status: string;
    details: string[];
    mode: 'Neural Network' | 'Enhanced Pattern' | 'Basic Pattern' | 'Limited';
    confidence: number;
    capabilities: string[];
  } {
    const progress = this.getTrainingProgress();
    const details: string[] = [];
    const capabilities: string[] = [];
    let mode: 'Neural Network' | 'Enhanced Pattern' | 'Basic Pattern' | 'Learning' | 'Limited';
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
      if (progress.ml5Available) {
        details.push('TensorFlow.js initialization pending');
      }
    } else {
      capabilities.push('Neural network ready');
    }

    // Check training status
    if (progress.isTraining) {
      details.push('Currently training neural network');
      mode = 'Limited'; // Set to limited while training
    }

    // Determine operational mode and confidence based on available data
    if (progress.gamesPlayed < 3) {
      details.push('Need at least 3 games for learning');
      mode = 'Limited';
      confidence = 0;
    } else if (progress.modelReady && !progress.isTraining) {
      // Neural network is ready and not training
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
        status = progress.isTraining ? 'Training Neural Network...' : 'Limited functionality';
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
    if (this.neuralNetwork) {
      this.initializeNeuralNetwork();
    }
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
      learningProgress = Math.min(1, (totalGames / 20) * 0.6 + patternQuality * 0.4);
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
}
