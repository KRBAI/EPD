import React from 'react';
import { Bluetooth } from 'lucide-react';

interface Esp32StatusBadgeProps {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

export const Esp32StatusBadge: React.FC<Esp32StatusBadgeProps> = ({
  className = '',
  compact = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-900/90 hover:bg-slate-800/90 border border-sky-500/40 text-[10px] sm:text-xs text-sky-400 font-semibold select-none cursor-pointer transition active:scale-95 ${className}`}
      title="Click to view ESP32-S3 Bluetooth Keyboard Setup & Live Keystroke Tester"
      aria-label="ESP32 Keyboard Setup and Status"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
      </span>
      <Bluetooth className="w-3 h-3 text-sky-400" />
      <span className="hidden sm:inline">ESP32 Ready</span>
    </button>
  );
};
