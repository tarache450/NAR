export interface StopPoint { id: string; city: string; name: string; position: number }
export interface SearchableTrip {
  status: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  stops: StopPoint[];
}
export interface TripQuery { from: string; to: string; date?: string; seats: number; earliestTime?: string }

export function normalizePlace(value: string) {
  return value.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

function matchesPlace(stop: StopPoint, query: string) {
  const place = normalizePlace(query);
  return normalizePlace(stop.city) === place || normalizePlace(stop.name) === place;
}

export function matchTrip(trip: SearchableTrip, query: TripQuery) {
  if (trip.status !== 'scheduled' || trip.availableSeats < query.seats) return null;
  if (query.date && trip.departureDate !== query.date) return null;
  if (query.earliestTime && trip.departureTime < query.earliestTime) return null;
  const stops = [...trip.stops].sort((a, b) => a.position - b.position);
  for (let pickup = 0; pickup < stops.length - 1; pickup++) {
    if (!matchesPlace(stops[pickup], query.from)) continue;
    for (let dropoff = pickup + 1; dropoff < stops.length; dropoff++) {
      if (matchesPlace(stops[dropoff], query.to)) {
        return { pickupStopId: stops[pickup].id, dropoffStopId: stops[dropoff].id, pickupPosition: pickup, dropoffPosition: dropoff };
      }
    }
  }
  return null;
}

export function salvadorNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/El_Salvador', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { date: `${value.year}-${value.month}-${value.day}`, time: `${value.hour}:${value.minute}` };
}

export function isFutureDeparture(date: string, time: string, now = new Date()) {
  const local = salvadorNow(now);
  return date > local.date || (date === local.date && time > local.time);
}
