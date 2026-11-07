import React, { useId, useState } from 'react';
import { ArrowUpDown, MapPin, Navigation, Search, AlertCircle } from 'lucide-react';
import { Button, cx } from './ui/primitives';
import { DAY_OPTIONS, type DayFilter } from '../lib/rides';
import StarBorder from './bits/StarBorder';

export interface SearchQuery {
  origin: string;
  destination: string;
  day: DayFilter;
  seats: number;
}

interface SearchPanelProps {
  value: SearchQuery;
  onChange: (q: SearchQuery) => void;
  onSubmit: (q: SearchQuery) => void;
  places: string[];
  submitLabel?: string;
  className?: string;
  /** Borde animado de marca en el botón principal (hero) */
  highlight?: boolean;
}

const norm = (s: string) => s.trim().toLowerCase();

export const SearchPanel: React.FC<SearchPanelProps> = ({
  value,
  onChange,
  onSubmit,
  places,
  submitLabel = 'Buscar',
  className,
  highlight,
}) => {
  const id = useId();
  const listId = `${id}-places`;
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof SearchQuery>(k: K, v: SearchQuery[K]) => {
    setError(null);
    onChange({ ...value, [k]: v });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.origin && value.destination && norm(value.origin) === norm(value.destination)) {
      setError('El origen y el destino son iguales. Cambia uno de los dos.');
      return;
    }
    setError(null);
    onSubmit(value);
  };

  const cell =
    'relative flex flex-col justify-center gap-1 px-4 h-[64px] rounded-[12px] bg-surface-2 border border-line hover:border-white/15 focus-within:border-accent transition-colors';
  const label = 'text-[12px] text-subtle leading-none';
  const control = 'w-full bg-transparent text-[16px] text-fg placeholder:text-subtle focus:outline-none leading-tight';

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Buscar un viaje"
      className={cx('card p-2 sm:p-3 text-left', className)}
      noValidate
    >
      <datalist id={listId}>
        {places.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr_150px_160px_auto] items-stretch">
        <div className={cell}>
          <label htmlFor={`${id}-o`} className={label}>
            Desde
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            <input
              id={`${id}-o`}
              list={listId}
              value={value.origin}
              onChange={(e) => set('origin', e.target.value)}
              placeholder="Ciudad o lugar"
              autoComplete="off"
              className={control}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange({ ...value, origin: value.destination, destination: value.origin })}
          aria-label="Intercambiar origen y destino"
          className="self-center justify-self-center w-10 h-10 -my-3 lg:my-0 z-10 rounded-full border border-line-strong bg-surface flex items-center justify-center text-muted hover:text-fg hover:bg-surface-3 lg:rotate-90"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

        <div className={cell}>
          <label htmlFor={`${id}-d`} className={label}>
            Hasta
          </label>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-fg shrink-0" aria-hidden="true" />
            <input
              id={`${id}-d`}
              list={listId}
              value={value.destination}
              onChange={(e) => set('destination', e.target.value)}
              placeholder="Ciudad o lugar"
              autoComplete="off"
              className={control}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:contents gap-2">
          <div className={cell}>
            <label htmlFor={`${id}-day`} className={label}>
              Día
            </label>
            <select
              id={`${id}-day`}
              value={value.day}
              onChange={(e) => set('day', e.target.value as DayFilter)}
              className={cx(control, 'cursor-pointer -mr-3 bg-[length:16px] !bg-[position:right_0_center]')}
            >
              {DAY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className={cell}>
            <label htmlFor={`${id}-seats`} className={label}>
              Pasajeros
            </label>
            <select
              id={`${id}-seats`}
              value={value.seats}
              onChange={(e) => set('seats', Number(e.target.value))}
              className={cx(control, 'cursor-pointer -mr-3 !bg-[position:right_0_center]')}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'pasajero' : 'pasajeros'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {highlight ? (
          <StarBorder
            as="button"
            type="submit"
            color="#21d2ed"
            trailColor="#2d62ff"
            backgroundColor="#ffffff"
            textColor="#09090b"
            borderColor="rgba(255,255,255,0.2)"
            radius={12}
            thickness={2}
            duration={4}
            hover="brighten"
            className="h-[64px] lg:px-7 text-[16px] hover:brightness-95"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {submitLabel}
          </StarBorder>
        ) : (
          <Button type="submit" size="lg" className="h-[64px] lg:px-7">
            <Search className="w-4 h-4" aria-hidden="true" />
            {submitLabel}
          </Button>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-3 px-2 text-[14px] text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </form>
  );
};
