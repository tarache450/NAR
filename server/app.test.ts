import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from './app';
import { openDatabase } from './db';
import { salvadorNow } from './matching';

const tomorrow = () => {
  const date = new Date(); date.setUTCDate(date.getUTCDate() + 2);
  return salvadorNow(date).date;
};

test('accounts, trip search, requests and capacity use persisted transactions', async () => {
  const db = openDatabase(':memory:');
  const app = createApp(db, 'test-secret-with-more-than-thirty-two-characters');
  const driver = request.agent(app);
  const passenger = request.agent(app);
  const passenger2 = request.agent(app);
  const register = (agent: ReturnType<typeof request.agent>, name: string, email: string) => agent.post('/api/auth/register').send({ name, email, password: 'correct-horse-battery-staple' });
  assert.equal((await register(driver, 'Conductora Prueba', 'driver@example.test')).status, 201);
  assert.equal((await register(passenger, 'Pasajera Uno', 'one@example.test')).status, 201);
  assert.equal((await register(passenger2, 'Pasajero Dos', 'two@example.test')).status, 201);
  assert.equal((await request(app).post('/api/trips').send({})).status, 401);
  assert.equal((await request(app).get('/api/auth/me')).body.user, null);

  const body = {
    origin: { name: 'Multiplaza', city: 'Antiguo Cuscatlán' },
    stops: [{ name: 'Parque San Martín', city: 'Santa Tecla' }],
    destination: { name: 'Terminal', city: 'Santa Ana' },
    date: tomorrow(), time: '09:00', seats: 2, contributionCents: 350,
    vehicleDescription: 'Vehículo de prueba', notes: '',
  };
  const created = await driver.post('/api/trips').send(body);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const trip = created.body.trip;
  assert.equal(trip.stops.length, 3);
  assert.equal((await passenger.get('/api/trips').query({ from: 'Santa Ana', to: 'Santa Tecla' })).body.trips.length, 0);
  const found = await passenger.get('/api/trips').query({ from: 'Santa Tecla', to: 'Santa Ana', seats: 1 });
  assert.equal(found.body.trips.length, 1);
  assert.equal(found.body.trips[0].match.pickupStopId, trip.stops[1].id);

  const requestBody = { pickupStopId: trip.stops[1].id, dropoffStopId: trip.stops[2].id, seats: 2 };
  assert.equal((await driver.post(`/api/trips/${trip.id}/requests`).send(requestBody)).status, 400);
  assert.equal((await passenger.post(`/api/trips/${trip.id}/requests`).send({ ...requestBody, pickupStopId: trip.stops[2].id, dropoffStopId: trip.stops[1].id })).status, 400);
  const pending = await passenger.post(`/api/trips/${trip.id}/requests`).send(requestBody);
  assert.equal(pending.status, 201);
  assert.equal(pending.body.request.status, 'pending');
  const driverAlert = (await driver.get('/api/notifications')).body.notifications[0];
  assert.equal(driverAlert.event_type, 'request.created');
  assert.equal((await passenger.post(`/api/notifications/${driverAlert.id}/read`).send()).status, 404);
  assert.equal((await driver.post(`/api/notifications/${driverAlert.id}/read`).send()).status, 204);
  assert.equal((await passenger.post(`/api/trips/${trip.id}/requests`).send(requestBody)).status, 200);
  const another = await passenger2.post(`/api/trips/${trip.id}/requests`).send({ ...requestBody, seats: 1 });
  assert.equal(another.status, 201);
  const accepted = await driver.post(`/api/requests/${pending.body.request.id}/accept`).send();
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.request.status, 'accepted');
  assert.equal((await passenger.get('/api/notifications')).body.notifications[0].event_type, 'request.accepted');
  assert.equal((await driver.get(`/api/trips/${trip.id}`)).body.trip.availableSeats, 0);
  assert.equal((await driver.post(`/api/requests/${another.body.request.id}/accept`).send()).status, 409);
  assert.equal((await passenger2.post(`/api/requests/${pending.body.request.id}/cancel`).send()).status, 403);
  assert.equal((await passenger.post(`/api/requests/${pending.body.request.id}/cancel`).send()).status, 200);
  assert.equal((await driver.get(`/api/trips/${trip.id}`)).body.trip.availableSeats, 2);
  assert.equal((await driver.post(`/api/requests/${another.body.request.id}/accept`).send()).status, 200);
  const passengerRequests = (await passenger.get('/api/requests/mine')).body.passenger;
  assert.equal(passengerRequests.length, 1);
  assert.equal(passengerRequests[0].pickup_city, 'Santa Tecla');
  assert.equal(passengerRequests[0].dropoff_name, 'Terminal');
  assert.equal((await driver.get('/api/requests/mine')).body.driver.length, 2);
  assert.equal((await passenger.post('/api/trips').set('Origin', 'https://evil.example').send(body)).status, 403);
  db.close();
});
