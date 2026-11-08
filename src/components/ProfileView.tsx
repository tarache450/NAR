import React, { useState } from 'react';
import { Car, MessageSquare, Navigation, Plus, QrCode, RotateCcw, Search, User, Users, LogIn, LogOut, ShieldCheck, PhoneCall } from 'lucide-react';
import type { Booking, Ride } from '../types';
import { Badge, Button, EmptyState, Eyebrow } from './ui/primitives';
import { clock24, usd } from '../lib/rides';
import { useAuth } from '../context/AuthContext';

interface ProfileViewProps {
  rides: Ride[];
  bookings: Booking[];
  onOpenPublish: () => void;
  onOpenAuth: () => void;
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
  onOpenAuth,
  onSearch,
  onOpenPass,
  onOpenTrip,
  onOpenChat,
  onViewRide,
  onResetDemo,
}) => {
  const { user, profile, signOut, loading } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);

  // Si no está autenticado, invitar a iniciar sesión
  if (!user && !loading) {
    return (
      <section aria-labelledby="perfil-title" className="pt-[96px] md:pt-[124px] pb-24">
        <div className="container-nar max-w-[640px] text-center">
          <Eyebrow>Identidad Segura</Eyebrow>
          <div className="card mt-6 p-8 sm:p-12 space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mx-auto flex items-center justify-center text-primary">
              <LogIn className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 id="perfil-title" className="t-h3 text-white">
                Ingresa a tu Perfil NAR
              </h1>
              <p className="t-small text-muted max-w-sm mx-auto">
                Inicia sesión o regístrate en Supabase para gestionar tus reservas, validar tu DUI oficial y publicar viajes en El Salvador.
              </p>
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={onOpenAuth}>
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión / Registrarme</span>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const published = rides.filter((r) => r.driver.id === (user?.id || 'demo'));

  return (
    <section aria-labelledby="perfil-title" className="pt-[96px] md:pt-[124px] pb-24">
      <div className="container-nar max-w-[960px]">
        <div className="flex items-center justify-between">
          <Eyebrow>Perfil de Usuario</Eyebrow>
          <Button variant="outline" size="sm" onClick={() => signOut()} className="text-rose-400 border-rose-500/20 hover:bg-rose-500/10">
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>

        <div className="card mt-4 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-surface-2 border border-line-strong flex items-center justify-center shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || 'Perfil'} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-muted" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 id="perfil-title" className="t-h3">
              {profile?.full_name || user?.email?.split('@')[0]}
            </h1>
            <p className="t-small text-muted mt-0.5">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile?.dui_verified ? (
                <Badge tone="success">✓ DUI Verificado</Badge>
              ) : (
                <Badge tone="warning">DUI: Validación pendiente</Badge>
              )}
              {profile?.phone ? (
                <Badge tone="accent">{profile.phone}</Badge>
              ) : (
                <Badge tone="neutral">Teléfono sin registrar</Badge>
              )}
              <Badge tone="accent" className="capitalize">{profile?.role === 'driver' ? 'Conductor' : 'Pasajero'}</Badge>
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
                      <MessageSquare className="w-4 h-4" aria-hidden="true" /> Chat
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onViewRide(b.ride)}>
                      Ver viaje
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Aún no tienes reservas activas"
              description="Busca un asiento en los corredores San Salvador, Santa Ana, El Tunco o San Miguel y asegura tu lugar."
              actions={
                <Button size="md" onClick={onSearch}>
                  <Search className="w-4 h-4" aria-hidden="true" /> Buscar viaje
                </Button>
              }
            />
          )}
        </div>

        {/* Viajes publicados */}
        <div className="mt-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="t-h4">Mis viajes publicados</h2>
            <Button size="sm" onClick={onOpenPublish}>
              <Plus className="w-4 h-4" aria-hidden="true" /> Publicar nuevo
            </Button>
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
                      {r.date} · {clock24(r.departureTime)} · {r.availableSeats} de {r.totalSeats} asientos libres · {usd(r.seatPrice)}/asiento
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button size="sm" onClick={() => onViewRide(r)}>
                      Ver detalle
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onOpenChat(r)}>
                      <MessageSquare className="w-4 h-4" aria-hidden="true" /> Chat
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No has publicado ningún viaje todavía"
              description="Si conduces a diario entre ciudades de El Salvador, publica tus asientos libres para compartir gastos de gasolina."
              actions={
                <Button size="md" onClick={onOpenPublish}>
                  <Plus className="w-4 h-4" aria-hidden="true" /> Publicar viaje
                </Button>
              }
            />
          )}
        </div>

      </div>
    </section>
  );
};
