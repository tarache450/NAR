import express, { type NextFunction, type Request, type Response } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { hash, verify } from 'argon2';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { NarDatabase } from './db';
import { SQLiteSessionStore } from './session-store';
import { isFutureDeparture, matchTrip, normalizePlace, salvadorNow, type StopPoint } from './matching';

const place = z.object({ name: z.string().trim().min(2).max(100), city: z.string().trim().min(2).max(80) });
const account = z.object({ name: z.string().trim().min(2).max(80), email: z.email().trim().toLowerCase(), password: z.string().min(12).max(128) });
const login = account.pick({ email: true, password: true });
const tripInput = z.object({
  origin: place, destination: place, stops: z.array(place).max(8).default([]),
  date: z.iso.date(), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  seats: z.number().int().min(1).max(7), contributionCents: z.number().int().min(0).max(100000),
  vehicleDescription: z.string().trim().min(3).max(120), notes: z.string().trim().max(500).default(''),
});
const searchInput = z.object({ from: z.string().trim().min(2).max(100), to: z.string().trim().min(2).max(100), date: z.iso.date().optional(), seats: z.coerce.number().int().min(1).max(7).default(1) });
const requestInput = z.object({ pickupStopId: z.uuid(), dropoffStopId: z.uuid(), seats: z.number().int().min(1).max(7) });

function fail(res: Response, code: number, message: string) { return res.status(code).json({ error: message }); }
function parse<T>(schema: z.ZodType<T>, value: unknown, res: Response): T | null {
  const result = schema.safeParse(value);
  if (!result.success) { fail(res, 400, 'Revisa los datos enviados.'); return null; }
  return result.data;
}
function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) { fail(res, 401, 'Inicia sesión para continuar.'); return; }
  next();
}

interface TripRow {
  id: string; driver_id: string; driver_name: string; departure_date: string; departure_time: string;
  total_seats: number; available_seats: number; contribution_cents: number;
  vehicle_description: string; notes: string; status: string;
}
interface StopRow { id: string; trip_id: string; position: number; name: string; city: string; planned_time: string | null }
interface RequestRow { id: string; trip_id: string; passenger_id: string; pickup_stop_id: string; dropoff_stop_id: string; seats: number; status: string }

export function createApp(db: NarDatabase, secret: string, production = false) {
  if (secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters.');
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: production ? {
    directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], styleSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'], fontSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.open-meteo.com'], objectSrc: ["'none'"], frameAncestors: ["'none'"],
    },
  } : false }));
  app.use(express.json({ limit: '16kb' }));
  app.use(session({
    name: 'nar.sid', secret, resave: false, saveUninitialized: false,
    store: new SQLiteSessionStore(db),
    cookie: { httpOnly: true, sameSite: 'lax', secure: production, maxAge: 7 * 24 * 60 * 60 * 1000 },
  }));
  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (origin && origin !== `${req.protocol}://${req.get('host')}`) return fail(res, 403, 'Origen no permitido.');
    if (req.get('sec-fetch-site') === 'cross-site') return fail(res, 403, 'Origen no permitido.');
    next();
  });
  const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });

  const tripSelect = `SELECT t.*, u.name AS driver_name FROM trips t JOIN users u ON u.id=t.driver_id`;
  const stopsFor = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY position');
  const getTrip = (id: string) => {
    const row = db.prepare(`${tripSelect} WHERE t.id = ?`).get(id) as TripRow | undefined;
    if (!row) return null;
    const stops = stopsFor.all(id) as StopRow[];
    return {
      id: row.id, driverId: row.driver_id, driverName: row.driver_name,
      departureDate: row.departure_date, departureTime: row.departure_time,
      totalSeats: row.total_seats, availableSeats: row.available_seats,
      contributionCents: row.contribution_cents, vehicleDescription: row.vehicle_description,
      notes: row.notes, status: row.status,
      stops: stops.map(({ id: stopId, position, name, city, planned_time }) => ({ id: stopId, position, name, city, plannedTime: planned_time })),
    };
  };
  const publicUser = (id: string) => db.prepare('SELECT id,name,email FROM users WHERE id=?').get(id);
  const log = (actorId: string, type: string, entityId: string) => db.prepare('INSERT INTO audit_events(id,actor_id,event_type,entity_id) VALUES(?,?,?,?)').run(randomUUID(), actorId, type, entityId);
  const notify = (userId: string, type: string, entityId: string, message: string) => db.prepare('INSERT INTO notifications(id,user_id,event_type,entity_id,message) VALUES(?,?,?,?,?)').run(randomUUID(), userId, type, entityId, message);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/api/auth/register', authLimit, async (req, res, next) => {
    try {
      const input = parse(account, req.body, res); if (!input) return;
      if (db.prepare('SELECT 1 FROM users WHERE email=?').get(input.email)) return fail(res, 409, 'Ese correo ya está registrado.');
      const id = randomUUID();
      db.prepare('INSERT INTO users(id,name,email,password_hash) VALUES(?,?,?,?)').run(id, input.name, input.email, await hash(input.password));
      req.session.regenerate((error) => {
        if (error) return next(error);
        req.session.userId = id;
        req.session.save((saveError) => saveError ? next(saveError) : res.status(201).json({ user: publicUser(id) }));
      });
    } catch (error) { next(error); }
  });
  app.post('/api/auth/login', authLimit, async (req, res, next) => {
    try {
      const input = parse(login, req.body, res); if (!input) return;
      const user = db.prepare('SELECT id,password_hash FROM users WHERE email=?').get(input.email) as { id: string; password_hash: string } | undefined;
      if (!user || !await verify(user.password_hash, input.password)) return fail(res, 401, 'Correo o contraseña incorrectos.');
      req.session.regenerate((error) => {
        if (error) return next(error);
        req.session.userId = user.id;
        req.session.save((saveError) => saveError ? next(saveError) : res.json({ user: publicUser(user.id) }));
      });
    } catch (error) { next(error); }
  });
  app.post('/api/auth/logout', (req, res, next) => req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('nar.sid'); res.status(204).end();
  }));
  app.get('/api/auth/me', (req, res) => {
    res.json({ user: req.session.userId ? publicUser(req.session.userId) || null : null });
  });

  app.get('/api/trips', (req, res) => {
    const hasSearch = typeof req.query.from === 'string' || typeof req.query.to === 'string';
    const query = hasSearch ? parse(searchInput, req.query, res) : null;
    if (hasSearch && !query) return;
    const today = salvadorNow();
    const rows = db.prepare(`${tripSelect} WHERE t.status='scheduled' AND t.departure_date >= ? ORDER BY t.departure_date,t.departure_time`).all(today.date) as TripRow[];
    const trips = rows.map((row) => getTrip(row.id)).filter((trip) => trip && isFutureDeparture(trip.departureDate, trip.departureTime));
    if (!query) return res.json({ trips: trips.slice(0, 100) });
    const matches = trips.flatMap((trip) => {
      if (!trip) return [];
      const match = matchTrip(trip, query);
      return match ? [{ ...trip, match }] : [];
    });
    return res.json({ trips: matches.slice(0, 100) });
  });
  app.get('/api/trips/mine', requireUser, (req, res) => {
    const rows = db.prepare(`${tripSelect} WHERE t.driver_id=? ORDER BY t.departure_date DESC,t.departure_time DESC`).all(req.session.userId) as TripRow[];
    res.json({ trips: rows.map((row) => getTrip(row.id)) });
  });
  app.get('/api/trips/:id', (req, res) => {
    const trip = getTrip(req.params.id);
    return trip ? res.json({ trip }) : fail(res, 404, 'Trayecto no encontrado.');
  });
  app.post('/api/trips', requireUser, (req, res) => {
    const input = parse(tripInput, req.body, res); if (!input) return;
    if (!isFutureDeparture(input.date, input.time)) return fail(res, 400, 'La salida debe ser futura en El Salvador.');
    const points = [input.origin, ...input.stops, input.destination];
    if (new Set(points.map((point) => normalizePlace(point.city))).size !== points.length) return fail(res, 400, 'Cada parada debe representar una ciudad distinta.');
    const id = randomUUID();
    db.transaction(() => {
      db.prepare('INSERT INTO trips(id,driver_id,departure_date,departure_time,total_seats,available_seats,contribution_cents,vehicle_description,notes) VALUES(?,?,?,?,?,?,?,?,?)')
        .run(id, req.session.userId, input.date, input.time, input.seats, input.seats, input.contributionCents, input.vehicleDescription, input.notes);
      const insert = db.prepare('INSERT INTO trip_stops(id,trip_id,position,name,city) VALUES(?,?,?,?,?)');
      points.forEach((point, index) => insert.run(randomUUID(), id, index, point.name, point.city));
      log(req.session.userId!, 'trip.created', id);
    })();
    res.status(201).json({ trip: getTrip(id) });
  });
  app.post('/api/trips/:id/cancel', requireUser, (req, res) => {
    const trip = getTrip(req.params.id);
    if (!trip) return fail(res, 404, 'Trayecto no encontrado.');
    if (trip.driverId !== req.session.userId) return fail(res, 403, 'No puedes modificar este trayecto.');
    if (trip.status !== 'scheduled') return fail(res, 409, 'El trayecto ya no está activo.');
    db.transaction(() => {
      const passengers = db.prepare("SELECT DISTINCT passenger_id FROM trip_requests WHERE trip_id=? AND status IN ('pending','accepted')").all(trip.id) as { passenger_id: string }[];
      db.prepare("UPDATE trips SET status='cancelled' WHERE id=?").run(trip.id);
      db.prepare("UPDATE trip_requests SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE trip_id=? AND status IN ('pending','accepted')").run(trip.id);
      passengers.forEach(({ passenger_id }) => notify(passenger_id, 'trip.cancelled', trip.id, 'El conductor canceló el trayecto. Tu solicitud quedó cancelada.'));
      log(req.session.userId!, 'trip.cancelled', trip.id);
    })();
    res.json({ trip: getTrip(trip.id) });
  });
  app.post('/api/trips/:id/requests', requireUser, (req, res) => {
    const input = parse(requestInput, req.body, res); if (!input) return;
    const trip = getTrip(req.params.id);
    if (!trip) return fail(res, 404, 'Trayecto no encontrado.');
    if (trip.driverId === req.session.userId) return fail(res, 400, 'No puedes solicitar un asiento en tu propio trayecto.');
    if (trip.status !== 'scheduled' || !isFutureDeparture(trip.departureDate, trip.departureTime)) return fail(res, 409, 'El trayecto ya no está disponible.');
    if (trip.availableSeats < input.seats) return fail(res, 409, 'No hay suficientes asientos.');
    const pickup = trip.stops.find((stop) => stop.id === input.pickupStopId);
    const dropoff = trip.stops.find((stop) => stop.id === input.dropoffStopId);
    if (!pickup || !dropoff || pickup.position >= dropoff.position) return fail(res, 400, 'El tramo solicitado no sigue el orden del trayecto.');
    const existing = db.prepare('SELECT * FROM trip_requests WHERE trip_id=? AND passenger_id=?').get(trip.id, req.session.userId) as RequestRow | undefined;
    if (existing) {
      if (existing.pickup_stop_id === pickup.id && existing.dropoff_stop_id === dropoff.id && existing.seats === input.seats && ['pending','accepted'].includes(existing.status)) return res.json({ request: existing });
      return fail(res, 409, 'Ya tienes una solicitud para este trayecto.');
    }
    const id = randomUUID();
    db.transaction(() => {
      db.prepare('INSERT INTO trip_requests(id,trip_id,passenger_id,pickup_stop_id,dropoff_stop_id,seats) VALUES(?,?,?,?,?,?)')
        .run(id, trip.id, req.session.userId, pickup.id, dropoff.id, input.seats);
      notify(trip.driverId, 'request.created', id, 'Recibiste una nueva solicitud de asiento.');
      log(req.session.userId!, 'request.created', id);
    })();
    res.status(201).json({ request: db.prepare('SELECT * FROM trip_requests WHERE id=?').get(id) });
  });
  app.get('/api/requests/mine', requireUser, (req, res) => {
    const details = `SELECT r.*,t.departure_date,t.departure_time,origin.city AS pickup_city,origin.name AS pickup_name,destination.city AS dropoff_city,destination.name AS dropoff_name`;
    const joins = `FROM trip_requests r JOIN trips t ON t.id=r.trip_id JOIN trip_stops origin ON origin.id=r.pickup_stop_id JOIN trip_stops destination ON destination.id=r.dropoff_stop_id`;
    const passenger = db.prepare(`${details},d.name AS driver_name ${joins} JOIN users d ON d.id=t.driver_id WHERE r.passenger_id=? ORDER BY r.created_at DESC`).all(req.session.userId);
    const driver = db.prepare(`${details},p.name AS passenger_name ${joins} JOIN users p ON p.id=r.passenger_id WHERE t.driver_id=? ORDER BY r.created_at DESC`).all(req.session.userId);
    res.json({ passenger, driver });
  });
  app.get('/api/notifications', requireUser, (req, res) => {
    const notifications = db.prepare('SELECT id,event_type,entity_id,message,read_at,created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC,id DESC LIMIT 50').all(req.session.userId);
    res.json({ notifications });
  });
  app.post('/api/notifications/:id/read', requireUser, (req, res) => {
    const result = db.prepare('UPDATE notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE id=? AND user_id=?').run(req.params.id, req.session.userId);
    return result.changes ? res.status(204).end() : fail(res, 404, 'Aviso no encontrado.');
  });
  app.post('/api/requests/:id/accept', requireUser, (req, res) => {
    const result = db.transaction(() => {
      const row = db.prepare('SELECT r.*,t.driver_id,t.available_seats,t.status AS trip_status,t.departure_date,t.departure_time FROM trip_requests r JOIN trips t ON t.id=r.trip_id WHERE r.id=?').get(req.params.id) as (RequestRow & { driver_id: string; available_seats: number; trip_status: string; departure_date: string; departure_time: string }) | undefined;
      if (!row) return { code: 404, error: 'Solicitud no encontrada.' };
      if (row.driver_id !== req.session.userId) return { code: 403, error: 'No puedes gestionar esta solicitud.' };
      if (row.status !== 'pending') return { code: 409, error: 'La solicitud ya fue gestionada.' };
      if (row.trip_status !== 'scheduled' || !isFutureDeparture(row.departure_date, row.departure_time)) return { code: 409, error: 'El trayecto ya no está disponible.' };
      if (row.available_seats < row.seats) return { code: 409, error: 'No hay suficientes asientos.' };
      db.prepare('UPDATE trips SET available_seats=available_seats-? WHERE id=?').run(row.seats, row.trip_id);
      db.prepare("UPDATE trip_requests SET status='accepted',updated_at=CURRENT_TIMESTAMP WHERE id=?").run(row.id);
      notify(row.passenger_id, 'request.accepted', row.id, 'El conductor aceptó tu solicitud de asiento.');
      log(req.session.userId!, 'request.accepted', row.id);
      return { request: db.prepare('SELECT * FROM trip_requests WHERE id=?').get(row.id) };
    }).immediate();
    return 'error' in result ? fail(res, result.code!, result.error!) : res.json(result);
  });
  app.post('/api/requests/:id/reject', requireUser, (req, res) => {
    const row = db.prepare('SELECT r.*,t.driver_id FROM trip_requests r JOIN trips t ON t.id=r.trip_id WHERE r.id=?').get(req.params.id) as (RequestRow & { driver_id: string }) | undefined;
    if (!row) return fail(res, 404, 'Solicitud no encontrada.');
    if (row.driver_id !== req.session.userId) return fail(res, 403, 'No puedes gestionar esta solicitud.');
    if (row.status !== 'pending') return fail(res, 409, 'La solicitud ya fue gestionada.');
    db.transaction(() => {
      db.prepare("UPDATE trip_requests SET status='rejected',updated_at=CURRENT_TIMESTAMP WHERE id=?").run(row.id);
      notify(row.passenger_id, 'request.rejected', row.id, 'El conductor rechazó tu solicitud de asiento.');
      log(req.session.userId!, 'request.rejected', row.id);
    })();
    res.json({ request: db.prepare('SELECT * FROM trip_requests WHERE id=?').get(row.id) });
  });
  app.post('/api/requests/:id/cancel', requireUser, (req, res) => {
    const row = db.prepare('SELECT * FROM trip_requests WHERE id=?').get(req.params.id) as RequestRow | undefined;
    if (!row) return fail(res, 404, 'Solicitud no encontrada.');
    if (row.passenger_id !== req.session.userId) return fail(res, 403, 'No puedes cancelar esta solicitud.');
    if (!['pending', 'accepted'].includes(row.status)) return fail(res, 409, 'La solicitud ya fue gestionada.');
    db.transaction(() => {
      db.prepare("UPDATE trip_requests SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE id=?").run(row.id);
      if (row.status === 'accepted') db.prepare('UPDATE trips SET available_seats=available_seats+? WHERE id=?').run(row.seats, row.trip_id);
      const driver = db.prepare('SELECT driver_id FROM trips WHERE id=?').get(row.trip_id) as { driver_id: string };
      notify(driver.driver_id, 'request.cancelled', row.id, 'Un pasajero canceló su solicitud de asiento.');
      log(req.session.userId!, 'request.cancelled', row.id);
    }).immediate();
    res.json({ request: db.prepare('SELECT * FROM trip_requests WHERE id=?').get(row.id) });
  });

  app.use('/api', (_req, res) => fail(res, 404, 'Endpoint no encontrado.'));
  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('NAR API error:', error.message);
    fail(res, 500, 'Ocurrió un error interno.');
  });
  return app;
}
