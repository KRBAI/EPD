import React, { useEffect } from 'react';
import { Award, Star, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { LessonLevel } from '../types';

interface LevelCompleteModalProps {
  isOpen: boolean;
  level: LessonLevel;
  earnedXp: number;
  stars: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onClose: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  level,
  earnedXp,
  stars,
  hasNextLevel,
  onNextLevel,
  onReplayLevel,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Big Trophy / Emoji Badge */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-lg mb-4 animate-bounce">
          {level.badgeEmoji}
        </div>

        <div className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-1 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" />
          Lesson Mastered!
        </div>

        <h2 id="victory-title" className="text-2xl sm:text-3xl font-black text-white mb-1">
          Level {level.id}: {level.title}
        </h2>
        <p className="text-xs text-slate-300 mb-6">{level.subtitle}</p>

        {/* Stars Celebration */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2 rounded-2xl border-2 transition-all ${
                starIdx <= stars
                  ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110'
                  : 'bg-slate-800/40 border-slate-700 text-slate-600'
              }`}
            >
              <Star
                className={`w-7 h-7 ${starIdx <= stars ? 'fill-amber-400' : ''}`}
              />
            </div>
          ))}
        </div>

        {/* XP & Rewards Pill */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">XP Gained</div>
            <div className="text-xl font-extrabold text-amber-400">+{earnedXp} XP</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
            <div className="text-xl font-extrabold text-emerald-400">100%</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-3">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              autoFocus
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
            >
              <span>Continue to Next Level</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              autoFocus
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
            >
              <span>Champion of BraillePad!</span>
            </button>
          )}

          <button
            onClick={onReplayLevel}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Level Again</span>
          </button>
        </div>

        <div className="mt-4 text-[11px] text-slate-400">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> to continue
        </div>
      </div>
    </div>
  );
};
