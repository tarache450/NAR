import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AmbientBackground } from './components/AmbientBackground';
import type { SearchQuery } from './components/SearchPanel';
import { INITIAL_RIDES } from './data/mockData';
import type { Booking, Ride } from './types';
import { clock24, corridorsFrom } from './lib/rides';
import { hashFor, viewFromHash, type ViewType } from './lib/nav';
import SwipeToast from './components/bits/SwipeToast';
import LatticeLoader from './components/bits/LatticeLoader';

const SearchView = lazy(() => import('./components/SearchView').then((m) => ({ default: m.SearchView })));
const CorridorsView = lazy(() => import('./components/CorridorsView').then((m) => ({ default: m.CorridorsView })));
const LiveTripView = lazy(() => import('./components/LiveTripView').then((m) => ({ default: m.LiveTripView })));
const ProfileView = lazy(() => import('./components/ProfileView').then((m) => ({ default: m.ProfileView })));
const RideDetailModal = lazy(() => import('./components/RideDetailModal').then((m) => ({ default: m.RideDetailModal })));
const PublishRideWizardModal = lazy(() =>
  import('./components/PublishRideWizardModal').then((m) => ({ default: m.PublishRideWizardModal }))
);
const BoardingPassModal = lazy(() => import('./components/BoardingPassModal').then((m) => ({ default: m.BoardingPassModal })));
const RideChatModal = lazy(() => import('./components/RideChatModal').then((m) => ({ default: m.RideChatModal })));

const STORE_KEY = 'nar_demo_state_v2';

interface Persisted {
  rides: Ride[];
  bookings: Booking[];
}

function loadState(): Persisted {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      if (Array.isArray(parsed.rides) && Array.isArray(parsed.bookings)) return parsed;
    }
  } catch {
    /* almacenamiento no disponible */
  }
  return { rides: INITIAL_RIDES, bookings: [] };
}

const EMPTY_QUERY: SearchQuery = { origin: '', destination: '', day: 'today', seats: 1 };

export function App() {
  const [{ rides, bookings }, setStore] = useState<Persisted>(loadState);
  const [view, setView] = useState<ViewType>(() => viewFromHash(window.location.hash));
  const [query, setQuery] = useState<SearchQuery>(EMPTY_QUERY);

  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [passBookingId, setPassBookingId] = useState<string | null>(null);
  const [chatRideId, setChatRideId] = useState<string | null>(null);
  const [tripRideId, setTripRideId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ rides, bookings }));
    } catch {
      /* sin persistencia */
    }
  }, [rides, bookings]);

  useEffect(() => {
    const onHash = () => setView(viewFromHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const rideById = useCallback((id: string | null) => (id ? rides.find((r) => r.id === id) ?? null : null), [rides]);
  const corridors = useMemo(() => corridorsFrom(rides), [rides]);
  const places = useMemo(() => {
    const s = new Set<string>();
    rides.forEach((r) => [r.origin, ...r.waypoints, r.destination].forEach((w) => s.add(w.city)));
    return [...s].sort((a, b) => a.localeCompare(b, 'es'));
  }, [rides]);

  const latestBooking = bookings.length ? bookings[bookings.length - 1] : null;
  const latestBookingFresh = latestBooking ? { ...latestBooking, ride: rideById(latestBooking.ride.id) ?? latestBooking.ride } : null;

  const navigate = useCallback((v: ViewType, anchor?: string) => {
    const target = hashFor(v);
    if (window.location.hash !== target) {
      window.history.pushState(null, '', target);
    }
    setView(v);
    window.requestAnimationFrame(() => {
      if (anchor) {
        document.getElementById(anchor)?.scrollIntoView({ block: 'start' });
      } else {
        window.scrollTo({ top: 0 });
      }
    });
  }, []);

  const searchCorridor = (origin: string, destination: string) => {
    setQuery({ origin, destination, day: 'any', seats: 1 });
    navigate('search');
  };

  const openTrip = (ride: Ride) => {
    setTripRideId(ride.id);
    setPassBookingId(null);
    navigate('telemetry');
  };

  const confirmBooking = (rideId: string, seats: number, pickupPoint: string, passengerName: string) => {
    const target = rideById(rideId);
    if (!target || target.availableSeats < seats) return;
    const updated: Ride = {
      ...target,
      availableSeats: target.availableSeats - seats,
      passengers: [
        ...target.passengers,
        ...Array.from({ length: seats }, (_, i) => ({
          id: `pax-${Date.now()}-${i}`,
          name: i === 0 ? passengerName : `${passengerName} (+${i})`,
          avatar: '',
          seatNumber: target.passengers.length + i + 1,
          pickupPoint,
          status: 'confirmed' as const,
        })),
      ],
    };
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const booking: Booking = {
      id: `NAR-${Date.now().toString(36).slice(-5).toUpperCase()}`,
      ride: updated,
      seatsBooked: seats,
      totalPrice: Number((target.seatPrice * seats).toFixed(2)),
      pickupPoint,
      passengerName,
      securityPin: `${pin.slice(0, 2)}-${pin.slice(2)}`,
      createdAt: Date.now(),
    };
    setStore((s) => ({
      rides: s.rides.map((r) => (r.id === rideId ? updated : r)),
      bookings: [...s.bookings, booking],
    }));
    setSelectedRideId(null);
    setPassBookingId(booking.id);
    setTripRideId(updated.id);
    setToast(`Reserva confirmada: ${target.origin.city} → ${target.destination.city}, ${seats} ${seats === 1 ? 'asiento' : 'asientos'}.`);
  };

  const publishRide = (ride: Ride) => {
    setStore((s) => ({ ...s, rides: [ride, ...s.rides] }));
    setPublishOpen(false);
    setQuery({ origin: ride.origin.city, destination: ride.destination.city, day: 'any', seats: 1 });
    navigate('search');
    setToast(`Publicaste ${ride.origin.city} → ${ride.destination.city} a las ${clock24(ride.departureTime)}.`);
  };

  const resetDemo = () => {
    setStore({ rides: INITIAL_RIDES, bookings: [] });
    setTripRideId(null);
    setQuery(EMPTY_QUERY);
    setToast('Datos de demostración restablecidos.');
  };

  const passBooking = bookings.find((b) => b.id === passBookingId) ?? null;
  const tripRide =
    rideById(tripRideId) ?? (latestBookingFresh ? latestBookingFresh.ride : null);
  const freshBookings = bookings.map((b) => ({ ...b, ride: rideById(b.ride.id) ?? b.ride }));

  const fallback = (
    <div className="container-nar pt-[160px] pb-32 flex justify-center" aria-busy="true">
      <LatticeLoader label="Cargando" color="#21d2ed" doneColor="#00c29a" />
    </div>
  );

  let content: React.ReactNode;
  switch (view) {
    case 'search':
      content = (
        <SearchView
          rides={rides}
          places={places}
          query={query}
          onQueryChange={setQuery}
          onSelectRide={(r) => setSelectedRideId(r.id)}
          onOpenPublish={() => setPublishOpen(true)}
        />
      );
      break;
    case 'corridors':
      content = (
        <CorridorsView
          corridors={corridors}
          onSelectCorridor={searchCorridor}
          onSelectRide={(r) => setSelectedRideId(r.id)}
          onOpenPublish={() => setPublishOpen(true)}
        />
      );
      break;
    case 'telemetry':
      content = (
        <LiveTripView
          ride={tripRide}
          rides={rides}
          bookings={freshBookings}
          onSelectRide={(r) => setTripRideId(r.id)}
          onOpenPass={(b) => setPassBookingId(b.id)}
          onOpenChat={(r) => setChatRideId(r.id)}
          onViewRide={(r) => setSelectedRideId(r.id)}
          onSearch={() => navigate('search')}
        />
      );
      break;
    case 'profile':
      content = (
        <ProfileView
          rides={rides}
          bookings={freshBookings}
          onOpenPublish={() => setPublishOpen(true)}
          onSearch={() => navigate('search')}
          onOpenPass={(b) => setPassBookingId(b.id)}
          onOpenTrip={openTrip}
          onOpenChat={(r) => setChatRideId(r.id)}
          onViewRide={(r) => setSelectedRideId(r.id)}
          onResetDemo={resetDemo}
        />
      );
      break;
    default:
      content = (
        <HomeView
          rides={rides}
          corridors={corridors}
          places={places}
          query={query}
          onQueryChange={setQuery}
          onSearch={(q) => {
            setQuery(q);
            navigate('search');
          }}
          onSelectRide={(r) => setSelectedRideId(r.id)}
          onOpenPublish={() => setPublishOpen(true)}
          onSelectCorridor={searchCorridor}
          onBrowseAll={() => navigate('search')}
          activeBooking={latestBookingFresh}
          onOpenPass={() => latestBooking && setPassBookingId(latestBooking.id)}
          onTrackBooking={() => latestBookingFresh && openTrip(latestBookingFresh.ride)}
        />
      );
  }

  return (
    <div className="relative min-h-dvh flex flex-col">
      <AmbientBackground view={view} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-[10px] focus:bg-white focus:text-ink"
      >
        Saltar al contenido
      </a>

      <Navbar
        activeView={view}
        onNavigate={(v) => navigate(v)}
        onOpenPublish={() => setPublishOpen(true)}
        activeTripCount={bookings.length}
      />

      <main id="main" tabIndex={-1} className="relative z-[1] flex-1 focus:outline-none">
        <Suspense fallback={fallback}>{content}</Suspense>
      </main>

      <Footer onNavigate={navigate} onOpenPublish={() => setPublishOpen(true)} onSelectCorridor={searchCorridor} corridors={corridors} />

      <BottomNav activeView={view} onNavigate={(v) => navigate(v)} hasActiveTrip={bookings.length > 0} />

      {toast && !selectedRideId && !publishOpen && !passBooking && !chatRideId ? (
        <div role="status" aria-live="polite" className="fixed z-[120] left-4 right-4 sm:left-auto sm:right-6 bottom-[84px] lg:bottom-6 sm:w-[400px]">
          <SwipeToast
            key={toast}
            inline
            open
            title="Listo"
            description={toast}
            icon={<CheckCircle2 className="w-5 h-5 text-success" aria-hidden="true" />}
            background="#141416"
            color="#ffffff"
            fuseColor="#21d2ed"
            width={400}
            radius={14}
            duration={4500}
            closeButton
            onClose={() => setToast(null)}
          />
        </div>
      ) : null}

      <Suspense fallback={null}>
        {selectedRideId ? (
          <RideDetailModal
            ride={rideById(selectedRideId)}
            defaultSeats={query.seats}
            onClose={() => setSelectedRideId(null)}
            onConfirmBooking={confirmBooking}
            onOpenChat={(r) => {
              setSelectedRideId(null);
              setChatRideId(r.id);
            }}
          />
        ) : null}
        {publishOpen ? <PublishRideWizardModal isOpen onClose={() => setPublishOpen(false)} onPublish={publishRide} /> : null}
        {passBooking ? (
          <BoardingPassModal
            booking={{ ...passBooking, ride: rideById(passBooking.ride.id) ?? passBooking.ride }}
            onClose={() => setPassBookingId(null)}
            onOpenTrip={openTrip}
            onOpenChat={(r) => {
              setPassBookingId(null);
              setChatRideId(r.id);
            }}
          />
        ) : null}
        {chatRideId ? <RideChatModal ride={rideById(chatRideId)} onClose={() => setChatRideId(null)} /> : null}
      </Suspense>
    </div>
  );
}

export default App;
