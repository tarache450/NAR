/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { INITIAL_RIDES, POPULAR_ROUTES } from './data/mockData';
import { Ride } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { HeroSearch } from './components/HeroSearch';
import { HowItWorksVisual } from './components/HowItWorksVisual';
import { PopularRoutesSection } from './components/PopularRoutesSection';
import { RideCard } from './components/RideCard';
import { TrustSafetySection } from './components/TrustSafetySection';
import { QuestionsSection } from './components/QuestionsSection';
import { Logo } from './components/Logo';
import { locationMatches } from './lib/locations';

const SearchView = lazy(() => import('./components/SearchView').then(m => ({ default: m.SearchView })));
const LiveTelemetryView = lazy(() => import('./components/LiveTelemetryView').then(m => ({ default: m.LiveTelemetryView })));
const PublishRideWizardModal = lazy(() => import('./components/PublishRideWizardModal').then(m => ({ default: m.PublishRideWizardModal })));
const DigitalBoardingPassModal = lazy(() => import('./components/DigitalBoardingPassModal').then(m => ({ default: m.DigitalBoardingPassModal })));
const ProfileView = lazy(() => import('./components/ProfileView').then(m => ({ default: m.ProfileView })));
const RideDetailModal = lazy(() => import('./components/RideDetailModal').then(m => ({ default: m.RideDetailModal })));
import { 
  Search, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Car, 
  Radio, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function App() {
  const [rides, setRides] = useState<Ride[]>(INITIAL_RIDES);
  const [popularRoutes] = useState(POPULAR_ROUTES);
  
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<TabType>('explore');

  // Search parameters
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState('hoy');
  const [passengers, setPassengers] = useState<number>(1);
  const [cityFilter, setCityFilter] = useState<string>('todos');

  // Modals
  const [detailRide, setDetailRide] = useState<Ride | null>(null);
  const [activeTelemetryRide, setActiveTelemetryRide] = useState<Ride>(
    INITIAL_RIDES.find(r => r.status === 'in_progress') || INITIAL_RIDES[0]
  );
  const [isPublishWizardOpen, setIsPublishWizardOpen] = useState(false);
  const [passRide, setPassRide] = useState<Ride | null>(null);
  const [passSeatCount, setPassSeatCount] = useState<number>(1);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.nar-reveal'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        element.classList.remove('nar-reveal-pending');
        element.classList.add('nar-reveal-visible');
        observer.unobserve(element);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    elements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
        element.classList.add('nar-reveal-visible');
      } else {
        element.classList.add('nar-reveal-pending');
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = () => {
    setActiveTab('explore');
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectPopularRoute = (orig: string, dest: string) => {
    setOrigin(orig);
    setDestination(dest);
    setCityFilter('todos');
    handleSearch();
  };

  // Filter rides based on search query
  const filteredRides = rides.filter(ride => {
    const matchesOrigin = locationMatches(origin, [ride.origin]);
    const matchesDest = locationMatches(destination, [...ride.waypoints, ride.destination]);

    const matchesCityFilter = cityFilter === 'todos' || 
      ride.origin.city.toLowerCase().includes(cityFilter.toLowerCase()) ||
      ride.destination.city.toLowerCase().includes(cityFilter.toLowerCase());

    const hasEnoughSeats = ride.availableSeats >= passengers;
    const matchesDate = selectedDate === 'hoy'
      ? ride.date.startsWith('Hoy') || ride.date === new Date().toLocaleDateString('sv-SE')
      : ride.date === selectedDate;

    return matchesOrigin && matchesDest && matchesCityFilter && hasEnoughSeats && matchesDate;
  });

  const handleBookSuccess = (bookedRide: Ride, seatCount: number) => {
    setRides(prev => prev.map(r => {
      if (r.id === bookedRide.id) {
        return {
          ...r,
          availableSeats: Math.max(0, r.availableSeats - seatCount),
          passengers: [
            ...r.passengers,
            {
              id: `pas-${Date.now()}`,
              name: 'Tú (Pasajero)',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
              seatNumber: r.passengers.length + 1,
              pickupPoint: r.origin.name,
              status: 'confirmed',
            }
          ]
        };
      }
      return r;
    }));

    setDetailRide(null);
    setPassSeatCount(seatCount);
    setPassRide(bookedRide);
    setActiveTelemetryRide(bookedRide);
    showToast('Solicitud simulada en esta página. No se notificó a ningún conductor.');
  };

  const handlePublishSuccess = (newRide: Ride) => {
    setRides(prev => [newRide, ...prev]);
    setIsPublishWizardOpen(false);
    showToast('Publicación de ejemplo añadida solo durante esta sesión.');
    setActiveTab('explore');
    handleSearch();
  };

  // Main Page Content depending on active tab
  const renderContent = () => {
    return (
      <div className="w-full">
        
        {/* TAB 1: EXPLORAR / INICIO */}
        {activeTab === 'explore' && (
          <div className="space-y-10 md:space-y-14">
            
            {/* Hero with Visual Search Box and Interactive Route Corridor */}
            <HeroSearch
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onSwapLocations={handleSwapLocations}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              passengers={passengers}
              onPassengersChange={setPassengers}
              onSearch={handleSearch}
              onOpenPublish={() => setIsPublishWizardOpen(true)}
            />

            <aside className="mx-auto -mt-5 max-w-6xl px-4" role="note">
              <div className="flex flex-col gap-3 rounded-2xl border border-[#9cb3ff]/20 bg-[#101a2b] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-3xl text-sm leading-relaxed text-slate-300"><strong className="text-white">Estás viendo una demostración.</strong> Las rutas, perfiles y precios son ilustrativos; no hay reservas, pagos ni conductores conectados.</p>
                <a href="#preguntas-frecuentes" className="shrink-0 text-sm font-bold text-[#b8c6ff] hover:text-white">Qué está disponible <span aria-hidden="true">→</span></a>
              </div>
            </aside>

            {/* Available Rides Section with Results */}
            <section ref={resultsRef} className="nar-reveal pt-4 scroll-mt-20">
              <div className="max-w-6xl mx-auto px-4">
                
                {/* Results Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9cb3ff] block mb-1">
                      RUTAS COMPATIBLES EN EL SALVADOR · NAR
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                      Rutas para comparar en tu próximo viaje
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Filtra por ciudad y revisa horarios, paradas y aportes ilustrativos
                    </p>
                  </div>

                  {/* Quick City Filter Tags */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {[
                      { label: 'Todos', val: 'todos' },
                      { label: 'Santa Ana', val: 'santa ana' },
                      { label: 'El Tunco / Playa', val: 'libertad' },
                      { label: 'San Miguel', val: 'san miguel' },
                      { label: 'Sonsonate', val: 'sonsonate' },
                    ].map(f => (
                      <button
                        key={f.val}
                        onClick={() => setCityFilter(f.val)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                          cityFilter === f.val
                            ? 'bg-[#315cff] text-slate-950 font-bold shadow-md'
                            : 'bg-[#131722] text-slate-400 hover:text-white border border-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ride Cards Grid */}
                {filteredRides.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                    {filteredRides.map(ride => (
                      <RideCard
                        key={ride.id}
                        ride={ride}
                        onSelect={(r) => setDetailRide(r)}
                        onOpenLiveTelemetry={(r) => {
                          setActiveTelemetryRide(r);
                          setActiveTab('telemetry');
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-10 sm:p-14 text-center bg-[#131722] border border-white/10 rounded-3xl">
                    <Car className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
                    <h3 className="text-lg font-display font-bold text-white">
                      No hay rutas para este filtro en este momento
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
                      Prueba el formulario para explorar el flujo. La publicación solo aparecerá en esta sesión de demostración.
                    </p>
                    <button
                      onClick={() => setIsPublishWizardOpen(true)}
                      className="mt-5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#315cff] to-[#00a89d] hover:from-[#4d77ff] hover:to-[#22c4b7] shadow-md shadow-[#315cff]/20"
                    >
                      Probar formulario de publicación
                    </button>
                  </div>
                )}

              </div>
            </section>

            {/* Popular Routes 1-click exploration */}
            <PopularRoutesSection
              routes={popularRoutes}
              onSelectRoute={handleSelectPopularRoute}
            />

            {/* Visual 3 Steps - No text overload */}
            <HowItWorksVisual />

            {/* Trust and Safety Section */}
            <TrustSafetySection />
            <QuestionsSection />

          </div>
        )}

        {/* TAB 2: BUSCADOR AVANZADO */}
        {activeTab === 'search' && (
          <Suspense fallback={<div className="p-8 text-slate-400">Cargando buscador…</div>}><SearchView
            rides={rides}
            onSelectRide={(r) => setDetailRide(r)}
            onOpenLiveTelemetry={(r) => {
              setActiveTelemetryRide(r);
              setActiveTab('telemetry');
            }}
            initialOrigin={origin}
            initialDestination={destination}
          /></Suspense>
        )}

        {/* TAB 3: TELEMETRÍA EN VIVO */}
        {activeTab === 'telemetry' && (
          <div className="py-6 px-4">
            <Suspense fallback={<div className="p-8 text-slate-400">Cargando ruta…</div>}><LiveTelemetryView
              ride={activeTelemetryRide}
              onBack={() => setActiveTab('explore')}
            /></Suspense>
          </div>
        )}

        {/* TAB 4: PERFIL & CONFIANZA */}
        {activeTab === 'profile' && (
          <Suspense fallback={<div className="p-8 text-slate-400">Cargando perfil…</div>}><ProfileView
            onOpenPublish={() => setIsPublishWizardOpen(true)}
            onExploreRides={() => setActiveTab('explore')}
          /></Suspense>
        )}

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col font-body antialiased pb-20 md:pb-0 selection:bg-[#315cff]/30 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed top-4 right-4 z-50 bg-[#161d2d] border border-[#315cff] text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#9cb3ff] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeView={activeTab}
        onViewChange={(tab) => {
          if (tab === 'publish') {
            setIsPublishWizardOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenPublish={() => setIsPublishWizardOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 w-full">
        <div>{renderContent()}</div>
      </main>

      {/* Floating Bottom Nav for Real Mobile Devices (< 768px) */}
      <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'publish') {
              setIsPublishWizardOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          hasActiveTrip={false}
      />

      {/* Ride Detail & Booking Modal */}
      {detailRide && (
        <Suspense fallback={null}><RideDetailModal
          ride={detailRide}
          onClose={() => setDetailRide(null)}
          onBookSuccess={handleBookSuccess}
        /></Suspense>
      )}

      {/* Driver Wizard Progressive Publish Modal (Ref 4 Style) */}
      {isPublishWizardOpen && (
        <Suspense fallback={null}><PublishRideWizardModal
          onClose={() => setIsPublishWizardOpen(false)}
          onPublish={handlePublishSuccess}
        /></Suspense>
      )}

      {/* Digital Boarding Pass Modal */}
      {passRide && (
        <Suspense fallback={null}><DigitalBoardingPassModal
          ride={passRide}
          seatNumber={passSeatCount}
          onClose={() => setPassRide(null)}
        /></Suspense>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 lg:px-8 bg-[#090c13] text-xs text-slate-400 mt-16 mb-16 md:mb-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" showWordmark={true} />
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">NAR · Prototipo de viajes compartidos para El Salvador</span>
          </div>
          <a href={`${import.meta.env.BASE_URL}como-funciona/`} className="text-sm text-slate-300 underline decoration-white/20 underline-offset-4 hover:text-white">Cómo funciona</a>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 flex-wrap justify-center">
            <span>Datos de viaje de ejemplo</span>
            <span>·</span>
            <span className="text-[#c4cfff]">Sin reservas ni pagos reales</span>
            <span>·</span>
            <span>Carretera Los Chorros & Panamericana</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
