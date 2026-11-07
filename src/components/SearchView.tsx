import React, { useMemo, useState } from 'react';
import { Compass, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { Ride } from '../types';
import { RideCard } from './RideCard';
import { SearchPanel, type SearchQuery } from './SearchPanel';
import { Button, Disclosure, EmptyState, Eyebrow, Segmented, cx } from './ui/primitives';
import { dayLabel, matchesPlace, minutesOfDay, runsOn, usd } from '../lib/rides';
import ElasticSlider from './bits/ElasticSlider';
import GlideSelect from './bits/GlideSelect';
import SquishSwitch from './bits/SquishSwitch';
import TextType from './bits/TextType';
import DotGrid from './bits/DotGrid';

interface SearchViewProps {
  rides: Ride[];
  places: string[];
  query: SearchQuery;
  onQueryChange: (q: SearchQuery) => void;
  onSelectRide: (ride: Ride) => void;
  onOpenPublish: () => void;
}

type Slot = 'all' | 'am' | 'pm';
type Sort = 'time' | 'price' | 'rating';

export const SearchView: React.FC<SearchViewProps> = ({ rides, places, query, onQueryChange, onSelectRide, onOpenPublish }) => {
  const priceCeil = useMemo(() => Math.ceil(Math.max(1, ...rides.map((r) => r.seatPrice))), [rides]);
  const [draft, setDraft] = useState<SearchQuery>(query);
  const [slot, setSlot] = useState<Slot>('all');
  const [maxPriceSel, setMaxPrice] = useState<number | null>(null);
  const maxPrice = maxPriceSel ?? priceCeil;
  const [minRating, setMinRating] = useState<'0' | '4.5' | '4.9'>('0');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('time');

  // Mantener el formulario sincronizado si la búsqueda llega desde otra vista
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setDraft(query);
  }

  const effectiveMax = maxPriceSel ?? Infinity;

  const results = rides
    .filter((r) => matchesPlace(r, query.origin, 'origin'))
    .filter((r) => matchesPlace(r, query.destination, 'destination'))
    .filter((r) => runsOn(r, query.day))
    .filter((r) => r.availableSeats >= query.seats)
    .filter((r) => {
      const h = minutesOfDay(r.departureTime) / 60;
      return slot === 'all' ? true : slot === 'am' ? h < 12 : h >= 12;
    })
    .filter((r) => r.seatPrice <= effectiveMax)
    .filter((r) => r.driver.rating >= Number(minRating))
    .filter((r) => (verifiedOnly ? r.driver.verifiedDUI : true))
    .sort((a, b) =>
      sort === 'price'
        ? a.seatPrice - b.seatPrice
        : sort === 'rating'
        ? b.driver.rating - a.driver.rating
        : minutesOfDay(a.departureTime) - minutesOfDay(b.departureTime)
    );

  const filtersActive = slot !== 'all' || maxPriceSel !== null || minRating !== '0' || verifiedOnly;

  const resetAll = () => {
    setSlot('all');
    setMaxPrice(null);
    setMinRating('0');
    setVerifiedOnly(false);
    setSort('time');
    const cleared = { origin: '', destination: '', day: 'any' as const, seats: 1 };
    setDraft(cleared);
    onQueryChange(cleared);
  };

  const filters = (
    <div className="flex flex-col gap-7">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-[14px] mb-3">Horario de salida</legend>
        <Segmented<Slot>
          label="Horario de salida"
          value={slot}
          onChange={setSlot}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'am', label: 'Mañana' },
            { value: 'pm', label: 'Tarde' },
          ]}
        />
      </fieldset>

      <div className="flex flex-col gap-4">
        <p className="text-[14px] flex justify-between">
          <span>Aporte máximo</span>
          <span className="text-muted tabular">{maxPriceSel === null ? 'Sin límite' : usd(maxPrice)}</span>
        </p>
        <ElasticSlider
          value={maxPrice}
          startingValue={1}
          maxValue={priceCeil}
          isStepped
          stepSize={0.5}
          onChange={(v) => setMaxPrice(v >= priceCeil ? null : v)}
          valuePosition="none"
          thickness={6}
          activeThickness={10}
          trackColor="rgba(255,255,255,0.1)"
          rangeColor="#21d2ed"
          thumbColor="#ffffff"
          ariaLabel="Aporte máximo por asiento en dólares"
          formatValue={(v) => usd(v)}
          leftIcon={<span className="text-[12px] text-subtle tabular">$1</span>}
          rightIcon={<span className="text-[12px] text-subtle tabular">${priceCeil}</span>}
        />
      </div>

      <fieldset>
        <legend className="text-[14px] mb-3">Calificación del conductor</legend>
        <Segmented<'0' | '4.5' | '4.9'>
          label="Calificación mínima"
          value={minRating}
          onChange={setMinRating}
          options={[
            { value: '0', label: 'Cualquiera' },
            { value: '4.5', label: '4.5+' },
            { value: '4.9', label: '4.9+' },
          ]}
        />
      </fieldset>

      <div className="flex items-center justify-between gap-3 text-[14px]">
        <span id="f-verified">Solo conductores con DUI verificado</span>
        <SquishSwitch
          checked={verifiedOnly}
          onChange={setVerifiedOnly}
          ariaLabel="Solo conductores con DUI verificado"
          trackColor="rgba(255,255,255,0.12)"
          trackOnColor="#21d2ed"
          thumbColor="#ffffff"
          thumbOnColor="#09090b"
          width={46}
          height={26}
        />
      </div>

      {filtersActive ? (
        <Button
          variant="ghost"
          size="sm"
          className="self-start -ml-3"
          onClick={() => {
            setSlot('all');
            setMaxPrice(null);
            setMinRating('0');
            setVerifiedOnly(false);
          }}
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Quitar filtros
        </Button>
      ) : null}
    </div>
  );

  const route =
    query.origin || query.destination
      ? `${query.origin || 'Cualquier origen'} → ${query.destination || 'cualquier destino'}`
      : 'Todos los corredores';

  return (
    <section aria-labelledby="buscar-title" className="relative pt-[96px] md:pt-[124px] pb-24">
      <div className="absolute inset-x-0 top-0 h-[360px] pointer-events-none [mask-image:linear-gradient(to_bottom,#000_30%,transparent)]" aria-hidden="true">
        <DotGrid dotSize={3} gap={22} baseColor="#1d2a3a" activeColor="#21d2ed" proximity={130} opacity={0.9} />
      </div>
      <div className="container-nar relative">
        <Eyebrow>Buscar viaje</Eyebrow>
        <h1 id="buscar-title" className="t-h2 mt-3">
          ¿A dónde vas?
        </h1>
        <p className="t-body text-muted mt-3 min-h-[24px]" aria-hidden="true">
          <span className="text-subtle">Prueba con </span>
          <TextType
            as="span"
            text={places.length ? places.slice(0, 6).map((p) => `“${p}”`) : ['tu ciudad']}
            typingSpeed={55}
            deletingSpeed={30}
            pauseDuration={1600}
            cursorCharacter="|"
            cursorColor="#21d2ed"
            className="text-fg"
            startOnVisible
          />
        </p>

        <SearchPanel
          className="mt-8"
          value={draft}
          onChange={setDraft}
          onSubmit={onQueryChange}
          places={places}
          submitLabel="Actualizar"
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside aria-label="Filtros" className="hidden lg:block">
            <div className="card p-6 sticky top-[96px]">
              <h2 className="t-h6 mb-6 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-muted" aria-hidden="true" /> Filtros
              </h2>
              {filters}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="lg:hidden mb-6">
              <Disclosure
                summary={
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-muted" aria-hidden="true" />
                    Filtros{filtersActive ? ' (activos)' : ''}
                  </span>
                }
              >
                <div className="card p-5">{filters}</div>
              </Disclosure>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div aria-live="polite">
                <p className="t-h5 tabular">
                  {results.length} {results.length === 1 ? 'viaje' : 'viajes'}
                </p>
                <p className="t-small text-muted mt-1">
                  {route} · {dayLabel(query.day)} · {query.seats} {query.seats === 1 ? 'pasajero' : 'pasajeros'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="t-small text-muted shrink-0">Ordenar por</span>
                <GlideSelect
                  value={sort}
                  onChange={(v) => setSort(v as Sort)}
                  options={[
                    { value: 'time', label: 'Hora de salida' },
                    { value: 'price', label: 'Menor aporte' },
                    { value: 'rating', label: 'Mejor calificación' },
                  ]}
                  accentColor="#21d2ed"
                  surfaceColor="#141416"
                  highlightColor="rgba(33,210,237,0.12)"
                  textColor="#ffffff"
                  size="md"
                  radius={10}
                  align="right"
                  ariaLabel="Ordenar resultados"
                />
              </div>
            </div>

            {results.length ? (
              <ul className={cx('grid gap-4 xl:grid-cols-2')}>
                {results.map((r) => (
                  <li key={r.id}>
                    <RideCard ride={r} onSelect={onSelectRide} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<Compass className="w-5 h-5" />}
                title="No hay viajes con estos criterios"
                description="Prueba con otro día, menos pasajeros o quita algún filtro. Si haces este trayecto en carro, puedes publicarlo."
                actions={
                  <>
                    <Button variant="outline" onClick={resetAll}>
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                      Ver todos los viajes
                    </Button>
                    <Button onClick={onOpenPublish}>Publicar viaje</Button>
                  </>
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
