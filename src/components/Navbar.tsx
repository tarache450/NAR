import React from 'react';
import { 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Radio, 
  Smartphone, 
  Monitor,
} from 'lucide-react';
import { Logo } from './Logo';
import { TabType } from './BottomNav';

interface NavbarProps {
  mode: 'request' | 'offer';
  onModeChange: (mode: 'request' | 'offer') => void;
  activeView: TabType;
  onViewChange: (view: TabType) => void;
  onOpenPublish: () => void;
  isMobileMockup: boolean;
  onToggleMockup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onModeChange,
  activeView,
  onViewChange,
  onOpenPublish,
  isMobileMockup,
  onToggleMockup,
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
            <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => onViewChange('explore')}
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
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeView === 'telemetry'
                    ? 'text-[#c4cfff] bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-[#9cb3ff] animate-pulse" />
                Ruta en Vivo
              </button>

              <button
                onClick={() => onViewChange('profile')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeView === 'profile'
                    ? 'text-emerald-300 bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Confianza & Perfil
              </button>
            </nav>
          </div>

          {/* Center Mode Switcher: "Buscar Asiento" vs "Publicar Asiento" (Ref 1 Style) */}
          <div className="hidden sm:flex items-center p-1 rounded-2xl bg-[#151924] border border-white/10 shadow-inner">
            <button
              onClick={() => onModeChange('request')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'request'
                  ? 'bg-gradient-to-r from-[#2563eb] to-[#1ea2dc] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar Asiento</span>
            </button>

            <button
              onClick={() => {
                onModeChange('offer');
                onOpenPublish();
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'offer'
                  ? 'bg-gradient-to-r from-[#315cff] to-[#00a89d] text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Publicar Asiento</span>
            </button>
          </div>

          {/* Right User & CTA Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 pr-12 lg:pr-0">
            
            {/* View Mode Toggle: Simulator vs Desktop */}
            <button
              onClick={onToggleMockup}
              title={isMobileMockup ? "Ver en modo pantalla completa" : "Simular pantalla de smartphone"}
              className="hidden md:flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#151924] hover:bg-[#1e2333] border border-white/10 rounded-xl transition-all"
            >
              {isMobileMockup ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-[#9cb3ff]" />
                  <span>Modo Completo</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#9cb3ff]" />
                  <span>Simular Móvil</span>
                </>
              )}
            </button>

            {/* Quick Publish Button */}
            <button
              onClick={onOpenPublish}
              className="min-h-[40px] px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#315cff] to-[#00a89d] hover:from-[#4d77ff] hover:to-[#22c4b7] rounded-xl shadow-lg shadow-[#315cff]/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Ofrecer Asiento</span>
              <span className="xs:hidden sm:hidden">Publicar</span>
            </button>

            {/* User Profile with DUI Verified Badge */}
            <div
              onClick={() => onViewChange('profile')}
              className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10 cursor-pointer"
            >
              <div className="relative group">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                  alt="Perfil Miguel"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-white/20 group-hover:border-[#315cff] transition-colors"
                />
                <span 
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-[#0c1017]" 
                  title="DUI Verificado"
                >
                  ✓
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </header>
  );
};
