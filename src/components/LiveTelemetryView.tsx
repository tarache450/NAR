import React, { useState } from 'react';
import { ArrowLeft, CalendarDays, Clock3, MapPin, MapPinned, Share2, Users } from 'lucide-react';
import type { Ride } from '../types';
import { googleMapsDirectionsUrl } from '../lib/maps';

interface RouteViewProps {
  ride: Ride;
  onBack?: () => void;
}

export const LiveTelemetryView: React.FC<RouteViewProps> = ({ ride, onBack }) => {
  const [notice, setNotice] = useState('');
  const mapsUrl = googleMapsDirectionsUrl(ride);
  const stops = [ride.origin, ...ride.waypoints, ride.destination];

  const shareRoute = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Recorrido: ${ride.origin.city} a ${ride.destination.city}`, url: mapsUrl });
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(mapsUrl);
      setNotice('Enlace de Google Maps copiado.');
    } catch {
      setNotice('No se pudo compartir ni copiar el enlace en este navegador.');
    }
    window.setTimeout(() => setNotice(''), 2500);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:py-12" aria-labelledby="route-view-title">
      {onBack && <button onClick={onBack} className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-slate-300 hover:bg-white/5"><ArrowLeft size={17}/> Volver a las rutas</button>}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
        <div className="relative border-b border-white/10 bg-[linear-gradient(120deg,#14203a,#102b31)] p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#aebdff]">Recorrido · información de ejemplo</p>
          <h1 id="route-view-title" className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{ride.origin.city} <span className="text-[#9cb3ff]">→</span> {ride.destination.city}</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">Consulta las paradas publicadas y abre la ruta en Google Maps. Esta vista no recibe la ubicación del conductor ni datos de tráfico en tiempo real.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#315cff] px-5 font-bold text-white shadow-lg shadow-blue-950/30 hover:bg-[#456dff]"><MapPinned size={18}/> Abrir recorrido en Google Maps</a>
            <button onClick={shareRoute} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 font-semibold text-white hover:bg-white/10"><Share2 size={17}/> Compartir ruta</button>
          </div>
          {notice && <p role="status" className="mt-3 text-sm text-[#b8c6ff]">{notice}</p>}
        </div>
        <div className="grid gap-8 p-6 sm:grid-cols-[1.1fr_.9fr] sm:p-9">
          <div>
            <h2 className="text-lg font-bold text-white">Paradas del recorrido</h2>
            <ol className="relative mt-5 space-y-5 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-px before:bg-gradient-to-b before:from-[#00a89d] before:to-[#9cb3ff]">
              {stops.map((stop, index) => <li key={stop.id} className="relative flex gap-4">
                <span className={`relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-4 border-[#111827] ${index === 0 ? 'bg-[#00a89d]' : index === stops.length - 1 ? 'bg-[#9cb3ff]' : 'bg-[#5b77ff]'}`} />
                <div><p className="font-semibold text-white">{stop.name}</p><p className="mt-1 text-sm text-slate-400">{stop.address || stop.city}{stop.time ? ` · ${stop.time}` : ''}</p></div>
              </li>)}
            </ol>
          </div>
          <aside className="rounded-2xl border border-white/10 bg-[#0c1017] p-5">
            <h2 className="font-bold text-white">Datos del trayecto</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex gap-3"><CalendarDays size={17} className="text-[#9cb3ff]"/><div><dt className="text-slate-400">Fecha</dt><dd className="mt-1 text-white">{ride.date}</dd></div></div>
              <div className="flex gap-3"><Clock3 size={17} className="text-[#9cb3ff]"/><div><dt className="text-slate-400">Salida prevista</dt><dd className="mt-1 text-white">{ride.departureTime} · duración estimada {ride.estimatedDuration}</dd></div></div>
              <div className="flex gap-3"><Users size={17} className="text-[#9cb3ff]"/><div><dt className="text-slate-400">Asientos de ejemplo</dt><dd className="mt-1 text-white">{ride.availableSeats} disponibles</dd></div></div>
            </dl>
            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-400"><MapPin size={14} className="mr-1 inline text-[#9cb3ff]"/>El mapa muestra indicaciones calculadas por Google según los puntos indicados; no confirma el itinerario real del conductor.</p>
          </aside>
        </div>
      </div>
    </section>
  );
};
