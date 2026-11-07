import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  wordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', wordmark = false }) => {
  const sizeClass =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      <span
        className={`relative ${sizeClass} aspect-square rounded-[9px] overflow-hidden border border-white/[0.1] bg-[#0c1017] block`}
        aria-hidden={wordmark ? true : undefined}
        role={wordmark ? undefined : 'img'}
        aria-label={wordmark ? undefined : 'NAR'}
      >
        {/* Official NAR Logo SVG (from /public/logo.svg) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="none"
          className="w-full h-full block"
          aria-hidden="true"
        >
          <rect width="512" height="512" rx="118" fill="#0c1017" />

          <radialGradient id="narLogoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#315cff" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#00c29a" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0c1017" stopOpacity="0" />
          </radialGradient>
          <rect width="512" height="512" rx="118" fill="url(#narLogoGlow)" />

          <defs>
            <linearGradient
              id="narDiagonalPath"
              x1="162"
              y1="180"
              x2="350"
              y2="352"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#2d62ff" />
              <stop offset="48%" stopColor="#1ea2dc" />
              <stop offset="100%" stopColor="#00be98" />
            </linearGradient>
          </defs>

          {/* Left Vertical Stem */}
          <line
            x1="162"
            y1="346"
            x2="162"
            y2="182"
            stroke="#2563eb"
            strokeWidth="44"
            strokeLinecap="round"
          />
          <circle cx="162" cy="354" r="28" fill="#2563eb" />
          <circle cx="162" cy="180" r="23" fill="#2563eb" />

          {/* Right Vertical Stem */}
          <line
            x1="350"
            y1="350"
            x2="350"
            y2="166"
            stroke="#00c29a"
            strokeWidth="44"
            strokeLinecap="round"
          />
          <circle cx="350" cy="350" r="22" fill="#00c29a" />
          <circle cx="350" cy="166" r="29" fill="#00c29a" />
          <circle cx="350" cy="166" r="12" fill="#ffffff" />

          {/* Diagonal Transit Route Bridge */}
          <line
            x1="162"
            y1="180"
            x2="350"
            y2="350"
            stroke="url(#narDiagonalPath)"
            strokeWidth="44"
            strokeLinecap="round"
          />

          {/* Center Waypoint Node */}
          <circle
            cx="256"
            cy="265"
            r="26"
            stroke="#ffffff"
            strokeWidth="3"
            strokeOpacity="0.45"
            fill="none"
          />
          <circle cx="256" cy="265" r="13" fill="#ffffff" />
        </svg>
      </span>
      {wordmark ? (
        <span className="text-[20px] leading-none font-medium tracking-[-0.02em] text-fg">NAR</span>
      ) : null}
    </span>
  );
};
