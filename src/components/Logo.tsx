import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-xl', sub: 'text-[11px]' },
    xl: { icon: 'w-16 h-16', text: 'text-2xl', sub: 'text-xs' },
  };

  const { icon, text, sub } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official NAR Kinetic Logo Mark */}
      <div className={`relative ${icon} shrink-0 aspect-square rounded-2xl overflow-hidden shadow-lg shadow-blue-600/20 ring-1 ring-white/10`}>
        <img 
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="NAR Logo" 
          className="w-full h-full object-cover" 
          width={512}
          height={512}
          loading="eager"
        />
      </div>

      {showWordmark && (
        <div className="flex flex-col text-left leading-none">
          <span className={`font-display font-black ${text} tracking-tight text-white flex items-center gap-1`}>
            NAR <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#315cff]/15 text-[#9cb3ff] border border-[#315cff]/30">SV</span>
          </span>
          <span className={`font-mono uppercase ${sub} tracking-widest text-slate-400 font-semibold mt-1`}>
            Viajes Compartidos
          </span>
        </div>
      )}
    </div>
  );
};
