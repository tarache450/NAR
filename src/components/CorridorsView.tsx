import React from 'react';
import type { Ride } from '../types';
import type { Corridor } from '../lib/rides';
import { usd } from '../lib/rides';
import { CorridorCards } from './HomeView';
import { RideCard } from './RideCard';
import { Button, Eyebrow, Reveal } from './ui/primitives';
import DotGrid from './bits/DotGrid';

interface CorridorsViewProps {
  corridors: Corridor[];
  onSelectCorridor: (origin: string, destination: string) => void;
  onSelectRide: (ride: Ride) => void;
  onOpenPublish: () => void;
}

export const CorridorsView: React.FC<CorridorsViewProps> = ({ corridors, onSelectCorridor, onSelectRide, onOpenPublish }) => (
  <section aria-labelledby="corr-title" className="relative pt-[96px] md:pt-[124px] pb-24">
    <div className="absolute inset-x-0 top-0 h-[380px] pointer-events-none [mask-image:linear-gradient(to_bottom,#000_30%,transparent)]" aria-hidden="true">
      <DotGrid dotSize={3} gap={22} baseColor="#1a2330" activeColor="#00c29a" proximity={130} opacity={0.9} />
    </div>
    <div className="container-nar relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-[640px]">
          <Eyebrow>Corredores</Eyebrow>
          <h1 id="corr-title" className="t-h2 mt-3">
            Rutas con salidas publicadas.
            <br />
            <span className="text-muted">Aporte por asiento a la vista.</span>
          </h1>
        </div>
        <Button variant="outline" onClick={onOpenPublish}>
          ¿No ves tu ruta? Publícala
        </Button>
      </div>

      <div className="mt-12">
        <CorridorCards corridors={corridors} onSelectCorridor={onSelectCorridor} />
      </div>

      <div className="mt-20 flex flex-col gap-16">
        {corridors.map((c) => (
          <Reveal key={c.key}>
            <section aria-labelledby={`c-${c.key}`}>
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6 pb-4 border-b border-line">
                <div>
                  <h2 id={`c-${c.key}`} className="t-h4">
                    {c.origin} → {c.destination}
                  </h2>
                  <p className="t-small text-muted mt-1">
                    {c.via ? `Pasa por ${c.via} · ` : ''}
                    {c.duration} · desde {usd(c.minPrice)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onSelectCorridor(c.origin, c.destination)}>
                  Buscar en este corredor
                </Button>
              </div>
              <ul className="grid gap-4 md:grid-cols-2">
                {c.rides.map((r) => (
                  <li key={r.id}>
                    <RideCard ride={r} onSelect={onSelectRide} />
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
