// Entorno de desarrollo local: `ng serve` contra el docker-compose en localhost.
// Este archivo se usa en todos los builds salvo `--configuration production`.
export const environment = {
  production: false,
  gatewayUrl: 'http://localhost:8089',
  keycloakUrl: 'http://localhost:8080',
  keycloakRealm: 'MicroservicesBarber',
  keycloakClientId: 'barber-service',
};
