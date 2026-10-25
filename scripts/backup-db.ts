import Database from 'better-sqlite3';
import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function backupDatabase(source = process.env.NAR_DB_PATH || 'var/nar.sqlite', directory = 'backups') {
  const sourcePath = resolve(source);
  const backupDir = resolve(directory);
  if (!existsSync(sourcePath) || !statSync(sourcePath).isFile()) throw new Error(`No existe la base de datos: ${sourcePath}`);
  mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = join(backupDir, `nar-${timestamp}-${randomBytes(6).toString('hex')}.sqlite`);
  if (existsSync(target)) throw new Error('La ruta del respaldo ya existe.');

  try {
    const database = new Database(sourcePath, { readonly: true, fileMustExist: true });
    try {
      await database.backup(target);
    } finally {
      database.close();
    }
    chmodSync(target, 0o600);
    const restored = new Database(target, { readonly: true, fileMustExist: true });
    try {
      if (restored.pragma('integrity_check', { simple: true }) !== 'ok') throw new Error('El respaldo no superó integrity_check.');
    } finally {
      restored.close();
    }
    return target;
  } catch (error) {
    if (existsSync(target)) unlinkSync(target);
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  backupDatabase().then((path) => console.log(path)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
