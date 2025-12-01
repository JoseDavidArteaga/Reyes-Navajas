package co.edu.unicauca.autmicroservice.service;

import co.edu.unicauca.autmicroservice.dto.*;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.ws.rs.core.Response;
import javax.ws.rs.NotAuthorizedException;
import java.util.ArrayList;
import java.util.List;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.auth-server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private Keycloak getInstance() {
        Keycloak kc = null;
        try {
            kc = KeycloakBuilder.builder()
                    .serverUrl(serverUrl)
                    .realm(realm)
                    .clientId(clientId)
                    .clientSecret(clientSecret)
                    .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                    .build();

            // Immediately attempt to acquire a token so we fail fast with a clear message
            try {
                kc.tokenManager().getAccessToken();
            } catch (NotAuthorizedException nae) {
                // Not authorized — close client and throw with helpful guidance
                try { kc.close(); } catch (Exception ignore) {}
                String msg = String.format("Keycloak token request unauthorized (401). Check client-id='%s', client-secret and that service account is enabled for this client in realm '%s' at %s",
                        clientId, realm, serverUrl);
                throw new RuntimeException(msg, nae);
            }

            return kc;
        } catch (RuntimeException rt) {
            // propagate our helpful runtime errors
            throw rt;
        } catch (Exception e) {
            if (kc != null) {
                try { kc.close(); } catch (Exception ignore) {}
            }
            throw new RuntimeException("Error conectando con Keycloak. Verifica la URL del servidor y credenciales.", e);
        }
    }

    public String createUser(UserCreateRequest req) {
        Keycloak kc = null;
        try {
            kc = getInstance();

            // Verificar si el usuario ya existe
            List<UserRepresentation> found = kc.realm(realm).users().search(req.getUsername());
            if (found != null && !found.isEmpty()) {
                throw new RuntimeException("El usuario ya existe: " + req.getUsername());
            }

            // Construir credenciales
            CredentialRepresentation cred = new CredentialRepresentation();
            cred.setType(CredentialRepresentation.PASSWORD);
            cred.setValue(req.getPassword());
            cred.setTemporary(false);

            // Construir usuario
            UserRepresentation user = new UserRepresentation();
            user.setUsername(req.getUsername());
            user.setEmail("na@test.com");
            user.setEnabled(true);
            user.setEmailVerified(true);
             // AÑADIDO: firstName y lastName (obligatorios para que keyckloar no falle)
            user.setFirstName(req.getUsername());
            user.setLastName( "NA");
            user.setCredentials(List.of(cred));

            // Crear usuario
            Response response = kc.realm(realm).users().create(user);
            int status = response.getStatus();
            
            if (status != 201 && status != 204) {
                String error = response.readEntity(String.class);
                throw new RuntimeException("Error creando usuario en Keycloak. Status: " + status + ", Error: " + error);
            }

            // Extraer ID del header Location
            String location = response.getHeaderString("Location");
            if (location == null || location.isBlank()) {
                throw new RuntimeException("Usuario creado pero no se retornó el Location header");
            }
            String userId = location.substring(location.lastIndexOf('/') + 1);

            // Asignar rol si se proporcionó
            if (req.getRole() != null && !req.getRole().isBlank()) {
                try {
                    RoleRepresentation roleRep = kc.realm(realm).roles().get(req.getRole()).toRepresentation();
                    kc.realm(realm).users().get(userId).roles().realmLevel().add(List.of(roleRep));
                } catch (Exception ex) {
                    // Si no se encuentra el rol, eliminamos el usuario y lanzamos error
                    kc.realm(realm).users().get(userId).remove();
                    throw new RuntimeException("Rol no encontrado: " + req.getRole() + ". Usuario no creado.", ex);
                }
            }

            return userId;
            
        } catch (Exception e) {
            throw new RuntimeException("Error en createUser: " + e.getMessage(), e);
        } finally {
            if (kc != null) {
                kc.close();
            }
        }
    }

    public void updateUserRoles(RoleUpdateRequest req) {
        Keycloak kc = null;
        try {
            kc = getInstance();
            String userId = req.getUserId();

                // Normalize: if string is username rather than id, try to search first
                try {
                    // if get by id fails, try search by username
                    try {
                        kc.realm(realm).users().get(userId).toRepresentation();
                    } catch (Exception eId) {
                        var found = kc.realm(realm).users().search(userId);
                        if (found != null && !found.isEmpty()) {
                            userId = found.get(0).getId();
                        } else {
                            throw new RuntimeException("Usuario no encontrado (id o username): " + userId);
                        }
                    }
                } catch (RuntimeException re) {
                    throw re;
                }

            // Obtener y eliminar roles actuales
            List<RoleRepresentation> existingRealmRoles = kc.realm(realm)
                    .users().get(userId).roles().realmLevel().listAll();
            if (existingRealmRoles != null && !existingRealmRoles.isEmpty()) {
                kc.realm(realm).users().get(userId).roles().realmLevel().remove(existingRealmRoles);
            }

            // Asignar nuevos roles
            if (req.getRoles() != null && !req.getRoles().isEmpty()) {
                List<RoleRepresentation> newRoles = new ArrayList<>();
                for (String roleName : req.getRoles()) {
                    try {
                        RoleRepresentation role = kc.realm(realm).roles().get(roleName).toRepresentation();
                        newRoles.add(role);
                    } catch (Exception e) {
                        throw new RuntimeException("Rol no encontrado: " + roleName);
                    }
                }
                kc.realm(realm).users().get(userId).roles().realmLevel().add(newRoles);
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Error actualizando roles: " + e.getMessage(), e);
        } finally {
            if (kc != null) {
                kc.close();
            }
        }
    }

    public void deleteUser(String userId) {
        Keycloak kc = null;
        try {
            kc = getInstance();
            
            // Verificar que el usuario existe
            try {
                kc.realm(realm).users().get(userId).toRepresentation();
            } catch (Exception e) {
                throw new RuntimeException("Usuario no encontrado con ID: " + userId);
            }
            
            kc.realm(realm).users().get(userId).remove();
            
        } catch (Exception e) {
            throw new RuntimeException("Error eliminando usuario: " + e.getMessage(), e);
        } finally {
            if (kc != null) {
                kc.close();
            }
        }
    }

    /** Enable or disable a user by username or id */
    public void setEnabledByUsernameOrId(String idOrUsername, boolean enabled) {
        Keycloak kc = null;
        try {
            kc = getInstance();

            String userId = null;
            // first try search by username
            List<UserRepresentation> found = kc.realm(realm).users().search(idOrUsername);
            if (found != null && !found.isEmpty()) {
                userId = found.get(0).getId();
            } else {
                // try as ID
                try {
                    var rep = kc.realm(realm).users().get(idOrUsername).toRepresentation();
                    userId = rep.getId();
                } catch (Exception ex) {
                    throw new RuntimeException("Usuario no encontrado: " + idOrUsername);
                }
            }

            var userResource = kc.realm(realm).users().get(userId);
            UserRepresentation user = userResource.toRepresentation();
            user.setEnabled(enabled);
            userResource.update(user);

        } catch (Exception e) {
            throw new RuntimeException("Error actualizando estado de usuario: " + e.getMessage(), e);
        } finally {
            if (kc != null) kc.close();
        }
    }
}