import test from 'node:test';
import assert from 'node:assert/strict';
import { isFutureDeparture, matchTrip, normalizePlace, salvadorNow } from './matching';

const stops = [
  { id: 'a', position: 0, name: 'Multiplaza', city: 'Antiguo Cuscatlán' },
  { id: 'b', position: 1, name: 'Parque San Martín', city: 'Santa Tecla' },
  { id: 'c', position: 2, name: 'Centro de Sonsonate', city: 'Sonsonate' },
  { id: 'd', position: 3, name: 'Terminal Santa Ana', city: 'Santa Ana' },
];
const trip = { status: 'scheduled', departureDate: '2026-10-30', departureTime: '09:00', availableSeats: 3, stops };

test('matches full trip and ordered intermediate segments', () => {
  assert.deepEqual(matchTrip(trip, { from: 'Antiguo Cuscatlan', to: 'Santa Ana', seats: 1 })?.pickupStopId, 'a');
  assert.deepEqual(matchTrip(trip, { from: 'Santa Tecla', to: 'Santa Ana', seats: 1 })?.pickupStopId, 'b');
  assert.deepEqual(matchTrip(trip, { from: 'Antiguo Cuscatlán', to: 'Sonsonate', seats: 1 })?.dropoffStopId, 'c');
  assert.deepEqual(matchTrip(trip, { from: 'Santa Tecla', to: 'Sonsonate', seats: 1 })?.dropoffStopId, 'c');
});

test('rejects reverse direction, absent stops, insufficient seats and incompatible schedule', () => {
  assert.equal(matchTrip(trip, { from: 'Santa Ana', to: 'Santa Tecla', seats: 1 }), null);
  assert.equal(matchTrip(trip, { from: 'Soyapango', to: 'Santa Ana', seats: 1 }), null);
  assert.equal(matchTrip(trip, { from: 'Santa Tecla', to: 'Santa Ana', seats: 4 }), null);
  assert.equal(matchTrip(trip, { from: 'Santa Tecla', to: 'Santa Ana', seats: 1, date: '2026-11-01' }), null);
  assert.equal(matchTrip(trip, { from: 'Santa Tecla', to: 'Santa Ana', seats: 1, earliestTime: '10:00' }), null);
  assert.equal(matchTrip({ ...trip, status: 'cancelled' }, { from: 'Santa Tecla', to: 'Santa Ana', seats: 1 }), null);
});

test('matches exact stop names without substring false positives', () => {
  assert.equal(matchTrip(trip, { from: 'Parque San Martín', to: 'Terminal Santa Ana', seats: 1 })?.pickupStopId, 'b');
  assert.equal(matchTrip(trip, { from: 'Tecla', to: 'Santa Ana', seats: 1 }), null);
  assert.equal(normalizePlace('  SAN  MIGUÉL '), 'san miguel');
});

test('future date uses El Salvador local time', () => {
  const now = new Date('2026-10-25T04:30:00Z');
  assert.deepEqual(salvadorNow(now), { date: '2026-10-24', time: '22:30' });
  assert.equal(isFutureDeparture('2026-10-24', '22:45', now), true);
  assert.equal(isFutureDeparture('2026-10-24', '22:15', now), false);
});
