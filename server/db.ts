import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function openDatabase(filename = process.env.NAR_DB_PATH || 'var/nar.sqlite') {
  const path = filename === ':memory:' ? filename : resolve(filename);
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  const migrations = [`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      driver_id TEXT NOT NULL REFERENCES users(id),
      departure_date TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      total_seats INTEGER NOT NULL CHECK(total_seats BETWEEN 1 AND 7),
      available_seats INTEGER NOT NULL CHECK(available_seats >= 0 AND available_seats <= total_seats),
      contribution_cents INTEGER NOT NULL CHECK(contribution_cents >= 0),
      vehicle_description TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','cancelled','completed')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS trip_stops (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      position INTEGER NOT NULL CHECK(position >= 0),
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      planned_time TEXT,
      UNIQUE(trip_id, position)
    );
    CREATE TABLE IF NOT EXISTS trip_requests (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id),
      passenger_id TEXT NOT NULL REFERENCES users(id),
      pickup_stop_id TEXT NOT NULL REFERENCES trip_stops(id),
      dropoff_stop_id TEXT NOT NULL REFERENCES trip_stops(id),
      seats INTEGER NOT NULL CHECK(seats BETWEEN 1 AND 7),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected','cancelled')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(trip_id, passenger_id)
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL REFERENCES users(id),
      event_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      event_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      message TEXT NOT NULL,
      read_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_trips_date_status ON trips(departure_date, status);
    CREATE INDEX IF NOT EXISTS idx_stops_trip ON trip_stops(trip_id, position);
    CREATE INDEX IF NOT EXISTS idx_requests_trip_status ON trip_requests(trip_id, status);
    CREATE INDEX IF NOT EXISTS idx_requests_passenger ON trip_requests(passenger_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
  `, `
    ALTER TABLE users ADD COLUMN email_verified_at TEXT;
    CREATE TABLE account_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      purpose TEXT NOT NULL CHECK(purpose IN ('verify_email','reset_password')),
      token_hash TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      consumed_at INTEGER,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX idx_account_tokens_user_purpose ON account_tokens(user_id,purpose);
    CREATE INDEX idx_account_tokens_expiry ON account_tokens(expires_at);
  `];
  try {
    const version = db.pragma('user_version', { simple: true }) as number;
    if (version > migrations.length) throw new Error(`Database schema ${version} is newer than this application supports.`);
    for (let index = version; index < migrations.length; index++) {
      db.transaction(() => {
        db.exec(migrations[index]);
        db.pragma(`user_version = ${index + 1}`);
      }).immediate();
    }
  } catch (error) {
    db.close();
    throw error;
  }
  return db;
}

export type NarDatabase = ReturnType<typeof openDatabase>;
