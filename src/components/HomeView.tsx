import React, { lazy, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Compass,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  Briefcase,
  Car,
  Users,
  ChevronRight,
  Check,
} from 'lucide-react';
import type { Booking, Ride } from '../types';
import {
  Decor,
  useRichEffects,
  AccordionItem,
  Badge,
  Button,
  EmptyState,
  Eyebrow,
  Reveal,
  SectionHeader,
  Segmented,
  ShaderBars,
  cx,
} from './ui/primitives';
import { RideCard } from './RideCard';
import { SearchPanel, type SearchQuery } from './SearchPanel';
import { clock24, minutesOfDay, usd, type Corridor } from '../lib/rides';
import { FAQ_ITEMS } from '../data/content';
import BlurText from './bits/BlurText';
import RotatingText from './bits/RotatingText';
import ShinyText from './bits/ShinyText';
import CountUp from './bits/CountUp';
import SpotlightCard from './bits/SpotlightCard';
import Magnet from './bits/Magnet';
import ClickSpark from './bits/ClickSpark';
import LogoLoop from './bits/LogoLoop';
import GradientText from './bits/GradientText';
import BorderGlow from './bits/BorderGlow';
import type { CardSwapHandle } from './bits/CardSwap';

// Efectos pesados o fuera de la primera pantalla: se cargan aparte
const Aurora = lazy(() => import('./bits/Aurora'));
const Noise = lazy(() => import('./bits/Noise'));
const ScrollReveal = lazy(() => import('./bits/ScrollReveal'));
const ScrollVelocity = lazy(() => import('./bits/ScrollVelocity'));
const CardSwap = lazy(() => import('./bits/CardSwap'));
const SwapCard = lazy(() => import('./bits/CardSwap').then((m) => ({ default: m.Card })));

const BRAND = ['#2d62ff', '#21d2ed', '#00c29a'];

const SPOT = { spotlightColor: 'rgba(33, 210, 237, 0.22)', intensity: 0.12, spotlightSize: 320, theme: 'dark' as const };

interface HomeViewProps {
  rides: Ride[];
  corridors: Corridor[];
  places: string[];
  query: SearchQuery;
  onQueryChange: (q: SearchQuery) => void;
  onSearch: (q: SearchQuery) => void;
  onSelectRide: (ride: Ride) => void;
  onOpenPublish: () => void;
  onSelectCorridor: (origin: string, destination: string) => void;
  onBrowseAll: () => void;
  activeBooking: Booking | null;
  onOpenPass: () => void;
  onTrackBooking: () => void;
}

export const HomeView: React.FC<HomeViewProps> = (p) => {
  const sample = p.rides[0];
  return (
    <>
      <Hero {...p} />
      <MeetingPointsStrip rides={p.rides} />
      {p.activeBooking ? (
        <ActiveBookingBar booking={p.activeBooking} onOpenPass={p.onOpenPass} onTrack={p.onTrackBooking} />
      ) : null}
      <TodaySection rides={p.rides} onSelectRide={p.onSelectRide} onBrowseAll={p.onBrowseAll} onOpenPublish={p.onOpenPublish} />
      {sample ? <FeaturesSection ride={sample} /> : null}
      <Manifesto />
      <AudienceSection onSearch={p.onBrowseAll} onOpenPublish={p.onOpenPublish} />
      <HowItWorks />
      <SafetySection onBrowseAll={p.onBrowseAll} />
      <CorridorsSection corridors={p.corridors} onSelectCorridor={p.onSelectCorridor} />
      <CorridorBand corridors={p.corridors} />
      <FaqSection />
      <ClosingCta onBrowseAll={p.onBrowseAll} onOpenPublish={p.onOpenPublish} />
    </>
  );
};

/* ── Hero ───────────────────────────────────────────────────────────────── */

const Hero: React.FC<HomeViewProps> = ({ query, onQueryChange, onSearch, places, onOpenPublish, rides, corridors }) => {
  const free = rides.reduce((n, r) => n + Math.max(0, r.availableSeats), 0);
  const destinations = useMemo(() => [...new Set(corridors.map((c) => c.destination))], [corridors]);
  const rich = useRichEffects();
  return (
    <section className="relative overflow-hidden pt-[104px] md:pt-[148px] pb-[140px] md:pb-[220px]" aria-labelledby="hero-title">
      <div className="absolute inset-x-0 top-0 h-[60%] pointer-events-none opacity-60 [mask-image:linear-gradient(to_bottom,#000_35%,transparent)]" aria-hidden="true">
        <Decor when={rich}>
          <Aurora colorStops={BRAND} amplitude={0.9} blend={0.55} speed={0.6} opacity={0.55} />
        </Decor>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[55%] md:h-[72%] pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,#000_45%,#000_88%,transparent)]" aria-hidden="true">
        <ShaderBars bias={0.8} density={7} />
      </div>
      <Decor when={rich}>
        <Noise opacity={0.05} fps={12} blendMode="overlay" className="pointer-events-none" />
      </Decor>

      <div className="container-nar relative flex flex-col items-center text-center">
        <Reveal>
          <p className="inline-flex items-center gap-2 h-8 pl-1 pr-3 rounded-full border border-line-strong bg-surface/70 text-[13px] whitespace-nowrap">
            <span className="h-6 px-2 rounded-full bg-accent text-ink text-[11px] font-medium inline-flex items-center">
              El Salvador
            </span>
            <ShinyText color="#ffffff" shineColor="#21d2ed" speed={3.2} delay={1.2} className="tabular">
              {free} asientos libres<span className="hidden sm:inline"> en {rides.length} salidas programadas</span>
            </ShinyText>
          </p>
        </Reveal>

        <h1 id="hero-title" className="t-h1 mt-6 max-w-[900px] flex flex-col items-center">
          <BlurText text="Tu ruta diaria," animateBy="words" direction="bottom" delay={90} trigger="load" className="justify-center" />
          <span className="flex flex-wrap items-baseline justify-center gap-x-[0.28em]">
            <GradientText colors={BRAND} animationSpeed={6} className="!inline-flex">
              compartida
            </GradientText>
            <span className="text-muted">hasta</span>
            {destinations.length > 1 ? (
              <RotatingText
                texts={destinations}
                rotationInterval={3200}
                animatePresenceMode="wait"
                staggerDuration={0.015}
                staggerFrom="first"
                mainClassName="inline-flex overflow-hidden pb-[0.08em] text-accent"
                splitLevelClassName="overflow-hidden"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            ) : (
              <span className="text-accent">{destinations[0] ?? 'tu destino'}</span>
            )}
          </span>
        </h1>

        <Reveal delay={160}>
          <p className="t-lead text-fg/90 mt-5 max-w-[560px]">
            Reserva un asiento con conductores verificados que ya van por tu mismo corredor. Aporte fijo en dólares,
            paradas acordadas y pase con PIN.
          </p>
        </Reveal>

        <Reveal delay={240} className="w-full max-w-[1080px] mt-10">
          <ClickSpark sparkColor="#21d2ed" sparkCount={10} sparkRadius={22} sparkSize={9} duration={420}>
            <SearchPanel value={query} onChange={onQueryChange} onSubmit={onSearch} places={places} submitLabel="Buscar viaje" highlight />
          </ClickSpark>
          <p className="mt-5 t-small text-muted">
            ¿Vas en carro por una de estas rutas?{' '}
            <button type="button" onClick={onOpenPublish} className="text-fg underline underline-offset-4 decoration-white/30 hover:decoration-white">
              Publica tus asientos libres
            </button>
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ── Franja de puntos de encuentro (equivale a la franja de logos) ─────── */

const MeetingPointsStrip: React.FC<{ rides: Ride[] }> = ({ rides }) => {
  const points = useMemo(() => {
    const set = new Set<string>();
    rides.forEach((r) => [r.origin, ...r.waypoints, r.destination].forEach((w) => set.add(w.name)));
    return [...set];
  }, [rides]);
  return (
    <section aria-labelledby="puntos-title" className="py-14 border-y border-line">
      <div className="container-nar">
        <p id="puntos-title" className="t-lead text-muted text-center">
          Puntos de encuentro en las salidas de hoy
        </p>
      </div>
      <div className="mt-8 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <LogoLoop
          logos={points.map((p) => ({
            node: (
              <span className="flex items-center gap-2.5 text-[18px] font-medium tracking-[-0.03em] whitespace-nowrap text-fg">
                <MapPin className="w-4 h-4 text-accent" aria-hidden="true" />
                {p}
              </span>
            ),
            title: p,
          }))}
          speed={45}
          gap={48}
          logoHeight={28}
          pauseOnHover
          fadeOut={false}
          ariaLabel="Puntos de encuentro"
        />
      </div>
    </section>
  );
};

/* ── Reserva activa ─────────────────────────────────────────────────────── */

const ActiveBookingBar: React.FC<{ booking: Booking; onOpenPass: () => void; onTrack: () => void }> = ({
  booking,
  onOpenPass,
  onTrack,
}) => (
  <div className="container-nar mt-10">
    <BorderGlow colors={BRAND} glowColor="190 85 55" backgroundColor="#111113" borderRadius={16} glowRadius={28} animated>
    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 rounded-[12px] bg-accent-soft text-accent flex items-center justify-center shrink-0">
          <QrCode className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="t-tag text-accent">Reserva {booking.id}</p>
          <p className="text-[16px] mt-1.5 truncate">
            {booking.ride.origin.city} → {booking.ride.destination.city} · {booking.ride.departureTime}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onTrack}>
          Ver mi viaje
        </Button>
        <Button size="sm" onClick={onOpenPass}>
          Abrir pase
        </Button>
      </div>
    </div>
    </BorderGlow>
  </div>
);

/* ── Salidas de hoy ─────────────────────────────────────────────────────── */

type Slot = 'all' | 'am' | 'pm';

const TodaySection: React.FC<{
  rides: Ride[];
  onSelectRide: (r: Ride) => void;
  onBrowseAll: () => void;
  onOpenPublish: () => void;
}> = ({ rides, onSelectRide, onBrowseAll, onOpenPublish }) => {
  const [slot, setSlot] = useState<Slot>('all');
  const list = rides
    .filter((r) => r.date === 'Hoy')
    .filter((r) => {
      const h = minutesOfDay(r.departureTime) / 60;
      return slot === 'all' ? true : slot === 'am' ? h < 12 : h >= 12;
    })
    .sort((a, b) => minutesOfDay(a.departureTime) - minutesOfDay(b.departureTime));

  return (
    <section id="salidas" aria-labelledby="salidas-title" className="section">
      <div className="container-nar">
        <Reveal>
          <SectionHeader
            id="salidas-title"
            eyebrow="Salidas de hoy"
            title="Asientos libres hoy."
            muted="Elige uno y resérvalo."
            actions={
              <>
                <Segmented<Slot>
                  label="Filtrar por horario"
                  value={slot}
                  onChange={setSlot}
                  options={[
                    { value: 'all', label: 'Todo el día' },
                    { value: 'am', label: 'Mañana' },
                    { value: 'pm', label: 'Tarde' },
                  ]}
                />
                <Button variant="outline" onClick={onBrowseAll}>
                  Más filtros
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </>
            }
          />
        </Reveal>

        <div className="mt-12 md:mt-16">
          {list.length ? (
            <ul className="grid gap-4 md:grid-cols-2">
              {list.map((r, i) => (
                <Reveal as="li" key={r.id} delay={i * 60}>
                  <RideCard ride={r} onSelect={onSelectRide} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Compass className="w-5 h-5" />}
              title="No hay salidas en este horario"
              description="Prueba con otro horario o publica tu propio viaje para compartir gastos en tu corredor."
              actions={
                <>
                  <Button variant="outline" onClick={() => setSlot('all')}>
                    Ver todo el día
                  </Button>
                  <Button onClick={onOpenPublish}>Publicar viaje</Button>
                </>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
};

/* ── Qué hace NAR: 3 tarjetas con escena ────────────────────────────────── */

const Stage: React.FC<{ children: React.ReactNode; bias?: number }> = ({ children, bias = 0.8 }) => (
  <div className="relative aspect-[4/3.4] rounded-[12px] overflow-hidden bg-[#0b0b0d] border border-line">
    <div className="absolute inset-x-0 bottom-0 h-[70%]">
      <ShaderBars bias={bias} density={6} intensity={0.9} />
    </div>
    <div className="absolute inset-0 flex items-center justify-center p-5">{children}</div>
  </div>
);

const MiniPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="w-full max-w-[280px] rounded-[12px] border border-line-strong bg-surface/95 backdrop-blur p-4 text-left">
    <p className="text-[13px] mb-3">{title}</p>
    {children}
  </div>
);

const FeaturesSection: React.FC<{ ride: Ride }> = ({ ride }) => {
  const items = [
    {
      title: 'Busca tu corredor',
      text: 'Escribe de dónde sales y a dónde vas. NAR también encuentra los viajes que pasan por tu parada.',
      scene: (
        <MiniPanel title="Buscar viaje">
          <div className="space-y-2">
            <div className="h-9 rounded-[8px] bg-surface-2 border border-line px-3 flex items-center gap-2 text-[12px]">
              <MapPin className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              {ride.origin.city}
            </div>
            <div className="h-9 rounded-[8px] bg-surface-2 border border-line px-3 flex items-center gap-2 text-[12px]">
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              {ride.destination.city}
            </div>
            <div className="h-9 rounded-[8px] bg-white text-ink flex items-center justify-center gap-2 text-[12px] font-medium">
              <Search className="w-3.5 h-3.5" aria-hidden="true" /> Buscar
            </div>
          </div>
        </MiniPanel>
      ),
    },
    {
      title: 'Reserva con pase y PIN',
      text: 'Eliges punto de subida y asientos. Al confirmar recibes un pase digital con un PIN para abordar.',
      scene: (
        <MiniPanel title="Pase de abordaje">
          <div className="flex items-center gap-3">
            <div className="text-[12px] space-y-1">
              <p className="text-muted">PIN de abordaje</p>
              <p className="text-[32px] leading-none tracking-[0.12em] tabular">48-21</p>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-muted">
            {ride.origin.city} → {ride.destination.city} · {clock24(ride.departureTime)}
          </p>
        </MiniPanel>
      ),
    },
    {
      title: 'Sigue y comparte el viaje',
      text: 'Ve el avance por paradas, escribe al conductor y comparte los datos del vehículo con quien tú elijas.',
      scene: (
        <MiniPanel title="Mi viaje">
          <div className="space-y-2.5">
            {[ride.origin, ...ride.waypoints, ride.destination].slice(0, 3).map((w, i) => (
              <div key={w.id} className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2">
                  <span className={cx('w-2 h-2 rounded-full', i === 0 ? 'bg-accent' : 'bg-white/30')} />
                  {w.city}
                </span>
                <span className="text-muted tabular">{clock24(w.time)}</span>
              </div>
            ))}
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[45%] bg-accent rounded-full" />
            </div>
          </div>
        </MiniPanel>
      ),
    },
  ];
  return (
    <section aria-labelledby="que-hace-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="que-hace-title" eyebrow="Qué hace NAR" title="Todo tu trayecto," muted="en una sola app." />
        </Reveal>
        <div className="mt-12 md:mt-16 grid gap-4 md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 80}>
              <SpotlightCard {...SPOT} className="rounded-[16px] p-3 h-full flex flex-col">
                <article className="flex flex-col h-full">
                  <Stage bias={i === 1 ? 0.5 : i === 0 ? 0.2 : 0.85}>{it.scene}</Stage>
                  <div className="p-4 pt-6 flex flex-col gap-2">
                    <h3 className="t-h5">{it.title}</h3>
                    <p className="t-body text-muted">{it.text}</p>
                  </div>
                </article>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Para quién: pasajeros y conductores (patrón "use cases") ──────────── */

const AudienceSection: React.FC<{ onSearch: () => void; onOpenPublish: () => void }> = ({ onSearch, onOpenPublish }) => {
  const tabs = [
    {
      id: 'pasajeros',
      icon: Users,
      title: 'Para pasajeros',
      text: 'Viaja sentado en un asiento reservado hacia tu trabajo o universidad, con hora de salida y punto de subida acordados antes de salir.',
      points: [
        'Ves el aporte por asiento antes de reservar',
        'Eliges en qué parada subes',
        'Recibes un pase digital con PIN',
        'Puedes escribir al conductor antes de salir',
      ],
      cta: { label: 'Buscar un viaje', action: onSearch },
    },
    {
      id: 'conductores',
      icon: Car,
      title: 'Para conductores',
      text: 'Si ya haces el trayecto, publica tus asientos libres y divide la gasolina con personas que van por tu misma ruta.',
      points: [
        'Defines salida, parada intermedia y llegada',
        'Eliges cuántos asientos ofreces (1 a 4)',
        'Fijas el aporte por asiento en USD',
        'Confirmas a cada pasajero con su PIN al abordar',
      ],
      cta: { label: 'Publicar mis asientos', action: onOpenPublish },
    },
    {
      id: 'rutina',
      icon: Briefcase,
      title: 'Para la ruta de cada día',
      text: 'Muchos viajes se repiten: de lunes a viernes, o ciertos días de la semana. Lo verás indicado en cada salida.',
      points: [
        'Salidas recurrentes marcadas en cada tarjeta',
        'Mismo conductor y mismo punto de encuentro',
        'Filtro por mañana o tarde',
        'Búsqueda de hoy, mañana o cualquier día',
      ],
      cta: { label: 'Ver salidas recurrentes', action: onSearch },
    },
  ];
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const swapRef = useRef<CardSwapHandle>(null);

  return (
    <section aria-labelledby="para-quien-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="para-quien-title" eyebrow="Para quién" title="Una ruta compartida," muted="hecha a tu medida." />
        </Reveal>

        <Reveal className="mt-12 md:mt-16">
          <div className="card p-2 md:p-3 grid lg:grid-cols-[minmax(0,420px)_1fr] gap-3">
            <div role="tablist" aria-label="Tipos de uso" aria-orientation="vertical" className="flex flex-col gap-2">
              {tabs.map((t) => {
                const on = t.id === active;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    id={`tab-${t.id}`}
                    aria-selected={on}
                    aria-controls={`panel-${t.id}`}
                    onClick={() => setActive(t.id)}
                    className={cx(
                      'text-left rounded-[12px] border p-5 transition-colors',
                      on ? 'bg-surface-2 border-line-strong' : 'border-transparent hover:bg-white/[0.03]'
                    )}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <Icon className={cx('w-5 h-5', on ? 'text-accent' : 'text-muted')} aria-hidden="true" />
                        <span className="t-h5">{t.title}</span>
                      </span>
                      <ChevronRight className={cx('w-4 h-4 text-muted transition-transform', on && 'rotate-90 lg:rotate-0')} aria-hidden="true" />
                    </span>
                    {on ? <span className="block mt-3 t-body text-muted">{t.text}</span> : null}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`panel-${current.id}`}
              aria-labelledby={`tab-${current.id}`}
              className="relative min-h-[420px] rounded-[12px] overflow-hidden border border-line bg-[#0b0b0d]"
            >
              <div className="absolute inset-0">
                <ShaderBars bias={0.15} density={7} intensity={0.85} />
              </div>
              <div className="relative h-full min-h-[420px] flex items-center justify-center p-5 sm:p-8">
                <Decor>
                  <div className="relative w-full max-w-[420px] h-[300px] hidden sm:block">
                    <CardSwap
                      ref={swapRef}
                      width={380}
                      height={260}
                      cardDistance={36}
                      verticalDistance={40}
                      delay={5200}
                      pauseOnHover
                      theme="dark"
                      cardRadius={14}
                      onChange={(i: number) => setActive(tabs[i % tabs.length].id)}
                      onCardClick={(i: number) => setActive(tabs[i % tabs.length].id)}
                    >
                      {tabs.map((t) => (
                        <SwapCard key={t.id} className="p-6 flex flex-col border border-line-strong" style={{ background: '#141416' }}>
                          <p className="t-tag text-accent">{t.title}</p>
                          <ul className="mt-4 flex flex-col gap-2.5">
                            {t.points.map((pt) => (
                              <li key={pt} className="flex items-start gap-2.5 text-[15px]">
                                <Check className="w-4 h-4 mt-1 text-success shrink-0" aria-hidden="true" />
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </SwapCard>
                      ))}
                    </CardSwap>
                  </div>
                </Decor>
                {/* Versión estática y accesible (móvil y lectores de pantalla) */}
                <div className="sm:sr-only w-full rounded-[12px] border border-line-strong bg-surface/95 backdrop-blur p-6">
                  <p className="t-tag text-accent">{current.title}</p>
                  <ul className="mt-5 flex flex-col gap-3">
                    {current.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3 t-body">
                        <Check className="w-4 h-4 mt-1 text-success shrink-0" aria-hidden="true" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="absolute left-5 sm:left-8 bottom-5 sm:bottom-8">
                  <Button onClick={current.cta.action}>{current.cta.label}</Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ── Manifiesto: texto que se revela con el scroll ───────────────────────── */

const Manifesto: React.FC = () => (
  <section aria-label="Por qué NAR" className="section border-t border-line">
    <div className="container-nar max-w-[980px]">
      <Eyebrow>Por qué NAR</Eyebrow>
      <Decor
        fallback={
          <p className="t-h3 mt-6">
            Si ya vas por la ruta, los asientos vacíos pueden llevar a alguien más. Mismo trayecto, gasolina compartida y
            perfiles que puedes revisar antes de subir.
          </p>
        }
      >
        <ScrollReveal
          enableBlur
          baseOpacity={0.12}
          baseRotation={2}
          blurStrength={6}
          containerClassName="mt-6"
          textClassName="t-h3 !leading-[1.25]"
        >
          Si ya vas por la ruta, los asientos vacíos pueden llevar a alguien más. Mismo trayecto, gasolina compartida y
          perfiles que puedes revisar antes de subir.
        </ScrollReveal>
      </Decor>
    </div>
  </section>
);

/* ── Banda de corredores en movimiento ──────────────────────────────────── */

const CorridorBand: React.FC<{ corridors: Corridor[] }> = ({ corridors }) => {
  const names = corridors.map((c) => `${c.origin} → ${c.destination}`);
  if (!names.length) return null;
  return (
    <section aria-label="Corredores con salidas" className="py-10 md:py-14 border-t border-line overflow-hidden">
      <p className="sr-only">{names.join(', ')}</p>
      <div aria-hidden="true">
        <Decor>
          <ScrollVelocity
            texts={[names.join('   ·   '), [...names].reverse().join('   ·   ')]}
            velocity={40}
            fontSize="clamp(32px, 6vw, 72px)"
            fontWeight={400}
            color="#ffffff"
            outlineAlternate
            fadeEdges
            gap={48}
          />
        </Decor>
      </div>
    </section>
  );
};

/* ── Cómo funciona ──────────────────────────────────────────────────────── */

const HowItWorks: React.FC = () => {
  const steps = [
    { n: 'Paso 1', title: 'Busca tu ruta', text: 'Indica origen, destino, día y cuántas personas viajan.', Icon: Search },
    { n: 'Paso 2', title: 'Reserva tu asiento', text: 'Revisa paradas, conductor y vehículo. Elige dónde subes y confirma.', Icon: QrCode },
    { n: 'Paso 3', title: 'Muestra tu PIN', text: 'Al abordar, el conductor confirma tu pase. El aporte se acuerda en USD.', Icon: ShieldCheck },
  ];
  return (
    <section id="como-funciona" aria-labelledby="como-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="como-title" align="center" eyebrow="Cómo funciona" title="De la búsqueda al asiento" muted="en tres pasos." />
        </Reveal>
        <ol className="mt-12 md:mt-16 grid gap-4 md:grid-cols-3 md:items-start max-w-[1040px] mx-auto">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 90} className={cx(i === 1 && 'md:mt-12', i === 2 && 'md:mt-24')}>
              <SpotlightCard {...SPOT} className="rounded-[16px] p-6 min-h-[260px] flex flex-col">
                <p className="text-[16px] text-accent">{s.n}</p>
                <div className="flex-1 flex items-center justify-center py-8" aria-hidden="true">
                  <div className="w-14 h-14 rounded-[14px] surface-inset flex items-center justify-center">
                    <s.Icon className="w-6 h-6 text-fg" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="t-h5">{s.title}</h3>
                <p className="t-body text-muted mt-2">{s.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};

/* ── Seguridad: rejilla de funciones + tarjeta alta ─────────────────────── */

const SafetySection: React.FC<{ onBrowseAll: () => void }> = ({ onBrowseAll }) => {
  const items = [
    { Icon: ShieldCheck, title: 'Perfiles con DUI', text: 'Cada perfil muestra si su Documento Único de Identidad está verificado.' },
    { Icon: Phone, title: 'Teléfono +503', text: 'Conductores con número salvadoreño verificado para coordinar la subida.' },
    { Icon: Car, title: 'Vehículo y placa', text: 'Marca, modelo, color y placa visibles antes de reservar.' },
    { Icon: MapPin, title: 'Puntos públicos', text: 'Subidas en centros comerciales, gasolineras, pasarelas y bahías conocidas.' },
    { Icon: MessageSquare, title: 'Chat del viaje', text: 'Escribe al conductor para confirmar el punto exacto de encuentro.' },
    { Icon: Share2, title: 'Comparte tu viaje', text: 'Envía ruta, conductor y placa a un familiar desde “Mi viaje”.' },
  ];
  return (
    <section id="seguridad" aria-labelledby="seguridad-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="seguridad-title" eyebrow="Seguridad" title="Sabes con quién viajas" muted="antes de subir." />
        </Reveal>
        <div className="mt-12 md:mt-16 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((it, i) => (
              <Reveal key={it.title} delay={(i % 2) * 70}>
                <SpotlightCard {...SPOT} className="rounded-[16px] p-6 h-full flex flex-col gap-6">
                  <div className="w-10 h-10 rounded-[10px] surface-inset flex items-center justify-center">
                    <it.Icon className="w-[18px] h-[18px] text-fg" strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="t-h5">{it.title}</h3>
                    <p className="t-body text-muted">{it.text}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
          <Reveal className="h-full">
            <article className="card relative overflow-hidden h-full min-h-[420px] flex flex-col justify-end">
              <div className="absolute inset-x-0 top-0 h-[62%]">
                <ShaderBars bias={0.55} density={7} intensity={1.35} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface from-30% via-surface/40 via-50% to-transparent" />
              <div className="relative p-6 sm:p-8 flex flex-col gap-5">
                <h3 className="t-h3">
                  En caso de emergencia,
                  <br />
                  <span className="text-muted">911 a un toque.</span>
                </h3>
                <p className="t-body text-muted">
                  Desde “Mi viaje” tienes a mano los datos del vehículo y del conductor y un acceso directo para llamar al 911.
                </p>
                <div>
                  <Button onClick={onBrowseAll}>Buscar un viaje</Button>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ── Corredores (patrón de tarjetas de precio) ─────────────────────────── */

export const CorridorCards: React.FC<{ corridors: Corridor[]; onSelectCorridor: (o: string, d: string) => void }> = ({
  corridors,
  onSelectCorridor,
}) => (
  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {corridors.map((c, i) => {
      const live = c.rides.some((r) => r.status === 'in_progress');
      const free = c.rides.reduce((n, r) => n + Math.max(0, r.availableSeats), 0);
      return (
        <Reveal as="li" key={c.key} delay={i * 60}>
          <SpotlightCard {...SPOT} className={cx('rounded-[16px] p-6 h-full flex flex-col', live && 'ring-1 ring-accent/35')}>
            <div className="flex items-center justify-between gap-2 min-h-6">
              <p className="text-[14px] text-muted">{c.origin}</p>
              {live ? <Badge tone="accent">En ruta ahora</Badge> : null}
            </div>
            <h3 className="t-h4 mt-2">{c.destination}</h3>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-[44px] leading-none tracking-[-0.04em] tabular">{usd(c.minPrice)}</span>
              <span className="t-small text-muted">/ asiento</span>
            </p>
            <p className="t-small text-muted mt-3 min-h-[42px]">{c.via ? `Pasa por ${c.via}` : 'Ruta directa'}</p>
            <Button
              variant={live ? 'primary' : 'outline'}
              block
              className="mt-6"
              onClick={() => onSelectCorridor(c.origin, c.destination)}
            >
              Ver salidas
            </Button>
            <ul className="mt-6 pt-6 border-t border-line flex flex-col gap-3 t-body">
              <li className="flex justify-between gap-3">
                <span className="text-muted">Duración</span>
                <span className="tabular">{c.duration}</span>
              </li>
              {c.distanceKm > 0 ? (
                <li className="flex justify-between gap-3">
                  <span className="text-muted">Distancia</span>
                  <span className="tabular">{c.distanceKm} km</span>
                </li>
              ) : null}
              <li className="flex justify-between gap-3">
                <span className="text-muted">Salidas</span>
                <span className="tabular">{c.rides.length}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted">Asientos libres</span>
                <span className="tabular">{free}</span>
              </li>
            </ul>
          </SpotlightCard>
        </Reveal>
      );
    })}
  </ul>
);

const CorridorsSection: React.FC<{ corridors: Corridor[]; onSelectCorridor: (o: string, d: string) => void }> = ({
  corridors,
  onSelectCorridor,
}) => {
  const prices = corridors.map((c) => c.minPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return (
    <section id="corredores" aria-labelledby="corredores-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader
            id="corredores-title"
            align="center"
            eyebrow="Corredores"
            title="Aporte fijo por asiento,"
            muted="conocido antes de reservar."
            description={
              Number.isFinite(min)
                ? `En las salidas publicadas el aporte va de ${usd(min)} a ${usd(max)} USD según la distancia del corredor.`
                : undefined
            }
          />
        </Reveal>
        <div className="mt-12 md:mt-16">
          <CorridorCards corridors={corridors} onSelectCorridor={onSelectCorridor} />
        </div>
        <StatsRow corridors={corridors} />
      </div>
    </section>
  );
};

/* ── Cifras en vivo, calculadas con los viajes publicados ───────────────── */

const StatsRow: React.FC<{ corridors: Corridor[] }> = ({ corridors }) => {
  const rides = corridors.flatMap((c) => c.rides);
  const seats = rides.reduce((n, r) => n + Math.max(0, r.availableSeats), 0);
  const minPrice = Math.min(...corridors.map((c) => c.minPrice));
  const stats = [
    { value: rides.length, label: 'Salidas publicadas', decimals: 0, prefix: '' },
    { value: seats, label: 'Asientos libres ahora', decimals: 0, prefix: '' },
    { value: corridors.length, label: 'Corredores activos', decimals: 0, prefix: '' },
    { value: Number.isFinite(minPrice) ? minPrice : 0, label: 'Aporte más bajo por asiento', decimals: 2, prefix: '$' },
  ];
  return (
    <dl className="mt-16 grid grid-cols-2 lg:grid-cols-4 border-y border-line">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cx(
            'py-8 px-4 flex flex-col items-center text-center gap-2',
            i % 2 === 1 && 'border-l border-line',
            i >= 2 && 'border-t lg:border-t-0 border-line',
            i === 2 && 'lg:border-l'
          )}
        >
          <dt className="t-small text-muted order-2">{s.label}</dt>
          <dd className="text-[40px] md:text-[48px] leading-none tracking-[-0.04em] tabular order-1 text-brand">
            <CountUp to={s.value} decimals={s.decimals} prefix={s.prefix} duration={1.4} trigger="view" />
          </dd>
        </div>
      ))}
    </dl>
  );
};

/* ── FAQ ────────────────────────────────────────────────────────────────── */

const FaqSection: React.FC = () => {
  const half = Math.ceil(FAQ_ITEMS.length / 2);
  return (
    <section id="faq" aria-labelledby="faq-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="faq-title" eyebrow="Preguntas frecuentes" title="Tienes preguntas." muted="Aquí las respuestas." />
        </Reveal>
        <div className="mt-12 md:mt-16 grid gap-4 md:grid-cols-2 md:items-start">
          {[FAQ_ITEMS.slice(0, half), FAQ_ITEMS.slice(half)].map((col, ci) => (
            <div key={ci} className="flex flex-col gap-4">
              {col.map((f) => (
                <AccordionItem key={f.q} question={f.q}>
                  {f.a}
                </AccordionItem>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── CTA final ──────────────────────────────────────────────────────────── */

const ClosingCta: React.FC<{ onBrowseAll: () => void; onOpenPublish: () => void }> = ({ onBrowseAll, onOpenPublish }) => (
  <section aria-labelledby="cta-title" className="pb-24 md:pb-32">
    <div className="container-nar">
      <Reveal>
        <div className="card relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-full md:w-[72%]">
            <ShaderBars bias={0.9} density={7} intensity={1.15} />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent" />
          </div>
          <div className="relative px-6 py-14 sm:px-10 md:px-14 md:py-20 max-w-[760px]">
            <Eyebrow>Empieza hoy</Eyebrow>
            <h2 id="cta-title" className="t-h2 mt-4">
              Alguien ya va por tu ruta.
              <br />
              <GradientText colors={BRAND} animationSpeed={5} className="!inline-flex">
                Comparte el viaje.
              </GradientText>
            </h2>
            <p className="t-body text-muted mt-5 max-w-[440px]">
              Busca un asiento para tu próximo trayecto o publica los que te sobran en el carro.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnet padding={60} magnetStrength={4} maxOffset={10}>
                <Button size="lg" onClick={onBrowseAll}>
                  Buscar viaje
                </Button>
              </Magnet>
              <Magnet padding={60} magnetStrength={4} maxOffset={10}>
                <Button size="lg" variant="outline" onClick={onOpenPublish}>
                  Publicar viaje
                </Button>
              </Magnet>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);
