# NAR: demo local y configuración SEO

## Ejecutar la demostración

```sh
npm ci
npm run dev
```

Las rutas, perfiles, precios, reseñas y solicitudes son datos de ejemplo. Publicar un trayecto o solicitar asiento solo cambia el estado temporal de la página. No hay cuentas, persistencia, pagos, chat, verificación, GPS ni asistencia de emergencia.

## Google Maps

Los botones de itinerario generan una URL universal de Google Maps Directions con origen, destino y paradas. La app de Maps se abre si está disponible; no se necesita clave API. Google calcula indicaciones propias, que no confirman la ruta de un conductor.

## Indexación

El build normal es privado para buscadores: genera `noindex,nofollow`, `robots.txt` restrictivo y elimina el sitemap. No ofrece un canonical, Open Graph absoluto ni datos estructurados hasta que se habilita la indexación.

Cuando el sitio público y su contenido estén listos, compilar con su URL canónica HTTPS real:

```sh
SITE_URL=https://dominio-canonico.example/ SEO_INDEXABLE=1 npm run build
```

`SITE_URL` puede incluir la ruta de GitHub Pages, por ejemplo `https://cuenta.github.io/NAR/`. El build usa esa ruta como base de recursos; en un dominio raíz usa `/`. `NAR_BASE_PATH` puede fijar explícitamente la base si el hosting lo requiere. El script genera canonical y metadatos Open Graph/Twitter para la portada y la guía, JSON-LD `WebSite`/`WebPage`, sitemap y `robots.txt`. En GitHub Pages de proyecto, `robots.txt` queda dentro de `/NAR/`; los rastreadores buscan primero el archivo en la raíz del dominio, así que configura un dominio propio o publica una política de robots en esa raíz antes de depender de ella. El sitemap se genera en la ruta de la app y se puede registrar manualmente en Search Console cuando exista acceso autorizado.

La compilación no publica ni envía el sitemap a Google. No se usa un nombre legal, correo, dirección ni dominio inventados; no incluyas datos estructurados de organización hasta contar con esos datos oficiales.
