# Arquitectura NAR

## Capas

`src/MarketplaceApp.tsx` es la beta funcional y `src/api/client.ts` habla con `/api`. `src/App.tsx` es el prototipo visual accesible en `/demo`. `public/como-funciona/index.html` es una guía estática con HTML inicial para SEO. `server/index.ts` monta Express, Vite en desarrollo y archivos `dist` en build. `server/app.ts` contiene la API, `server/db.ts` las migraciones SQLite, `server/session-store.ts` las sesiones persistentes y `server/matching.ts` la compatibilidad de paradas. `scripts/backup-db.ts` crea y verifica copias locales de SQLite.

La elección de Express + SQLite permite validar flujos locales sin servicios de pago. No ofrece por sí sola alta disponibilidad ni migraciones multiinstancia. La app debe usar una única instancia con un volumen persistente para esta fase. No se recomienda desplegarla hasta resolver los bloqueos de seguridad y operación en `SECURITY_NOTES.md`.

## Modelo y reglas

- `users`: nombre, correo único, hash Argon2 de contraseña y campo de verificación de correo aún sin flujo activo.
- `trips`: conductor, salida local El Salvador, capacidad, aporte expresado en centavos, vehículo, estado.
- `trip_stops`: paradas ordenadas declaradas por el conductor; origen y destino son primera y última.
- `trip_requests`: pasajero, tramo entre dos paradas, plazas y estado. Una solicitud por persona y trayecto.
- `sessions`: sesión HTTP persistida; `audit_events`: eventos internos de cambios de estado; `notifications`: avisos privados persistidos por usuario con estado leído.
- `account_tokens`: estructura para verificación y recuperación; no se emiten tokens hasta configurar y probar un proveedor de correo.

La coincidencia compara nombres normalizados y exige que la parada de subida preceda a la de bajada; verifica fecha futura y capacidad. **No hay coordenadas ni geometría vial.** La capacidad se calcula para el trayecto completo: es conservadora para tramos disjuntos. Una solicitud pendiente no reserva plazas; la aceptación actualiza solicitud y capacidad dentro de una transacción inmediata.

La API devuelve hasta 100 viajes por búsqueda, tras evaluar todas las coincidencias disponibles. Esta beta no tiene paginación; se necesitará un índice de búsqueda y cursores antes de escalar el catálogo.

## API

`GET /api/health`; `POST /api/auth/register|login|logout`; `GET /api/auth/me`; `GET /api/trips[?from=&to=&date=&seats=]`, `/api/trips/mine`, `/api/trips/:id`; `POST /api/trips`, `/api/trips/:id/cancel`, `/api/trips/:id/requests`; `GET /api/requests/mine`; `POST /api/requests/:id/accept|reject|cancel`; `GET /api/notifications`; `POST /api/notifications/:id/read`.

Todos los cambios privados requieren sesión. El servidor valida entradas con Zod, limita cuerpo a 16 KB y usa consultas parametrizadas. El cliente muestra estados de carga, vacío y error. No hay API pública versionada ni contratos de terceros.

`src/analytics/events.ts` emite eventos de producto locales sin PII mediante `CustomEvent`; no existe una herramienta externa de analítica configurada ni se envía telemetría de usuarios.

## Evolución pendiente

El esquema usa `PRAGMA user_version` y transacciones por migración. El respaldo local se crea con la API de copia de SQLite y se verifica con `integrity_check`; falta una política operativa de cifrado, almacenamiento externo, retención y restauración con datos reales. También faltan observabilidad, cola de notificaciones, control de acceso operativo y reglas de disponibilidad por segmento. La portada sigue siendo SPA y necesitará HTML inicial específico antes de indexarla; la guía `/como-funciona/` ya se sirve como HTML independiente.
