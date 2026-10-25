# NAR — auditoría y aplicación de Clases 6 y 7

Fecha: 2026-10-25. Rama: `feature/nar-uiux-redesign-v2`. Alcance: prototipo local, sin despliegue.

## Estado encontrado

- Aplicación React/TypeScript/Vite de una sola página, con rutas, perfiles, reservas, chat y telemetría simulados. No hay API de viajes, autenticación ni persistencia.
- La rama no compilaba al iniciar: faltaba cerrar un `AnimatedContent` en `src/App.tsx`.
- Había metadatos básicos, pero faltaban imagen social y URL canónica, archivos de rastreo, una integración externa útil y una medición de rendimiento.
- La portada cargaba animaciones costosas al inicio y dependía de Google Fonts. Primera medición móvil Lighthouse: rendimiento 29, SEO 66, accesibilidad 100; LCP 9,7 s, TBT 9.820 ms, CLS 0,038. SEO 66 correspondía a `noindex` de la demo.

## Clase 6 — API e integración

| Criterio | Implementación y comprobación |
| --- | --- |
| Integración real | `DestinationWeather` consulta `GET https://api.open-meteo.com/v1/forecast` con coordenadas de destinos conocidos de El Salvador. Solo envía ubicación pública; no usa claves. |
| JSON y datos mínimos | Se validan temperatura, código meteorológico y hora antes de mostrarlos. |
| Carga, éxito y error | Mensaje de carga, datos actuales y error con botón Reintentar. Se cancela la petición si cambia el destino o se desmonta la vista. |
| Prueba real | Santa Ana mostró un pronóstico de la API. Con navegador sin conexión apareció el error; tras volver a conectar, Reintentar mostró datos nuevos. |
| Seguridad | `.env.example` ya no sugiere una clave Gemini que la aplicación no utiliza; `.env*` continúa fuera de Git salvo el ejemplo. |

La API pública de Open-Meteo permite este prototipo sin clave, con atribución visible. Antes de usarla en un producto comercial hay que revisar las condiciones y el plan aplicable. Los viajes y reservas permanecen como demostración.

## Clase 7 — SEO y rendimiento

| Criterio | Resultado |
| --- | --- |
| HTML semántico | Un `h1` por vista visible; `header`, `nav`, `main`, `section` y `footer`. FAQ elevada a `h2` para respetar jerarquía. |
| Title y descripción | Texto específico de NAR y del carácter de prototipo en `index.html`. |
| Open Graph | Título, descripción, sitio, locale y tarjeta Twitter. `og:image`, `og:url` y canonical se generan con `SITE_URL`. |
| Imágenes | Alt descriptivo para rutas y perfil; imágenes inferiores con lazy loading; foto local WebP de 114 KB y variante móvil de 29 KB; fuentes Inter/Manrope locales WOFF2. |
| Robots y sitemap | `scripts/generate-seo.mjs` crea ambos al construir con `SITE_URL=https://dominio-real`. Sin dominio, genera `robots.txt` con `Disallow: /`, conserva `noindex` y no inventa un sitemap inválido. |
| Lighthouse | Build local final: rendimiento 74, SEO 66 por `noindex`, accesibilidad 100; LCP 3,0 s, TBT 730 ms, CLS 0,034. Una construcción temporal con `SITE_URL` de prueba obtuvo SEO 100 y accesibilidad 100. Los resultados de laboratorio varían entre ejecuciones. |

Las vistas y modales secundarios se cargan cuando se usan. Se sustituyeron la animación inicial pesada de los pasos, las transiciones GSAP de secciones y la navegación animada por versiones HTML/CSS ligeras; el hero conserva animación solo en pantallas grandes con movimiento permitido.

## Configuración y límites

Para generar metadatos de publicación: `SITE_URL=https://dominio-real npm run build`. Reemplazar el ejemplo por la URL pública exacta antes de publicar. No se ha publicado ni conectado NAR a un backend. La SPA sigue entregando contenido principal mediante JavaScript; si se requiere indexación robusta de páginas individuales de rutas, hará falta una estrategia de renderizado del lado del servidor o prerenderizado cuando existan datos reales y URLs propias.

Fuentes técnicas: [documentación de Open-Meteo](https://open-meteo.com/en/docs), [condiciones y atribución](https://open-meteo.com/).
