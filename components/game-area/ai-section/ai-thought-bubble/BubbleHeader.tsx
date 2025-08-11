'use client';

import type { FC } from 'react';
import type { AIConfidence, AdaptiveAI } from '@/lib/game/adaptive-ai';

interface BubbleHeaderProps {
  prediction: AIConfidence;
  adaptiveAI: AdaptiveAI | null;
  onOpenInfoModal: () => void;
}

const BubbleHeader: FC<BubbleHeaderProps> = ({ prediction, adaptiveAI, onOpenInfoModal }) => {
  const formatPercentage = (value: number): number => Math.round(value * 100);

  // Get confidence from the same source as the main status badge
  const getConfidenceValue = (): number => {
    if (!adaptiveAI) return prediction.confidence;

    try {
      const status = adaptiveAI.getStatus();
      return status.confidence;
    } catch (error) {
      console.error('Error getting AI status:', error);
      return prediction.confidence; // Fallback to prediction confidence
    }
  };

  const confidence = getConfidenceValue();

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.7) return 'text-green-300';
    if (confidence > 0.4) return 'text-yellow-300';
    return 'text-red-300';
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence > 0.7) return 'Very Confident';
    if (confidence > 0.4) return 'Moderately Confident';
    return 'Low Confidence';
  };

  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-accent-300/30 relative">
      <div className="flex-1">
        <h3 className="font-bold text-sm bg-gradient-to-r from-accent-200 to-accent-300 bg-clip-text text-transparent">
          AI Neural Network
        </h3>
        <p className={`text-xs font-semibold ${getConfidenceColor(confidence)}`}>
          {getConfidenceText(confidence)} • {formatPercentage(confidence)}%
        </p>
      </div>

      {/* Info Icon */}
      <button
        onClick={onOpenInfoModal}
        className="w-6 h-6 bg-accent-500/20 hover:bg-accent-500/30 rounded-full flex items-center justify-center text-accent-300 transition-all duration-200 hover:scale-110 hover:text-accent-200"
        aria-label="AI Information"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default BubbleHeader;
