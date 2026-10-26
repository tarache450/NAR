import React from 'react';
import SpotlightCard from './reactbits/SpotlightCard';
import { RoutePopular } from '../types';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

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
              {/* Route artwork */}
              <div className="nar-route-card__cover">
                <img 
                  src={rt.image} 
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="nar-route-card__image"
                />
                <div className="nar-route-card__shade" />
                <div className="nar-route-card__cover-top">
                  <span>RUTA DE EJEMPLO</span>
                  <span className="nar-route-card__price">${rt.avgPrice.toFixed(2)} <small>USD</small></span>
                </div>
                <div className="nar-route-card__visual" aria-hidden="true">
                  <span className="nar-route-card__city">{rt.origin}</span>
                  <span className="nar-route-card__line"><i /><i /><i /></span>
                  <span className="nar-route-card__city is-destination">{rt.destination}</span>
                </div>
              </div>

              <div className="nar-route-card__body">
                <div className="nar-route-card__stops">
                  <MapPin size={14} aria-hidden="true" />
                  <div>
                    <span>PARADAS ORIENTATIVAS</span>
                    <p>{rt.intermediate}</p>
                  </div>
                </div>
                <div className="nar-route-card__footer">
                  <span><Clock size={13} aria-hidden="true" /> {rt.travelTime}</span>
                  <span>Explorar <ArrowRight size={14} aria-hidden="true" /></span>
                </div>
              </div>

            </SpotlightCard>
          ))}
        </div>

      </div>
    </section>
  );
};
