import React from 'react';
import { ThemeMode } from '../types';

interface BrailleCellProps {
  activeDots: number[];
  targetDots?: number[];
  errorDots?: number[];
  theme: ThemeMode;
  onDotClick?: (dotNumber: number) => void;
  interactive?: boolean;
  label?: string;
  size?: 'auto' | 'compact' | 'normal' | 'large';
}

export const BrailleCell: React.FC<BrailleCellProps> = ({
  activeDots,
  targetDots,
  errorDots,
  theme,
  onDotClick,
  interactive = false,
  label = '6-Dot Braille Cell',
  size = 'auto',
}) => {
  // Dot layout:
  // Col 1 (Left Hand): Dot 1, 2, 3
  // Col 2 (Right Hand): Dot 4, 5, 6
  const dotsLayout = [
    { num: 1, col: 1, row: 1, finger: 'Left Index' },
    { num: 2, col: 1, row: 2, finger: 'Left Middle' },
    { num: 3, col: 1, row: 3, finger: 'Left Ring' },
    { num: 4, col: 2, row: 1, finger: 'Right Index' },
    { num: 5, col: 2, row: 2, finger: 'Right Middle' },
    { num: 6, col: 2, row: 3, finger: 'Right Ring' },
  ];

  // Fluid responsive sizing that scales smoothly across small phones, tablets, and laptops
  const dotSizeClass =
    size === 'compact'
      ? 'w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base'
      : size === 'large'
      ? 'w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 text-xl sm:text-2xl'
      : 'w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-18 lg:h-18 text-base sm:text-xl';

  const gapClass =
    size === 'compact'
      ? 'gap-x-5 gap-y-2.5'
      : 'gap-x-6 xs:gap-x-8 sm:gap-x-10 gap-y-3 xs:gap-y-3.5 sm:gap-y-4';

  const getDotStyles = (num: number) => {
    const isTarget = targetDots ? targetDots.includes(num) : activeDots.includes(num);
    const isError = errorDots ? errorDots.includes(num) : false;
    const hasErrorState = errorDots && errorDots.length > 0;

    // Error visual diagnosis:
    // If error state active and this dot was pressed erroneously (not in target)
    if (hasErrorState && isError && !isTarget) {
      return 'bg-rose-600 text-white border-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.9)] scale-[1.04] ring-2 ring-rose-400/50';
    }

    // If this dot was pressed AND it was a target dot (correct part of chord)
    if (hasErrorState && isError && isTarget) {
      return 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-[1.04]';
    }

    // If this dot is a target dot that was missed in error
    if (hasErrorState && !isError && isTarget) {
      return 'bg-amber-500/30 text-amber-300 border-2 border-dashed border-amber-400 animate-pulse';
    }

    // Normal active target dot
    if (isTarget) {
      if (theme === 'yellow-black') {
        return 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_24px_rgba(250,204,21,0.9)] scale-[1.03]';
      }
      if (theme === 'light') {
        return 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.65)] scale-[1.03]';
      }
      return 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.75)] scale-[1.03]';
    }

    // Inactive dot
    if (theme === 'yellow-black') {
      return 'bg-black text-yellow-600/40 border-yellow-800/80 hover:border-yellow-600';
    }
    if (theme === 'light') {
      return 'bg-slate-100 text-slate-400 border-slate-300 hover:border-slate-400';
    }
    return 'bg-slate-900/90 text-slate-500 border-slate-700/80 hover:border-slate-500';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between w-full mb-1.5 px-1 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-slate-400">
        <span className="truncate">Left: 1-3</span>
        <span className="font-bold text-slate-200 px-1 truncate">{label}</span>
        <span className="truncate">Right: 4-6</span>
      </div>

      <div
        className={`grid grid-cols-2 p-3 xs:p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-200 ${
          theme === 'yellow-black'
            ? 'bg-black border-yellow-500 shadow-xl'
            : theme === 'light'
            ? 'bg-white border-slate-300 shadow-md'
            : 'bg-slate-950/85 border-slate-800 shadow-lg'
        } ${gapClass}`}
        role="group"
        aria-label="Braille 6-dot cell diagram"
      >
        {dotsLayout.map(({ num, col, row, finger }) => {
          const isTarget = targetDots ? targetDots.includes(num) : activeDots.includes(num);
          const isError = errorDots ? errorDots.includes(num) : false;
          const isLit = isTarget || isError;

          return (
            <button
              key={num}
              type="button"
              disabled={!interactive}
              onClick={() => onDotClick && onDotClick(num)}
              style={{ gridColumn: col, gridRow: row }}
              aria-label={`Dot ${num}, ${finger}, ${isLit ? 'Active' : 'Empty'}`}
              className={`relative rounded-full flex flex-col items-center justify-center font-black border-2 sm:border-3 transition-all duration-200 select-none ${dotSizeClass} ${getDotStyles(
                num
              )} ${interactive ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
            >
              {/* Tactile dome highlight */}
              {isLit && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 left-1.5 sm:top-1.5 sm:left-2 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-white/60 blur-[0.5px] pointer-events-none"
                />
              )}

              {/* Dot Number */}
              <span className="relative z-10 leading-none">{num}</span>

              {/* Minimal finger hint */}
              <span
                aria-hidden="true"
                className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-tight opacity-80 leading-none mt-0.5 ${
                  isLit ? 'text-black font-extrabold' : 'text-slate-500'
                }`}
              >
                {finger.split(' ')[1]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
