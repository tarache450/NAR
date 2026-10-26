import React from 'react';
import { 
  Compass, 
  Search, 
  PlusCircle, 
  Route,
  UserCheck 
} from 'lucide-react';

export type TabType = 'explore' | 'search' | 'publish' | 'telemetry' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasActiveTrip?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  hasActiveTrip = true,
}) => {
  return (
    <nav 
      aria-label="Navegación principal móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c1017]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl select-none"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        
        {/* Tab 1: Explorar Rutas */}
        <button
          type="button"
          onClick={() => onTabChange('explore')}
          aria-current={activeTab === 'explore' ? 'page' : undefined}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'explore'
              ? 'text-[#9cb3ff] font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight leading-none">Rutas</span>
        </button>

        {/* Tab 2: Buscar Específico */}
        <button
          type="button"
          onClick={() => onTabChange('search')}
          aria-current={activeTab === 'search' ? 'page' : undefined}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'search'
              ? 'text-[#9cb3ff] font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] tracking-tight leading-none">Buscar</span>
        </button>

        {/* Tab 3: Publicar Asiento (Central Prominent Button) */}
        <button
          type="button"
          onClick={() => onTabChange('publish')}
          className="min-h-[48px] flex flex-col items-center justify-center -mt-4 group focus:outline-none"
          aria-label="Publicar Asiento de tu viaje"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563eb] via-[#1ea2dc] to-[#00a89d] p-0.5 shadow-xl shadow-[#315cff]/25 group-active:scale-95 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#0c1017] rounded-[14px] flex items-center justify-center text-[#9cb3ff] group-hover:text-white transition-colors">
              <PlusCircle className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[10px] text-[#c4cfff] font-bold tracking-tight mt-1 leading-none">
            Publicar
          </span>
        </button>

        {/* Tab 4: En Vivo */}
        <button
          type="button"
          onClick={() => onTabChange('telemetry')}
          aria-current={activeTab === 'telemetry' ? 'page' : undefined}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 relative transition-all ${
            activeTab === 'telemetry'
              ? 'text-[#9cb3ff] font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Route className="w-5 h-5" />
            {hasActiveTrip && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#315cff] animate-ping" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none">Recorrido</span>
        </button>

        {/* Tab 5: Perfil / Seguridad */}
        <button
          type="button"
          onClick={() => onTabChange('profile')}
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'profile'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px] tracking-tight leading-none">Perfil</span>
        </button>

      </div>
    </nav>
  );
};
