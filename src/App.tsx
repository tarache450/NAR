/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { INITIAL_RIDES, POPULAR_ROUTES } from './data/mockData';
import { Ride } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { HeroSearch } from './components/HeroSearch';
import { HowItWorksVisual } from './components/HowItWorksVisual';
import { PopularRoutesSection } from './components/PopularRoutesSection';
import { RideCard } from './components/RideCard';
import { SearchView } from './components/SearchView';
import { ProfileView } from './components/ProfileView';
import { TrustSafetySection } from './components/TrustSafetySection';
import { LiveTelemetryView } from './components/LiveTelemetryView';
import { RideDetailModal } from './components/RideDetailModal';
import { PublishRideWizardModal } from './components/PublishRideWizardModal';
import { DigitalBoardingPassModal } from './components/DigitalBoardingPassModal';
import { RideChatModal } from './components/RideChatModal';
import { Logo } from './components/Logo';
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
  Wifi,
  BatteryMedium
} from 'lucide-react';

export default function App() {
  const [rides, setRides] = useState<Ride[]>(INITIAL_RIDES);
  const [popularRoutes] = useState(POPULAR_ROUTES);
  
  // Navigation & View state
  const [mode, setMode] = useState<'request' | 'offer'>('request');
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [isMobileMockup, setIsMobileMockup] = useState<boolean>(false);

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
  const [chatRide, setChatRide] = useState<Ride | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

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
    handleSearch();
  };

  // Filter rides based on search query
  const filteredRides = rides.filter(ride => {
    const matchesOrigin = !origin.trim() || 
      ride.origin.name.toLowerCase().includes(origin.toLowerCase()) ||
      ride.origin.city.toLowerCase().includes(origin.toLowerCase());

    const matchesDest = !destination.trim() ||
      ride.destination.name.toLowerCase().includes(destination.toLowerCase()) ||
      ride.destination.city.toLowerCase().includes(destination.toLowerCase()) ||
      ride.waypoints.some(wp => wp.name.toLowerCase().includes(destination.toLowerCase()) || wp.city.toLowerCase().includes(destination.toLowerCase()));

    const matchesCityFilter = cityFilter === 'todos' || 
      ride.origin.city.toLowerCase().includes(cityFilter.toLowerCase()) ||
      ride.destination.city.toLowerCase().includes(cityFilter.toLowerCase());

    const hasEnoughSeats = ride.availableSeats >= passengers;

    return matchesOrigin && matchesDest && matchesCityFilter && hasEnoughSeats;
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
    showToast(`¡Asiento reservado con éxito! Tu código QR está listo.`);
  };

  const handlePublishSuccess = (newRide: Ride) => {
    setRides(prev => [newRide, ...prev]);
    setIsPublishWizardOpen(false);
    showToast('¡Tu ruta ha sido publicada! Los pasajeros de la zona podrán verla.');
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

            {/* Popular Routes 1-click exploration */}
            <PopularRoutesSection
              routes={popularRoutes}
              onSelectRoute={handleSelectPopularRoute}
            />

            {/* Visual 3 Steps - No text overload */}
            <HowItWorksVisual />

            {/* Available Rides Section with Results */}
            <section ref={resultsRef} className="pt-4 scroll-mt-20">
              <div className="max-w-6xl mx-auto px-4">
                
                {/* Results Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                      RUTAS COMPATIBLES EN EL SALVADOR · NAR
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                      Conductores que ya van por tu camino
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Aprovecha asientos en trayectos existentes y viaja sin desvíos de taxi ni paradas de bus
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
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
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
                      ¿Vas a viajar en tu auto? Publica tus asientos y comparte la gasolina con personas de tu zona.
                    </p>
                    <button
                      onClick={() => setIsPublishWizardOpen(true)}
                      className="mt-5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-[#00c29a] hover:from-cyan-300 hover:to-teal-300 shadow-md shadow-cyan-500/20"
                    >
                      Publicar Mi Asiento Ahora
                    </button>
                  </div>
                )}

              </div>
            </section>

            {/* Trust and Safety Section */}
            <TrustSafetySection />

          </div>
        )}

        {/* TAB 2: BUSCADOR AVANZADO */}
        {activeTab === 'search' && (
          <SearchView
            rides={rides}
            onSelectRide={(r) => setDetailRide(r)}
            onOpenLiveTelemetry={(r) => {
              setActiveTelemetryRide(r);
              setActiveTab('telemetry');
            }}
            initialOrigin={origin}
            initialDestination={destination}
          />
        )}

        {/* TAB 3: TELEMETRÍA EN VIVO */}
        {activeTab === 'telemetry' && (
          <div className="py-6 px-4">
            <LiveTelemetryView
              ride={activeTelemetryRide}
              onOpenPass={() => setPassRide(activeTelemetryRide)}
              onOpenChat={() => setChatRide(activeTelemetryRide)}
            />
          </div>
        )}

        {/* TAB 4: PERFIL & CONFIANZA */}
        {activeTab === 'profile' && (
          <ProfileView
            onOpenPublish={() => setIsPublishWizardOpen(true)}
            onExploreRides={() => setActiveTab('explore')}
          />
        )}

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col font-body antialiased pb-20 md:pb-0 selection:bg-cyan-500/30 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#161d2d] border border-cyan-400 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        mode={mode}
        onModeChange={(m) => {
          setMode(m);
          if (m === 'offer') setIsPublishWizardOpen(true);
        }}
        activeView={activeTab}
        onViewChange={(tab) => {
          if (tab === 'publish') {
            setIsPublishWizardOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenPublish={() => setIsPublishWizardOpen(true)}
        isMobileMockup={isMobileMockup}
        onToggleMockup={() => setIsMobileMockup(!isMobileMockup)}
      />

      {/* Main Body */}
      <main className="flex-1 w-full">
        {isMobileMockup ? (
          /* Phone Frame Mockup View (Ref 1 & 2 Style) */
          <div className="flex flex-col items-center justify-center my-4 px-2">
            
            <div className="mb-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Simulador Móvil NAR (390 x 844 px)</span>
              <button 
                onClick={() => setIsMobileMockup(false)}
                className="text-cyan-300 hover:underline ml-2"
              >
                Pantalla completa
              </button>
            </div>

            <div className="w-[390px] h-[844px] bg-[#0c1017] border-4 border-slate-700 rounded-[48px] shadow-2xl shadow-black relative overflow-hidden flex flex-col ring-1 ring-white/10">
              
              {/* Dynamic Island / Top Bezel */}
              <div className="h-10 bg-[#0c1017] px-6 flex items-center justify-between z-30 shrink-0 border-b border-white/5">
                <span className="text-[12px] font-mono text-white font-semibold">07:15</span>
                <div className="w-24 h-4 bg-black rounded-full mx-auto" />
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <BatteryMedium className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {renderContent()}
              </div>

              {/* Bottom Mobile Bar inside chassis */}
              <div className="h-14 bg-[#131722]/95 border-t border-white/10 px-3 flex items-center justify-around z-30 shrink-0">
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] ${
                    activeTab === 'explore' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Logo size="sm" showWordmark={false} />
                  <span>Rutas</span>
                </button>

                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] ${
                    activeTab === 'search' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>

                <button
                  onClick={() => setIsPublishWizardOpen(true)}
                  className="w-10 h-10 -mt-5 rounded-full bg-cyan-400 border-2 border-[#0c1017] flex items-center justify-center text-slate-950 shadow-lg"
                  aria-label="Publicar"
                >
                  <Car className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] ${
                    activeTab === 'telemetry' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>En Vivo</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] ${
                    activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Perfil</span>
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* Full Viewport Clean Experience */
          <div>
            {renderContent()}
          </div>
        )}
      </main>

      {/* Floating Bottom Nav for Real Mobile Devices (< 768px) */}
      {!isMobileMockup && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'publish') {
              setIsPublishWizardOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          hasActiveTrip={activeTelemetryRide.status === 'in_progress'}
        />
      )}

      {/* Ride Detail & Booking Modal */}
      {detailRide && (
        <RideDetailModal
          ride={detailRide}
          onClose={() => setDetailRide(null)}
          onBookSuccess={handleBookSuccess}
          onOpenLiveView={(ride) => {
            setActiveTelemetryRide(ride);
            setActiveTab('telemetry');
          }}
        />
      )}

      {/* Driver Wizard Progressive Publish Modal (Ref 4 Style) */}
      {isPublishWizardOpen && (
        <PublishRideWizardModal
          onClose={() => setIsPublishWizardOpen(false)}
          onPublish={handlePublishSuccess}
        />
      )}

      {/* Digital Boarding Pass Modal */}
      {passRide && (
        <DigitalBoardingPassModal
          ride={passRide}
          seatNumber={passSeatCount}
          onClose={() => setPassRide(null)}
        />
      )}

      {/* Encrypted In-Ride Chat Modal */}
      {chatRide && (
        <RideChatModal
          ride={chatRide}
          onClose={() => setChatRide(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 lg:px-8 bg-[#090c13] text-xs text-slate-400 mt-16 mb-16 md:mb-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" showWordmark={true} />
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">NAR · Red de viajes compartidos en El Salvador</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 flex-wrap justify-center">
            <span className="text-emerald-400">✓ DUI Verificado</span>
            <span>·</span>
            <span className="text-cyan-300">Aporte Justo en USD</span>
            <span>·</span>
            <span>Carretera Los Chorros & Panamericana</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
