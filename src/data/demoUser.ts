/**
 * Perfil de demostración. NAR todavía no tiene registro ni verificación real:
 * estos datos solo existen en este navegador para probar los flujos.
 */
export const DEMO_USER = {
  id: 'drv-user',
  name: 'Usuario de prueba',
  firstName: 'Tú',
  avatar: '',
  memberSince: 'Demo',
} as const;

export const DEMO_NOTICE =
  'Prototipo de NAR: los viajes, reservas, chat y seguimiento usan datos de demostración y no se envían a ningún servidor.';
