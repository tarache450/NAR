import React from 'react';
import { CircleUserRound, PlusCircle, Route, Search } from 'lucide-react';
import { Logo } from './Logo';
import { TabType } from './BottomNav';

interface NavbarProps {
  activeView: TabType;
  onViewChange: (view: TabType) => void;
  onOpenPublish: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  onOpenPublish,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0c1017]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Platform Name with Official N Mark */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onViewChange('explore')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <Logo size="md" showWordmark={true} />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => onViewChange('explore')}
                aria-current={activeView === 'explore' ? 'page' : undefined}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeView === 'explore'
                    ? 'text-[#c4cfff] bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Explorar Rutas
              </button>

              <button
                onClick={() => onViewChange('search')}
                aria-current={activeView === 'search' ? 'page' : undefined}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeView === 'search'
                    ? 'text-[#c4cfff] bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Buscador
              </button>
              
              <button
                onClick={() => onViewChange('telemetry')}
                aria-current={activeView === 'telemetry' ? 'page' : undefined}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeView === 'telemetry'
                    ? 'text-[#c4cfff] bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Route className="w-3.5 h-3.5 text-[#9cb3ff]" />
                Recorrido
              </button>

            </nav>
          </div>

          {/* Right User & CTA Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Quick Publish Button */}
            <button
              onClick={onOpenPublish}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#315cff] to-[#00a89d] hover:from-[#4d77ff] hover:to-[#22c4b7] rounded-xl shadow-lg shadow-[#315cff]/20 flex items-center gap-2 transition-all transform active:scale-[.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Ofrecer Asiento</span>
              <span className="xs:hidden sm:hidden">Publicar</span>
            </button>

            {/* User Profile with DUI Verified Badge */}
            <button
              type="button"
              onClick={() => onViewChange('profile')}
              aria-label="Abrir perfil de demostración"
              className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-[#b8c6ff]"><CircleUserRound size={20}/></span>
            </button>

          </div>
        </div>
      </div>

    </header>
  );
};
