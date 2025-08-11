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
        // Use singleton instance to prevent multiple initializations
        adaptiveAI.current = AdaptiveAI.getInstance();

        // Wait a bit for the AI to initialize
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify the AI is working properly
        if (adaptiveAI.current) {
          try {
            // Test if the AI can perform basic operations
            const status = adaptiveAI.current.getStatus();
            console.log('🧠 AI initialization status:', status);
          } catch (statusError) {
            console.warn('⚠️ AI status check failed, but continuing:', statusError);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize AdaptiveAI:', error);
        // Don't crash the app, just set loading to false
        setIsLoading(false);

        // Try to create a fallback instance
        try {
          adaptiveAI.current = new AdaptiveAI();
          console.log('🧠 Created fallback AI instance');
        } catch (fallbackError) {
          console.error('Failed to create fallback AI instance:', fallbackError);
          adaptiveAI.current = null;
        }
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
