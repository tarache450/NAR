import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import SpotlightCard from './reactbits/SpotlightCard';
import type { RoutePopular } from '../types';

interface PopularRoutesSectionProps {
  routes: RoutePopular[];
  onSelectRoute: (origin: string, destination: string) => void;
}

export function PopularRoutesSection({ routes, onSelectRoute }: PopularRoutesSectionProps) {
  return (
    <section className="nar-section nar-popular" aria-labelledby="nar-popular-title">
      <div className="nar-container">
        <div className="nar-section-heading nar-section-heading-split">
          <div><p className="nar-eyebrow">EXPLORA EL SALVADOR</p><h2 id="nar-popular-title">Rutas que nos acercan.</h2></div>
          <p>Elige un destino para ver los viajes de ejemplo disponibles.</p>
        </div>
        <div className="nar-route-grid">
          {routes.map((route, index) => (
            <button
              type="button"
              className="nar-route-card"
              key={route.id}
              onClick={() => onSelectRoute(route.origin, route.destination.split('/')[0].trim())}
            >
              <div className="nar-route-image">
                <img src={route.image} alt={`Paisaje de ${route.destination}, destino de esta ruta de ejemplo`} loading="lazy" decoding="async" width="800" height="500" />
                <span>0{index + 1} / 0{routes.length}</span>
              </div>
              <div className="nar-route-card-content">
                <div><span className="nar-route-card-kicker">DESDE ${route.avgPrice.toFixed(2)} · EJEMPLO</span><h3>{route.destination}</h3><p>Desde {route.origin} · {route.travelTime} aprox.</p></div>
                <ArrowUpRight size={22} aria-hidden="true" />
              </div>
              <SpotlightCard
                className="nar-route-glow"
                aria-hidden="true"
                theme="dark"
                spotlightColor="#22d3ee"
                intensity={0.22}
                spotlightSize={260}
                softness={0.75}
                borderGlow={0.9}
                proximity={70}
                ambient
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: 0,
                  borderRadius: 'inherit',
                  pointerEvents: 'none',
                  '--spotlight-card-surface': 'transparent',
                  '--spotlight-card-shadow': 'none',
                } as CSSProperties}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
