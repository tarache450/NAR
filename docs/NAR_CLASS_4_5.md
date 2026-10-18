# Clases 4–5 de ORIGO Academy — "Auditar y rediseñar NAR"

> Para reproducir los errores de instalación y build de esta clase, partir del commit de estudio `cec47e1` en un worktree aislado. La versión actual del repositorio ya corrige esos dos problemas.

**TASK ID:** NAR-DOCS-01 · Duración: **120 minutos** (2 sesiones de 60 o un bloque) · Nivel: intermedio · Modalidad: trabajo en worktree aislado por alumno (nunca sobre `main`).

**Proyecto de estudio:** NAR (carpooling para El Salvador) — prototipo React 19 + Vite 8 + Tailwind v4, 100% front-end con datos mock. Base factual de la clase: `docs/NAR_PROJECT_CONTEXT.md` (leerlo ANTES de la clase, profesor y alumnos).

**Filosofía pedagógica:** los alumnos aprenden el ciclo honesto "verificar → diagnosticar → delegar → revisar → verificar de nuevo". Cada bloque alterna hands-on del alumno con tareas asignadas a Codex (agente de código) y delegaciones a roles del ecosistema. **Regla de oro de la clase (léela en voz alta): si un feature miente en pantalla, es un bug.**

---

## Objetivos de aprendizaje

Al terminar, el alumno sabe:
1. Ejecutar un **audit reproducible** de un repo pequeño (instalar, lint, build, greps) y evidenciar problemas con comandos, no con opiniones.
2. Distinguir **lo que la app muestra** vs **lo que la app hace** (QR/telemetría/chat/SOS fake de NAR como casos de estudio).
3. **Delegar y revisar**: escribir prompts para Codex con criterios de aceptación verificables, y auditar el resultado.
4. Priorizar según riesgo: arreglar el Sprint 0 (instalación rota) antes que agregar cualquier feature.

Prerrequisitos: Node 22 y npm instalados; cuenta de Codex u OpenCode disponible; haber leído el PROJECT_CONTEXT (10 min previos).

---

## Estructura del bloque (tiempos reales)

| # | Bloque | Tiempo | Quién actúa |
|---|---|---|---|
| 0 | Setup del worktree | 5' | Alumno (guiado) |
| 1 | Audit reproducible de NAR | 20' | Alumno hands-on |
| 2 | Casos de estudio: funcionalidad que miente | 15' | Alumno + discusión |
| 3 | Delegar el fix P1 a Codex | 25' | Codex ejecuta, alumno revisa |
| 4 | Hands-on del alumno: refactor DataPort | 25' | Alumno escribe código |
| 5 | Delegación al ecosistema ORIGO (roles) | 15' | Codex + roles |
| 6 | Cierre: informe + commit local | 15' | Alumno |
| | **Total** | **120'** | |

---

## Bloque 0 (5') — Setup del worktree

Alumno:
```bash
cd ~/orca/workspaces   # o donde estén los worktrees de NAR
# cada alumno trabaja en SU worktree aislado, jamás en main
git clone <repo NAR> nar-clase-<tu-nombre>   # o worktree si ya existe
cd nar-clase-<tu-nombre>
git switch -c clase/audit-nar
```
Verificación de salida: `git status` muestra tu rama y un árbol limpio.

---

## Bloque 1 (20') — Audit reproducible (hands-on del alumno)

Ejecute y **anote el resultado textual** de cada uno en `docs/audit-notes.md` (crear):

1. `npm install` → **¿qué error da exactamente y mencionando qué paquete?** (P1: conflicto esbuild vs vite)
2. `npm install --legacy-peer-deps` → ¿instala? ¿cuántos paquetes?
3. `npm run lint` → ¿con "lint" qué se ejecuta? ¿hay ESLint en el repo?
4. `npm run build` → ¿pasa? ¿qué warning emite y en qué archivo?
5. `npm test` → ¿existe? (no) — primera conclusión: repo sin tests.
6. `grep -rn "genai\|express\|dotenv\|motion" src/ index.html` → ¿cuántas coincidencias? ¿qué concluye sobre las deps de package.json?
7. `grep -rn "Math.random\|setInterval" src/` → ¿en qué componente aparece y qué anima?

Checkpoint (profesor dibuja en pizarra la tabla Resultado/Causa/Severidad): el alumno debe poder decir **sin mirar notas** cuál es el problema más urgente y por qué (P1: nadie puede ni instalar con el flujo estándar).

Errores comunes de esta fase: confundir "build pasa" con "sistema sano"; no capturar el texto del error.

---

## Bloque 2 (15') — Casos de estudio: "funcionalidad que miente"

Discusión guiada por el profesor, usando como evidencia el PROJECT_CONTEXT §5:

| Caso | Qué promete la UI | Qué hace el código | Archivo de evidencia |
|---|---|---|---|
| A. Pase digital | "PASE VERIFICADO" + QR escaneable | SVG decorativo + código con `Math.random()` recalculado en cada render | `DigitalBoardingPassModal.tsx:26, 64-96` |
| B. Telemetría | "MONITOREO EN TIEMPO REAL", GPS fijado | `setInterval` + `Math.random()` cada 2.5 s | `LiveTelemetryView.tsx:37-46` |
| C. Chat | Badge "PRIVADO" | Todo local; respuesta canned tras 1.5 s | `RideChatModal.tsx:84` |
| D. SOS | Botón de emergencia | toggle de color local | `LiveTelemetryView.tsx:104-113` |
| E. Compartir | "¡Enlace Copiado!" | no copia nada, no existe el enlace | `LiveTelemetryView.tsx:48-51` |

Ejercicio rápido del alumno (3'): elegir un caso y redactar en una línea: *síntoma visible, causa raíz, severidad de negocio (si esto saliera a producción con usuarios reales)*. Se comparte 1 por grupo.

---

## Bloque 3 (25') — Delegar a Codex: el fix de instalación (P1) + primera limpieza

Tarea asignada a Codex (prompt modelo que la clase copiará/adaptará):

```
En este worktree (NO edites src/ ni hagas push):
1. Corrige package.json para que `npm install` estándar resuelva sin --legacy-peer-deps
   (resuelve el conflicto esbuild ^0.25.0 vs vite@8.x, prefiriendo esbuild 0.27/0.28
   o removiéndolo si solo es peer transitivo — justifica la elección).
2. Elimina las dependencias sin imports verificados: @google/genai, express, dotenv, tsx, motion.
   Antes de borrarlas, verifica con grep que realmente no se importan.
3. Renombra el proyecto a "nar-web" en package.json.
4. Reemplaza __dirname por import.meta.dirname en vite.config.ts.
Criterios de aceptación (yo los verifico después):
- `npm install` (sin flags) y `npm ci` terminan sin error ERESOLVE.
- `npm run lint`, `npm run build` y un `npm ls esbuild` limpio.
- No tocaste src/ ni creaste secretos ni hiciste push.
Reporta el diff completo y los comandos ejecutados.
```

El **alumno no escribe el fix a mano**: actúa como revisor/plantea el prompt, lanza Codex, y cuando termina, revisa:
1. `git diff` — ¿solo package.json/package-lock.json/vite.config.ts? ¿algo más? (lección: el agente puede sobrepasar alcance)
2. Reproducir los criterios de aceptación uno a uno.
3. Si un criterio falla → iterar el prompt (típicamente falta "no edits beyond..." o el agente eligió una solución peor).

Actividad paralela del alumno durante la ejecución de Codex (5'): redactar su propia versión del prompt para el fix del QR real con 3 criterios de aceptación verificables.

---

## Bloque 4 (25') — Hands-on del alumno: primer refactor con contrato

Objetivo: el entregable mínimo del Sprint 1 del roadmap, escrito a mano por el alumno (Codex NO en esta fase):

1. Crear `src/domain/dataPort.ts`:
```ts
export interface DataPort {
  listRides(): Ride[];
  bookSeats(rideId: string, seats: number, passenger: Passenger): { ok: true } | { ok: false; reason: string };
}
```
2. Implementar `LocalStorageDataPort` (10–15 líneas de estado real):
   - guarda los rides con updates de asientos; hace seed desde `src/data/mockData.ts` la primera vez.
   - `bookSeats` debe devolver `{ok:false}` si `availableSeats < seats` (aquí y solo aquí se corrige la lógica base de P9).
3. En `App.tsx` sustituir `setRides(prev => ...)` del `handleBookSuccess` por la llamada al puerto. Primera lección de gobernanza de estado sin derribar la app.
4. Verificación (los mismos criterios del Sprint 1 del roadmap):
   - [ ] reservar el último asiento no muestra un asiento de más en el modal (`RideDetailModal.tsx:226` aún limita el selector a 3 — registrar, no arreglar en clase)
   - [ ] recargar la página conserva la reserva (localStorage)
   - [ ] `npm run lint && npm run build` siguen verdes

Si el alumno no llega: es el momento de comparar con la solución del profesor (dejarla en un branch aparte `clase/solucion-bloque4` solo para revisión).

---

## Bloque 5 (15') — Delegaciones al ecosistema ORIGO (roles)

El profesor asigna (o cada alumno elige según lo que documentó en su rama) y **las delegaciones se lanzan y se esperan a tiempo real con una ronda de verificación**, no se implementan en clase:

| Delegación | Agente sugerido | Entregable esperado | Se revisa con |
|---|---|---|---|
| Redactar README de onboarding post-Sprint-0 | Codex (prompt de 10 líneas) | README.md con setup de 3 comandos | alumno + profesor |
| Auditoría de accesibilidad de los 4 modales | Codex o especialista a11y | lista axe-like de errores críticos | humano |
| Diseño del flujo SOS honesto (Bloque 3 del roadmap) | Humano (delicado, sensible) + Codex para UI | spec de 1 página | profesor |
| Fuente de mapas sin API key (Leaflet + OpenStreetMap) | Codex (investigación y spike) | demo pequeña | ATLAS / profesor |
| Fechas dinámicas del hero (P8) | Codex | diff pequeño con test | alumno |

Reglas de delegación que deben quedar grabadas:
- Nada se da por hecho hasta que el **delegante verifica los criterios de aceptación**.
- Tareas sensibles (dinero, seguridad, legal) **no se delegan a ciegas**: humano decide, agente ejecuta.
- Documentar prompt usado, salida y decisión final (hacerlo en `docs/audit-notes.md`).

---

## Bloque 6 (15') — Cierre y commit local

Alumno:
1. Redacta en `docs/audit-notes.md` un resumen: el problema que más duele (elegido entre P1–P10 con justificación), si su DataPort funciona o no, y qué delegó/revisó.
2. Ejecuta la batería final del día:
```bash
npm run lint && npm run build   # y npm test si ya existe
git add docs/ && git commit -m "docs(clase4-5): audit NAR + dataPort + plan delegaciones"
```
3. Pregunta de cierre: **si el proyecto aún falla `npm install` estándar, ¿por qué?** (lección final: verificar siempre y marcar como `unverified` aquello que no se pudo probar).

Tarea post-clase (para la Clase 6): instalar el repo limpio en su máquina, leer el Sprint 1 del roadmap (`docs/NAR_REDESIGN_ROADMAP.md`) e implementar el QR real de su pase de la clase con una librería de QR y su DataPort — llega con PR abierto en su rama de clase.

---

## Materiales y criterios de evaluación

- **Eval. Bloque 1 (30%)**: notas de auditoría completas con la evidencia textual de los 7 comandos.
- **Eval. Bloque 3 (25%)**: calidad del prompt + si la revisión detectó (o no) sobre-alcances de Codex.
- **Eval. Bloque 4 (30%)**: DataPort con las 3 casillas de verificación.
- **Eval. Bloque 5 (15%)**: al menos 1 delegación lanzada, esperada, verificada y documentada.

Escala honesta: cada criterio se marca `verificado` (con comando/verificador como evidencia) o `unverified` — se adopta la norma del ecosistema: **"no lo probé" no es una excusa aceptable, ni para agentes ni para alumnos**.

---

## Riesgos operativos de la clase

- **P1 rompe la clase si no se gestiona primero**: sin `--legacy-peer-deps` (o sin el fix del Bloque 3) nadie puede ejecutar nada. El profesor lo resuelve en los primeros 5 minutos; plan B: tratar la reproducción del error como parte del ejercicio del Bloque 1.
- Tiempo: el Bloque 3 puede estirarse (Codex + revisión). Ten el prompt en texto listo para copiar.
- Si Codex está saturado o lento: mientras corre, el alumno adelanta el ejercicio individual (redactar el prompt del QR) para no perder el hilo.
- No editar `src/` excepto en el Bloque 4 (está explícito); no push/deploy en ningún momento; los commits son locales en la branch de clase.
