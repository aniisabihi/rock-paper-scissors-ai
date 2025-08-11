'use client';

import type { FC } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed Background Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" onClick={onClose} />

      {/* Info Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
        <div className="w-full max-w-[600px] bg-dark-800/90 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-accent-400/30 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 pointer-events-auto relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-accent-500/20 hover:bg-accent-500/30 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            aria-label="Close modal"
          >
            <span className="text-lg font-bold">×</span>
          </button>

          <div className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">How to Play</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Choose Rock, Paper, or Scissors to play against the AI. Rock crushes Scissors, Scissors cuts Paper,
                  and Paper covers Rock. The AI will adapt its strategy based on your difficulty choice.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">AI Difficulties</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🎲</span>
                    <div>
                      <span className="font-semibold text-white">Easy Mode:</span>
                      <span className="text-white/90 text-sm block">Random choices</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🧩</span>
                    <div>
                      <span className="font-semibold text-white">Medium Mode:</span>
                      <span className="text-white/90 text-sm block">Pattern recognition - learns from your moves</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🧠</span>
                    <div>
                      <span className="font-semibold text-white">Hard Mode:</span>
                      <span className="text-white/90 text-sm block">
                        Adaptive neural network - constantly evolves its strategy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">AI Learning</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                The AI analyzes your playing patterns and adapts its strategy in real-time. In Hard mode, it uses a
                neural network that continuously learns and improves, making each game more challenging than the last!
              </p>
              <p className="text-white/90 text-sm mt-2 leading-relaxed">
                In hard mode, click the info icon in the AI thought bubble for detailed insights on how the AI is
                learning from your moves.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoModal;
