'use client';

import { createContext, useContext, useRef, useEffect, useState, type ReactNode } from 'react';
import { AdaptiveAI } from '@/lib/game/adaptive-ai';

interface AdaptiveAIContextType {
  adaptiveAI: AdaptiveAI | null;
  isLoading: boolean;
}

const AdaptiveAIContext = createContext<AdaptiveAIContextType | null>(null);

export const useAdaptiveAI = () => {
  const context = useContext(AdaptiveAIContext);
  if (!context) {
    throw new Error('useAdaptiveAI must be used within an AdaptiveAIProvider');
  }
  return context;
};

interface AdaptiveAIProviderProps {
  children: ReactNode;
}

export const AdaptiveAIProvider: React.FC<AdaptiveAIProviderProps> = ({ children }) => {
  const adaptiveAI = useRef<AdaptiveAI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        adaptiveAI.current = new AdaptiveAI();
        // Wait a bit for the AI to initialize
        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize AdaptiveAI:', error);
        setIsLoading(false);
      }
    };

    initializeAI();
  }, []);

  const contextValue = {
    adaptiveAI: adaptiveAI.current,
    isLoading,
  };

  return <AdaptiveAIContext.Provider value={contextValue}>{children}</AdaptiveAIContext.Provider>;
};
