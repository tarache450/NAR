import session from 'express-session';
import type { NarDatabase } from './db';

export class SQLiteSessionStore extends session.Store {
  constructor(private readonly db: NarDatabase) {
    super();
    db.exec(`CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    ); CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);`);
  }

  get(sid: string, callback: (err?: Error | null, session?: session.SessionData | null) => void) {
    try {
      const row = this.db.prepare('SELECT data FROM sessions WHERE sid = ? AND expires_at > ?').get(sid, Date.now()) as { data: string } | undefined;
      callback(null, row ? JSON.parse(row.data) as session.SessionData : null);
    } catch (error) { callback(error as Error); }
  }

  set(sid: string, data: session.SessionData, callback?: (err?: Error) => void) {
    try {
      const expires = data.cookie.expires?.getTime() ?? Date.now() + 7 * 24 * 60 * 60 * 1000;
      this.db.prepare('INSERT INTO sessions(sid,data,expires_at) VALUES(?,?,?) ON CONFLICT(sid) DO UPDATE SET data=excluded.data, expires_at=excluded.expires_at').run(sid, JSON.stringify(data), expires);
      callback?.();
    } catch (error) { callback?.(error as Error); }
  }

  destroy(sid: string, callback?: (err?: Error) => void) {
    try { this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid); callback?.(); }
    catch (error) { callback?.(error as Error); }
  }

  touch(sid: string, data: session.SessionData, callback?: (err?: Error) => void) {
    try {
      const expires = data.cookie.expires?.getTime() ?? Date.now() + 7 * 24 * 60 * 60 * 1000;
      this.db.prepare('UPDATE sessions SET expires_at = ? WHERE sid = ?').run(expires, sid);
      callback?.();
    } catch (error) { callback?.(error as Error); }
  }
}
