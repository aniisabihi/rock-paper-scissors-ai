'use client';

import type { FC } from 'react';
import type { AIConfidence } from '@/lib/game/adaptive-ai';

interface BubbleHeaderProps {
  prediction: AIConfidence;
}

const BubbleHeader: FC<BubbleHeaderProps> = ({ prediction }) => {
  const formatPercentage = (value: number): number => Math.round(value * 100);

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
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-300/30">
      <div className="text-xl p-1.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-400/30">
        🧠
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
          AI Neural Network
        </h3>
        <p className={`text-xs font-semibold ${getConfidenceColor(prediction.confidence)}`}>
          {getConfidenceText(prediction.confidence)} • {formatPercentage(prediction.confidence)}%
        </p>
      </div>
    </div>
  );
};

export default BubbleHeader;
