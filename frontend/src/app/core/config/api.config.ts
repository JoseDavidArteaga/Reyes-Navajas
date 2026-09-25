import { environment } from '../../../environments/environment';

// Único punto de verdad para las URLs del frontend.
// En dev lee `environment.ts` (localhost); en prod (Vercel) Angular lo
// sustituye por `environment.prod.ts` vía `fileReplacements` (angular.json).
// Los servicios NUNCA deben quemar `http://localhost:...` directamente.
export const API_CONFIG = {
  // API Gateway
  GATEWAY_URL: environment.gatewayUrl,

  // Keycloak
  KEYCLOAK_URL: environment.keycloakUrl,
  KEYCLOAK_REALM: environment.keycloakRealm,
  KEYCLOAK_CLIENT_ID: environment.keycloakClientId,

  // Endpoints a través del Gateway
  ENDPOINTS: {
    // Autenticación (Keycloak directo)
    AUTH: {
      LOGIN: `${environment.keycloakUrl}/realms/${environment.keycloakRealm}/protocol/openid-connect/token`,
      REGISTER: `${environment.gatewayUrl}/usuarios/registro`
    },

    // Usuarios
    USUARIOS: `${environment.gatewayUrl}/usuarios`,

    // Catálogo (servicios)
    CATALOGO: `${environment.gatewayUrl}/catalogo`,

    // Turnos y Reservas
    TURNOS: `${environment.gatewayUrl}/turnos`,

    // Barberos (a través de usuarios)
    BARBEROS: `${environment.gatewayUrl}/usuarios/barberos`
  }
};
