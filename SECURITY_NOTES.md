# Seguridad y privacidad — revisión de beta

Implementado: hash Argon2, sesión HTTP persistida con cookie HttpOnly/SameSite=Lax/Secure en producción, regeneración al autenticar, comprobación de origen en escrituras, límite de intentos de login, Helmet/CSP, límite de JSON, validación Zod, SQL parametrizado, autorización por dueño y transacciones de plazas. `SESSION_SECRET`, `.env.local` y SQLite local quedan fuera de Git.

Bloqueos antes de operar con usuarios reales:

- Verificación de correo, recuperación segura de contraseña, prevención de abuso de registros y política de eliminación/retención de cuentas.
- HTTPS con proxy fiable; configurar `TRUST_PROXY_HOPS` únicamente para infraestructura conocida. Probar cookies y CSP en el dominio final.
- Los backups locales y las migraciones versionadas están probados con una base de prueba. Falta cifrado, almacenamiento separado, retención y ensayo de restauración en la infraestructura elegida. SQLite local de una instancia no equivale a operación resistente a fallos.
- Revisión legal de privacidad, condiciones, responsabilidad de viajes compartidos, menores, soporte e incidentes. No se recopilan DUI ni pagos.
- Control de cancelaciones y spam a mayor escala, monitorización y respuesta a incidentes.
- Revisión de integraciones externas antes de claves, consentimiento o facturación.

El nombre del conductor y notas de trayecto son públicos en búsquedas; nunca colocar teléfono, correo ni datos sensibles en notas. La interfaz avisa que no existe verificación de identidad. El prototipo `/demo` está rotulado como tal y se excluye de indexación.
