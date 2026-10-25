import { randomBytes } from 'node:crypto';
import { open } from 'node:fs/promises';

try {
  const file = await open(new URL('../.env.local', import.meta.url), 'wx', 0o600);
  try {
    await file.writeFile(`SESSION_SECRET=${randomBytes(48).toString('base64url')}\n`);
  } finally {
    await file.close();
  }
  console.log('Created private local session configuration.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
