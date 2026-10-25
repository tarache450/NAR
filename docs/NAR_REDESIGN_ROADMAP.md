# NAR — Roadmap del rediseño

Actualizado: 2026-10-18. `COMPLETADO` describe trabajo hecho en `feature/nar-uiux-redesign-v2`; no implica publicación. Cada fase se cierra con revisión visual, funcional y documentación.

| Fase | Alcance | Estado |
|---|---|---|
| 01 Descubrimiento | Repo, stack, marca, Framer, referencias del usuario y límites del prototipo | COMPLETADO |
| 02 Sistema visual | Tokens, tipografía, espaciado, componentes base y criterios responsive | COMPLETADO en Explorar; PENDIENTE extender a vistas secundarias |
| 03 Hero | Navegación, mensaje, búsqueda, ruta visual, fotografía original, FloatingLines y fallback | COMPLETADO |
| 04 Página Explorar | Destinos, explicación, resultados y confianza coherentes con el hero | COMPLETADO |
| 05 Vistas secundarias | Buscar rutas y perfil alineados; telemetría, modales y pase aún por adaptar | EN PROGRESO |
| 06 Calidad | Responsive, teclado, contraste, reduced motion, dependencias, rendimiento y SEO | EN PROGRESO |
| 07 Producto real | Persistencia, identidad, pagos, QR, telemetría y chat auténticos | PENDIENTE; requiere decisiones de producto y servicios |

## Próxima iteración de diseño

1. Adaptar Telemetría y los modales de publicar/reservar/pase al sistema visual; revisar Escape, foco y mensajes de demo.
2. Optimizar las imágenes de las tarjetas, disminuir JavaScript inicial y revisar Core Web Vitals en navegador.
3. Resolver las etiquetas de funciones simuladas en cada modal. Evitar promesas de verificación, SOS o GPS que aún no existen.
4. Realizar una revisión de accesibilidad con herramienta automatizada y recorrido manual de teclado; registrar hallazgos.

## Decisiones abiertas

- La foto editorial, el papel claro de búsqueda y la intensidad de FloatingLines son propuestas v2. Validar con la empresa antes de considerarlas marca definitiva.
- No introducir backend, autenticación ni pagos dentro del sprint visual sin definir producto, seguridad y alcance.
- El diseño usa destinos reales como nombres, pero recorridos, precios y perfiles actuales son datos de ejemplo.

## Criterio de cierre de cada iteración

`npm install`/`npm ci`, `npm run lint` y `npm run build` deben pasar; se comprueban los anchos 320, 375, 768, 1024 y 1440 px, el teclado y reduced motion, y se actualiza `NAR_IMPLEMENTATION_LOG.md`. Los commits son locales en la rama de trabajo hasta obtener autorización explícita para push/merge/despliegue.
