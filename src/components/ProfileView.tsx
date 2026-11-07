import React, { useState } from 'react';
import { Car, MessageSquare, Navigation, Plus, QrCode, RotateCcw, Search, User, Users } from 'lucide-react';
import type { Booking, Ride } from '../types';
import { Badge, Button, EmptyState, Eyebrow } from './ui/primitives';
import { DEMO_USER, DEMO_NOTICE } from '../data/demoUser';
import { clock24, usd } from '../lib/rides';

interface ProfileViewProps {
  rides: Ride[];
  bookings: Booking[];
  onOpenPublish: () => void;
  onSearch: () => void;
  onOpenPass: (b: Booking) => void;
  onOpenTrip: (r: Ride) => void;
  onOpenChat: (r: Ride) => void;
  onViewRide: (r: Ride) => void;
  onResetDemo: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  rides,
  bookings,
  onOpenPublish,
  onSearch,
  onOpenPass,
  onOpenTrip,
  onOpenChat,
  onViewRide,
  onResetDemo,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const published = rides.filter((r) => r.driver.id === DEMO_USER.id);

  return (
    <section aria-labelledby="perfil-title" className="pt-[96px] md:pt-[124px] pb-24">
      <div className="container-nar max-w-[960px]">
        <Eyebrow>Perfil</Eyebrow>

        <div className="card mt-4 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-surface-2 border border-line-strong flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-muted" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 id="perfil-title" className="t-h3">
              {DEMO_USER.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge tone="warning">DUI sin verificar</Badge>
              <Badge>Teléfono sin verificar</Badge>
              <Badge>Perfil de demostración</Badge>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:w-[240px]">
            <div className="surface-inset p-4">
              <dt className="t-small text-muted">Reservas</dt>
              <dd className="t-h4 tabular">{bookings.length}</dd>
            </div>
            <div className="surface-inset p-4">
              <dt className="t-small text-muted">Publicados</dt>
              <dd className="t-h4 tabular">{published.length}</dd>
            </div>
          </dl>
        </div>

        <p className="t-small text-subtle mt-4">
          La verificación de DUI y teléfono aún no está disponible en esta versión. {DEMO_NOTICE}
        </p>

        {/* Reservas */}
        <div className="mt-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="t-h4">Mis reservas</h2>
            {bookings.length ? (
              <Button variant="outline" size="sm" onClick={onSearch}>
                <Search className="w-4 h-4" aria-hidden="true" /> Buscar otro
              </Button>
            ) : null}
          </div>
          {bookings.length ? (
            <ul className="flex flex-col gap-3">
              {[...bookings].reverse().map((b) => (
                <li key={b.id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="min-w-0">
                    <p className="t-small text-muted tabular">
                      {b.id} · PIN {b.securityPin}
                    </p>
                    <p className="t-h6 mt-1">
                      {b.ride.origin.city} → {b.ride.destination.city}
                    </p>
                    <p className="t-small text-muted">
                      {b.ride.date} · {clock24(b.ride.departureTime)} · subes en {b.pickupPoint} · {b.seatsBooked}{' '}
                      {b.seatsBooked === 1 ? 'asiento' : 'asientos'} · {usd(b.totalPrice)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button size="sm" onClick={() => onOpenPass(b)}>
                      <QrCode className="w-4 h-4" aria-hidden="true" /> Pase
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onOpenTrip(b.ride)}>
                      <Navigation className="w-4 h-4" aria-hidden="true" /> Mi viaje
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onOpenChat(b.ride)}>
                      <MessageSquare className="w-4 h-4" aria-hidden="true" /> Escribir
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Users className="w-5 h-5" />}
              title="Todavía no has reservado"
              description="Busca una salida en tu corredor y reserva tu asiento. Tus pases aparecerán aquí."
              actions={<Button onClick={onSearch}>Buscar viaje</Button>}
            />
          )}
        </div>

        {/* Publicados */}
        <div className="mt-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="t-h4">Mis viajes publicados</h2>
            {published.length ? (
              <Button variant="outline" size="sm" onClick={onOpenPublish}>
                <Plus className="w-4 h-4" aria-hidden="true" /> Publicar otro
              </Button>
            ) : null}
          </div>
          {published.length ? (
            <ul className="flex flex-col gap-3">
              {published.map((r) => (
                <li key={r.id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="min-w-0">
                    <p className="t-h6">
                      {r.origin.city} → {r.destination.city}
                    </p>
                    <p className="t-small text-muted">
                      {r.isRecurring && r.recurringDays ? r.recurringDays : r.date} · {clock24(r.departureTime)} · {usd(r.seatPrice)} por
                      asiento
                    </p>
                    <p className="t-small mt-1 tabular">
                      {r.totalSeats - r.availableSeats} de {r.totalSeats} asientos reservados
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onViewRide(r)}>
                    <Car className="w-4 h-4" aria-hidden="true" /> Ver publicación
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Car className="w-5 h-5" />}
              title="No has publicado viajes"
              description="Si haces un trayecto con asientos libres, publícalo y comparte la gasolina."
              actions={<Button onClick={onOpenPublish}>Publicar viaje</Button>}
            />
          )}
        </div>

        {/* Datos demo */}
        <div className="mt-14 card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="t-h6">Datos de demostración</h2>
            <p className="t-small text-muted mt-1">Borra tus reservas y publicaciones y vuelve a los viajes de ejemplo.</p>
          </div>
          {confirmReset ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onResetDemo();
                  setConfirmReset(false);
                }}
              >
                Sí, restablecer
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="w-4 h-4" aria-hidden="true" /> Restablecer
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
