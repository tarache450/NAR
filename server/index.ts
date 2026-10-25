import 'dotenv/config';
import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';
import { createApp } from './app';
import { openDatabase } from './db';

config({ path: '.env.local', override: false, quiet: true });
const production = process.env.NODE_ENV === 'production';
const secret = process.env.SESSION_SECRET;
if (!secret) throw new Error('SESSION_SECRET is required. See .env.example.');
const app = createApp(openDatabase(), secret, production);
const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (Number.isInteger(proxyHops) && proxyHops > 0 && proxyHops <= 3) app.set('trust proxy', proxyHops);

if (production) {
  const dist = join(dirname(fileURLToPath(import.meta.url)), 'dist');
  app.use(express.static(dist, { index: false }));
  app.get('/como-funciona', (req, res, next) => req.path.endsWith('/') ? next() : res.redirect(301, '/como-funciona/'));
  app.get('/como-funciona/', async (_req, res, next) => {
    try { res.type('html').send(await readFile(join(dist, 'como-funciona/index.html'), 'utf8')); }
    catch (error) { next(error); }
  });
  app.get('*', async (req, res, next) => {
    if (req.path !== '/' && req.path !== '/demo') return res.status(404).type('text').send('Página no encontrada.');
    try {
      if (req.path === '/demo') res.set('X-Robots-Tag', 'noindex, nofollow');
      res.type('html').send(await readFile(join(dist, 'index.html'), 'utf8'));
    }
    catch (error) { next(error); }
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true, host: '127.0.0.1' }, appType: 'spa' });
  app.use(vite.middlewares);
}

const port = Number(process.env.PORT || 3000);
app.listen(port, '127.0.0.1', () => console.log(`NAR local server: http://127.0.0.1:${port}`));
