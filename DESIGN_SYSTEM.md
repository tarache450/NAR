# Sistema visual NAR

La interfaz funcional usa fondo claro para formularios y tarjetas, hero azul petróleo, acciones verde azulado y acentos del branding NAR. Tipografías locales Inter y Manrope con `font-display: swap`. Logo SVG existente. Los estilos de la beta están en `src/styles/marketplace.css`; los estilos previos del prototipo viven en `src/index.css` y `src/styles/` y se cargan solo al abrir `/demo`.

Anchos: contenedor máximo 1180 px; controles mínimo 48 px; tarjetas y formularios fluidos. A 700 px navegación en dos filas, buscador dentro del hero y secciones en una columna. `:focus-visible` ofrece contorno visible; `prefers-reduced-motion` elimina movimiento innecesario. No se presentan ratings, identidades verificadas ni estimaciones de ruta que el producto no pueda demostrar.

La beta usa componentes locales `TripCard`, `RequestItem`, `AuthDialog` y `PublishForm` dentro de `MarketplaceApp.tsx`. Conviene extraerlos cuando crezcan y haya más pantallas; por ahora mantienen una superficie pequeña y directa. Ver `DESIGN.md` para intención y limitaciones de producto.
