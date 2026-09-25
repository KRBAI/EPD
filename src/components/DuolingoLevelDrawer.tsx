import React from 'react';
import { X, Lock, CheckCircle2, Star, BookOpen, Unlock } from 'lucide-react';
import { LessonLevel, UserStats } from '../types';
import { LESSON_LEVELS } from '../data/lessons';

interface DuolingoLevelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevelId: number;
  userStats: UserStats;
  onSelectLevel: (level: LessonLevel) => void;
  onUnlockAllLevels: () => void;
}

export const DuolingoLevelDrawer: React.FC<DuolingoLevelDrawerProps> = ({
  isOpen,
  onClose,
  currentLevelId,
  userStats,
  onSelectLevel,
  onUnlockAllLevels,
}) => {
  if (!isOpen) return null;

  // Group levels by units
  const units = [
    { id: 1, title: 'Unit 1: The First Decade', subtitle: 'Upper 4 dots foundation (A - J)' },
    { id: 2, title: 'Unit 2: Adding Dot 3', subtitle: 'Second Decade progression (K - T)' },
    { id: 3, title: 'Unit 3: The Complete Cell & Words', subtitle: 'Full alphabet (U - Z) and first words' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <h2 id="drawer-title" className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Learning Path (Duolingo Style)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Progress step-by-step from single dots to full Braille words
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close learning path"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Bar in Drawer */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              ⭐ {Object.values(userStats.starsPerLevel).reduce((a, b) => a + b, 0)} Stars
            </span>
            <span className="text-sky-400 font-bold flex items-center gap-1">
              💎 {userStats.xp} XP
            </span>
          </div>

          <button
            onClick={onUnlockAllLevels}
            className="text-[11px] font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
            title="Parent/Teacher shortcut to unlock all levels"
          >
            <Unlock className="w-3.5 h-3.5" />
            Unlock All
          </button>
        </div>

        {/* Scrollable Unit Journey */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {units.map((unit) => {
            const unitLevels = LESSON_LEVELS.filter((lvl) => lvl.unit === unit.id);

            return (
              <div key={unit.id} className="space-y-3">
                {/* Unit Header Banner */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/80 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {unit.title}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{unit.subtitle}</div>
                </div>

                {/* Level Nodes */}
                <div className="space-y-2.5 pl-2">
                  {unitLevels.map((lvl) => {
                    const isUnlocked =
                      lvl.unlockedByDefault ||
                      userStats.completedLevels.includes(lvl.id) ||
                      userStats.completedLevels.includes(lvl.id - 1);
                    const isCompleted = userStats.completedLevels.includes(lvl.id);
                    const isCurrent = currentLevelId === lvl.id;
                    const stars = userStats.starsPerLevel[lvl.id] || 0;

                    return (
                      <div
                        key={lvl.id}
                        onClick={() => {
                          if (isUnlocked) {
                            onSelectLevel(lvl);
                            onClose();
                          }
                        }}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                          !isUnlocked
                            ? 'opacity-50 bg-slate-950/40 border-slate-800/60 cursor-not-allowed'
                            : isCurrent
                            ? 'bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/20 cursor-pointer scale-[1.01]'
                            : isCompleted
                            ? 'bg-emerald-950/20 border-emerald-600/40 hover:border-emerald-500 cursor-pointer'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Badge Circle */}
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold shadow-inner ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                                : isCompleted
                                ? 'bg-emerald-500 text-slate-950'
                                : isUnlocked
                                ? 'bg-slate-800 text-slate-200'
                                : 'bg-slate-900 text-slate-600'
                            }`}
                          >
                            {!isUnlocked ? (
                              <Lock className="w-4 h-4 text-slate-500" />
                            ) : (
                              lvl.badgeEmoji
                            )}
                          </div>

                          {/* Level Details */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                Level {lvl.id}: {lvl.title}
                              </span>
                              {isCompleted && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {lvl.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Stars or Status */}
                        <div className="flex flex-col items-end gap-1">
                          {isUnlocked ? (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`w-3.5 h-3.5 ${
                                    starIdx <= stars
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Locked
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400">
                            {lvl.totalSteps} steps
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-center text-xs text-slate-400">
          Typing Braille chords automatically advances through levels!
        </div>
      </div>
    </div>
  );
};
