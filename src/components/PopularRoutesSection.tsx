import React from 'react';
import SpotlightCard from './reactbits/SpotlightCard';
import { RoutePopular } from '../types';
import { ArrowRight, Clock, MapPin, Users } from 'lucide-react';

interface PopularRoutesSectionProps {
  routes: RoutePopular[];
  onSelectRoute: (origin: string, destination: string) => void;
}

export const PopularRoutesSection: React.FC<PopularRoutesSectionProps> = ({
  routes,
  onSelectRoute,
}) => {
  return (
    <section className="nar-reveal py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9cb3ff] block mb-1">
              RUTAS DE EJEMPLO
            </span>
            <h2 className="text-xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Trayectos para explorar en El Salvador
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Selecciona una ruta para filtrar la demostración
          </span>
        </div>

        {/* Routes Grid */}
        <div className="nar-route-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {routes.map((rt, index) => (
            <SpotlightCard
              key={rt.id}
              spotlightColor="#315cff"
              onClick={() => onSelectRoute(rt.origin, rt.destination)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectRoute(rt.origin, rt.destination); } }}
              role="button" tabIndex={0} aria-label={`Buscar viajes de ${rt.origin} a ${rt.destination}`}
              className="group nar-route-card cursor-pointer flex flex-col justify-between"
              style={{ '--route-index': index } as React.CSSProperties}
            >
              {/* Photo Banner with overlay */}
              <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                <img 
                  src={rt.image} 
                  alt={`${rt.origin} a ${rt.destination}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-transparent" />
                
                {/* Price Tag Pill */}
                <div className="absolute top-3 right-3 bg-[#0c0f17]/90 border border-white/10 px-2.5 py-1 rounded-xl shadow-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">Aporte de ejemplo</span>
                  <span className="text-xs font-extrabold text-[#c4cfff] font-display">
                    ${rt.avgPrice.toFixed(2)} USD
                  </span>
                </div>

                <div className="absolute bottom-2 left-3">
                  <span className="text-[11px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Duración de referencia · {rt.travelTime}
                  </span>
                </div>
              </div>

              {/* Text content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#c4cfff] transition-colors flex items-center gap-1.5">
                    <span>{rt.origin}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9cb3ff]" />
                    <span>{rt.destination}</span>
                  </h3>
                  
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {rt.intermediate}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-400">
                    Trayecto ilustrativo
                  </span>
                  <span className="text-[#9cb3ff] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Ver →
                  </span>
                </div>
              </div>

            </SpotlightCard>
          ))}
        </div>

      </div>
    </section>
  );
};
