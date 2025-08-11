declare module 'ml5' {
  export interface NeuralNetworkOptions {
    task: 'regression' | 'classification';
    debug?: boolean;
    layers?: Array<{
      type: string;
      units: number;
      activation: string;
    }>;
  }

  export interface NeuralNetwork {
    addData: (inputs: number[], outputs: number[]) => void;
    train: (options: { epochs: number; batchSize: number }) => Promise<void>;
    predict: (inputs: number[]) => Promise<Array<{ value: number }>>;
  }

  // ml5 0.12.2 exports neuralNetwork as a top-level function
  export function neuralNetwork(options: NeuralNetworkOptions): NeuralNetwork;

  // Also export as a default export for compatibility
  const ml5Default = {
    neuralNetwork: neuralNetwork,
  };
  export default ml5Default;
}

// Extend Window interface to include ml5
declare global {
  interface Window {
    ml5: typeof import('ml5');
  }
}
