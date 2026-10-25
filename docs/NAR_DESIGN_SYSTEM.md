# NAR — Sistema visual v2

Fecha: 2026-10-18. Sistema aplicado a navegación, hero, secciones de Explorar y primeras adaptaciones de Buscar rutas y Perfil. La identidad base proviene del logo y CSS originales; las adiciones se identifican abajo.

## Principios

1. La ruta es el motivo visual: nodos, líneas y destinos explican el producto.
2. Un titular fuerte y una acción primaria por bloque evitan competir con la búsqueda.
3. La fotografía añade contexto humano y geográfico; los datos quedan legibles encima.
4. La interacción responde sin exigir movimiento; teclado y `prefers-reduced-motion` tienen una experiencia completa.
5. Los datos simulados se identifican como tales.

## Tokens

Fuente de implementación: `src/styles/tokens.css`.

| Uso | Valor | Origen |
|---|---|---|
| Verde primario | `#00c29a` | Marca existente |
| Azul secundario | `#2563eb` | Marca existente |
| Cian acento | `#22d3ee` | UI existente |
| Fondo | `#0c1017` | Marca existente |
| Superficie | `#131722` | UI existente |
| Texto principal | `#f8fafc` | UI existente |
| Fondo hero | `#07151c` | Propuesta v2 |
| Superficie clara de búsqueda | `#f4f8f6` | Propuesta v2 |
| Texto sobre claro | `#102720` | Propuesta v2 |
| Títulos | Manrope | Marca existente |
| Cuerpo | Inter | Marca existente |

Espaciado: escala `--space-1` a `--space-7` (0.5–4.5 rem). Radios: 0.75 rem para controles, 1.25 rem para paneles. Movimiento: 180/280 ms con curva `cubic-bezier(0.2, 0.8, 0.2, 1)`; la línea de ruta usa un ciclo lento y se desactiva con reduced motion.

## Composición

- Desktop: navegación sticky, hero en dos columnas, formulario como superficie clara bajo el relato, cuatro tarjetas de destinos y módulos editoriales.
- Tablet: hero en una columna, tarjetas en dos columnas, menú de Sheet cuando la navegación deja de caber.
- Móvil: CTA de ancho completo, ilustración de ruta adaptada, formulario apilado, menú Sheet y navegación inferior existente.
- Los estados `hover`, `focus-visible`, `active` y `aria-current` se mantienen distinguibles. Los controles táctiles principales miden al menos 44 px.

## Componentes incorporados

- `FloatingLines` (React Bits): fondo WebGL2 del hero solo a partir de 768 px cuando no hay reduced motion; carga diferida, DPR 1.25, parada fuera del viewport y limpieza al desmontar. La composición CSS + fotografía + SVG permanece si falla WebGL2.
- `Sheet` (shadcn/ui): menú móvil con foco modal, cierre por Escape y navegación clara.
- `Accordion` (shadcn/ui): preguntas frecuentes sobre los límites reales del prototipo.

## Referencias y derechos

[ROVA](https://dribbble.com/shots/27819139-Rova-Smart-Running-Tracker-App), [Aurevia](https://dribbble.com/shots/27210462-Aurevia-AI-Support-Agent-SaaS-Website-Design), [Flux](https://dribbble.com/shots/25250355-Flux-Finance-Landing-Page) y el Framer facilitado por el usuario sirvieron para composición, movimiento y jerarquía. No se incorporaron sus imágenes, UI ni copias literales. La foto local del hero se generó específicamente para NAR.
