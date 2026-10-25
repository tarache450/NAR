# SEO NAR — estado y estrategia

## Estado verificable

`index.html` tiene idioma español, título, descripción, OG y Twitter. Se añadió una guía estática con contenido visible y metadatos únicos en `/como-funciona/`. `scripts/generate-seo.mjs` genera canonical, OG URL/imagen, robots y sitemap para ambas páginas al configurar `SITE_URL`; **solo** cambia a `index,follow` con `SEO_INDEXABLE=1`. `/demo` envía `X-Robots-Tag: noindex,nofollow` en producción y las rutas desconocidas devuelven 404. El entorno local y cualquier build sin habilitación explícita permanecen noindex. No hay indexación confirmada ni Search Console conectada.

La SPA puede ser renderizada por Google, pero su HTML inicial carece de contenido de portada más allá del contenedor React. La guía ya entrega HTML útil sin JavaScript; antes de publicar conviene prerenderizar también la portada y cualquier ruta estable que se cree, con título, descripción, canonical, H1 y enlaces propios; no cambiar de framework solo por SEO. El sitemap debe incluir únicamente páginas públicas con contenido útil y canónico. Las búsquedas parametrizadas, sesiones, perfiles y viajes volátiles deben quedar fuera. No se añade schema de reseñas, LocalBusiness ni viajes que no puedan verificarse. [Google explica el renderizado de JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) y [advierte que un sitemap no garantiza indexación](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

## Investigación cualitativa de keywords

Sin acceso a Search Console, Keyword Planner o datos fiables de volumen de El Salvador; **no se estiman búsquedas ni dificultad numérica**. Son hipótesis de lenguaje e intención a validar con usuarios y herramientas antes de crear páginas. Prioridad expresa relevancia de producto, no volumen.

| Consulta/cluster | Intención | Geografía | Página objetivo | Conversión | Prioridad |
|---|---|---|---|---|---|
| viajes compartidos El Salvador; compartir carro El Salvador | Encontrar alternativa de viaje | País | Portada / explicación del servicio | Alta | P0 |
| viaje compartido San Salvador Santa Ana; Santa Tecla Santa Ana | Buscar asiento en corredor | Ciudades | Página de corredor solo con datos y contenido real | Alta | P1 |
| viaje compartido San Salvador San Miguel; San Salvador La Libertad | Buscar asiento en corredor | Ciudades | Página de corredor validada | Alta | P1 |
| publicar viaje compartido; ofrecer asientos en mi carro | Publicar | País | Guía de publicación | Alta | P1 |
| cómo funciona compartir carro; compartir gastos de gasolina | Informarse | País | Guía de funcionamiento y reglas | Media | P1 |
| carpooling El Salvador | Alternativa lingüística | País | Portada si se valida uso local | Media | P2 |

La comparación de [BlaBlaCar](https://www.blablacar.es/), [Uber](https://www.uber.com/) y [Poparide](https://www.poparide.com/) informa la jerarquía de búsqueda y publicación, no prueba demanda local. Entrevistas y Search Console deben validar si “viaje compartido”, “jalón”, “aventón” u otra expresión se usa realmente en El Salvador.

## Plan de publicación

1. Verificar dominio, empresa responsable y textos legales auténticos; revisar promesas de seguridad y servicios.
2. Crear páginas editoriales con contenido original sobre cómo funciona y publicar, y páginas de corredor solo con disponibilidad o información propia verificable.
3. Añadir HTML inicial, metadatos únicos, canonical y enlaces internos a cada URL; generar sitemap solo de ellas. Schema `Organization` o `WebSite` únicamente con datos reales, siguiendo los [tipos admitidos por Google](https://developers.google.com/search/docs/appearance/structured-data/search-gallery).
4. Activar `SEO_INDEXABLE=1` para el dominio aprobado, revisar robots/canonicals en build y solicitar inspección con Search Console. Medir impresiones, clics, consultas y Core Web Vitals; iterar contenido con evidencia.

No se crea ficha local ni marcado `LocalBusiness` sin dirección, presencia y elegibilidad reales. Una única versión `es-SV` no necesita `hreflang`; se añadirá solo si existen variantes localizadas equivalentes, según [Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions).
