# NAR

Beta local de viajes compartidos para El Salvador. La página principal usa viajes y cuentas persistidos; `/demo` conserva el prototipo visual anterior con datos de ejemplo.

## Inicio local

Requiere Node.js compatible con Vite 8 y npm. Ejecuta `npm ci`, luego `npm run dev` y abre `http://127.0.0.1:3000`. El primer arranque crea `.env.local` con un secreto de sesión aleatorio; no se versiona. Si el puerto está ocupado, configura `PORT`.

`npm run lint`, `npm test`, `npm run build` y `npm audit --omit=dev` son los controles principales. `npm start` sirve el build con `NODE_ENV=production`; requiere HTTPS para que las cookies `Secure` funcionen en un navegador. Consulta [.env.example](.env.example).

## Estado del producto

Una cuenta puede publicar trayectos y solicitar asientos. La búsqueda compara ciudades o puntos en el orden de las paradas declaradas por el conductor. La aceptación reserva capacidad en una transacción SQLite. Hay avisos dentro de «Mis viajes» para solicitudes y cancelaciones. No hay verificación de identidad, pagos, mapas de carretera, mensajería, correo ni notificaciones externas; no debe tratarse esta beta como operación pública lista para lanzamiento.

Los detalles técnicos y pendientes están en [ARCHITECTURE.md](ARCHITECTURE.md), [INTEGRATIONS.md](INTEGRATIONS.md), [SEO_STRATEGY.md](SEO_STRATEGY.md), [SECURITY_NOTES.md](SECURITY_NOTES.md) y [TESTING.md](TESTING.md). El diseño y el alcance se describen en [PRODUCT.md](PRODUCT.md) y [DESIGN.md](DESIGN.md).

## Datos y despliegue

SQLite vive en `var/nar.sqlite` por defecto y no se sube a Git. `server/db.ts` aplica migraciones versionadas al arrancar. `npm run db:backup` crea una copia local verificada en `backups/` (fuera de Git); `NAR_DB_PATH` permite elegir la base de origen. La restauración se probó sobre una copia aislada en tests. Antes de operar con usuarios reales todavía se necesitan cifrado y retención de respaldos, revisión legal y operación HTTPS. No hay despliegue ni cambios en producción asociados a esta rama.
