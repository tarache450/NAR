import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowRightLeft, MapPin, Search, Users } from 'lucide-react';
import StarBorder from './reactbits/StarBorder';
import { DestinationWeather } from './DestinationWeather';

const FloatingLines = lazy(() => import('./motion/FloatingLines'));
const WarpText = lazy(() => import('./reactbits/WarpText'));

interface HeroSearchProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onSwapLocations: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  passengers: number;
  onPassengersChange: (count: number) => void;
  onSearch: () => void;
  onOpenPublish: () => void;
}

const quickDestinations = ['Santa Ana', 'El Tunco', 'San Miguel'];
const dateOptions = [
  { value: 'todos', label: 'Todas' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'manana', label: 'Mañana' },
];

function useDecorativeLines() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
    const update = () => {
      if (!media.matches) {
        setEnabled(false);
        return;
      }
      const context = document.createElement('canvas').getContext('webgl2');
      setEnabled(Boolean(context));
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return enabled;
}

export function HeroSearch({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwapLocations,
  selectedDate,
  onDateChange,
  passengers,
  onPassengersChange,
  onSearch,
  onOpenPublish,
}: HeroSearchProps) {
  const showLines = useDecorativeLines();

  const focusSearch = () => {
    document.getElementById('nar-origin')?.focus();
  };

  return (
    <section className="nar-hero" aria-labelledby="nar-hero-title">
      <div className="nar-hero-lines" aria-hidden="true">
        {showLines && (
          <Suspense fallback={null}>
            <FloatingLines
              linesGradient={['#2563eb', '#22d3ee', '#00c29a']}
              enabledWaves={['top', 'middle', 'bottom']}
              lineCount={8}
              lineDistance={7}
              amplitude={0.55}
              animationSpeed={0.45}
              bendStrength={-0.25}
              interactive
              clickSwirl={false}
              glow={0.28}
              opacity={0.44}
              dpr={1.25}
            />
          </Suspense>
        )}
      </div>

      <div className="nar-container nar-hero-content">
        <div className="nar-hero-grid">
          <div className="nar-hero-copy">
            <p className="nar-hero-locale">
              <span className="nar-hero-locale-dot" />
              VIAJES COMPARTIDOS EN EL SALVADOR
            </p>
            <h1 id="nar-hero-title">
              Tu próximo viaje
              <span className="nar-hero-warp">
                {showLines ? <Suspense fallback={<span className="nar-hero-warp-fallback">ya va en camino.</span>}>
                  <WarpText
                    text="ya va en camino."
                    color="#00c29a"
                    fontSize="clamp(3.35rem, 6.7vw, 5.9rem)"
                    fontWeight={800}
                    letterSpacing="-0.04em"
                    lineHeight={1.03}
                    warpScale={1.1}
                    warpStrength={0.02}
                    speed={0.45}
                    pointerInfluence={0.28}
                    pointerStrength={0.14}
                    refraction={0.004}
                    chromatic={0}
                    ripple={false}
                    clickRipple
                    idleDrift={0.04}
                    lens="bulge"
                    intro
                    style={{ minHeight: '1.12em', height: '1.12em' }}
                  />
                </Suspense> : <span className="nar-hero-warp-fallback">ya va en camino.</span>}
              </span>
            </h1>
            <p className="nar-hero-description">
              Encuentra a alguien que ya va por tu ruta. Conecta, elige tu asiento
              y comparte los gastos del trayecto.
            </p>
            <div className="nar-hero-actions">
              <StarBorder
                as="button"
                type="button"
                onClick={focusSearch}
                backgroundColor="#00c29a"
                textColor="#04241c"
                color="#eafffb"
                trailColor="#22d3ee"
                theme="dark"
                radius={14}
                thickness={1.2}
                duration={3.5}
                trailLength={0.35}
                glow={0.55}
                sparkle
                style={{
                  minHeight: 52,
                  padding: '0.9rem 1.25rem',
                  fontSize: '0.91rem',
                  fontWeight: 750,
                }}
              >
                Buscar un viaje <ArrowRight size={18} aria-hidden="true" />
              </StarBorder>
              <button type="button" className="nar-button nar-button-quiet" onClick={onOpenPublish}>
                Publicar mi ruta <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="nar-hero-scroll" aria-hidden="true">
              <ArrowDown size={15} /> Explora rutas disponibles
            </div>
          </div>

          <div className="nar-route-scene" aria-label="Ilustración de un trayecto de ejemplo entre San Salvador y Santa Ana">
            <div className="nar-route-scene-top">
              <span>UN MISMO CAMINO</span>
              <span>RUTA DE EJEMPLO</span>
            </div>
            <div className="nar-route-scene-map" aria-hidden="true">
              <span className="nar-map-coordinate nar-map-coordinate-one">13°41&apos; N</span>
              <span className="nar-map-coordinate nar-map-coordinate-two">89°13&apos; O</span>
              <svg viewBox="0 0 520 310" preserveAspectRatio="xMidYMid meet">
                <path className="nar-route-ghost" d="M22 205 C112 237 127 65 229 107 S397 278 501 88" />
                <path className="nar-route-path" d="M22 205 C112 237 127 65 229 107 S397 278 501 88" />
                <circle className="nar-route-node nar-route-node-start" cx="22" cy="205" r="9" />
                <circle className="nar-route-node nar-route-node-mid" cx="229" cy="107" r="7" />
                <circle className="nar-route-node nar-route-node-end" cx="501" cy="88" r="9" />
              </svg>
              <span className="nar-map-stop nar-map-stop-start">San Salvador</span>
              <span className="nar-map-stop nar-map-stop-mid">Santa Tecla</span>
              <span className="nar-map-stop nar-map-stop-end">Santa Ana</span>
            </div>
            <div className="nar-route-scene-bottom">
              <span>Origen y destino</span>
              <strong>La conexión empieza con una ruta.</strong>
            </div>
          </div>
        </div>

        <form
          id="nar-search-form"
          className="nar-search-panel"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch();
          }}
        >
          <div className="nar-search-heading">
            <div>
              <h2>Encuentra tu trayecto</h2>
              <p>Busca entre los viajes publicados por la comunidad.</p>
            </div>
            <span className="nar-search-demo">Vista de demostración</span>
          </div>

          <div className="nar-search-fields">
            <div className="nar-location-fields">
              <label className="nar-field" htmlFor="nar-origin">
                <span>Origen</span>
                <span className="nar-field-control">
                  <MapPin size={18} aria-hidden="true" />
                  <input
                    id="nar-origin"
                    type="text"
                    value={origin}
                    onChange={(event) => onOriginChange(event.target.value)}
                    placeholder="¿Desde dónde sales?"
                    autoComplete="off"
                  />
                </span>
              </label>
              <button
                className="nar-swap"
                type="button"
                onClick={onSwapLocations}
                aria-label="Invertir origen y destino"
                title="Invertir origen y destino"
              >
                <ArrowRightLeft size={18} aria-hidden="true" />
              </button>
              <label className="nar-field" htmlFor="nar-destination">
                <span>Destino</span>
                <span className="nar-field-control">
                  <MapPin size={18} aria-hidden="true" />
                  <input
                    id="nar-destination"
                    type="text"
                    value={destination}
                    onChange={(event) => onDestinationChange(event.target.value)}
                    placeholder="¿A dónde vas?"
                    autoComplete="off"
                  />
                </span>
              </label>
            </div>

            <div className="nar-search-options">
              <fieldset className="nar-option-group">
                <legend>Fecha de salida</legend>
                <div className="nar-option-row">
                  {dateOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={selectedDate === option.value ? 'nar-option is-selected' : 'nar-option'}
                      aria-pressed={selectedDate === option.value}
                      onClick={() => onDateChange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="nar-option-group">
                <legend>Asientos</legend>
                <div className="nar-option-row">
                  {[1, 2, 3].map((count) => (
                    <button
                      key={count}
                      type="button"
                      className={passengers === count ? 'nar-option is-selected' : 'nar-option'}
                      aria-pressed={passengers === count}
                      aria-label={count === 1 ? '1 asiento' : String(count) + ' asientos'}
                      onClick={() => onPassengersChange(count)}
                    >
                      <Users size={15} aria-hidden="true" /> {count}
                    </button>
                  ))}
                </div>
              </fieldset>
              <button className="nar-search-submit" type="submit">
                <Search size={18} aria-hidden="true" />
                Ver viajes
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="nar-quick-routes">
            <span>Desde el área de San Salvador hacia</span>
            {quickDestinations.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  onOriginChange('San Salvador');
                  onDestinationChange(city);
                }}
              >
                {city} <ArrowRight size={13} aria-hidden="true" />
              </button>
            ))}
          </div>
        </form>
        <DestinationWeather destination={destination} />
      </div>
    </section>
  );
}
