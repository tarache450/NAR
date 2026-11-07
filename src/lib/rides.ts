import type { Ride } from '../types';

export type DayFilter = 'today' | 'tomorrow' | 'any';

export const DAY_OPTIONS: { value: DayFilter; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'tomorrow', label: 'Mañana' },
  { value: 'any', label: 'Cualquier día' },
];

const DAY_KEYS: Record<string, number> = { dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6 };

const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const dayIndex = (token: string): number | null => {
  const key = stripAccents(token.trim().toLowerCase()).slice(0, 3);
  return key in DAY_KEYS ? DAY_KEYS[key] : null;
};

/** Convierte textos como "Lunes a Viernes", "Miércoles y Sábados" o "Lun - Vie" en días de la semana. */
export function parseRecurringDays(text?: string): Set<number> {
  const days = new Set<number>();
  if (!text) return days;
  const clean = stripAccents(text.toLowerCase());
  const range = /([a-z]+)\s*(?:\sa\s|-|–)\s*([a-z]+)/.exec(clean);
  if (range) {
    const a = dayIndex(range[1]);
    const b = dayIndex(range[2]);
    if (a !== null && b !== null) {
      for (let d = a; ; d = (d + 1) % 7) {
        days.add(d);
        if (d === b) break;
      }
      return days;
    }
  }
  clean.split(/,|\sy\s|\s/).forEach((p) => {
    const d = dayIndex(p);
    if (d !== null) days.add(d);
  });
  return days;
}

export function runsOn(ride: Ride, filter: DayFilter, now = new Date()): boolean {
  if (filter === 'any') return true;
  const target = new Date(now);
  if (filter === 'tomorrow') target.setDate(target.getDate() + 1);
  if (filter === 'today' && ride.date === 'Hoy') return true;
  if (ride.isRecurring) return parseRecurringDays(ride.recurringDays).has(target.getDay());
  return false;
}

export function dayLabel(filter: DayFilter, now = new Date()): string {
  if (filter === 'any') return 'Cualquier día';
  const d = new Date(now);
  if (filter === 'tomorrow') d.setDate(d.getDate() + 1);
  const txt = d.toLocaleDateString('es-SV', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${filter === 'today' ? 'Hoy' : 'Mañana'} · ${txt}`;
}

export function minutesOfDay(time: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(time.trim());
  if (!m) return 0;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const p = m[3]?.toUpperCase();
  if (p === 'PM' && h !== 12) h += 12;
  if (p === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/** Coincidencia de texto contra origen, paradas o destino (sin tildes). */
export function matchesPlace(ride: Ride, query: string, side: 'origin' | 'destination'): boolean {
  const q = norm(query);
  if (!q) return true;
  const end = side === 'origin' ? ride.origin : ride.destination;
  const pool = [end.city, end.name, ...ride.waypoints.flatMap((w) => [w.city, w.name])];
  return pool.some((p) => norm(p).includes(q));
}

/** "02:00 PM" → "14:00" */
export const clock24 = (time: string) => {
  const m = minutesOfDay(time);
  if (!/^\d{1,2}:\d{2}/.test(time.trim())) return time;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export const usd = (n: number) => `$${n.toFixed(2)}`;

export const seatsLabel = (n: number) => (n === 1 ? '1 asiento' : `${n} asientos`);

export interface Corridor {
  key: string;
  origin: string;
  destination: string;
  via: string;
  minPrice: number;
  duration: string;
  distanceKm: number;
  rides: Ride[];
}

/** Agrupa los viajes reales por corredor origen → destino. */
export function corridorsFrom(rides: Ride[]): Corridor[] {
  const map = new Map<string, Corridor>();
  rides.forEach((r) => {
    const key = `${r.origin.city}→${r.destination.city}`;
    const existing = map.get(key);
    if (existing) {
      existing.rides.push(r);
      existing.minPrice = Math.min(existing.minPrice, r.seatPrice);
      return;
    }
    map.set(key, {
      key,
      origin: r.origin.city,
      destination: r.destination.city,
      via: r.waypoints.map((w) => w.city).join(' · '),
      minPrice: r.seatPrice,
      duration: r.estimatedDuration,
      distanceKm: r.distanceKm,
      rides: [r],
    });
  });
  return [...map.values()];
}
