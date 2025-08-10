'use client';

import { createContext, useContext, useRef, useEffect, useState, type ReactNode } from 'react';
import { AdaptiveAI } from '@/lib/game/adaptive-ai';

interface AdaptiveAIContextType {
  adaptiveAI: AdaptiveAI | null;
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    adaptiveAI.current = new AdaptiveAI();
  }, []);

  // Provide a default value during SSR and initial render
  const contextValue = {
    adaptiveAI: isClient ? adaptiveAI.current : null,
  };

  return <AdaptiveAIContext.Provider value={contextValue}>{children}</AdaptiveAIContext.Provider>;
};
