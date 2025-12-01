package co.edu.unicauca.autmicroservice.service;

import co.edu.unicauca.autmicroservice.infra.RabbitMQConfig;
import co.edu.unicauca.autmicroservice.dto.UserCreateRequest;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;



@Service
public class UsuarioConsumerService {

    @Autowired
    private KeycloakAdminService usuarioService;

    @RabbitListener(queues = RabbitMQConfig.USER_QUEUE_CREATED)
    public void usuariosCreated(UserCreateRequest usuarionuevo) {
        System.out.println("Usuario recibido desde cola: " + usuarionuevo);
        System.out.println("Rol recibido desde cola: " + usuarionuevo.getRole());

        try {
            usuarioService.createUser(usuarionuevo);
            System.out.println("Usuario registrado en keycloak: " + usuarionuevo.getUsername());
        }catch(Exception e) {
            System.err.println(" Error al crear usuario en keyckoal: " + e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.USER_QUEUE_UPDATED)
    public void usuariosUpdated(co.edu.unicauca.autmicroservice.dto.UserUpdateRequest update) {
        System.out.println("Evento de actualización recibido: " + update);
        try {
            if (update.getRole() != null) {
                // map to RoleUpdateRequest and call updateUserRoles
                co.edu.unicauca.autmicroservice.dto.RoleUpdateRequest req = new co.edu.unicauca.autmicroservice.dto.RoleUpdateRequest();
                // Keycloak Admin API expects userId; try to look up by username inside service
                req.setUserId(update.getUsername()); // service will search by username if id is not an actual keycloak id
                req.setRoles(java.util.List.of(update.getRole()));
                usuarioService.updateUserRoles(req);
            }

            if (update.getEnabled() != null) {
                usuarioService.setEnabledByUsernameOrId(update.getUsername(), update.getEnabled());
            }

            System.out.println("Procesada actualización en Keycloak para: " + update.getUsername());
        } catch (Exception ex) {
            System.err.println("Error procesando evento de actualización: " + ex.getMessage());
        }
    }
  

}
