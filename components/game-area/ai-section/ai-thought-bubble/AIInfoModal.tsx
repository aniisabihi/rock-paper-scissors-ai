'use client';

import type { FC } from 'react';
import type { AdaptiveAI } from '@/lib/game/adaptive-ai';

interface AIInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  adaptiveAI: AdaptiveAI | null;
}

const AIInfoModal: FC<AIInfoModalProps> = ({ isOpen, onClose, adaptiveAI }) => {
  if (!isOpen || !adaptiveAI) return null;

  // Safety checks to ensure all required methods exist
  if (
    !adaptiveAI.getStatus ||
    !adaptiveAI.getPerformanceMetrics ||
    !adaptiveAI.getLearningInsights ||
    !adaptiveAI.getPredictionInsights
  ) {
    console.error('AdaptiveAI methods not available:', adaptiveAI);
    return null;
  }

  let status, metrics, insights, predictionInsights;

  try {
    status = adaptiveAI.getStatus();
    metrics = adaptiveAI.getPerformanceMetrics();
    insights = adaptiveAI.getLearningInsights();
    predictionInsights = adaptiveAI.getPredictionInsights();

    // Additional safety checks for returned data
    if (!status || !metrics || !insights || !predictionInsights) {
      console.error('Invalid data returned from AdaptiveAI methods');
      return null;
    }
  } catch (error) {
    console.error('Error in AIInfoModal:', error);
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center">
        <div className="bg-dark-800/90 backdrop-blur-md rounded-xl p-6 border border-red-500/30 max-w-md mx-4">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Error Loading AI Information</h3>
          <p className="text-white/80 text-center mb-4">
            There was an error loading the AI information. Please try again.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (status.mode) {
      case 'Neural Network':
        return 'bg-emerald-600/80 text-emerald-100';
      case 'Enhanced Pattern':
        return 'bg-blue-600/80 text-blue-100';
      case 'Basic Pattern':
        return 'bg-amber-600/80 text-amber-100';
      case 'Limited':
      default:
        return 'bg-yellow-600/80 text-yellow-100';
    }
  };

  const getModeIcon = () => {
    switch (status.mode) {
      case 'Neural Network':
        return '🧠';
      case 'Enhanced Pattern':
        return '🔍';
      case 'Basic Pattern':
        return '📊';
      case 'Limited':
      default:
        return '🤖';
    }
  };

  const getNeuralNetworkIcon = () => {
    switch (metrics.neuralNetworkStatus) {
      case 'Ready':
        return '🟢';
      case 'Training':
        return '🟡';
      case 'Unavailable':
        return '🔴';
      default:
        return '🔴';
    }
  };

  return (
    <>
      {/* Dimmed Background Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" onClick={onClose} />

      {/* AI Info Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
        <div className="w-full max-w-[700px] max-h-[90vh] bg-dark-800/90 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-accent-400/30 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 pointer-events-auto relative overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-accent-500/20 hover:bg-accent-500/30 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            aria-label="Close modal"
          >
            <span className="text-lg font-bold">×</span>
          </button>

          <div className="space-y-6 text-left">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Adaptive AI Status</h2>
              <div className="flex items-center justify-center gap-3">
                <span className={`px-4 py-2 rounded-full font-medium text-sm ${getStatusColor()}`}>
                  {getModeIcon()} {status.status}
                </span>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-accent-900/30 rounded-lg p-4 border border-accent-800/50">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Performance Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-300">{metrics.gamesPlayed}</div>
                  <div className="text-xs text-accent-200/80">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-300">{Math.round(metrics.winRate * 100)}%</div>
                  <div className="text-xs text-accent-200/80">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-300">
                    {Math.round(metrics.predictionAccuracy * 100)}%
                  </div>
                  <div className="text-xs text-accent-200/80">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-300">
                    {Math.round(metrics.learningProgress * 100)}%
                  </div>
                  <div className="text-xs text-accent-200/80">Learning</div>
                </div>
              </div>

              {/* Neural Network Status */}
              <div className="mt-4 pt-4 border-t border-accent-800/50 flex items-center justify-center gap-3">
                <span className="text-accent-300/90 font-medium">Neural Network:</span>
                <span className="flex items-center gap-2">
                  {getNeuralNetworkIcon()}
                  <span className="text-white/90 font-medium">{metrics.neuralNetworkStatus}</span>
                </span>
              </div>
            </div>

            {/* Capabilities */}
            {status.capabilities.length > 0 && (
              <div className="bg-accent-900/20 rounded-lg p-4 border border-accent-800/30">
                <h3 className="text-lg font-bold text-white mb-3 text-center">AI Capabilities</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {status.capabilities.map((capability, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 rounded-md bg-accent-800/40 text-accent-200/90 text-sm font-medium"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Insights */}
            <div className="bg-accent-900/20 rounded-lg p-4 border border-accent-800/30">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Learning Insights</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Player Patterns */}
                <div>
                  <div className="text-accent-300/90 font-medium mb-2">Player Patterns:</div>
                  {insights.playerPatterns.map((pattern, index) => (
                    <div key={index} className="text-sm text-white/80 mb-2 pl-3 border-l-2 border-accent-600/50">
                      • {pattern}
                    </div>
                  ))}
                </div>

                {/* Adaptation Strategies */}
                <div>
                  <div className="text-accent-300/90 font-medium mb-2">Adaptation:</div>
                  {insights.adaptationStrategies.map((strategy, index) => (
                    <div key={index} className="text-sm text-white/80 mb-2 pl-3 border-l-2 border-accent-600/50">
                      • {strategy}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Learning Focus */}
                <div>
                  <div className="text-accent-300/90 font-medium mb-2">Focus Areas:</div>
                  {insights.learningFocus.map((focus, index) => (
                    <div key={index} className="text-sm text-white/80 mb-2 pl-3 border-l-2 border-accent-600/50">
                      • {focus}
                    </div>
                  ))}
                </div>

                {/* Recent Improvements */}
                <div>
                  <div className="text-accent-300/90 font-medium mb-2">Improvements:</div>
                  {insights.recentImprovements.map((improvement, index) => (
                    <div key={index} className="text-sm text-white/80 mb-2 pl-3 border-l-2 border-accent-600/50">
                      • {improvement}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Prediction */}
            <div className="bg-accent-900/40 rounded-lg p-4 border border-accent-800/60">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Current Prediction</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Next Move */}
                <div className="text-center">
                  <div className="text-accent-300/90 font-medium mb-2">Next Move:</div>
                  <div className="text-white/90 font-medium text-lg">{predictionInsights.nextMovePrediction}</div>
                </div>

                {/* Confidence */}
                <div className="text-center">
                  <div className="text-accent-300/90 font-medium mb-2">Confidence:</div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-24 bg-accent-800/50 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-accent-400 to-accent-300 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(predictionInsights.currentConfidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-white/90 font-medium">
                      {Math.round(predictionInsights.currentConfidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence Trend */}
              <div className="mt-4 text-center">
                <div className="text-accent-300/90 font-medium mb-2">Confidence Trend:</div>
                <div className="flex items-center justify-center gap-2">
                  {predictionInsights.confidenceTrend === 'Increasing' && '📈'}
                  {predictionInsights.confidenceTrend === 'Stable' && '➡️'}
                  {predictionInsights.confidenceTrend === 'Decreasing' && '📉'}
                  <span className="text-white/90 font-medium">{predictionInsights.confidenceTrend}</span>
                </div>
              </div>

              {/* Prediction Reasoning */}
              <div className="mt-4">
                <div className="text-accent-300/90 font-medium mb-2 text-center">Reasoning:</div>
                <div className="space-y-2">
                  {predictionInsights.predictionReasoning.map((reason, index) => (
                    <div key={index} className="text-sm text-white/80 text-center pl-3 border-l-2 border-accent-600/50">
                      • {reason}
                    </div>
                  ))}
                </div>
              </div>

              {/* Uncertainty Factors */}
              {predictionInsights.uncertaintyFactors.length > 0 && (
                <div className="mt-4">
                  <div className="text-accent-300/90 font-medium mb-2 text-center">Uncertainty Factors:</div>
                  <div className="space-y-2">
                    {predictionInsights.uncertaintyFactors.map((factor, index) => (
                      <div
                        key={index}
                        className="text-sm text-yellow-200/80 text-center pl-3 border-l-2 border-yellow-600/50"
                      >
                        • {factor}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Details */}
            {status.details.length > 0 && (
              <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/30">
                <h3 className="text-lg font-bold text-white mb-3 text-center">Status Details</h3>
                <div className="space-y-2">
                  {status.details.map((detail, index) => (
                    <div
                      key={index}
                      className="text-sm text-yellow-200/80 text-center pl-3 border-l-2 border-yellow-600/50"
                    >
                      • {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AIInfoModal;
