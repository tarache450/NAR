# NAR — Roadmap de Rediseño (Contract-First)

> Documento de planificación basado en el estado anterior al rediseño (`cec47e1`). El conflicto de instalación con `esbuild` y la advertencia de `__dirname` ya están resueltos en la versión actual. Las demás propuestas siguen siendo tareas por evaluar, no funcionalidades implementadas.

**TASK ID:** NAR-DOCS-01 · Fecha: 2026-10-18 · Base: `docs/NAR_PROJECT_CONTEXT.md` (problemas P1–P10 referenciados ahí; no se repite la evidencia aquí).

Principio del roadmap: **primero estabilizar y acabar con la mentira (QR/telemetría/chat/SOS fake), después hacer real el dominio (persistencia, auth, matching), y solo entonces escalar (mapa, pagos, tiempo real).** Cada sprint cierra con criterios verificables y una demo.

---

## Sprint 0 — Estabilizar e instalar (día 1, medio sprint) 🔴

**Objetivo:** cualquiera puede clonar → instalar → correr → testear en un comando, sin warnings de identidad confusa.

Alcance:
- Corregir `esbuild` (subir a ^0.27/0.28 o quitarlo: es peer transitivo de Vite) para que `npm install` plano pase sin `--legacy-peer-deps` (P1).
- Eliminar deps muertas: `@google/genai`, `express`, `dotenv`, `tsx`, `motion` (+`autoprefixer` redundante con Tailwind v4) — o documentar la intención si alguna se va a usar en próximo sprint.
- Renombrar: `package.json` name → `nar-web`, decidir y ejecutar/eliminar `metadata.json` (`Obsidian Kinetic`) y actualizar `npm run clean` (borra un `server.js` inexistente).
- Activar TypeScript `strict` + `noUncheckedIndexedAccess` en `tsconfig.json` y arreglar los errores que aparezcan (hay riesgo real por `split`/`parseInt` en `SearchView.tsx:58-60`).
- Reemplazar `__dirname` por `import.meta.dirname` en `vite.config.ts` y eliminar el warning del build.

**Criterios de aceptación:**
- [ ] `npm ci && npm run lint && npm run build` pasa en máquina limpia sin `--legacy-peer-deps` ni warnings de deprecación.
- [ ] `npm ls motion express @google/genai` no devuelve nada de esos paquetes.
- [ ] proyecto se llama `nar-web` en package.json (y sin trazas de "react-example"/"Obsidian Kinetic" o con decisión documentada).
- [ ] `tsc --noEmit` corre con `strict: true` sin errores.
- [ ] Commit único de estabilización + tag `v0.1.0-sprint0`.

**Delegación sugerida:** tarea mecánica ideal para Codex (prompt de 1 minuto). Humano: revisión final de el diff de dependencias.

---

## Sprint 1 — Dominio honesto: datos con contrato y persistencia (1 sprint)

**Objetivo:** matar P2 (mock volátil). Introducir una capa de datos con interfaz, y persistencia local real como primer paso.

Alcance:
- Extraer modelos a módulo de dominio (`src/domain/`): `Ride`, `Driver`, `Passenger`, `Booking`, `PassCode` con reglas de negocio (p. ej. no sobreasignar asientos y soportar reservas de 1–4; ver P9).
- Definir **DataPort** (interfaz): `listRides(query)`, `getRide(id)`, `bookSeats(rideId, n, user)`, `publishRide(draft)`. Implementación por defecto: `LocalStorageDataPort` con seed desde `mockData.ts`.
- Quitar de `App.tsx` la lógica de negocio (moverla a servicios); App queda en UI/tab routing.
- Booking fluye por el puerto; el pase digital guarda su código junto a la reserva (mata el re-random de P3) y el QR real se genera (librería de QR, payload = JSON firmado ligero o URL del pase).
- Fix P9: selector de reserva soporta hasta `totalSeats` publicados (cap 4).
- Fix P8: fechas del hero derivadas de `new Date()` (mínimo: etiqueta "Hoy/Mañana" con la fecha real al lado).
- Fix P7 parcial: derivar `arrivalTime`/`duration`/`distance` de hora de salida y hora de paradas del wizard o dejar de mostrarlas si no se calculan.

**Criterios de aceptación:**
- [ ] Recargo la página tras reservar: el asiento sigue reservado y reaparece el mismo código de pase (persistido en localStorage + test).
- [ ] Al reservar el último asiento, la tarjeta muestra "Completo" y el modal no deja pasar de `availableSeats`.
- [ ] Publicar 4 asientos → puedo reservar 4.
- [ ] Código del pase es estable: refresh → mismo código; copiar → no cambia.
- [ ] El hero muestra las fechas correctas del día actual (p. ej. "Hoy · Dom 18").
- [ ] Primer test automatizado existe (vitest) para `bookSeats` y `passCode` estable. `npm test` ya es un script real.

**Delegación:** Codex puede implementar el LocalStorageDataPort + tests a partir de esta spec; revisión humana en la interfaz DataPort.

---

## Sprint 2 — Identidad y confianza real (1 sprint)

**Objetivo:** eliminar la identidad hardcodeada (el "usuario actual" fijo en `PublishRideWizardModal.tsx:62-75` y `ProfileView.tsx`, ver §4b del contexto) y hacer honesto el eje "confianza" (badges DUI, teléfono, reseñas).

Alcance:
- Sesión mínima (registro/login local, o fake-auth solo para demo) + `useCurrentUser()`. El wizard usa el usuario real en vez de Miguel Ángel Cortez; ProfileView muestra el perfil del usuario logeado.
- Separar "verificado" de "no verificado": los badges DUI/teléfono pasan a estado en el modelo (`verification: {dui: 'pending'|'verified'}`) con flujo demo de verificación (upload mock o código OTP demo) — nada verifica de verdad, pero nada miente tampoco.
- Reseñas propias del usuario (lista + form) en vez de la lista fija; correcto anónimo vs verificado.
- Chat de la ruta con DataPort (persistido) y múltiples participantes — la respuesta canned se queda solo como modo "demo" explícito, no como mentira (P6 mitigado en honestidad).

**Criterios de aceptación:**
- [ ] Puedo registrarme con mi nombre y publicar viaje como yo; el viaje muestra mi perfil, no el Miguel plantilla.
- [ ] El badge "DUI Verificado" solo aparece tras completar el flujo demo de verificación (por defecto: "Pendiente de verificar").
- [ ] El chat persiste al recargar y funciona con 2 sesiones simuladas (2 navegadores).
- [ ] La copia "Encrypted In-Ride Chat" desaparece hasta que exista cifrado real.

**Delegación:** auth demo con Codex; revisión de producto (flujos de confianza) con humano.

---

## Sprint 3 — Telemetría y seguridad honestas (1 sprint)

**Objetivo:** o hacemos reales el mapa/SOS/compartir, o los matamos. Nada de botones muertos (P4/P5).

Alcance:
- **Mapa real**: Leaflet + tiles OpenStreetMap (sin API key) renderizando la polilínea de waypoints de `types.ts` (ya hay lat/lng en el mock).
- **Compartir en vivo real**: `navigator.share()` (con fallback a clipboard y una página pública de lectura) con URL que muestra ETA y mapa sin login.
- **SOS**: mínimo honesto: botón que con un confirm explícito abre un `tel:` hacia la línea de emergencias elegida por el usuario, con aviso de qué va a pasar (es una llamada) y registro del evento en la bitácora del viaje. Sin servicio de emergencia backend implícito.
- Telemetría: interfaz de suscripción/polling (`TelemetrySource`) con dos implementaciones: `SimulatedSource` (la actual, renombrada y etiquetada "Demo") y `GpsSource` (cola mock), preparando el camino a WebSocket futuro. Nada presenta datos simulados como reales.

**Criterios de aceptación:**
- [ ] El tab "En Vivo" muestra un mapa de verdad con la ruta San Salvador → Santa Ana trazada (no patrón de puntos).
- [ ] "Compartir con Familiar" comparte una URL real (probado en iOS Safari y desktop) que al abrir muestra ETA + mapa sin credenciales.
- [ ] El botón SOS abre un confirm explícito ("se abrirá el teléfono hacia emergencias") y lo hace; el evento queda registrado en la bitácora del viaje.
- [ ] La UI distinge ante el usuario datos "demo" vs "reales" (badge DEMO en la simulación).

**Delegación:** mapa y deep-linking son tareas naturales para Codex; el diseño del flujo SOS se define con el humano (tema sensible).

---

## Sprint 4 — Matching engine y publicación seria (1 sprint)

**Objetivo:** que "buscar ruta" sea un matching geográfico real, no un LIKE de strings (los filtros actuales en `App.tsx:95-112` y `SearchView.tsx:43-69` son comparaciones de texto).

Alcance:
- Matching por **corredor**: un viaje sirve a un pasajero si su origen/destino cae dentro de una desviación tolerable (radio configurable, p. ej. 3 km urbano / 10 km interurbano) respecto de la polilínea origen→waypoints→destino (fórmula Haversine local, sin API pagada).
- Ranking: desviación, horario (ventana ±15 min), rating del conductor, precio.
- Wizard de publicación: geocodificación opcional (OpenStreetMap Nominatim, sin key y con límites de cortesía documentados) o selección en mapa con click; cálculo real de distancia/duración estimada por media de velocidad por tipo de carretera (hardcoded SV: 60 km/h urbano, 90 km/h carretera).
- Recurrencia real: un viaje recurrente genera instancias por día de forma derivada (no solo un string "Lunes a Viernes").

**Criterios de aceptación:**
- [ ] Buscar "Lourdes Colón → San Salvador" encuentra el ride-sv-01 (que pasa por Lourdes Colón) aunque mi texto de origen no coincida con el del conductor.
- [ ] Buscar con typo ("Snta Ana") encuentra con fallback de similitud, o al menos no rompe.
- [ ] Publicar un viaje San Salvador→Santa Ana a las 7:00 muestra distancia ~60-65 km y duración ~1h10 razonable, NO siempre "1h 15m / 64 km" hardcodeado (corrige P7).
- [ ] Un viaje recurrente L-V lista 5 instancias consultando el DataPort.

**Delegación:** Haversine/ranking y tests → Codex; definición de polilíneas de corredores reales de SV (Los Chorros, Panamericana) → humano con conocimiento/geografía (con Codex como asistente).

---

## Sprint 5 — Tiempo real y backend mínimo (1–2 sprints)

**Objetivo:** reemplazar DataPort local por un backend mínimo persistido (supabase/postgres en la infra ORIGO ya disponible o SQLite en VPS) con auth y WebSocket para telemetría y chat reales.

Alcance:
- DataPort implementación HTTP/WS detrás de la misma interfaz del Sprint 1 (el front no se reescribe).
- RLS/multi-tenant: cada usuario solo edita sus viajes/bookings; pasajeros ven asientos de otros consistentes (con transaction de booking: no hay race de doble reserva).
- Telemetría real: el conductor reporta posición (cada N s via WS) y viajeros/familiares la reciben; evidencia con segundo navegador.
- Chat persistido en servidor.

**Criterios de aceptación:**
- [ ] Reserva concurrente doble (2 pestañas mismo último asiento) → solo una gana (test de concurrencia en API).
- [ ] El pase QR del pasajero es verificable por el conductor (scan muestra: pasajero, viaje, asiento, vigencia) — QR real de datos reales.
- [ ] Dos navegadores ven el chat y la posición en tiempo real (<3 s de latencia).
- [ ] RLS probada: un intento de leer/editar un viaje ajeno devuelve 403 y el front nunca lo muestra.

**Delegación:** backend con Codex bajo spec; seguridad/RLS → revisión humana obligatoria (skill `origo-security` en el ecosistema ORIGO).

---

## Sprint 6 — Calidad, aporte/legal y pulido de producto (1 sprint)

**Objetivo:** cerrar la parte frágil de "aporte justo en USD" con lo mínimo legal y de calidad.

Alcance:
- Aporte: especificar qué es legal en El Salvador para carpooling (documentar con humano) y elegir: aporte sugerido no cobrado en la app (registro + acuerdo a la Splitwise) vs pasarela (Stripe/Wompi, si se llega a ello). El MVP elige **registro de aporte sin cobro dentro de la app** hasta validar legal/operación.
- QA: Playwright e2e de los 3 flujos (reservar, publicar, compartir) corriendo en CI; cobertura de dominio ≥80%.
- i18n/a11y: auditoría (axe) + textos ES listos para EN.
- Lighthouse ≥90 en móvil en las 4 categorías del deploy preview.
- Polish de producto: empty states, modo demo claramente marcado, onboarding de primera visita.

**Criterios de aceptación:**
- [ ] CI verde: lint, tsc strict, unit + e2e, build.
- [ ] Lighthouse móvil ≥90 en las 4 categorías del deploy preview (PWA/performance cuando aplique).
- [ ] a11y: cero errores críticos de axe en flujos principales.
- [ ] Decisión de aporte documentada en `07-DECISIONS` del ORIGO BRAIN con fecha y responsable.

---

## Tablero resumen

| Sprint | Tema | Problemas que ataca | Duración | Riesgo principal |
|---|---|---|---|---|
| 0 | Instalable y limpio | P1, P10 (parcial) | 0.5 | baja |
| 1 | Datos + persistencia + QR real | P2, P3, P7 (parcial), P8, P9 | 1 | media (arquitectura) |
| 2 | Identidad y confianza | P6 (queda demo-honesto) + identidad fija | 1 | media (producto) |
| 3 | Telemetría/SOS honestos + mapa real | P4, P5 | 1 | media (integración mapa) |
| 4 | Matching geográfico real | base de valor del negocio | 1 | media |
| 5 | Backend + tiempo real | escalar a multiusuario | 1–2 | alta (seguridad) |
| 6 | Pagos/legales + QA | lanzar bien | 1 | baja-media |

**Definition of Done global de cada sprint:** `npm run lint && npm test && npm run build` verdes + demo con criterios marcados + doc de la sesión en ORIGO BRAIN (`08-SESSIONS`) + commit/tag local. Nunca push/deploy a `main` sin aprobación explícita (skill `origo-git-workflow`).
