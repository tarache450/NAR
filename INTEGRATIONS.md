# Inventario de integraciones

Estado al 25 de octubre de 2026. Precios y límites cambian; validar antes de contratar. No se han configurado credenciales externas ni enviado mensajes.

| Prioridad | Servicio | Caso y estado | Credenciales, coste y límite | Riesgo/errores |
|---|---|---|---|---|
| P0 | API propia Express/SQLite | Cuentas, rutas y solicitudes: funcional local | `SESSION_SECRET` privado; SQLite local | Requiere almacenamiento persistente, backup y HTTPS antes de beta pública |
| P1 | Avisos dentro de NAR | Solicitudes, respuestas y cancelaciones: funcional local y persistente | Sin proveedor externo | Solo se ven al entrar en «Mis viajes»; falta entrega en tiempo real o email |
| P1 | Open-Meteo | Pronóstico de destino en `/demo`: funcional solo en prototipo; no participa en matching | Endpoint público sin clave para evaluación no comercial; la modalidad comercial exige suscripción | Puede fallar o faltar pronóstico; la UI del demo tiene estado de error/reintento. No usar como promesa de seguridad vial |
| P1 | Email transaccional, candidato Resend | Verificación, recuperación y avisos: **pendiente** | Dominio verificado y API key de envío; plan gratuito anunciado 3000/mes, 100/día | Sin consentimiento, política de entrega y plantillas no se debe activar. Preparar cola/reintentos idempotentes antes de enviar |
| P1 | Analítica de producto | Eventos locales `nar:product-event` para búsqueda, publicación y solicitud; sin transmisión externa | Proveedor y política por definir | Antes de conectar un destino, obtener consentimiento aplicable y no transmitir nombres, correos, rutas personales o IDs directos |
| P2 | Google Maps/Routes | Geocodificación, mapa y tiempo de desvío: **pendiente** | Billing y clave restringida por API/origen; cobro por consulta o elemento | Coste variable, precisión geográfica y cuotas; la beta usa solo paradas textuales |
| P2 | Google Calendar | Exportación de viaje confirmado: **pendiente** | Un archivo ICS no requiere OAuth | Falta hora de llegada fiable; evitar cita con duración inventada |
| P2 | WhatsApp Business | Avisos: evaluación pendiente | Cuenta Meta, plantillas y consentimiento; precio a validar | No usar números privados ni envíos automáticos sin autorización |
| P2 | Pagos | **No implementado** | Proveedor, precio y modelo legal por definir | Antes definir comisión, fiscalidad, cancelación y quién retiene fondos |
| P2 | Google Drive | Sin uso de producto justificado; no integrado | Si se usa internamente, acceso mínimo | No almacenar DUI ni datos de usuarios en carpetas compartidas |

Fuentes primarias: [Open-Meteo, condiciones y precio](https://open-meteo.com/en/pricing), [Resend, precios](https://resend.com/pricing), [Google Routes, uso y facturación](https://developers.google.com/maps/documentation/routes/usage-and-billing). Esta tabla es una comparación técnica, no una autorización de gasto.
