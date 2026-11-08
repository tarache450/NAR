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
  Smartphone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Ride } from '../types';
import {
  Decor,
  useRichEffects,
  AccordionItem,
  Badge,
  Button,
  Eyebrow,
  Reveal,
  SectionHeader,
  ShaderBars,
  cx,
} from './ui/primitives';
import { clock24, usd, type Corridor } from '../lib/rides';
import { FAQ_ITEMS } from '../data/content';
import BlurText from './bits/BlurText';
import ShinyText from './bits/ShinyText';
import SpotlightCard from './bits/SpotlightCard';
import Magnet from './bits/Magnet';
import LogoLoop from './bits/LogoLoop';
import GradientText from './bits/GradientText';
import type { CardSwapHandle } from './bits/CardSwap';
import { Logo } from './Logo';

// Efectos dinámicos cargados bajo demanda
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
  onOpenAuth: () => void;
  onSelectCorridor: (origin: string, destination: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = (p) => {
  const sample = p.rides[0];
  return (
    <>
      <Hero onOpenAuth={p.onOpenAuth} corridors={p.corridors} />
      <MeetingPointsStrip rides={p.rides} />
      {sample ? <FeaturesSection ride={sample} /> : null}
      <AppDownloadSection onOpenAuth={p.onOpenAuth} />
      <Manifesto />
      <AudienceSection onOpenAuth={p.onOpenAuth} />
      <HowItWorks onOpenAuth={p.onOpenAuth} />
      <SafetySection onOpenAuth={p.onOpenAuth} />
      <CorridorsSection corridors={p.corridors} onSelectCorridor={p.onSelectCorridor} onOpenAuth={p.onOpenAuth} />
      <CorridorBand corridors={p.corridors} />
      <FaqSection />
      <ClosingCta onOpenAuth={p.onOpenAuth} />
    </>
  );
};

/* ── Hero Informativo y Embudo de Conversión ────────────────────────────── */

const Hero: React.FC<{ onOpenAuth: () => void; corridors: Corridor[] }> = ({ onOpenAuth }) => {
  const rich = useRichEffects();
  return (
    <section className="relative overflow-hidden pt-[112px] md:pt-[160px] pb-[100px] md:pb-[140px]" aria-labelledby="hero-title">
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
          <p className="inline-flex items-center gap-2 h-8 pl-1 pr-3 rounded-full border border-line-strong bg-surface/80 text-[13px] whitespace-nowrap backdrop-blur">
            <span className="h-6 px-2 rounded-full bg-accent text-ink text-[11px] font-bold inline-flex items-center">
              El Salvador 🇸🇻
            </span>
            <ShinyText color="#ffffff" shineColor="#21d2ed" speed={3.2} delay={1.2} className="tabular font-medium">
              La primera app móvil de carpool interurbano
            </ShinyText>
          </p>
        </Reveal>

        <h1 id="hero-title" className="t-h1 mt-6 max-w-[920px] flex flex-col items-center">
          <BlurText text="Tu ruta diaria," animateBy="words" direction="bottom" delay={90} trigger="load" className="justify-center" />
          <span className="flex flex-wrap items-baseline justify-center gap-x-[0.28em]">
            <GradientText colors={BRAND} animationSpeed={6} className="!inline-flex">
              compartida
            </GradientText>
            <span className="text-muted">en comunidad.</span>
          </span>
        </h1>

        <Reveal delay={160}>
          <p className="t-lead text-muted mt-6 max-w-[620px] mx-auto leading-relaxed">
            NAR conecta a conductores y pasajeros verificados con DUI en El Salvador. Ahorra tiempo, divide gastos de gasolina y viaja seguro y cómodo cada día desde tu teléfono móvil.
          </p>
        </Reveal>

        {/* Botones de Acción del Embudo */}
        <Reveal delay={240} className="w-full max-w-[640px] mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Magnet padding={60} magnetStrength={4} maxOffset={10}>
            <a
              href="#descargar-app"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('descargar-app')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="h-12 px-7 rounded-xl font-bold bg-accent text-ink flex items-center justify-center gap-2.5 shadow-lg shadow-accent/25 hover:brightness-110 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Smartphone className="w-4 h-4" />
              <span>Conoce la App Móvil</span>
            </a>
          </Magnet>
          <Magnet padding={60} magnetStrength={4} maxOffset={10}>
            <button
              type="button"
              onClick={onOpenAuth}
              className="h-12 px-7 rounded-xl font-medium border border-line-strong hover:border-white/40 text-white flex items-center justify-center gap-2 cursor-pointer bg-surface/70 backdrop-blur transition-all w-full sm:w-auto"
            >
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Crear mi Perfil / Ingresar</span>
            </button>
          </Magnet>
        </Reveal>

        {/* 3 Pilares Informativos en el Hero */}
        <Reveal delay={320} className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[860px]">
          <div className="p-4 rounded-2xl bg-surface/60 border border-line flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">DUI Verificado</p>
              <p className="text-[11px] text-muted">Comunidad salvadoreña 100% identificada.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/60 border border-line flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Aporte Justo en USD</p>
              <p className="text-[11px] text-muted">Comparte combustible sin tarifas abusivas.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/60 border border-line flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Rutas Interurbanas</p>
              <p className="text-[11px] text-muted">San Salvador, Santa Ana, San Miguel y más.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ── Franja de Ciudades y Puntos de Encuentro ─────────────────────────── */

const MeetingPointsStrip: React.FC<{ rides: Ride[] }> = ({ rides }) => {
  const points = useMemo(() => {
    const set = new Set<string>();
    rides.forEach((r) => [r.origin, ...r.waypoints, r.destination].forEach((w) => set.add(w.name)));
    return [...set];
  }, [rides]);

  return (
    <section aria-labelledby="puntos-title" className="py-12 border-y border-line bg-surface/[0.2]">
      <div className="container-nar">
        <p id="puntos-title" className="t-small text-muted text-center uppercase tracking-wider font-mono">
          Corredores y puntos de encuentro conectados en El Salvador
        </p>
      </div>
      <div className="mt-6 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <LogoLoop
          logos={points.map((p) => ({
            node: (
              <span className="flex items-center gap-2 text-[16px] font-medium tracking-tight whitespace-nowrap text-fg/90">
                <MapPin className="w-4 h-4 text-accent" aria-hidden="true" />
                {p}
              </span>
            ),
            title: p,
          }))}
          speed={40}
          gap={44}
          logoHeight={26}
          pauseOnHover
          fadeOut={false}
          ariaLabel="Puntos de encuentro"
        />
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
      title: 'Encuentra tu ruta en segundos',
      text: 'Explora salidas programadas hacia tu trabajo, universidad o destinos de descanso con puntos de encuentro públicos y seguros.',
      scene: (
        <MiniPanel title="Rutas en la App">
          <div className="space-y-2">
            <div className="h-9 rounded-[8px] bg-surface-2 border border-line px-3 flex items-center gap-2 text-[12px]">
              <MapPin className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              {ride.origin.city}
            </div>
            <div className="h-9 rounded-[8px] bg-surface-2 border border-line px-3 flex items-center gap-2 text-[12px]">
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              {ride.destination.city}
            </div>
            <div className="h-9 rounded-[8px] bg-accent text-ink flex items-center justify-center gap-2 text-[12px] font-bold">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Rutas directas
            </div>
          </div>
        </MiniPanel>
      ),
    },
    {
      title: 'Pase digital y check-in con QR',
      text: 'Cada pasajero cuenta con un pase de abordaje único con PIN de seguridad y código QR verificable por el conductor al subir.',
      scene: (
        <MiniPanel title="Pase de abordaje móvil">
          <div className="flex items-center gap-3">
            <div className="text-[12px] space-y-1">
              <p className="text-muted">PIN de abordaje</p>
              <p className="text-[32px] font-bold text-accent leading-none tracking-[0.12em] tabular">48-21</p>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-muted">
            {ride.origin.city} → {ride.destination.city} · Verificado con DUI
          </p>
        </MiniPanel>
      ),
    },
    {
      title: 'Seguimiento y botón de auxilio SOS',
      text: 'Comparte tu trayecto en vivo con tus familiares por WhatsApp y viaja con acceso directo al sistema de emergencias en un toque.',
      scene: (
        <MiniPanel title="Seguridad en cabina">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2 text-accent font-bold">
                <ShieldCheck className="w-4 h-4" /> Enlace de monitoreo
              </span>
              <span className="text-muted tabular">Activo</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[65%] bg-accent rounded-full" />
            </div>
            <p className="text-[11px] text-muted">Datos de placa y conductor encriptados.</p>
          </div>
        </MiniPanel>
      ),
    },
  ];

  return (
    <section aria-labelledby="que-hace-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="que-hace-title" eyebrow="La Experiencia NAR" title="Todo tu viaje resuelto," muted="en una sola aplicación móvil." />
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

/* ── Sección de Descarga de la App Móvil (El Embudo Principal) ──────────── */

export const AppDownloadSection: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  return (
    <section id="descargar-app" aria-labelledby="download-title" className="section relative border-t border-line overflow-hidden">
      <div className="container-nar">
        <div className="card relative overflow-hidden p-8 sm:p-12 md:p-16 border border-accent/25 bg-gradient-to-br from-[#12151e] via-[#0d0f17] to-[#08090d]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            {/* Lado Izquierdo: Textos del embudo */}
            <div className="flex flex-col gap-6 text-left">
              <Reveal>
                <Eyebrow>Aplicación Oficial</Eyebrow>
                <h2 id="download-title" className="t-h2 mt-3">
                  Lleva a NAR en tu bolsillo.{' '}
                  <GradientText colors={BRAND} animationSpeed={5} className="!inline-flex">
                    Viaja mejor cada día.
                  </GradientText>
                </h2>
                <p className="t-body text-muted mt-4 max-w-[500px]">
                  NAR es una aplicación nativa creada para la movilidad real de El Salvador. Desde tu teléfono podrás encontrar rutas diarias, coordinar paradas públicas y validar tu viaje con total seguridad.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <div className="grid sm:grid-cols-2 gap-4 my-2">
                  <div className="p-4 rounded-xl bg-surface/80 border border-line flex flex-col gap-1.5">
                    <span className="text-accent font-bold text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> 100% Verificado
                    </span>
                    <span className="text-xs text-muted">
                      Conductores y pasajeros registrados con DUI salvadoreño oficial.
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface/80 border border-line flex flex-col gap-1.5">
                    <span className="text-accent font-bold text-sm flex items-center gap-2">
                      <Navigation className="w-4 h-4" /> GPS en Vivo
                    </span>
                    <span className="text-xs text-muted">
                      Seguimiento en tiempo real de tu ruta y botón SOS de emergencia.
                    </span>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200} className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="h-12 px-7 rounded-xl font-bold bg-accent text-ink flex items-center gap-2 shadow-lg shadow-accent/25 hover:brightness-110 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Crear mi Perfil / Preregistro</span>
                </button>
                <div className="flex items-center gap-2 text-xs text-muted px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span>Próximamente en App Store & Google Play</span>
                </div>
              </Reveal>
            </div>

            {/* Lado Derecho: Mockup Smartphone & QR */}
            <Reveal delay={160} className="flex justify-center">
              <div className="relative w-full max-w-[320px] rounded-[36px] p-3.5 bg-gradient-to-b from-white/20 via-white/5 to-white/10 shadow-2xl border border-white/15">
                <div className="w-full rounded-[28px] bg-[#0c0f17] border border-line overflow-hidden p-6 flex flex-col items-center text-center gap-5">
                  <div className="w-16 h-4 rounded-full bg-white/10 mb-1" />
                  
                  <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
                    <Logo />
                  </div>

                  <div>
                    <p className="font-display font-extrabold text-xl text-white">NAR El Salvador</p>
                    <p className="text-xs text-muted mt-1">Carpooling interurbano seguro</p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center">
                    <QRCodeSVG
                      value="https://nar.sv/#descargar-app"
                      size={125}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <p className="text-[11px] text-muted max-w-[220px]">
                    Escanea este código QR con la cámara de tu teléfono móvil para acceder al registro de la beta.
                  </p>

                  <div className="w-full pt-3 border-t border-line flex items-center justify-between text-[11px] text-subtle">
                    <span>iOS & Android</span>
                    <span className="text-accent font-bold">El Salvador 🇸🇻</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
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

/* ── Para quién: pasajeros y conductores ────────────────────────────────── */

const AudienceSection: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const tabs = [
    {
      id: 'pasajeros',
      icon: Users,
      title: 'Para pasajeros',
      text: 'Viaja cómodo en un asiento reservado hacia tu trabajo o universidad, con horario de salida y punto de subida acordados antes de salir.',
      points: [
        'Ves el aporte estimado por asiento en USD',
        'Puntos de encuentro seguros en centros comerciales y gasolineras',
        'Pase digital verificado con PIN al abordar',
        'Identidad del conductor con DUI antes de subir',
      ],
      cta: { label: 'Crear cuenta de pasajero', action: onOpenAuth },
    },
    {
      id: 'conductores',
      icon: Car,
      title: 'Para conductores',
      text: 'Si ya haces el trayecto en tu vehículo, comparte tus asientos libres y amortiza tus gastos de gasolina con personas verificadas.',
      points: [
        'Tú defines tus rutas habituales y tus horas de salida',
        'Eliges cuántos asientos libres ofreces en tu auto',
        'Aporte justo por asiento para compartir el combustible',
        'Comunidad confiable: todos los usuarios presentan DUI',
      ],
      cta: { label: 'Registrarme como conductor', action: onOpenAuth },
    },
    {
      id: 'rutina',
      icon: Briefcase,
      title: 'Para la rutina diaria',
      text: 'Ideal para quienes viajan de lunes a viernes en los corredores de mayor tráfico de El Salvador.',
      points: [
        'Rutas habituales entre Santa Tecla, San Salvador y Santa Ana',
        'Mismo grupo de confianza para viajar cada día',
        'Menos estrés, menos tráfico y menos gasto mensual',
        'Viaja sentado y con aire acondicionado',
      ],
      cta: { label: 'Unirme a la comunidad', action: onOpenAuth },
    },
  ];
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const swapRef = useRef<CardSwapHandle>(null);

  return (
    <section aria-labelledby="para-quien-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="para-quien-title" eyebrow="Comunidad NAR" title="Una alternativa real," muted="para moverte por El Salvador." />
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
              tabIndex={0}
              id={`panel-${current.id}`}
              role="tabpanel"
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

/* ── Cómo funciona la App ────────────────────────────────────────────────── */

const HowItWorks: React.FC<{ onOpenAuth: () => void }> = () => {
  const steps = [
    { n: 'Paso 1', title: 'Descarga la App y regístrate', text: 'Crea tu cuenta en minutos verificando tu DUI y número telefónico de El Salvador.', Icon: Smartphone },
    { n: 'Paso 2', title: 'Encuentra o comparte tu ruta', text: 'Busca las salidas que coinciden con tu camino o publica los asientos libres de tu vehículo.', Icon: Navigation },
    { n: 'Paso 3', title: 'Viaja seguro y divide gastos', text: 'Seguimiento por GPS, pase digital de abordaje con código QR y aporte justo en USD.', Icon: ShieldCheck },
  ];
  return (
    <section id="como-funciona" aria-labelledby="como-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="como-title" align="center" eyebrow="Cómo funciona" title="La movilidad compartida" muted="en tres sencillos pasos." />
        </Reveal>
        <ol className="mt-12 md:mt-16 grid gap-4 md:grid-cols-3 md:items-start max-w-[1040px] mx-auto">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 90} className={cx(i === 1 && 'md:mt-12', i === 2 && 'md:mt-24')}>
              <SpotlightCard {...SPOT} className="rounded-[16px] p-6 min-h-[260px] flex flex-col">
                <p className="text-[16px] text-accent font-mono font-bold">{s.n}</p>
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

/* ── Seguridad: Confianza antes de subir ─────────────────────────────────── */

const SafetySection: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const items = [
    { Icon: ShieldCheck, title: 'Perfiles con DUI', text: 'Todos los miembros de la comunidad validan su Documento Único de Identidad salvadoreño.' },
    { Icon: Phone, title: 'Teléfono +503 verificado', text: 'Número local verificado por SMS para coordinar la recogida con total puntualidad.' },
    { Icon: Car, title: 'Vehículo y placas registrados', text: 'Marca, modelo, color y placa registrados en la plataforma antes de salir.' },
    { Icon: MapPin, title: 'Puntos de encuentro públicos', text: 'Subidas acordadas en centros comerciales, gasolineras reconocidas y bahías iluminadas.' },
    { Icon: MessageSquare, title: 'Chat interno en la App', text: 'Comunícate con el conductor o pasajeros sin compartir tu número personal.' },
    { Icon: Share2, title: 'Monitoreo en tiempo real', text: 'Comparte el trayecto en vivo y los datos del carro con un familiar por WhatsApp.' },
  ];
  return (
    <section id="seguridad" aria-labelledby="seguridad-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="seguridad-title" eyebrow="Seguridad y Confianza" title="Sabes con quién viajas" muted="antes de subir al carro." />
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
                  Seguridad 24/7
                  <br />
                  <span className="text-muted">en cada trayecto.</span>
                </h3>
                <p className="t-body text-muted">
                  En la aplicación móvil cuentas con acceso rápido a botón de emergencia y datos completos de la cabina.
                </p>
                <div>
                  <Button onClick={onOpenAuth}>Crear mi cuenta segura</Button>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ── Corredores (Información de Cobertura) ───────────────────────────────── */

export const CorridorCards: React.FC<{ corridors: Corridor[]; onSelectCorridor: (o: string, d: string) => void }> = ({
  corridors,
  onSelectCorridor,
}) => (
  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {corridors.map((c, i) => (
      <Reveal as="li" key={c.key} delay={i * 60}>
        <SpotlightCard {...SPOT} className="rounded-[16px] p-6 h-full flex flex-col">
          <p className="text-[14px] text-muted">{c.origin}</p>
          <h3 className="t-h4 mt-2">{c.destination}</h3>
          <p className="mt-6 flex items-baseline gap-2">
            <span className="text-[40px] font-bold leading-none tracking-tight tabular">{usd(c.minPrice)}</span>
            <span className="t-small text-muted">/ aporte aprox.</span>
          </p>
          <p className="t-small text-muted mt-3 min-h-[42px]">{c.via ? `Pasa por ${c.via}` : 'Ruta directa en carretera'}</p>
          <Button
            variant="outline"
            block
            className="mt-6"
            onClick={() => onSelectCorridor(c.origin, c.destination)}
          >
            Ver paradas habituales
          </Button>
        </SpotlightCard>
      </Reveal>
    ))}
  </ul>
);

const CorridorsSection: React.FC<{
  corridors: Corridor[];
  onSelectCorridor: (o: string, d: string) => void;
  onOpenAuth: () => void;
}> = ({ corridors, onSelectCorridor }) => (
  <section id="corredores" aria-labelledby="corredores-title" className="section border-t border-line">
    <div className="container-nar">
      <Reveal>
        <SectionHeader
          id="corredores-title"
          eyebrow="Red de Cobertura"
          title="Los corredores más transitados"
          muted="de El Salvador."
        />
      </Reveal>
      <div className="mt-12 md:mt-16">
        <CorridorCards corridors={corridors} onSelectCorridor={onSelectCorridor} />
      </div>
    </div>
  </section>
);

/* ── Banda de corredores en movimiento ──────────────────────────────────── */

const CorridorBand: React.FC<{ corridors: Corridor[] }> = ({ corridors }) => {
  const names = corridors.map((c) => `${c.origin} → ${c.destination}`);
  if (!names.length) return null;
  return (
    <section aria-label="Corredores conectados" className="py-10 md:py-14 border-t border-line overflow-hidden">
      <p className="sr-only">{names.join(', ')}</p>
      <div aria-hidden="true">
        <Decor>
          <ScrollVelocity
            texts={[names.join('   ·   '), [...names].reverse().join('   ·   ')]}
            velocity={36}
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

/* ── FAQ Informativo ────────────────────────────────────────────────────── */

const FaqSection: React.FC = () => {
  const half = Math.ceil(FAQ_ITEMS.length / 2);
  const left = FAQ_ITEMS.slice(0, half);
  const right = FAQ_ITEMS.slice(half);
  return (
    <section id="faq" aria-labelledby="faq-title" className="section border-t border-line">
      <div className="container-nar">
        <Reveal>
          <SectionHeader id="faq-title" eyebrow="Preguntas frecuentes" title="Todo lo que necesitas saber" muted="sobre NAR." />
        </Reveal>
        <div className="mt-12 md:mt-16 grid gap-6 md:grid-cols-2 md:items-start max-w-[1040px]">
          {[left, right].map((col, idx) => (
            <div key={idx} className="flex flex-col gap-3">
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

/* ── CTA Final de Descarga y Captación ───────────────────────────────────── */

const ClosingCta: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => (
  <section aria-labelledby="cta-title" className="pb-24 md:pb-32 border-t border-line pt-20">
    <div className="container-nar">
      <Reveal>
        <div className="card relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-full md:w-[72%]">
            <ShaderBars bias={0.9} density={7} intensity={1.15} />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent" />
          </div>
          <div className="relative px-6 py-14 sm:px-10 md:px-14 md:py-20 max-w-[760px]">
            <Eyebrow>El futuro de la movilidad en El Salvador</Eyebrow>
            <h2 id="cta-title" className="t-h2 mt-4">
              Alguien ya va por tu misma ruta.
              <br />
              <GradientText colors={BRAND} animationSpeed={5} className="!inline-flex">
                Comparte el viaje.
              </GradientText>
            </h2>
            <p className="t-body text-muted mt-5 max-w-[460px]">
              Únete a la lista oficial de lanzamiento de NAR. Crea tu perfil en la web para obtener beneficios de lanzamiento y aviso directo cuando la app esté disponible.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnet padding={60} magnetStrength={4} maxOffset={10}>
                <a
                  href="#descargar-app"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('descargar-app')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn btn-primary h-12 px-7 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Conocer la App</span>
                </a>
              </Magnet>
              <Magnet padding={60} magnetStrength={4} maxOffset={10}>
                <Button size="lg" variant="outline" onClick={onOpenAuth}>
                  Crear mi Perfil / Ingresar
                </Button>
              </Magnet>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);
