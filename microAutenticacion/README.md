# AuthMicroService — Keycloak administrative façade

This microservice acts as an administrative façade for Keycloak. It does NOT authenticate end users or issue tokens. Instead it exposes administrative operations so other internal services (e.g. UsuariosMicroService) and admin tools can manage users in Keycloak.

Core features implemented:

- Create user (POST /auth/usuarios)
- Update user roles (PUT /auth/usuarios/{id}/roles)
- Reset password (POST /auth/usuarios/{id}/reset-password)
- Enable/disable user (PUT /auth/usuarios/{id}/estado)
- Delete user (DELETE /auth/usuarios/{id})
- Fetch technical user state (GET /auth/usuarios/{id})
- Health checks exposed via /auth/usuarios/health and the standard /health (Actuator)

Important: this service must be given a Keycloak service account (client credentials). Configure connection in src/main/resources/application.yml.

Quick flow summary

- Client (or Usuarios microservice) -> API Gateway
- API Gateway validates tokens for most paths (configured to use Keycloak issuer) and routes application traffic.
- API Gateway routes /auth/** to this AuthMicroService (http://localhost:8084 by default) for administrative operations.
- AuthMicroService exposes endpoints to manage users/roles/credentials in Keycloak using the Keycloak Admin API.

Ports
- AuthMicroService default port: 8084 (change in application.yml)

Security note
- For demo purposes /auth/** is permitted by the gateway. In production you should restrict /auth/** to admin clients or service-to-service calls and use mTLS or token validation.
