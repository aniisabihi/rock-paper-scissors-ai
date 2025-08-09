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
    this.initializeNeuralNetwork();
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
        // Add training data to the neural network
        trainingData.forEach((data) => {
          this.neuralNetwork!.data.addData(data.inputs, data.outputs);
        });

        // Normalize and train with recent data
        await this.neuralNetwork.data.normalize();
        await this.neuralNetwork.train(
          {
            epochs: 10, // Small number for incremental learning
            batchSize: Math.min(trainingData.length, 4),
          },
          () => {
            this.isTraining = false;
          }
        );
      }
    } catch (error) {
      console.error('Training error:', error);
      this.isTraining = false;
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
    if (!this.modelReady || this.history.length === 0) {
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

  public getTrainingProgress(): { gamesPlayed: number; modelReady: boolean; isTraining: boolean } {
    return {
      gamesPlayed: this.history.length,
      modelReady: this.modelReady,
      isTraining: this.isTraining,
    };
  }

  public reset(): void {
    this.history = [];
    this.lastPrediction = null;
    if (this.neuralNetwork) {
      this.initializeNeuralNetwork();
    }
  }
}
