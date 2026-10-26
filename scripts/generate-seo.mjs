import { readFile, writeFile, rm } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const indexPath = new URL('index.html', dist);
const guidePath = new URL('como-funciona/index.html', dist);
const rawSiteUrl = process.env.SITE_URL?.trim();
const indexable = process.env.SEO_INDEXABLE === '1';
let html = await readFile(indexPath, 'utf8');
let guide = await readFile(guidePath, 'utf8');

const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const cleanSeo = value => value
  .replace(/<meta name="robots" content="[^"]+"\s*\/>/, '<meta name="robots" content="noindex,nofollow" />')
  .replace(/^\s*<(?:link rel="canonical"|meta property="og:(?:url|image)"|meta name="twitter:image")[^\n]*\n/gm, '')
  .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '\n');
html = cleanSeo(html);
guide = cleanSeo(guide);

if (indexable && !rawSiteUrl) throw new Error('SITE_URL is required when SEO_INDEXABLE=1.');

if (rawSiteUrl) {
  const site = new URL(rawSiteUrl);
  if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash) {
    throw new Error('SITE_URL must be an HTTPS canonical site URL without credentials, query, or fragment.');
  }
  const base = new URL(site.pathname.endsWith('/') ? site.pathname : `${site.pathname}/`, site.origin);
  const home = base.href;
  const guideUrl = new URL('como-funciona/', base).href;
  const image = new URL('images/nar-road-editorial.webp', base).href;
  if (indexable) {
    html = html.replace('<meta name="robots" content="noindex,nofollow" />', '<meta name="robots" content="index,follow" />');
    guide = guide.replace('<meta name="robots" content="noindex,nofollow" />', '<meta name="robots" content="index,follow" />');
    html = html.replace('</head>', `  <link rel="canonical" href="${escapeHtml(home)}" />\n    <meta property="og:url" content="${escapeHtml(home)}" />\n    <meta property="og:image" content="${escapeHtml(image)}" />\n    <meta name="twitter:image" content="${escapeHtml(image)}" />\n    <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'NAR', url: home, inLanguage: 'es-SV' })}</script>\n  </head>`);
    guide = guide.replace('</head>', `  <link rel="canonical" href="${escapeHtml(guideUrl)}" />\n  <meta property="og:url" content="${escapeHtml(guideUrl)}" />\n  <meta property="og:image" content="${escapeHtml(image)}" />\n    <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Cómo funciona NAR', url: guideUrl, inLanguage: 'es-SV', isPartOf: { '@type': 'WebSite', name: 'NAR', url: home } })}</script>\n</head>`);
  }
  if (indexable) {
    const sitemap = new URL('sitemap.xml', base).href;
    await writeFile(new URL('robots.txt', dist), `User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`);
    await writeFile(new URL('sitemap.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${home}</loc></url><url><loc>${guideUrl}</loc></url></urlset>\n`);
  }
}
if (!indexable) {
  await writeFile(new URL('robots.txt', dist), 'User-agent: *\nDisallow: /\n');
  await rm(new URL('sitemap.xml', dist), { force: true });
}

await writeFile(indexPath, html);
await writeFile(guidePath, guide);
console.log(indexable ? `SEO metadata, sitemap, and robots rules generated for ${rawSiteUrl}` : 'Indexing disabled until SEO_INDEXABLE=1 and SITE_URL are set.');
