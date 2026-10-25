# Pruebas y QA

Comandos: `npm run lint` (TypeScript), `npm test` (Node/tsx), `npm run build` (Vite + SEO + bundle Express), `npm audit --omit=dev` (dependencias de producción). Las pruebas de `server/app.test.ts` cubren registro, login, permisos, persistencia de viajes, búsqueda por tramo, solicitudes y capacidad. `server/matching.test.ts` cubre orden de paradas, sentido inverso, ausencia, plazas y zona horaria El Salvador.

Los tests de API también comprueban que los avisos se entregan al conductor o pasajero correcto y que otro usuario no puede marcarlos como leídos. `server/db.test.ts` comprueba migración de una cuenta existente, apertura repetida del esquema, respaldo privado desde WAL, restauración del snapshot y rechazo de una base inexistente.

Verificación manual 25-10-2026 en localhost: registro de conductor, trayecto San Salvador → Santa Tecla → Santa Ana, búsqueda Santa Tecla → Santa Ana, registro de pasajero, solicitud pendiente, aceptación por el conductor y reducción de capacidad 3 → 2. Capturas en `.playwright-cli/` (artefactos locales). Vista de 375 px revisada y buscador movido a la primera pantalla. Build de producción comprobado: `/` y `/demo` devuelven 200, `/demo` envía noindex, ruta desconocida devuelve 404 y `/api/health` devuelve 200.

La guía `/como-funciona/` devuelve 200 con título propio; la variante sin barra final redirige 301. Se probó una generación SEO con dominio de ejemplo: portada y guía recibieron canonical e index, y el sitemap incluyó solo ambas URLs. Se desactivó de nuevo la indexación local al terminar.

Lighthouse móvil local del build funcional (25-10-2026): rendimiento **91**, accesibilidad **100**, buenas prácticas **100**, SEO **66**. FCP 2,5 s, LCP 2,9 s, TBT 70 ms en una ejecución anterior, CLS 0. La puntuación SEO baja por el `noindex` intencional de esta beta; no representa una prueba de indexación. Separar CSS del prototipo redujo el CSS inicial de 84,45 KB a 11,67 KB y corrigió contraste del logotipo. JSON de medición local: `/tmp/nar-lighthouse-after-20261025.json`.

Pendiente para salida pública: Lighthouse de producción en dominio real y dispositivo medio, pruebas de accesibilidad con usuarios/teclado y lector, pruebas de carga y recuperación de DB, pruebas de email y flujos de identidad cuando existan, pruebas de multiinstancia si se cambia arquitectura. No se declara beta pública aprobada.
