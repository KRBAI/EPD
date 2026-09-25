import React from 'react';
import { ThemeMode } from '../types';

interface PerkinsKeyboardGuideProps {
  activeDots: number[];
  theme: ThemeMode;
  minimal?: boolean;
}

export const PerkinsKeyboardGuide: React.FC<PerkinsKeyboardGuideProps> = ({
  activeDots,
  theme,
  minimal = false,
}) => {
  const keys = [
    { dot: 3, label: 'Dot 3', hand: 'L', finger: 'Ring', keyChar: 'S' },
    { dot: 2, label: 'Dot 2', hand: 'L', finger: 'Mid', keyChar: 'D' },
    { dot: 1, label: 'Dot 1', hand: 'L', finger: 'Idx', keyChar: 'F' },
    { dot: 0, label: 'Space', hand: 'Thumb', finger: 'Spc', keyChar: 'SPC' },
    { dot: 4, label: 'Dot 4', hand: 'R', finger: 'Idx', keyChar: 'J' },
    { dot: 5, label: 'Dot 5', hand: 'R', finger: 'Mid', keyChar: 'K' },
    { dot: 6, label: 'Dot 6', hand: 'R', finger: 'Ring', keyChar: 'L' },
  ];

  return (
    <div
      className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border ${
        theme === 'yellow-black'
          ? 'bg-black border-yellow-800'
          : theme === 'light'
          ? 'bg-slate-50 border-slate-200'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 mb-1.5 px-0.5">
        <span className="font-semibold text-slate-300">ESP32 / Perkins Chords</span>
        <span className="opacity-75">3 · 2 · 1 | Space | 4 · 5 · 6</span>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 items-end">
        {keys.map((k) => {
          const isSpace = k.dot === 0;
          const isActive = !isSpace && activeDots.includes(k.dot);

          let bgClass = 'bg-slate-800/80 border-slate-700/80 text-slate-400';
          if (isSpace) {
            bgClass = 'bg-slate-800/40 border-slate-700/50 text-slate-500';
          } else if (isActive) {
            bgClass =
              theme === 'yellow-black'
                ? 'bg-yellow-400 border-yellow-300 text-black shadow-md shadow-yellow-500/40 font-bold scale-[1.02]'
                : 'bg-gradient-to-t from-amber-500 to-amber-400 border-amber-300 text-slate-950 shadow-md shadow-amber-500/40 font-bold scale-[1.02]';
          }

          return (
            <div
              key={k.label}
              className={`flex flex-col items-center justify-between p-1 rounded-lg sm:rounded-xl border transition-all ${
                isSpace ? 'h-9 sm:h-11' : 'h-13 sm:h-16'
              } ${bgClass}`}
            >
              <div className="text-[7px] sm:text-[8px] uppercase tracking-tight text-center leading-none">
                <span className="block font-bold">{k.finger}</span>
              </div>

              <div className="text-center my-0.5">
                {isSpace ? (
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">SPC</span>
                ) : (
                  <span className="text-xs sm:text-sm font-extrabold">{k.dot}</span>
                )}
              </div>

              <div
                className={`text-[7px] px-1 py-0.2 rounded font-mono ${
                  isActive
                    ? 'bg-black/20 text-black font-bold'
                    : 'bg-slate-700/50 text-slate-400'
                }`}
              >
                {k.keyChar}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
