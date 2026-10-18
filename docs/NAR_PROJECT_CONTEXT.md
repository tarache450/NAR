# NAR — Contexto del Proyecto

**TASK ID:** NAR-DOCS-01 · Fecha: 2026-10-18 · Rama: `maniky/nar-docs-classes`
Fuente de verdad: inspección directa del código en este worktree (refs `archivo:línea`) + comandos ejecutados. Sin secretos incluidos.

---

## 1. Qué es NAR

NAR es una **web app single-page de viajes compartidos (carpooling) para El Salvador**: pasajeros buscan asientos en trayectos que conductores ya van a hacer (San Salvador → Santa Ana, El Tunco, San Miguel, Sonsonate), reservan, obtienen un pase digital QR y pueden seguir la ruta "en vivo" y chatear con el conductor.

**Estado real:** es un **prototipo/demo front-end 100% cliente con datos mock**. No hay backend, no hay base de datos, no hay autenticación, no hay pagos reales. El título de sesión de `metadata.json` es `"Obsidian Kinetic"` y el paquete npm se llama `react-example` — es un scaffold mapeado a la marca NAR.

---

## 2. Stack (verificado en `package.json`)

| Capa | Tecnología | Versión declarada | ¿Usada de verdad? |
|---|---|---|---|
| UI | React + React DOM | ^19.0.1 | ✅ |
| Build / Dev server | Vite | ^8.3.0 | ✅ |
| Lenguaje | TypeScript (sin `strict` en `tsconfig.json`) | ^7.0.2 | ✅ |
| Estilos | Tailwind CSS v4 vía plugin `@tailwindcss/vite` | ^4.3.3 | ✅ |
| Iconos | lucide-react | ^0.546.0 | ✅ |
| IA | `@google/genai` | ^2.4.0 | ❌ cero imports en `src/` |
| Backend local | express, dotenv, tsx | ^4.21.2 / ^17.2.3 / ^4.21.0 | ❌ cero imports; no existe `server.js` |
| Animaciones | motion | ^12.23.24 | ❌ no se importa; solo CSS keyframes en `src/index.css` |

Evidencia de "no usadas": `grep "genai|GEMINI|process.env"` y `grep "motion|express|dotenv"` sobre `src/` y `index.html` devuelven 0 coincidencias. `.env.example` declara `GEMINI_API_KEY` y `APP_URL` (placeholders del scaffold AI Studio), pero ninguna variable se lee en el código.

### Geometría del proyecto

- **Sin router**: la navegación es estado local (`activeTab: 'explore' | 'search' | 'telemetry' | 'profile'` en `src/components/BottomNav.tsx:10`; `'publish'` es un pseudo-tab que solo abre el wizard, `src/App.tsx:325-330`).
- **Todo el estado global vive en `App.tsx`** con `useState` (rides, filtros, modales, toast). No hay Context/Redux/Zustand ni cámara de datos.
- **Fuentes de datos**: una sola constante mock `INITIAL_RIDES` (4 viajes) y `POPULAR_ROUTES` (4 rutas) en `src/data/mockData.ts`.
- **Tipado de dominio** (`src/types.ts`): `Waypoint`, `Review`, `Driver` (con `verifiedDUI`, `verifiedPhone`), `Vehicle`, `Passenger`, `Ride` (status `scheduled | boarding | in_progress | completed`), `RoutePopular`.

---

## 3. Arquitectura (componentes y flujo)

```
main.tsx
└── App.tsx (estado global, filtros, modales, toast)
    ├── Navbar.tsx           — top bar: modo request/offer, tabs, toggle "Simular Móvil"
    ├── BottomNav.tsx        — nav móvil (<768px) con CTA central Publicar
    ├── TAB explore
    │   ├── HeroSearch.tsx          — origen/destino/fecha/pasajeros + chips de ciudades
    │   ├── PopularRoutesSection.tsx— 4 rutas populares 1-click
    │   ├── HowItWorksVisual.tsx    — 3 pasos visuales
    │   ├── RideCard.tsx            — tarjeta de viaje (grid filtrado en App, App.tsx:95-112)
    │   └── TrustSafetySection.tsx  — bloque de confianza (DUI, aporte justo en USD)
    ├── TAB search  → SearchView.tsx   — filtros franja horaria, precio máx ($2-8), rating mín (4.5/4.8/4.9)
    ├── TAB telemetry → LiveTelemetryView.tsx — "mapa" vectorial, velocidad simulada, manifiesto, SOS
    ├── TAB profile → ProfileView.tsx  — perfil fijo de "Miguel Ángel Cortez", vehículo, reseñas
    ├── RideDetailModal.tsx      — detalle + selector de asientos [1,2,3] + reserva
    ├── PublishRideWizardModal.tsx — wizard de 5 pasos para publicar asiento
    ├── DigitalBoardingPassModal.tsx — pase digital con QR decorativo y código NAR-XXXX-XXXX
    └── RideChatModal.tsx        — chat de la ruta (mensajes simulados)
```

Flujo de diálogo (lo único "dinámico"):
1. **Reservar**: `RideDetailModal → onBookSuccess` (`App.tsx:114-141`) descuenta `availableSeats` y agrega pasajero "Tú (Pasajero)" al estado local; muestra toast y abre el pase digital.
2. **Publicar**: wizard de 5 pasos crea un objeto `Ride` nuevo (`PublishRideWizardModal.tsx:56-132`) lo agrega al inicio de la lista (`App.tsx:143-149`).

Diseño: tema oscuro con tokens propios (`--color-primary #00c29a`, superficies `#0c1017/#131722`, `src/index.css:8-26`), fuentes Inter/Manrope desde Google Fonts (`index.html:14`), imaginería de Unsplash.

---

## 4. Funcionalidades reales (las que funciona el demo)

1. **Explorar**: buscador hero con origen/destino/fecha/pasajeros, chips de destinos rápidos, rutas populares 1-click, filtro por ciudad (tags Santa Ana, El Tunco, San Miguel, Sonsonate), grid de viajes filtrado in-memory (`App.tsx:95-112`), estado vacío con CTA a publicar.
2. **Buscador avanzado** (`SearchView.tsx:43-69`): filtro por franja horaria (parse AM/PM de string), precio máximo (slider $2–8), rating mínimo (4.5/4.8/4.9) y reset de filtros.
3. **Reserva** (`RideDetailModal.tsx`): detalle con recorrido en paradas, copasajeros, reseñas; selector de asientos limitado a disponibles; confirmación simulada (1 s) que muta el estado.
4. **Publicar** (`PublishRideWizardModal.tsx`): wizard progresivo en 5 pasos (origen, destino + parada intermedia, fecha/hora + flag "ruta diaria de trabajo", asientos + aporte USD, vehículo/placa + badge DUI) que crea viaje recurrente.
5. **Telemetría "en vivo"** (`LiveTelemetryView.tsx`): barra de progreso de ruta con nodos, velocidad simulada (ver §5), hora de llegada, placa, manifiesto de cabina con conductor + pasajeros + asientos libres, botones chat/pase/compartir/SOS.
6. **Pase digital** (`DigitalBoardingPassModal.tsx`): QR decorativo SVG, código aleatorio copiable, plaz # y detalles.
7. **Chat de ruta** (`RideChatModal.tsx`): hilo precargado, chips de respuesta rápida, respuesta del conductor tras 1.5 s.
8. **Perfil & confianza** (`ProfileView.tsx`): identidad con badges DUI/teléfono, métricas (84 viajes, 0 cancelaciones), vehículo verificado, reseñas.
9. **Simulador móvil** (`App.tsx:338-423`): marco de teléfono 390×844 con dynamic island, para demo responsive — funcionalidad real de la demo.
10. **Responsive + UI kit**: navbar sticky con drawer móvil, bottom nav con CTA elevado, toast, scrollbars y keyframes propios.

## 4b. Qué NO es funcional (advertencias justas)

- No hay login ni sesión: el usuario actual es siempre "Miguel Ángel Cortez" (`PublishRideWizardModal.tsx:62-75`, `ProfileView.tsx:44`, `Navbar.tsx:172`).
- No hay persistencia: reservas y viajes publicados se pierden al recargar (todo es `useState`).
- No hay mapa real: el "GPS 13.6929° N, -89.2182° W" (`LiveTelemetryView.tsx:140-141`) es texto fijo sobre un patrón de puntos CSS.
- No hay pagos: el "Aporte Total" es aritmética local (`seatPrice * seatCount`), no flujo de cobro.
- No hay envío real de ningún mensaje/dato a ningún servidor.

---

## 5. Problemas verificables (evidencia, no suposiciones)

### P1 — `npm install` falla tal cual viene el repo (dependencias incompatibles) 🔴
```
$ npm install
npm error code ERESOLVE
npm error While resolving: vite@8.3.4
npm error Found: esbuild@0.25.12
npm error   dev esbuild@"^0.25.0" from the root project
npm error peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.3.4
```
Causa: `package.json` fija `esbuild: ^0.25.0` en devDependencies mientras Vite 8.x exige esbuild 0.27/0.28. Solo instala con `npm install --legacy-peer-deps` (probado: instala 182 paquetes). **Esto rompe el onboarding de cualquier alumno/CI.**

### P2 — Datos 100% mock y volátiles
Todo vive en `INITIAL_RIDES` (`mockData.ts`) y se muta en memoria. Reservar/publicar funciona solo en sesión. Sin capa de datos ni contrato de API, cualquier rediseño real empieza desde cero.

### P3 — QR del pase no es un QR y su código es inestable
- El QR es un SVG decorativo con puntos fijos (`DigitalBoardingPassModal.tsx:64-96`); no codifica nada (sin librería de QR).
- `passCode` se calcula en el cuerpo del componente con `Math.random()` (`DigitalBoardingPassModal.tsx:26`): se regenera en cada render — al pulsar "Copiar", `setCopied(true)` re-renderiza y el código mostrado cambia respecto al copiado.

### P4 — Botones que prometen seguridad y no hacen nada
- "Compartir con Familiar": `handleShareTrip` solo cambia el texto del botón; no hay `navigator.share`, `clipboard` ni link real (`LiveTelemetryView.tsx:48-51`).
- "Botón S.O.S.": `setSosActive(!sosActive)` — un toggle de color local; sin flujo de emergencia ni notificación (`LiveTelemetryView.tsx:104-113`).

### P5 — Telemetría fake
La velocidad es un random walk con `setInterval(2500ms)` + `Math.random()` acotado entre 60–88 km/h (`LiveTelemetryView.tsx:37-46`); el nodo de vehículo siempre marca "Santa Tecla — Completada" para cualquier ruta (`LiveTelemetryView.tsx:176`).

### P6 — Chat con respuesta canned
Sin importar lo que escribas, el conductor responde siempre lo mismo tras 1.5 s (`RideChatModal.tsx:84`). El badge "PRIVADO" (`RideChatModal.tsx:114-117`) y la claim "Encrypted In-Ride Chat" (`App.tsx:477`) no tienen sustento técnico.

### P7 — Wizard de publicación con datos inventados fijos
`arrivalTime: '07:45 AM'`, `estimatedDuration: '1h 15m'`, `distanceKm: 64.0`, hora de waypoint `07:00 AM` y el conductor siempre "Miguel Ángel Cortez ★5.0" se hardcodean igual para cualquier origen/destino/hora que teclee el usuario (`PublishRideWizardModal.tsx:94-115`).

### P8 — Fechas hardcodeadas caducadas
Los pills del hero dicen "Mié 16 … Dom 20" con strings fijos (`HeroSearch.tsx:44-50`); hoy es domingo 18/10/2026 → el calendario de la home ya miente.

### P9 — Asientos: selector de reserva limitado a 3
El wizard permite publicar hasta 4 asientos (`PublishRideWizardModal.tsx:360`), pero el modal de reserva `slice(0, ride.availableSeats)` sobre `[1,2,3]` nunca puede reservar 4 (`RideDetailModal.tsx:226`).

### P10 — Higiene de proyecto
- Deps muertas inflando install/audit: `@google/genai`, `express`, `dotenv`, `tsx`, `motion` (cero imports; verificado por grep).
- Triple identidad del repo: `package.json` name `react-example`, `metadata.json` name `Obsidian Kinetic`, brand NAR.
- `lint` es solo `tsc --noEmit`; no hay ESLint. **No hay ningún test** (sin script `test`, sin archivos de test) y `tsconfig.json` no activa `strict`.
- `npm run clean` borra `server.js`, que no existe en el repo.
- Build emite warning de deprecación `__dirname` en `vite.config.ts:11` (Vite recomienda `import.meta.dirname`).
- Cosméticos: avatar duplicado (el "Dr. Carlos Mendoza" comparte foto Unsplash con la reseñista María José, `mockData.ts:53/66`).

### Lo que SÍ funciona (verificado por ejecución)
| Comando | Resultado |
|---|---|
| `npm run lint` (tsc --noEmit) | ✅ 0 errores (con deps instaladas vía `--legacy-peer-deps`) |
| `npm run build` (vite build) | ✅ 1676 módulos, 349 kB JS gzip 97 kB, en ~2.2 s |
| `npm install` default | ❌ ERESOLVE (P1) |
| `npm test` | ❌ no existe el script |

---

## 6. Mapa archivo-por-archivo

| Archivo | Líneas aprox. | Rol | Riesgos notables |
|---|---|---|---|
| `App.tsx` | 505 | Estado global + tabs + filtros + toast + phone frame | estado monolito, handles con `Date.now()` |
| `types.ts` | 91 | Modelo de dominio | buena base, pero sin IDs de usuario |
| `data/mockData.ts` | 429 | 4 rides + 4 rutas populares | única fuente de datos |
| `Navbar/BottomNav.tsx` | ~390 | Navegación desktop/móvil | coherente |
| `HeroSearch.tsx` | 121+ | buscador hero | fechas hardcodeadas (P8) |
| `SearchView.tsx` | 260 | buscador avanzado | parse AM/PM frágil (`'2:30 AM'.split(':')[0]` OK, pero sin validar) |
| `RideDetailModal.tsx` | 285 | reserva | cap 3 asientos (P9), confirmación fake |
| `PublishRideWizardModal.tsx` | 503 | publicar | datos fake fijos (P7) |
| `LiveTelemetryView.tsx` | 357 | "en vivo" | telemetría fake (P5), SOS/share muertos (P4) |
| `DigitalBoardingPassModal.tsx` | 154 | pase | QR decorativo + código inestable (P3) |
| `RideChatModal.tsx` | 219 | chat | respuesta canned (P6) |
| `ProfileView.tsx` | 228 | perfil | identidad fija (§4b) |
| `index.css` | 92 | tokens + keyframes | bien organizado |
| `vite.config.ts` / `tsconfig.json` | 22/27 | config | warning `__dirname`; sin `strict` |

*Líneas mayormente 1-1 con lo contado en lectura; aproximaciones ±5 líneas para los que leí parcialmente.*

---

## 7. Evaluación honesta

- **Como demo de producto, 8/10**: la narrativa de producto es muy fuerte (aporte justo en USD, DUI verificado, rutas reales de El Salvador, pase de abordaje, telemetría, chat) y el UI es coherente y pulido.
- **Como base de desarrollo, 3/10**: sin backend, sin auth, sin persistencia, sin tests, y cuatro de los pilares más virales de la apuesta (QR, telemetría, chat, SOS) son maquetas con lógica falsa presentada como real dentro de la app.
- **Prioridad #1 absoluta**: arreglar P1 (instalación rota) antes de cualquier trabajo educativo sobre este repo — nadie puede ni instalar el proyecto con el flujo estándar.

---

## 8. Convenciones y secretos

- Estilo funcional con hooks y componentes `const` exportados; Tailwind utility-inline; español en la UI; ids con prefijos (`ride-sv-…`, `wp-…`, `pas-…`).
- No hay secretos en el repo: solo `.env.example` con placeholders `MY_GEMINI_API_KEY`/`MY_APP_URL` (y ninguna de esas variables se usa en código). Mantener así.
