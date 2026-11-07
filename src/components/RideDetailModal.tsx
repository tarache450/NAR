import React, { useEffect, useState } from 'react';
import { Car, MessageSquare, Phone, ShieldCheck, Star, Info } from 'lucide-react';
import type { Ride } from '../types';
import { Avatar, Badge, Button, Field, Modal, Stepper, cx, inputClass } from './ui/primitives';
import { clock24, usd } from '../lib/rides';
import Counter from './bits/Counter';
import ClickSpark from './bits/ClickSpark';

interface RideDetailModalProps {
  ride: Ride | null;
  defaultSeats?: number;
  onClose: () => void;
  onConfirmBooking: (rideId: string, seats: number, pickupPoint: string, passengerName: string) => void;
  onOpenChat: (ride: Ride) => void;
}

export const RouteTimeline: React.FC<{ ride: Ride }> = ({ ride }) => {
  const stops = [ride.origin, ...ride.waypoints, ride.destination];
  return (
    <ol className="relative">
      {stops.map((s, i) => {
        const first = i === 0;
        const last = i === stops.length - 1;
        return (
          <li key={s.id} className="grid grid-cols-[64px_20px_1fr] gap-x-3">
            <span className={cx('tabular text-[15px] pt-0.5', !first && !last && 'text-muted text-[14px]')}>
              {clock24(first ? ride.departureTime : last ? ride.arrivalTime : s.time)}
            </span>
            <span className="relative flex justify-center" aria-hidden="true">
              <span
                className={cx(
                  'relative z-10 mt-1.5 rounded-full',
                  first ? 'w-3 h-3 border-2 border-accent bg-surface' : last ? 'w-3 h-3 bg-white' : 'w-2 h-2 mt-2 bg-white/40'
                )}
              />
              {!last ? <span className="absolute top-3 bottom-0 w-px bg-white/15" /> : null}
            </span>
            <div className={cx('min-w-0', !last && 'pb-5')}>
              <p className={cx(first || last ? 'text-[16px]' : 'text-[15px] text-fg/90')}>{s.name}</p>
              <p className="t-small text-muted">
                {s.name.toLowerCase().includes(s.city.toLowerCase()) ? '' : `${s.city} · `}
                {s.address}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export const RideDetailModal: React.FC<RideDetailModalProps> = ({
  ride,
  defaultSeats = 1,
  onClose,
  onConfirmBooking,
  onOpenChat,
}) => {
  const [seats, setSeats] = useState(1);
  const [pickup, setPickup] = useState('');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ride) return;
    setSeats(Math.max(1, Math.min(defaultSeats, ride.availableSeats || 1)));
    setPickup(`${ride.origin.name} (${ride.origin.city})`);
    setNameError(null);
    setSubmitting(false);
  }, [ride, defaultSeats]);

  if (!ride) return null;

  const full = ride.availableSeats <= 0;
  const maxSeats = Math.max(1, Math.min(4, ride.availableSeats));
  const total = ride.seatPrice * seats;
  const pickupOptions = [
    { value: `${ride.origin.name} (${ride.origin.city})`, time: clock24(ride.departureTime), label: `${ride.origin.name}`, city: ride.origin.city },
    ...ride.waypoints.map((w) => ({ value: `${w.name} (${w.city})`, time: clock24(w.time), label: w.name, city: w.city })),
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (full) return;
    const clean = name.trim();
    if (clean.length < 3) {
      setNameError('Escribe el nombre de quien viaja (al menos 3 letras). Lo verá el conductor.');
      window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#booking-form [aria-invalid="true"]')?.focus());
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => onConfirmBooking(ride.id, seats, pickup, clean), 450);
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      eyebrow={`${ride.date}${ride.isRecurring && ride.recurringDays ? ` · ${ride.recurringDays}` : ''}`}
      title={`${ride.origin.city} → ${ride.destination.city}`}
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex items-baseline justify-between sm:block">
            <p className="t-small text-muted">
              Total · {seats} × {usd(ride.seatPrice)}
            </p>
            <p className="t-h4 tabular leading-tight" aria-live="polite">
              <span className="sr-only">{usd(total)}</span>
              <span aria-hidden="true">
                <Counter value={total} decimals={2} prefix="$" fontSize="inherit" fontWeight={400} textColor="#ffffff" tabular intro={false} />
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChat(ride)} className="flex-1 sm:flex-none">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              Escribir
            </Button>
            <div className="flex-[2] sm:flex-none sm:w-[220px]">
              <ClickSpark sparkColor="#21d2ed" sparkCount={12} sparkRadius={26} duration={480} disabled={full}>
                <Button type="submit" form="booking-form" disabled={full} loading={submitting} block>
                  {full ? 'Sin asientos libres' : submitting ? 'Reservando…' : 'Reservar asiento'}
                </Button>
              </ClickSpark>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-6">
          <section aria-label="Recorrido" className="surface-inset p-5">
            <div className="flex flex-wrap gap-2 mb-5">
              <Badge className="tabular">{ride.estimatedDuration}</Badge>
              {ride.distanceKm > 0 ? <Badge className="tabular">{ride.distanceKm} km</Badge> : null}
              {ride.status === 'in_progress' ? <Badge tone="accent">En ruta</Badge> : null}
            </div>
            <RouteTimeline ride={ride} />
          </section>

          <section aria-label="Conductor" className="surface-inset p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar src={ride.driver.avatar} name={ride.driver.name} size={56} />
              <div className="min-w-0">
                <p className="t-h6 truncate">{ride.driver.name}</p>
                <p className="t-small text-muted truncate">{ride.driver.affiliation}</p>
                <p className="t-small flex items-center gap-1.5 mt-0.5 tabular">
                  {ride.driver.totalTrips > 0 ? (
                    <>
                      <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      {ride.driver.rating.toFixed(2)}
                      <span className="text-muted">· {ride.driver.totalTrips} viajes · desde {ride.driver.memberSince}</span>
                    </>
                  ) : (
                    <span className="text-muted">Conductor nuevo, sin reseñas todavía</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ride.driver.verifiedDUI ? (
                <Badge tone="accent" icon={<ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />}>
                  DUI verificado
                </Badge>
              ) : (
                <Badge tone="warning">DUI sin verificar</Badge>
              )}
              {ride.driver.verifiedPhone ? (
                <Badge tone="accent" icon={<Phone className="w-3.5 h-3.5" aria-hidden="true" />}>
                  Teléfono +503
                </Badge>
              ) : null}
            </div>
            {ride.driver.bio ? <p className="t-body text-muted">{ride.driver.bio}</p> : null}
            <div className="border-t border-line pt-4 flex items-start gap-3">
              <Car className="w-5 h-5 text-muted shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-[15px]">
                  {ride.vehicle.make} {ride.vehicle.model} · {ride.vehicle.color}
                </p>
                <p className="t-small text-muted">
                  Placa <span className="text-fg tabular">{ride.vehicle.plate}</span>
                  {ride.vehicle.year ? ` · ${ride.vehicle.year}` : ''}
                </p>
              </div>
            </div>
            {ride.amenities.length ? (
              <ul className="flex flex-wrap gap-2" aria-label="Comodidades">
                {ride.amenities.map((a) => (
                  <li key={a}>
                    <Badge>{a}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {ride.driver.reviews?.length ? (
            <section aria-label="Reseñas" className="flex flex-col gap-3">
              <h3 className="t-h6">Reseñas recientes</h3>
              {ride.driver.reviews.slice(0, 2).map((r) => (
                <blockquote key={r.id} className="surface-inset p-4">
                  <p className="t-body">“{r.comment}”</p>
                  <footer className="t-small text-muted mt-2">
                    {r.authorName} · {r.date}
                  </footer>
                </blockquote>
              ))}
            </section>
          ) : null}
        </div>

        <form id="booking-form" onSubmit={submit} noValidate className="flex flex-col gap-6">
          {full ? (
            <div role="status" className="surface-inset p-4 flex gap-3 text-[15px]">
              <Info className="w-5 h-5 text-warning shrink-0" aria-hidden="true" />
              Esta salida ya no tiene asientos libres. Busca otra salida en el mismo corredor.
            </div>
          ) : null}

          <fieldset disabled={full} className="flex flex-col gap-3">
            <legend className="text-[14px] mb-3">¿Dónde subes?</legend>
            {pickupOptions.map((o) => {
              const on = pickup === o.value;
              return (
                <label
                  key={o.value}
                  className={cx(
                    'flex items-center gap-3 p-4 rounded-[12px] border cursor-pointer transition-colors',
                    on ? 'border-accent bg-accent-soft' : 'border-line-strong hover:border-white/20'
                  )}
                >
                  <input
                    type="radio"
                    name="pickup"
                    value={o.value}
                    checked={on}
                    onChange={() => setPickup(o.value)}
                    className="w-4 h-4 accent-[#21d2ed]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] truncate">{o.label}</span>
                    <span className="block t-small text-muted">{o.city}</span>
                  </span>
                  <span className="t-small tabular text-muted shrink-0">{o.time}</span>
                </label>
              );
            })}
          </fieldset>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[14px]">Asientos</p>
              <p className="t-small text-muted">
                {full ? 'Completo' : `${ride.availableSeats} de ${ride.totalSeats} libres`}
              </p>
            </div>
            <Stepper
              label="Asientos a reservar"
              value={seats}
              min={1}
              max={maxSeats}
              onChange={setSeats}
            />
          </div>

          <Field label="Nombre de quien viaja" error={nameError} hint="El conductor lo verá en su lista de pasajeros.">
            {(a) => (
              <input
                {...a}
                value={name}
                disabled={full}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                autoComplete="name"
                className={inputClass(Boolean(nameError))}
              />
            )}
          </Field>

          {ride.notes ? (
            <div className="surface-inset p-4">
              <p className="t-small text-muted">Nota del conductor</p>
              <p className="t-body mt-1">{ride.notes}</p>
            </div>
          ) : null}

          <p className="t-small text-subtle">
            Al reservar recibes un pase con PIN. El aporte se acuerda con el conductor: esta versión de NAR no procesa pagos.
          </p>
        </form>
      </div>
    </Modal>
  );
};
