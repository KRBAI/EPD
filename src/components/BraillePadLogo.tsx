import React from 'react';

interface BraillePadLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BraillePadLogo: React.FC<BraillePadLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 36 : 28;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom Vector BraillePad Icon: Tactile 6-dot matrix inside pad frame */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="padBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="dotAmber" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fef08a" />
            <stop offset="0.6" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>
          <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Rounded Tablet/Pad Enclosure */}
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="10"
          fill="url(#padBg)"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Subtle Screen Bezel */}
        <rect
          x="5"
          y="5"
          width="30"
          height="30"
          rx="7"
          fill="#060913"
          stroke="#1e293b"
          strokeWidth="1"
        />

        {/* 6-Dot Braille Matrix spelling 'B' (Dots 1 and 2 lit, tactile glow) */}
        {/* Dot 1 (Left Col, Row 1) - ACTIVE */}
        <circle cx="15" cy="13" r="3.2" fill="url(#dotAmber)" filter="url(#amberGlow)" />
        <circle cx="14" cy="12" r="1" fill="#ffffff" opacity="0.7" />

        {/* Dot 2 (Left Col, Row 2) - ACTIVE */}
        <circle cx="15" cy="20" r="3.2" fill="url(#dotAmber)" filter="url(#amberGlow)" />
        <circle cx="14" cy="19" r="1" fill="#ffffff" opacity="0.7" />

        {/* Dot 3 (Left Col, Row 3) - INACTIVE */}
        <circle cx="15" cy="27" r="2.8" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />

        {/* Dot 4 (Right Col, Row 1) - INACTIVE */}
        <circle cx="25" cy="13" r="2.8" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />

        {/* Dot 5 (Right Col, Row 2) - INACTIVE */}
        <circle cx="25" cy="20" r="2.8" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />

        {/* Dot 6 (Right Col, Row 3) - INACTIVE */}
        <circle cx="25" cy="27" r="2.8" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      </svg>

      {/* Typography with Braille Dot Accent */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center text-white tracking-tight font-extrabold text-sm sm:text-base">
            <span>Braille</span>
            <span className="text-amber-400 ml-0.5">Pad</span>
          </div>
          <span className="text-[9px] font-medium tracking-wider uppercase text-slate-400 hidden sm:inline">
            Tactile Tutor
          </span>
        </div>
      )}
    </div>
  );
};
