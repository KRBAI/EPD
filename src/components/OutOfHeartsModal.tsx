import React from 'react';
import { Heart, Sparkles, Infinity, RotateCcw } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface OutOfHeartsModalProps {
  isOpen: boolean;
  onRefillHearts: () => void;
  onEnableInfiniteHearts: () => void;
}

export const OutOfHeartsModal: React.FC<OutOfHeartsModalProps> = ({
  isOpen,
  onRefillHearts,
  onEnableInfiniteHearts,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hearts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(244,63,94,0.35)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Heart icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center text-rose-400 mb-4 shadow-lg animate-pulse">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>

        <h2 id="hearts-title" className="text-2xl font-black text-white mb-2">
          Need More Hearts?
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          Learning Braille takes practice! You can refill your hearts to keep going, or switch to Infinite Hearts so you can learn at your own pace without pressure.
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={() => {
              sound.playSuccessTone();
              onEnableInfiniteHearts();
            }}
            autoFocus
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
          >
            <Infinity className="w-4 h-4" />
            <span>Turn On Infinite Hearts (Recommended)</span>
          </button>

          <button
            onClick={() => {
              sound.playGemXpSound();
              onRefillHearts();
            }}
            className="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Refill 5 Hearts & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
