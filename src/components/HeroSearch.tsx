import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import RubberSegmentSource from './reactbits/RubberSegment';
import BorderGlowSource from './reactbits/BorderGlow';
import { ArrowRightLeft, MapPin, Search, Users, Route, Sparkles } from 'lucide-react';

const FloatingLines = lazy(() => import('./reactbits/FloatingLines').then(m => ({ default: m.default as React.ComponentType<any> })));
const StrokeText = lazy(() => import('./reactbits/StrokeText').then(m => ({ default: m.default as React.ComponentType<any> })));
const RubberSegment = RubberSegmentSource as React.ComponentType<any>;
const BorderGlow = BorderGlowSource as React.ComponentType<any>;

interface HeroSearchProps {
  origin: string; destination: string; onOriginChange: (val: string) => void; onDestinationChange: (val: string) => void;
  onSwapLocations: () => void; selectedDate: string; onDateChange: (date: string) => void;
  passengers: number; onPassengersChange: (num: number) => void; onSearch: () => void; onOpenPublish: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ origin, destination, onOriginChange, onDestinationChange, onSwapLocations, selectedDate, onDateChange, passengers, onPassengersChange, onSearch, onOpenPublish }) => {
  const [reduceMotion, setReduceMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [wideScreen, setWideScreen] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 801px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 801px)');
    const update = () => setWideScreen(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const dates = useMemo(() => Array.from({ length: 4 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : new Intl.DateTimeFormat('es', { weekday: 'short' }).format(d), value: i === 0 ? 'hoy' : localDate, day: d.getDate() };
  }), []);

  return <section className="nar-hero">
    <img className="nar-hero-photo" src={`${import.meta.env.BASE_URL}images/nar-road-editorial.webp`} srcSet={`${import.meta.env.BASE_URL}images/nar-road-editorial-640.webp 640w, ${import.meta.env.BASE_URL}images/nar-road-editorial-1280.webp 1280w, ${import.meta.env.BASE_URL}images/nar-road-editorial.webp 1536w`} sizes="100vw" alt="" aria-hidden="true" fetchPriority="high" />
    {!reduceMotion && wideScreen && <Suspense fallback={null}><FloatingLines className="nar-floating-lines" linesGradient={['#315cff', '#00a89d', '#9cb3ff']} enabledWaves={['middle', 'bottom']} lineCount={5} animationSpeed={0.35} amplitude={0.4} interactive={false} parallax={false} clickSwirl={false} opacity={0.36} /></Suspense>}
    <div className="nar-hero-grid" aria-hidden="true" />
    <div className="nar-hero-inner">
      <div className="nar-hero-copy">
        <span className="nar-eyebrow">
          <span className="nar-live-dot" /> 
          <span>MOVILIDAD COMPARTIDA · EL SALVADOR</span>
        </span>
        <h1>Tu camino.<br/><span className="nar-stroke-line">{reduceMotion ? <span>Nuestra ruta.</span> : <Suspense fallback={<span>Nuestra ruta.</span>}><StrokeText text="Nuestra ruta." strokeColor="#9cb3ff" fillColor="#9cb3ff" fontSize={96} drawDuration={1.1} stagger={0.035} hoverRedraw={false} /></Suspense>}</span></h1>
        <p>Explora rutas de ejemplo en El Salvador, revisa cada parada y calcula el trayecto en Google Maps.</p>
        <div className="nar-proof"><span><MapPin size={16}/> Rutas de ejemplo</span><i/><span><Users size={16}/> Gastos compartidos directamente</span></div>
      </div>
      <BorderGlow className="nar-search-glow" backgroundColor="#111827" glowColor="225 100 60" colors={['#315cff','#00a89d','#9cb3ff']} borderRadius={24} glowIntensity={0.35}>
      <form className="nar-search" onSubmit={e => { e.preventDefault(); onSearch(); }}>
        <div className="nar-search-title"><div><span className="nar-kicker">PLANIFICA TU RECORRIDO</span><h2>¿A dónde vas?</h2><p>Elige origen, destino y fecha.</p></div><span className="nar-search-icon"><Route size={21}/></span></div>
        <div className="nar-route-fields">
          <label className="nar-field"><span className="nar-origin-dot"/><span><small>DESDE</small><input value={origin} onChange={e => onOriginChange(e.target.value)} placeholder="Ciudad de salida" aria-label="Ciudad de salida"/></span></label>
          <button type="button" className="nar-swap" onClick={onSwapLocations} aria-label="Intercambiar origen y destino"><ArrowRightLeft size={17}/></button>
          <label className="nar-field"><span className="nar-destination-dot"/><span><small>HACIA</small><input value={destination} onChange={e => onDestinationChange(e.target.value)} placeholder="¿Cuál es tu destino?" aria-label="Ciudad de destino"/></span></label>
        </div>
        <div className="nar-search-options"><div className="nar-date-block"><span className="nar-kicker">¿CUÁNDO?</span><div className="nar-date-list">{dates.map(d => <button type="button" key={d.value} className={selectedDate === d.value ? 'nar-date active' : 'nar-date'} onClick={() => onDateChange(d.value)}><small>{d.label}</small><b>{d.day}</b></button>)}</div></div>
          <div className="nar-seat-block"><span className="nar-kicker">ASIENTOS</span><RubberSegment items={[{value:1,label:'1'},{value:2,label:'2'},{value:3,label:'3'}]} value={passengers} onChange={onPassengersChange} size="lg" trackColor="#080b10" thumbColor="#315cff" textColor="#c4c5d9" activeTextColor="#fff" aria-label="Cantidad de asientos" /></div>
        </div>
        <button className="nar-primary" type="submit">
          <Search size={18}/> Encontrar mi viaje <span aria-hidden="true">→</span>
        </button>
        <button className="nar-offer" type="button" onClick={onOpenPublish}><Sparkles size={15}/> ¿Tienes espacio? <b>Ofrece un asiento</b></button>
      </form>
      </BorderGlow>
    </div>
    <div className="nar-hero-foot"><span>01 / VIAJA MEJOR</span><span>MENOS AUTOS SOLOS. MÁS CAMINOS COMPARTIDOS.</span></div>
  </section>;
};
