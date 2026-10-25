# NAR — informe de ejecución, 25 de octubre de 2026

Repositorio: `/Users/mac/orca/NAR`, rama `feature/nar-platform-foundation`. No se hizo push, merge ni despliegue. Se conservaron los cambios previos del rediseño y de los PDF de Clases 6 y 7. El otro repositorio `/Users/mac/NAR` no se modificó en esta tarea.

## 1. Estado inicial

La aplicación React 19/Vite 8/TypeScript mostraba un prototipo de viajes compartidos. Los trayectos, perfiles, reservas, conversación y telemetría de `src/App.tsx` dependían de datos simulados; no había API, autenticación ni base de datos. La tarea anterior había preparado pronóstico Open-Meteo, metadatos, canonical/sitemap opcionales, fuentes locales e imágenes optimizadas. Consulte `docs/NAR_CLASS_6_7_AUDIT.md`.

## 2. Arquitectura detectada

SPA React + Tailwind v4 + motion/react. Se añadió un servidor Express en el mismo proceso de Vite para desarrollo, con SQLite local para persistencia. `ARCHITECTURE.md` registra modelo, endpoints y reglas. El prototipo anterior se conserva aislado en `/demo`.

## 3. Decisiones de diseño

La portada funcional prioriza buscar con origen, destino, fecha y asientos, seguida de resultados y publicación. Se conservaron logo y tipografías NAR. La interfaz evita ratings, verificación, rutas geométricas y testimonios que la beta no puede demostrar. `PRODUCT.md`, `DESIGN.md` y `DESIGN_SYSTEM.md` detallan criterios.

## 4. UI/UX implementada

`src/MarketplaceApp.tsx` incorpora búsqueda, publicación con paradas ordenadas, registro/login, detalle de plazas, solicitudes, estados, avisos internos y gestión como conductor/pasajero. Estados vacío, carga y error. Diseño responsive revisado a 375 px. `/demo` queda rotulado como prototipo y se carga de forma diferida. CSS del prototipo separado: la hoja inicial bajó de 84,45 KB a 11,67 KB antes de los pequeños ajustes finales.

## 5. Integraciones configuradas

- API propia Express/SQLite: funcional local.
- Open-Meteo: pronóstico en `/demo`, heredado de la tarea de PDF; sin incidencia en el motor de viajes.
- Avisos internos: funcionales y persistentes para solicitud, aceptación, rechazo y cancelación.
- Eventos de producto locales `nar:product-event`: preparados sin envío externo ni PII.

`INTEGRATIONS.md` incluye proveedor, prioridad, coste/límite, credenciales y riesgo. No se enviaron emails, mensajes ni pagos.

## 6. Integraciones pendientes

Correo transaccional, verificación/recuperación, mapas y cálculo vial, analítica externa, exportación de calendario, WhatsApp y pagos. Resend es candidato de correo, no una conexión activa. Google Maps requiere billing y claves restringidas; pagos requieren decisiones legales y comerciales previas. Open-Meteo exige revisar licencia para uso comercial. No hay credenciales comprometidas en Git.

## 7. Motor de rutas

`server/matching.ts` normaliza nombres y compara dos paradas en sentido y orden correctos, fecha futura y plazas. Una cuenta puede conducir y viajar. No geocodifica, no calcula desvíos ni valida que una carretera pase por las paradas. La capacidad es conservadora para el viaje completo, aun cuando haya tramos disjuntos. Se devuelven hasta 100 coincidencias tras evaluar el catálogo local.

## 8. Base de datos

Tablas `users`, `trips`, `trip_stops`, `trip_requests`, `sessions`, `audit_events`, `notifications` y `account_tokens`; índices para fecha, trayecto, solicitudes y avisos. Las solicitudes pendientes no reservan plazas. La aceptación descuenta capacidad dentro de transacción inmediata y la cancelación de una aceptada devuelve plazas. Se añadieron migraciones con `PRAGMA user_version` y respaldo local verificado con restauración de prueba. El flujo de tokens de correo aún no existe.

## 9. Seguridad

Argon2, cookie HttpOnly/SameSite y Secure en producción, regeneración de sesión, control de origen, límites de auth y JSON, validación Zod, SQL parametrizado, autorización por usuario y CSP/Helmet. Las notas de producto prohíben publicar datos sensibles en descripciones. `SECURITY_NOTES.md` describe las condiciones pendientes para usuarios reales.

## 10. SEO técnico

Metadatos y OG de portada, guía HTML `/como-funciona/` con metadatos propios, canonical y sitemap para dos URLs canónicas solo con `SITE_URL` y `SEO_INDEXABLE=1`. Por defecto noindex y robots Disallow. `/demo` emite `X-Robots-Tag: noindex`; rutas desconocidas devuelven 404. El script se comprobó con un dominio de ejemplo y se revirtió a noindex. No se afirmó indexación real. La portada SPA todavía necesita HTML inicial útil antes de publicación SEO.

## 11. Investigación de keywords

`SEO_STRATEGY.md` clasifica hipótesis para “viajes compartidos El Salvador”, corredores San Salvador–Santa Ana/San Miguel/La Libertad, publicar asientos y guías informativas. No se inventaron volúmenes ni dificultades: no hubo acceso a Search Console ni herramienta de volumen local. Se debe validar lenguaje salvadoreño antes de abrir páginas de corredor. Referencias UX oficiales: [BlaBlaCar](https://www.blablacar.es/), [Uber](https://www.uber.com/) y [Poparide](https://www.poparide.com/).

## 12. Contenido creado

La guía `/como-funciona/` explica búsqueda, solicitud, confirmación, publicación y límites reales de la beta. No se fabricaron páginas de ciudades vacías, testimonios ni reseñas. El contenido de portada y guía puede revisarse editorialmente antes de indexarse.

## 13. Rendimiento

La portada funcional no carga los estilos ni el código del prototipo hasta visitar `/demo`. Se quitaron preloads de imágenes que la nueva portada no usa. Fuentes locales con swap. Lighthouse móvil local del build funcional: rendimiento 91; FCP 2,5 s y LCP 2,9 s. La prueba anterior de la página de demo había dado 74, pero son pantallas distintas y no se presenta como comparación directa controlada.

## 14. Pruebas

`npm run lint` sin errores; `npm test` 8 grupos superados, incluyendo migración y respaldo/restauración; `npm run build` correcto; `npm audit --omit=dev --audit-level=high`: 0 vulnerabilidades; `git diff --check`: correcto. Playwright probó registro, publicación San Salvador → Santa Tecla → Santa Ana, búsqueda del tramo Santa Tecla → Santa Ana, solicitud de segunda cuenta y aceptación con capacidad de 3 a 2. La base local de QA se limpió después.

## 15. Resultado QA

Lighthouse local: 91 rendimiento, 100 accesibilidad, 100 buenas prácticas y 66 SEO por el noindex intencional. `/`, `/demo`, `/como-funciona/`, `/api/health` responden 200 en build; la URL de guía sin barra redirige 301; URL desconocida responde 404. El dominio final y sus Core Web Vitals no se han probado.

## 16. Archivos principales

`src/MarketplaceApp.tsx`, `src/styles/marketplace.css`, `src/api/client.ts`, `src/analytics/events.ts`, `server/app.ts`, `server/db.ts`, `server/matching.ts`, `server/session-store.ts`, `server/index.ts`, `public/como-funciona/index.html`, `scripts/generate-seo.mjs`, `index.html`, `package.json` y la documentación raíz.

## 17. Decisiones que requieren aprobación o datos

Dominio público autorizado; operador responsable y textos legales; proveedor/dominio de correo y política de verificación; forma de comunicación entre personas; si el producto cobrará o retendrá dinero; proveedor de mapas y presupuesto; licencia comercial de Open-Meteo. Son requisitos para una beta pública, no para la beta local. Activar indexación o desplegar exige autorización explícita.

## 18. Próximos pasos de lanzamiento

1. Cerrar privacidad/condiciones y soporte; definir verificación y recuperación de cuenta.
2. Definir cifrado, retención y ubicación externa de backups; probar sesión y CSP sobre HTTPS en staging.
3. Elegir email y comunicación con consentimiento; probar avisos externos sin escribir a usuarios reales.
4. Añadir HTML inicial de portada, validar contenido y schema con datos empresariales auténticos; activar indexación solo para dominio aprobado.
5. Hacer pruebas de accesibilidad con teclado/lector, carga, recuperación, dispositivo móvil medio y Search Console en dominio autorizado.

Fuentes de límites externos: [Open-Meteo](https://open-meteo.com/en/pricing), [Resend](https://resend.com/pricing), [Google Routes](https://developers.google.com/maps/documentation/routes/usage-and-billing), [Google sobre JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) y [Google sobre sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).
