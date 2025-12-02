package co.edu.unicauca.UsuariosMicroService.service;

import jakarta.transaction.Transactional;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import co.edu.unicauca.UsuariosMicroService.entities.User;
import co.edu.unicauca.UsuariosMicroService.infra.config.RabbitMQConfig;
import co.edu.unicauca.UsuariosMicroService.infra.dto.UserCreateRequest;
import co.edu.unicauca.UsuariosMicroService.infra.dto.UsuarioRequest;
import co.edu.unicauca.UsuariosMicroService.repository.UsuarioRepository;

import java.util.List;
import java.util.Optional;
import org.modelmapper.ModelMapper;

@Service
public class UsuarioService {
 
    ModelMapper modelMapper = new ModelMapper();
    @Autowired
    private UsuarioRepository repository;
       @Autowired
    private RabbitTemplate rabbitTemplate;

    public Optional<User> findByNombreAndContrasenia(String nombre, String password) {
        return repository.findByNombreAndContrasenia(nombre, password);
    }

    @Transactional
    public Optional<User> findByNombre(String nombre) {
        System.out.println("consultando usuario en repositorio");
        return repository.findByNombre(nombre);
    }

    @Transactional
    public Optional<User> findById(Long id) {
        return repository.findById(id);
    }
   @Transactional
public User save(UsuarioRequest usuarioRequest) {
    
        if (repository.findByNombre(usuarioRequest.getNombre()).isPresent()) {
            throw new co.edu.unicauca.UsuariosMicroService.infra.exception.UserAlreadyExistsException(
                    "El nombre de usuario '" + usuarioRequest.getNombre() + "' ya está en uso");
        }
    
    User user = User.builder()
            .nombre(usuarioRequest.getNombre())
            .contrasenia(usuarioRequest.getContrasenia())
            .telefono(usuarioRequest.getTelefono())
            .rol(usuarioRequest.getRol())
            .estado(usuarioRequest.isEstado())
            .build();
    
    try {
        User savedUser = repository.save(user);
        
        try {
            UserCreateRequest event = new UserCreateRequest();
            event.setUsername(savedUser.getNombre());
            event.setPassword(savedUser.getContrasenia()); 
            event.setEmail(
                savedUser.getTelefono() != null && savedUser.getTelefono().contains("@")
                    ? savedUser.getTelefono()
                    : savedUser.getNombre() + "@barberia.com"
            );
            event.setRole(savedUser.getRol() != null ? savedUser.getRol().toLowerCase() : "cliente");

            rabbitTemplate.convertAndSend(RabbitMQConfig.USER_QUEUE_CREATED, event);
        } catch (Exception e) {
            System.err.printf("No se pudo enviar evento a RabbitMQ (usuario creado igual): %s%n", e.getMessage());

        }

        return savedUser; 

    } catch (DataIntegrityViolationException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Violación de integridad de datos";
        if (msg.toLowerCase().contains("duplicate") || msg.toLowerCase().contains("duplicate entry") || msg.toLowerCase().contains("uc_users_nombre")) {
            throw new co.edu.unicauca.UsuariosMicroService.infra.exception.UserAlreadyExistsException("El nombre de usuario ya existe (violación de unicidad)", e);
        }
        throw new RuntimeException("Error al guardar el usuario: " + msg, e);
    }
    catch (Exception e) {
        System.err.printf("Error inesperado al crear usuario: %s\n", e.getMessage());
        throw new RuntimeException("Error interno del servidor al crear el usuario", e);
    }
}

    @Transactional
    public User updateUsuario(User existingusuario, UsuarioRequest usuariomodificado) throws Exception {

        if (usuariomodificado.getNombre() != null) {
            existingusuario.setNombre(usuariomodificado.getNombre());
        }
        if (usuariomodificado.getContrasenia() != null) {
            existingusuario.setContrasenia(usuariomodificado.getContrasenia());
        }
        if (usuariomodificado.getTelefono() != null) {
            existingusuario.setTelefono(usuariomodificado.getTelefono());
        }
        if (usuariomodificado.isEstado() != existingusuario.isEstado()) {
            existingusuario.setEstado(usuariomodificado.isEstado());
        }
        User updated = repository.save(existingusuario);

        // Publish update message so AuthMicroService can sync roles / enabled state
        try {
            co.edu.unicauca.UsuariosMicroService.infra.dto.UserUpdateRequest update = new co.edu.unicauca.UsuariosMicroService.infra.dto.UserUpdateRequest();
            update.setInternalId(updated.getId());
            update.setUsername(updated.getNombre());
            update.setRole(updated.getRol());
            update.setEnabled(updated.isEstado());
            rabbitTemplate.convertAndSend(RabbitMQConfig.USER_QUEUE_UPDATED, update);
        } catch (Exception e) {
            System.err.println("Error publicando evento de actualización de usuario: " + e.getMessage());
        }

        return updated;
    }

    public List<User> findAll() throws Exception {
        return repository.findAll();

    }
}
