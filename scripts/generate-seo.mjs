import { readFile, writeFile, rm } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const indexPath = new URL('index.html', dist);
const guidePath = new URL('como-funciona/index.html', dist);
const rawSiteUrl = process.env.SITE_URL?.trim();
const indexable = process.env.SEO_INDEXABLE === '1';
let html = await readFile(indexPath, 'utf8');
let guide = await readFile(guidePath, 'utf8');

const escapeAttribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const resetSeo = (value) => value
  .replace('<meta name="robots" content="index,follow" />', '<meta name="robots" content="noindex,nofollow" />')
  .replace(/^\s*<(?:link rel="canonical"|meta property="og:(?:url|image)"|meta name="twitter:image")[^\n]*\n/gm, '');
html = resetSeo(html);
guide = resetSeo(guide);

if (indexable && !rawSiteUrl) throw new Error('SITE_URL is required when SEO_INDEXABLE=1.');

if (rawSiteUrl) {
  const site = new URL(rawSiteUrl);
  if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash || site.pathname !== '/') {
    throw new Error('SITE_URL must be an HTTPS site origin, for example https://nar.example.com');
  }
  const origin = site.origin;
  const image = new URL('/images/nar-road-editorial.jpg', origin).href;
  if (indexable) html = html.replace('<meta name="robots" content="noindex,nofollow" />', '<meta name="robots" content="index,follow" />');
  if (indexable) guide = guide.replace('<meta name="robots" content="noindex,nofollow" />', '<meta name="robots" content="index,follow" />');
  html = html.replace('</head>', `  <link rel="canonical" href="${escapeAttribute(origin)}/" />\n    <meta property="og:url" content="${escapeAttribute(origin)}/" />\n    <meta property="og:image" content="${escapeAttribute(image)}" />\n    <meta name="twitter:image" content="${escapeAttribute(image)}" />\n  </head>`);
  guide = guide.replace('</head>', `  <link rel="canonical" href="${escapeAttribute(origin)}/como-funciona/" />\n  <meta property="og:url" content="${escapeAttribute(origin)}/como-funciona/" />\n  <meta property="og:image" content="${escapeAttribute(image)}" />\n</head>`);
  if (indexable) {
    await writeFile(new URL('robots.txt', dist), `User-agent: *\nDisallow: /demo\nSitemap: ${origin}/sitemap.xml\n`);
    await writeFile(new URL('sitemap.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url><url><loc>${origin}/como-funciona/</loc></url></urlset>\n`);
  }
}
if (!indexable) {
  await writeFile(new URL('robots.txt', dist), 'User-agent: *\nDisallow: /\n');
  await rm(new URL('sitemap.xml', dist), { force: true });
}
console.log(indexable ? `SEO files generated for ${rawSiteUrl}` : 'Indexing disabled until SEO_INDEXABLE=1 and SITE_URL are set.');

await writeFile(indexPath, html);
await writeFile(guidePath, guide);
