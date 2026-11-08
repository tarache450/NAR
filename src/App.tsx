import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AmbientBackground } from './components/AmbientBackground';
import type { SearchQuery } from './components/SearchPanel';
import { INITIAL_RIDES } from './data/mockData';
import type { Ride } from './types';
import { corridorsFrom } from './lib/rides';
import { hashFor, viewFromHash, type ViewType } from './lib/nav';
import SwipeToast from './components/bits/SwipeToast';
import LatticeLoader from './components/bits/LatticeLoader';
import { useAuth } from './context/AuthContext';
import { getLiveRides } from './lib/ridesApi';

const SearchView = lazy(() => import('./components/SearchView').then((m) => ({ default: m.SearchView })));
const CorridorsView = lazy(() => import('./components/CorridorsView').then((m) => ({ default: m.CorridorsView })));
const ProfileView = lazy(() => import('./components/ProfileView').then((m) => ({ default: m.ProfileView })));
const RideDetailModal = lazy(() => import('./components/RideDetailModal').then((m) => ({ default: m.RideDetailModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));

const EMPTY_QUERY: SearchQuery = { origin: '', destination: '', day: 'today', seats: 1 };

export function App() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>(INITIAL_RIDES);
  const [view, setView] = useState<ViewType>(() => viewFromHash(window.location.hash));
  const [query, setQuery] = useState<SearchQuery>(EMPTY_QUERY);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Sincronizar viajes de referencia desde Supabase si existen
  useEffect(() => {
    let isMounted = true;
    getLiveRides().then((live) => {
      if (isMounted && live.length > 0) {
        setRides(live);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
          onOpenPublish={() => setAuthOpen(true)}
        />
      );
      break;
    case 'corridors':
      content = (
        <CorridorsView
          corridors={corridors}
          onSelectCorridor={searchCorridor}
          onSelectRide={(r) => setSelectedRideId(r.id)}
          onOpenPublish={() => setAuthOpen(true)}
        />
      );
      break;
    case 'profile':
      content = (
        <ProfileView
          rides={rides}
          bookings={[]}
          onSelectRide={(r) => setSelectedRideId(r.id)}
          onOpenPass={() => {}}
          onOpenPublish={() => setAuthOpen(true)}
          onOpenTrip={() => {}}
          onResetDemo={() => {
            setRides(INITIAL_RIDES);
            setToast('Datos de referencia restablecidos.');
          }}
        />
      );
      break;
    case 'explore':
    default:
      content = (
        <HomeView
          rides={rides}
          corridors={corridors}
          places={places}
          query={query}
          onQueryChange={setQuery}
          onSelectRide={(r) => setSelectedRideId(r.id)}
          onSearch={(q) => {
            setQuery(q);
            navigate('search');
          }}
          onSelectCorridor={searchCorridor}
          onOpenPublish={() => setAuthOpen(true)}
          onBrowseAll={() => navigate('search')}
          activeBooking={null}
          onOpenPass={() => {}}
          onTrackBooking={() => {}}
        />
      );
      break;
  }

  return (
    <div className="relative min-h-screen bg-bg text-fg flex flex-col font-sans selection:bg-accent/25 selection:text-white">
      <AmbientBackground view={view} />

      <a href="#main" className="skip-link">
        Saltar al contenido principal
      </a>

      <Navbar
        activeView={view}
        onNavigate={(v) => navigate(v)}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <main id="main" tabIndex={-1} className="relative z-[1] flex-1 focus:outline-none">
        <Suspense fallback={fallback}>{content}</Suspense>
      </main>

      <Footer
        onNavigate={navigate}
        onOpenPublish={() => setAuthOpen(true)}
        onSelectCorridor={searchCorridor}
        corridors={corridors}
      />

      <BottomNav
        activeView={view}
        onNavigate={(v) => navigate(v)}
      />

      {toast ? (
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
            onConfirmBooking={() => {}}
            onOpenChat={() => {}}
            onOpenAuth={() => setAuthOpen(true)}
          />
        ) : null}
        {authOpen ? <AuthModal isOpen onClose={() => setAuthOpen(false)} /> : null}
      </Suspense>
    </div>
  );
}

export default App;
