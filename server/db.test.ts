import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import Database from 'better-sqlite3';
import { backupDatabase } from '../scripts/backup-db';
import { openDatabase } from './db';

test('migration upgrades a legacy database without losing accounts', () => {
  const directory = mkdtempSync(join(tmpdir(), 'nar-migration-'));
  const filename = join(directory, 'nar.sqlite');
  try {
    const legacy = new Database(filename);
    legacy.exec('CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    legacy.prepare('INSERT INTO users(id,name,email,password_hash) VALUES(?,?,?,?)').run('legacy-user', 'Usuario', 'legacy@example.test', 'hash');
    legacy.close();

    const migrated = openDatabase(filename);
    assert.equal(migrated.pragma('user_version', { simple: true }), 2);
    assert.deepEqual(migrated.prepare('SELECT id,name,email FROM users').get(), { id: 'legacy-user', name: 'Usuario', email: 'legacy@example.test' });
    assert.ok(migrated.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='account_tokens'").get());
    migrated.close();

    const reopened = openDatabase(filename);
    assert.equal(reopened.pragma('user_version', { simple: true }), 2);
    reopened.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('backup is a private, restorable snapshot of a WAL database', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'nar-backup-'));
  const filename = join(directory, 'nar.sqlite');
  const backupDir = join(directory, 'backups');
  try {
    const live = openDatabase(filename);
    const id = randomUUID();
    live.prepare('INSERT INTO users(id,name,email,password_hash) VALUES(?,?,?,?)').run(id, 'Antes', 'before@example.test', 'hash');
    const snapshot = await backupDatabase(filename, backupDir);
    assert.equal(statSync(snapshot).mode & 0o777, 0o600);
    assert.equal(statSync(backupDir).mode & 0o777, 0o700);
    live.prepare('UPDATE users SET name=? WHERE id=?').run('Después', id);
    live.close();

    const restoredPath = join(directory, 'restored.sqlite');
    copyFileSync(snapshot, restoredPath);
    const restored = openDatabase(restoredPath);
    assert.equal(restored.pragma('integrity_check', { simple: true }), 'ok');
    assert.equal((restored.prepare('SELECT name FROM users WHERE id=?').get(id) as { name: string }).name, 'Antes');
    restored.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('backup refuses a missing source without creating data', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'nar-missing-'));
  try {
    const source = join(directory, 'missing.sqlite');
    await assert.rejects(backupDatabase(source, join(directory, 'backups')), /No existe la base de datos/);
    assert.equal(existsSync(source), false);
    assert.equal(existsSync(join(directory, 'backups')), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
