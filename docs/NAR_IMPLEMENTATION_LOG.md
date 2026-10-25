# NAR — Registro de implementación

## 2026-10-18 · Rediseño v2, primera iteración

**Base:** `origin/main` `cec47e1`, árbol limpio. **Trabajo:** `feature/nar-uiux-redesign-v2`. Sin push, merge ni despliegue.

### Cambios

- Navegación sticky con cuatro vistas, CTA publicar, menú móvil Sheet de shadcn y navegación inferior existente.
- Hero editorial con dos acciones, formulario de búsqueda accesible, ilustración SVG de ruta y fotografía original. FloatingLines de React Bits carga de forma diferida solo si hay WebGL2, ancho suficiente y movimiento permitido; foto/SVG son el fallback.
- Secciones de destinos, tres pasos y confianza rediseñadas con tokens compartidos. FAQ Accordion de shadcn aclara qué es real en el prototipo.
- Vistas Buscar rutas y Perfil alineadas al nuevo encabezado y al contenido de demo. Perfil ya no muestra verificaciones/estadísticas no comprobadas como reales.
- Búsqueda reconoce la zona metropolitana para el acceso rápido San Salvador → Santa Ana y normaliza nombres compuestos de destinos populares. Filtro de fecha acepta «Todas» y fecha ISO de una ruta nueva; publicar limpia filtros para mostrarla.
- `esbuild ^0.28.2` corrige la instalación y evita el aviso de seguridad de versiones anteriores. Se añadió lockfile, se renombró el paquete a `nar-web`, se corrigieron metadatos y el favicon, y Vite usa `import.meta.dirname`.
- `components.json` incluye el registro `@react-bits`. Se añadió shadcn MCP al config global de Codex sin reemplazar conexiones existentes; requiere reinicio de Codex para autodescubrimiento en sesiones futuras.

### Verificación ejecutada

| Comprobación | Resultado |
|---|---|
| `npm ci` | Correcto, 255 paquetes instalados |
| `npm run lint` | Correcto; ejecuta `tsc --noEmit` |
| `npm run build` | Correcto; Vite 8.3.4, sin aviso de `__dirname` |
| `npm audit --omit=dev --audit-level=low` | 0 vulnerabilidades |
| `git diff --check` | Correcto |
| Playwright: 320, 375, 768, 1024, 1440 px en Explorar | Sin desbordamiento horizontal |
| Playwright: móvil | Hero visible; menú Sheet abre y cierra con Escape; FAQ expande respuesta |
| Playwright: búsqueda rápida a Santa Ana | 1 ruta de ejemplo encontrada tras corregir origen metropolitano |
| Playwright: destino popular La Libertad / El Tunco | 1 ruta encontrada tras normalizar el nombre compuesto |
| Playwright: reduced motion | 0 canvas, SVG/foto y CTA presentes |
| Playwright: movimiento normal en desktop | Canvas de FloatingLines cargado después de la importación diferida |
| Playwright: Perfil móvil a 375 px | Encabezado, perfil de ejemplo y acciones; sin desbordamiento |
| shadcn MCP | Handshake `initialize`, `tools/list`, búsqueda y vista de Accordion/Sheet; comando de instalación obtenido y ejecutado |

**Tamaño de build observado:** CSS 72.08 kB, JS principal 412.73 kB (124.21 kB gzip), FloatingLines separado 13.67 kB (5.66 kB gzip), fotografía JPEG 318 kB. No se ejecutó Lighthouse ni auditoría automatizada de accesibilidad. No existe script de tests en el repositorio.

### Pendientes y riesgos

- Telemetría, chat, reserva, publicación y pase siguen con interfaz y datos de demostración heredados; requieren revisión visual y de mensajes antes de presentar NAR como producto operativo.
- Las imágenes externas de tarjetas/perfiles dependen de Unsplash. Optimización y sustitución por activos aprobados quedan pendientes.
- La superficie clara y la fotografía original son propuestas de diseño por validar con marca.
- Revisar contraste con herramienta automatizada, recorrido completo de teclado y Core Web Vitals. No se inventan puntuaciones.

### Origen del recurso generado

`public/images/nar-road-editorial.jpg` se creó con la herramienta integrada de generación de imágenes y se convirtió a JPEG para el proyecto. Prompt de producción: fotografía editorial original 3:2 de una carretera sinuosa por colinas salvadoreñas al atardecer azul, un vehículo pequeño en movimiento, sombras azul oscuro y reflejos verde azulado discretos, espacio visual para superponer una ruta SVG, sin texto, logos ni UI. Las referencias del usuario solo guiaron composición y atmósfera.
