export const API_CONFIG = {
  // API Gateway
  GATEWAY_URL: 'http://localhost:8089',
  
  // Keycloak
  KEYCLOAK_URL: 'http://localhost:8080',
  KEYCLOAK_REALM: 'MicroservicesBarber',
  KEYCLOAK_CLIENT_ID: 'barber-service',
  
  // Endpoints a través del Gateway
  ENDPOINTS: {
    // Autenticación (Keycloak directo)
    AUTH: {
      LOGIN: 'http://localhost:8080/realms/MicroservicesBarber/protocol/openid-connect/token',
      REGISTER: 'http://localhost:8089/usuarios/registro'
    },
    
    // Usuarios
    USUARIOS: 'http://localhost:8089/usuarios',
    
    // Catálogo (servicios)
    CATALOGO: 'http://localhost:8089/catalogo',
    
    // Turnos y Reservas
    TURNOS: 'http://localhost:8089/turnos',
    
    // Barberos (a través de usuarios)
    BARBEROS: 'http://localhost:8089/usuarios/barberos'
  }
};