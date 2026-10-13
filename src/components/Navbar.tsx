import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  UserCheck, 
  Radio, 
  Compass, 
  Smartphone, 
  Monitor,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                    ? 'text-cyan-300 bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Explorar Rutas
              </button>

              <button
                onClick={() => onViewChange('search')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeView === 'search'
                    ? 'text-cyan-300 bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Buscador
              </button>
              
              <button
                onClick={() => onViewChange('telemetry')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeView === 'telemetry'
                    ? 'text-cyan-300 bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
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
                  ? 'bg-gradient-to-r from-[#1ea2dc] to-[#00c29a] text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Publicar Asiento</span>
            </button>
          </div>

          {/* Right User & CTA Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* View Mode Toggle: Simulator vs Desktop */}
            <button
              onClick={onToggleMockup}
              title={isMobileMockup ? "Ver en modo pantalla completa" : "Simular pantalla de smartphone"}
              className="hidden md:flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#151924] hover:bg-[#1e2333] border border-white/10 rounded-xl transition-all"
            >
              {isMobileMockup ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Modo Completo</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Simular Móvil</span>
                </>
              )}
            </button>

            {/* Quick Publish Button */}
            <button
              onClick={onOpenPublish}
              className="min-h-[40px] px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-[#00c29a] hover:from-cyan-300 hover:to-teal-300 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Ofrecer Asiento</span>
              <span className="xs:hidden sm:hidden">Publicar</span>
            </button>

            {/* User Profile with DUI Verified Badge */}
            <div 
              onClick={() => onViewChange('profile')}
              className="flex items-center gap-2 pl-2 border-l border-white/10 cursor-pointer"
            >
              <div className="relative group">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                  alt="Perfil Miguel"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-white/20 group-hover:border-cyan-400 transition-colors"
                />
                <span 
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-[#0c1017]" 
                  title="DUI Verificado"
                >
                  ✓
                </span>
              </div>
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-h-[40px] min-w-[40px] rounded-xl bg-[#151924] border border-white/10 text-slate-300 flex items-center justify-center"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0c1017] p-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#151924] rounded-xl mb-3">
            <button
              onClick={() => {
                onModeChange('request');
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg text-center ${
                mode === 'request' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Buscar Asiento
            </button>
            <button
              onClick={() => {
                onModeChange('offer');
                onOpenPublish();
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg text-center ${
                mode === 'offer' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Publicar Asiento
            </button>
          </div>

          <button
            onClick={() => {
              onViewChange('explore');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
              activeView === 'explore' ? 'bg-white/10 text-cyan-300' : 'text-slate-300'
            }`}
          >
            Explorar Rutas Disponibles
          </button>

          <button
            onClick={() => {
              onViewChange('search');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
              activeView === 'search' ? 'bg-white/10 text-cyan-300' : 'text-slate-300'
            }`}
          >
            Buscador Avanzado de Rutas
          </button>

          <button
            onClick={() => {
              onViewChange('telemetry');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              activeView === 'telemetry' ? 'bg-white/10 text-cyan-300' : 'text-slate-300'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Monitoreo de Ruta en Vivo</span>
          </button>

          <button
            onClick={() => {
              onViewChange('profile');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              activeView === 'profile' ? 'bg-white/10 text-emerald-300' : 'text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mi Perfil & Identidad DUI</span>
          </button>
        </div>
      )}
    </header>
  );
};
