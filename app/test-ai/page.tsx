'use client';

import { useState, useEffect } from 'react';
import { AdaptiveAI } from '@/lib/game/adaptive-ai';
import { Choice, Result } from '@/lib/game/logic';

export default function TestAIPage() {
  const [ai, setAi] = useState<AdaptiveAI | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');
  const [prediction, setPrediction] = useState<string>('No prediction yet');
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const initializeAI = async () => {
      try {
        setIsInitializing(true);
        setStatus('Creating AI instance...');

        // Use singleton instance to prevent multiple initializations
        const adaptiveAI = AdaptiveAI.getInstance();

        // Wait a bit for ml5 to initialize if it's available
        if (typeof window !== 'undefined') {
          setStatus('Waiting for ml5 initialization...');
          // Give ml5 time to load
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setAi(adaptiveAI);
        setStatus('AI initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        setStatus('AI initialization failed - using fallback mode');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAI();
  }, []);

  const simulateGame = async (playerChoice: Choice) => {
    if (!ai) return;

    // Simple AI logic for testing
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    const aiChoice = choices[Math.floor(Math.random() * 3)];

    // Determine result
    let result: Result;
    if (playerChoice === aiChoice) {
      result = 'draw';
    } else if (
      (playerChoice === 'rock' && aiChoice === 'scissors') ||
      (playerChoice === 'paper' && aiChoice === 'rock') ||
      (playerChoice === 'scissors' && aiChoice === 'paper')
    ) {
      result = 'win';
    } else {
      result = 'lose';
    }

    // Record the game
    ai.recordGame(playerChoice, aiChoice, result);

    // Get prediction for next move
    const nextPrediction = await ai.predictNextMove();

    // Update state
    setGameHistory((prev) => [...prev, `Game: Player=${playerChoice}, AI=${aiChoice}, Result=${result}`]);
    setPrediction(
      `Next move prediction: Rock=${Math.round(nextPrediction.rockProbability * 100)}%, Paper=${Math.round(nextPrediction.paperProbability * 100)}%, Scissors=${Math.round(nextPrediction.scissorsProbability * 100)}%`
    );

    // Update status
    const aiStatus = ai.getStatus();
    setStatus(`AI Status: ${aiStatus.status} (${aiStatus.mode})`);
  };

  const resetAI = () => {
    if (ai) {
      // Reset the singleton instance to get a fresh start
      AdaptiveAI.resetInstance();

      // Get a new instance
      const newAI = AdaptiveAI.getInstance();
      setAi(newAI);

      setGameHistory([]);
      setPrediction('No prediction yet');
      setStatus('AI reset');
    }
  };

  const testML5Exports = async () => {
    try {
      setDebugInfo('Testing ml5 exports...');

      // Test direct import
      const ml5Module: Record<string, unknown> & { default?: unknown } = await import('ml5');
      console.log('🔍 Raw ml5 module:', ml5Module);
      console.log('📋 Module keys:', Object.keys(ml5Module));

      // Check default export
      if ('default' in ml5Module) {
        console.log('✅ Has default export:', ml5Module.default);
        if (ml5Module.default) {
          console.log('📋 Default export keys:', Object.keys(ml5Module.default));
        }
      } else {
        console.log('❌ No default export');
      }

      // Check for neuralNetwork function
      if ('neuralNetwork' in ml5Module) {
        console.log('✅ neuralNetwork found in module:', typeof ml5Module.neuralNetwork);
      } else if (
        ml5Module.default &&
        typeof ml5Module.default === 'object' &&
        ml5Module.default &&
        'neuralNetwork' in ml5Module.default
      ) {
        console.log(
          '✅ neuralNetwork found in default export:',
          typeof (ml5Module.default as typeof import('ml5').default).neuralNetwork
        );
      } else {
        console.log('❌ neuralNetwork not found in module or default export');

        // Search for neuralNetwork in all exports
        const allExports = Object.values(ml5Module);
        const neuralNetworkExport = allExports.find((exp) => exp && typeof exp === 'object' && 'neuralNetwork' in exp);

        if (neuralNetworkExport) {
          console.log('🔍 Found neuralNetwork in nested export:', neuralNetworkExport);
        }
      }

      // Check if any export has neuralNetwork as a function
      const hasNeuralNetworkFn = Object.values(ml5Module).some(
        (exp) => exp && typeof exp === 'function' && (exp as { name?: string }).name === 'neuralNetwork'
      );

      if (hasNeuralNetworkFn) {
        console.log('✅ Found neuralNetwork function in exports');
      } else {
        console.log('❌ No neuralNetwork function found in exports');
      }

      // Test the actual neuralNetwork function call
      console.log('🧪 Testing neuralNetwork function call...');
      try {
        if (ml5Module.neuralNetwork && typeof ml5Module.neuralNetwork === 'function') {
          const testNN = (ml5Module.neuralNetwork as typeof import('ml5').neuralNetwork)({
            task: 'regression',
            debug: true,
            layers: [
              { type: 'dense', units: 32, activation: 'relu' },
              { type: 'dense', units: 16, activation: 'relu' },
              { type: 'dense', units: 3, activation: 'softmax' },
            ],
          });
          console.log('✅ neuralNetwork function call successful:', testNN);
        } else {
          console.log('❌ neuralNetwork not callable from module');
        }
      } catch (callError) {
        console.error('💥 neuralNetwork function call failed:', callError);
      }

      // Check TensorFlow.js availability
      console.log('🧠 Checking TensorFlow.js availability...');
      try {
        if (typeof window !== 'undefined') {
          const tf = (window as { tf?: { version: string } }).tf;
          if (tf) {
            console.log('✅ TensorFlow.js found on window:', tf.version);
          } else {
            console.log('❌ TensorFlow.js not found on window');
          }

          // Check if ml5 has tf property
          if (ml5Module.tf) {
            console.log('✅ TensorFlow.js found in ml5 module:', (ml5Module.tf as { version: string }).version);
          } else {
            console.log('❌ TensorFlow.js not found in ml5 module');
          }
        }
      } catch (tfError) {
        console.error('💥 TensorFlow.js check failed:', tfError);
      }

      setDebugInfo('ml5 exports test completed - check console for details');
      return ml5Module;
    } catch (error) {
      console.error('Failed to test ml5 exports:', error);
      setDebugInfo(`ml5 exports test failed: ${error}`);
      throw error;
    }
  };

  if (isInitializing) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Adaptive AI Test Page</h1>
          <div className="animate-pulse">
            <p className="text-lg text-gray-600 mb-4">{status}</p>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ai) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Adaptive AI Test Page</h1>
          <p className="text-red-600">Failed to initialize AI. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Adaptive AI Test Page</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">AI Status</h2>
        <p className="text-gray-700">{status}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Prediction</h2>
        <p className="text-gray-700">{prediction}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Controls</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => simulateGame('rock')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Play Rock
          </button>
          <button
            onClick={() => simulateGame('paper')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Play Paper
          </button>
          <button
            onClick={() => simulateGame('scissors')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Play Scissors
          </button>
        </div>
        <button onClick={resetAI} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Reset AI
        </button>
        <button
          onClick={testML5Exports}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 ml-2"
        >
          Debug ML5
        </button>
      </div>

      {debugInfo && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
          <p className="text-gray-700">{debugInfo}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Game History</h2>
        <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
          {gameHistory.length === 0 ? (
            <p className="text-gray-500">No games played yet</p>
          ) : (
            gameHistory.map((game, index) => (
              <div key={index} className="mb-2 text-sm">
                {game}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">AI Insights</h2>
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Training Progress</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(ai.getTrainingProgress(), null, 2)}
          </pre>

          <h3 className="font-semibold mb-2 mt-4">Performance Metrics</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(ai.getPerformanceMetrics(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
