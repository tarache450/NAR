# NAR — Contexto actual

Actualizado: 2026-10-18 · Rama de trabajo: `feature/nar-uiux-redesign-v2` · Base: `cec47e1` (`origin/main`).

## Producto y alcance real

NAR es un prototipo de viajes compartidos para El Salvador. Permite explorar rutas, filtrar viajes, abrir detalles, simular una reserva, publicar una ruta, ver un pase y navegar por vistas de búsqueda, telemetría y perfil. Todo funciona en el cliente con datos de `src/data/mockData.ts`; los cambios se pierden al recargar. No hay autenticación, pagos, verificación de identidad, seguimiento GPS, chat entre usuarios ni backend real. La interfaz señala este carácter de demostración en el hero, los resultados, confianza y el pie.

## Repositorio y arquitectura

- GitHub: `tarache450/NAR`; repo local: `/Users/mac/orca/NAR`.
- React 19, TypeScript 7, Vite 8, Tailwind CSS 4, lucide-react.
- `src/App.tsx` conserva las vistas mediante estado local (`explore`, `search`, `telemetry`, `profile`) y modales. No hay router ni rutas URL independientes.
- `src/components/` contiene vistas, tarjetas, modales, navegación y secciones. Buscar rutas y Perfil ya comparten el nuevo encabezado editorial; Telemetría y los modales siguen en el diseño anterior. `src/components/ui/` aloja Accordion y Sheet de shadcn; `src/components/motion/` contiene FloatingLines de React Bits.
- `src/styles/tokens.css`, `hero.css`, `sections.css` y `views.css` reúnen la nueva capa visual; `src/index.css` conserva Tailwind y estilos globales.
- `public/logo.svg` es el logo existente; `public/images/nar-road-editorial.jpg` es una fotografía original creada para este rediseño.
- `package.json` usa el nombre `nar-web`; `metadata.json` describe el prototipo NAR sin atribuirle servicios de servidor inexistentes.
- `components.json` registra `@react-bits` y las rutas del registro shadcn. El servidor shadcn MCP figura en `~/.codex/config.toml`; Codex debe reiniciarse para cargarlo automáticamente en sesiones nuevas.

## Identidad verificada

La marca previa usa fondo oscuro `#0c1017`, verde `#00c29a`, azul `#2563eb`, cian `#22d3ee`, Manrope para titulares e Inter para interfaz. El nuevo papel claro de búsqueda `#f4f8f6` y el encuadre editorial son decisiones provisionales de este rediseño. Ver `NAR_DESIGN_SYSTEM.md`.

## Referencias estudiadas

- Framer Conicorn: observado en una pestaña Chrome con acceso de sesión. Se tomaron jerarquía tipográfica, navegación compacta, ritmo editorial y adaptación por breakpoint; no se copiaron recursos ni contenido.
- Captura ROVA aportada por el usuario: sensación de movimiento, superposición de datos sobre fotografía y controles móviles sencillos.
- Capturas Aurevia aportadas por el usuario: contraste azul profundo, composición cinematográfica y diagramas finos.
- Enlace Dribbble de Flux: el URL compartido abre un listado general; el parámetro de campaña identifica [Flux – Finance Landing Page](https://dribbble.com/shots/25250355-Flux-Finance-Landing-Page). Se usa solo como inspiración de composición.

## Estado y límites

La instalación estándar fallaba en la base por `esbuild ^0.25.0` frente a Vite 8. Se actualizó a `^0.28.2` y se creó `package-lock.json`; `npm install`, `npm run lint` y `npm run build` pasan en la rama de trabajo. `npm audit --omit=dev` devolvió 0 vulnerabilidades tras esta actualización. `lint` ejecuta TypeScript, no ESLint. No existe script de tests. El pase QR es decorativo, y telemetría/chat/SOS son experiencias simuladas; no se presentan como servicios conectados. La auditoría de la base está conservada en `NAR_INITIAL_AUDIT.md`.

No se ha hecho push, merge ni despliegue.
