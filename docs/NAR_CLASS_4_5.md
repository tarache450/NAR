# ORIGO Academy — Clases 4 y 5 con NAR

Duración total: **120 minutos**. Proyecto: la rama local del rediseño de NAR. El alumno trabaja en su propia rama/worktree y compara el estado inicial (`cec47e1`) con el rediseño. La sesión se centra en estructura web, análisis visual, sistema de diseño, componentes, responsive, interactividad y validación. No requiere backend ni servicios de pago.

## Resultados de aprendizaje

Al terminar, el alumno puede explicar dónde viven vistas, datos y estilos; identificar decisiones de una referencia visual; modificar un token y ver su alcance; editar un componente pequeño; comprobar la página en móvil y escritorio; y distinguir una animación decorativa de una función esencial.

| Min | Bloque | Trabajo del alumno | Apoyo de Codex / delegación | Entregable |
|---:|---|---|---|---|
| 0–10 | Abrir NAR | Ejecuta `npm ci`, `npm run dev`; identifica `src/App.tsx`, `src/components`, `src/styles`, `public` | Codex aclara el flujo de datos; OpenCode puede enumerar archivos | Mapa de 5 carpetas y responsabilidades |
| 10–30 | Analizar referencias | Compara Framer, ROVA, Aurevia y Flux con el hero actual: titular, CTA, foto, tarjetas, movimiento | Codex explica qué rasgos se adaptaron a NAR y cuáles siguen provisionales | 3 observaciones con captura o nota |
| 30–50 | Sistema de diseño | Localiza en `tokens.css` dos colores y dos tipografías; modifica una variable en su rama y observa hero, botón y tarjetas | Codex revisa contraste y consistencia | Mini ficha de tokens + cambio reversible |
| 50–70 | Componentes | Recorre `HeroSearch`, `Navbar`, `PopularRoutesSection`; cambia un texto de ejemplo y añade una etiqueta de demo accesible | OpenCode puede explicar props; Codex revisa semántica | Diff de un componente con motivo |
| 70–90 | Responsive | Inspecciona 320, 375, 768 y 1440 px; corrige un desbordamiento o espaciado sin ocultar contenido | Codex ayuda a localizar el selector; Antigravity puede proponer variante visual aislada si está disponible | Antes/después con 2 capturas |
| 90–105 | Interacción y movimiento | Prueba menú Sheet con teclado, FAQ Accordion y hero con reduced motion; describe el fallback de FloatingLines | Codex explica WebGL2 y degradación progresiva | Lista de 4 comprobaciones observadas |
| 105–120 | Validar y presentar | Ejecuta `npm run lint` y `npm run build`; muestra su cambio y un límite del prototipo | Codex revisa el diff y separa hechos de propuestas | Informe de una página y commit local |

## Guion práctico

1. **Inicio.** Mostrar `git status`, rama y commit. En un worktree de clase, nunca editar `main`. Señalar que `npm ci` funciona en la rama del rediseño porque se corrigió el conflicto de `esbuild` del estado inicial.
2. **Referencia.** Pedir al alumno que marque el punto focal y la acción principal de cada captura. Debe explicar por qué una tarjeta con ruta y una foto de carretera cuentan la historia de NAR mejor que copiar pantallas de running o finanzas.
3. **Token.** Cambiar temporalmente `--color-primary` en `tokens.css`, observar todos los lugares afectados y restaurarlo. Esto demuestra el valor de una fuente única.
4. **Componente.** Editar el texto descriptivo de una ruta de ejemplo o una respuesta del FAQ. Confirmar que el texto sigue siendo verdadero y que el botón mantiene nombre accesible.
5. **Responsive.** Abrir las herramientas del navegador y comprobar ancho de documento igual al viewport. Observar que el menú desktop pasa a Sheet y las rutas pasan de cuatro a dos y una columna.
6. **Movimiento.** Activar `prefers-reduced-motion` y comprobar que la foto, el SVG y los CTA siguen utilizables sin FloatingLines.
7. **Cierre.** Cada alumno presenta un cambio, evidencia visual y un pendiente. Guardar el aprendizaje en un commit local y una nota breve.

## Evaluación y límites

- 30% comprensión de estructura y referencias; 30% cambio de componente/token; 25% responsive y accesibilidad; 15% evidencia de lint/build y explicación del prototipo.
- Codex ejecuta cambios de arquitectura, integra componentes y revisa; el alumno realiza el cambio pequeño, inspección visual y defensa de la decisión. OpenCode/Hermes sirven para inventario o documentación; Antigravity puede maquetar una variante aislada si realmente está disponible. Ningún agente sustituye la revisión del alumno.
- Rutas, perfiles, reservas, pase, chat y telemetría no son servicios reales. No se usan credenciales ni se publica la rama durante la clase.
