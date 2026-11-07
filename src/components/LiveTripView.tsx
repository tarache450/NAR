import React, { useEffect, useState } from 'react';
import { Check, MessageSquare, Navigation, Phone, QrCode, Share2, ShieldCheck, Star, AlertTriangle, Info, Search } from 'lucide-react';
import type { Booking, Ride } from '../types';
import { Avatar, Badge, Button, EmptyState, Eyebrow, ShaderBars, cx } from './ui/primitives';
import { clock24, minutesOfDay } from '../lib/rides';
import HoldButton from './bits/HoldButton';
import Radar from './bits/Radar';

interface LiveTripViewProps {
  ride: Ride | null;
  rides: Ride[];
  bookings: Booking[];
  onSelectRide: (ride: Ride) => void;
  onOpenPass: (booking: Booking) => void;
  onOpenChat: (ride: Ride) => void;
  onViewRide: (ride: Ride) => void;
  onSearch: () => void;
}

export const LiveTripView: React.FC<LiveTripViewProps> = ({
  ride,
  rides,
  bookings,
  onSelectRide,
  onOpenPass,
  onOpenChat,
  onViewRide,
  onSearch,
}) => {
  const [progress, setProgress] = useState(0.35);
  const [shareState, setShareState] = useState<'idle' | 'done' | 'error'>('idle');
  const [sosOpen, setSosOpen] = useState(false);

  useEffect(() => {
    setProgress(ride?.status === 'in_progress' ? 0.35 : 0);
    setSosOpen(false);
    setShareState('idle');
  }, [ride?.id, ride?.status]);

  useEffect(() => {
    if (!ride || ride.status !== 'in_progress') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setProgress((p) => (p >= 0.95 ? 0.35 : p + 0.01)), 2500);
    return () => window.clearInterval(t);
  }, [ride?.id, ride?.status]);

  if (!ride) {
    const demo = rides.find((r) => r.status === 'in_progress');
    return (
      <section className="pt-[96px] md:pt-[124px] pb-24">
        <div className="container-nar max-w-[760px]">
          <Eyebrow>Mi viaje</Eyebrow>
          <h1 className="t-h2 mt-3 mb-10">Aún no tienes viajes reservados.</h1>
          <EmptyState
            icon={<Navigation className="w-5 h-5" />}
            title="Reserva un asiento para seguirlo aquí"
            description="Cuando reserves, verás aquí las paradas, el conductor, tu pase y las opciones para compartir el viaje."
            actions={
              <>
                <Button onClick={onSearch}>
                  <Search className="w-4 h-4" aria-hidden="true" />
                  Buscar viaje
                </Button>
                {demo ? (
                  <Button variant="outline" onClick={() => onSelectRide(demo)}>
                    Ver un viaje en ruta (demo)
                  </Button>
                ) : null}
              </>
            }
          />
        </div>
      </section>
    );
  }

  const booking = bookings.find((b) => b.ride.id === ride.id) ?? null;
  const stops = [ride.origin, ...ride.waypoints, ride.destination];
  const live = ride.status === 'in_progress';
  const reached = live ? Math.floor(progress * (stops.length - 1)) : -1;
  const options = Array.from(new Map([...bookings.map((b) => b.ride), ...rides.filter((r) => r.status === 'in_progress')].map((r) => [r.id, r])).values());

  const share = async () => {
    const text = `Voy en NAR de ${ride.origin.city} a ${ride.destination.city}. Conductor: ${ride.driver.name}. Vehículo: ${ride.vehicle.make} ${ride.vehicle.model} ${ride.vehicle.color}, placa ${ride.vehicle.plate}. Llegada estimada ${ride.arrivalTime}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mi viaje en NAR', text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShareState('done');
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      setShareState('error');
    }
    window.setTimeout(() => setShareState('idle'), 3000);
  };

  const minsLeft = live
    ? Math.max(0, Math.round((minutesOfDay(ride.arrivalTime) - minutesOfDay(ride.departureTime)) * (1 - progress)))
    : null;

  return (
    <section aria-labelledby="trip-title" className="pt-[96px] md:pt-[124px] pb-24">
      <div className="container-nar">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Eyebrow>Mi viaje</Eyebrow>
            <h1 id="trip-title" className="t-h2 mt-3">
              {ride.origin.city} → {ride.destination.city}
            </h1>
            <p className="t-body text-muted mt-3">
              {live ? 'En ruta' : 'Programado'} · salida {clock24(ride.departureTime)} · llegada estimada {clock24(ride.arrivalTime)}
            </p>
          </div>
          {options.length > 1 ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="trip-select" className="t-small text-muted">
                Cambiar de viaje
              </label>
              <select
                id="trip-select"
                value={ride.id}
                onChange={(e) => {
                  const r = options.find((o) => o.id === e.target.value);
                  if (r) onSelectRide(r);
                }}
                className="h-11 pl-4 rounded-[12px] bg-surface border border-line-strong text-[15px] min-w-[260px]"
              >
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.origin.city} → {o.destination.city} · {clock24(o.departureTime)}
                    {bookings.some((b) => b.ride.id === o.id) ? ' (reservado)' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <p className="mt-6 t-small text-subtle flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          Seguimiento de demostración: el avance se simula y no usa la ubicación real del vehículo.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          {/* Escena del recorrido */}
          <div className="card p-3 flex">
            <div className="relative flex-1 rounded-[12px] overflow-hidden border border-line bg-[#0b0b0d]">
              {live ? (
                <div className="absolute inset-0 opacity-50 [mask-image:radial-gradient(circle_at_70%_40%,#000_20%,transparent_70%)]" aria-hidden="true">
                  <Radar color="#21d2ed" backgroundColor="transparent" speed={0.6} centerX={0.72} centerY={0.38} scale={0.9} targets={3} mouseInteraction={false} />
                </div>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 h-[45%]">
                <ShaderBars bias={0.7} density={6} intensity={0.8} />
              </div>
              <div className="relative p-5 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="t-small text-muted">{live ? 'Llegada en' : 'Sale a las'}</p>
                    <p className="t-h2 tabular">{live ? `${minsLeft} min` : clock24(ride.departureTime)}</p>
                  </div>
                  {live ? (
                    <Badge tone="accent">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                      En ruta · simulado
                    </Badge>
                  ) : (
                    <Badge>Programado</Badge>
                  )}
                </div>

                <div className="mt-8" aria-hidden="true">
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-[width] duration-1000" style={{ width: `${Math.round(progress * 100)}%` }} />
                  </div>
                </div>

                <ol className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Paradas">
                  {stops.map((s, i) => {
                    const done = i <= reached;
                    const isPickup = booking?.pickupPoint.startsWith(s.name);
                    return (
                      <li key={s.id} className={cx('rounded-[12px] border p-4 bg-surface/90 backdrop-blur', done ? 'border-accent/40' : 'border-line')}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={cx('w-2.5 h-2.5 rounded-full', done ? 'bg-accent' : 'bg-white/25')} aria-hidden="true" />
                          <span className="t-small text-muted tabular">
                            {clock24(i === 0 ? ride.departureTime : i === stops.length - 1 ? ride.arrivalTime : s.time)}
                          </span>
                        </div>
                        <p className="text-[15px] mt-3">{s.city}</p>
                        <p className="t-small text-muted">{s.name}</p>
                        {isPickup ? <p className="t-small text-accent mt-1">Tu subida</p> : null}
                        <span className="sr-only">{done ? 'Parada superada' : 'Parada pendiente'}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>

          {/* Conductor y acciones */}
          <div className="flex flex-col gap-4">
            <div className="card p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <Avatar src={ride.driver.avatar} name={ride.driver.name} size={56} />
                <div className="min-w-0">
                  <p className="t-h6 truncate">{ride.driver.name}</p>
                  <p className="t-small text-muted flex items-center gap-1.5 tabular">
                    {ride.driver.totalTrips > 0 ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-current text-fg" aria-hidden="true" />
                        {ride.driver.rating.toFixed(2)} · {ride.driver.totalTrips} viajes
                      </>
                    ) : (
                      'Conductor nuevo'
                    )}
                  </p>
                </div>
              </div>
              <div className="surface-inset p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] truncate">
                    {ride.vehicle.make} {ride.vehicle.model}
                  </p>
                  <p className="t-small text-muted">{ride.vehicle.color}</p>
                </div>
                <span className="h-9 px-3 rounded-[8px] bg-white text-ink text-[15px] font-medium tabular inline-flex items-center shrink-0">
                  {ride.vehicle.plate}
                </span>
              </div>
              {ride.driver.verifiedDUI ? (
                <p className="t-small text-muted flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" aria-hidden="true" /> DUI verificado
                  {ride.driver.verifiedPhone ? ' · Teléfono +503' : ''}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                {booking ? (
                  <Button onClick={() => onOpenPass(booking)}>
                    <QrCode className="w-4 h-4" aria-hidden="true" />
                    Mi pase
                  </Button>
                ) : (
                  <Button onClick={() => onViewRide(ride)}>Reservar</Button>
                )}
                <Button variant="outline" onClick={() => onOpenChat(ride)}>
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  Escribir
                </Button>
                <Button variant="outline" onClick={share} className="col-span-2">
                  {shareState === 'done' ? <Check className="w-4 h-4 text-accent" aria-hidden="true" /> : <Share2 className="w-4 h-4" aria-hidden="true" />}
                  <span aria-live="polite">
                    {shareState === 'done'
                      ? 'Datos del viaje listos para compartir'
                      : shareState === 'error'
                      ? 'No se pudo compartir. Inténtalo de nuevo'
                      : 'Compartir con un familiar'}
                  </span>
                </Button>
              </div>
            </div>

            <div className={cx('card p-6', sosOpen && 'border-danger/40')}>
              <button
                type="button"
                aria-expanded={sosOpen}
                aria-controls="sos-panel"
                onClick={() => setSosOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <span className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger" aria-hidden="true" />
                  <span className="t-h6">Emergencia</span>
                </span>
                <span className="t-small text-muted">{sosOpen ? 'Ocultar' : 'Abrir'}</span>
              </button>
              {sosOpen ? (
                <div id="sos-panel" className="mt-5 flex flex-col gap-4">
                  <p className="t-small text-muted">
                    Se abrirá la llamada al 911 de El Salvador. Ten a mano estos datos: {ride.vehicle.make} {ride.vehicle.model}{' '}
                    {ride.vehicle.color}, placa {ride.vehicle.plate}, conductor {ride.driver.name}.
                  </p>
                  <HoldButton
                    size="md"
                    radius={12}
                    holdTime={1200}
                    backgroundColor="rgba(255,107,107,0.14)"
                    fillColor="#ff6b6b"
                    textColor="#ff6b6b"
                    fillTextColor="#09090b"
                    icon={<Phone className="w-4 h-4" aria-hidden="true" />}
                    doneLabel="Llamando al 911…"
                    resetAfter={2500}
                    onHold={() => {
                      window.location.href = 'tel:911';
                    }}
                    className="w-full"
                  >
                    Mantén pulsado para llamar al 911
                  </HoldButton>
                  <p className="t-small text-subtle">
                    Mantener pulsado evita llamadas por un toque accidental. Si no funciona,{' '}
                    <a href="tel:911" className="underline underline-offset-4 text-fg">
                      llama directamente al 911
                    </a>
                    .
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
