// Entorno de producción: build de Vercel (`ng build --configuration production`).
// Angular sustituye environment.ts por este archivo vía `fileReplacements` (ver angular.json).
//
// Cómo rellenar (despliegue Opción A, sin dominio propio):
//   1. Crea la VM en OCI y anota su IP pública, p. ej. 80.90.100.110.
//   2. Convierte la IP a slug nip.io (puntos -> guiones): 80-90-100-110.nip.io
//      (nip.io resuelve *.80-90-100-110.nip.io a tu VM; Let's Encrypt sí emite
//      certificados para esos nombres vía Nginx+certbot en la VM).
//   3. Reemplaza TU-IP-CON-GUIONES abajo por ese slug. Debe coincidir con
//      BACKEND_HOST de .env.prod en la VM.
// Si algún día tienes dominio propio, usa https://api.tu-dominio.com y
// https://auth.tu-dominio.com en su lugar.
export const environment = {
  production: true,
  gatewayUrl: 'https://api.TU-IP-CON-GUIONES.nip.io',
  keycloakUrl: 'https://auth.TU-IP-CON-GUIONES.nip.io',
  keycloakRealm: 'MicroservicesBarber',
  keycloakClientId: 'barber-service',
};
