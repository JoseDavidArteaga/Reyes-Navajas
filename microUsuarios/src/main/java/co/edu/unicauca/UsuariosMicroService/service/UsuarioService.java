package co.edu.unicauca.UsuariosMicroService.service;

import jakarta.transaction.Transactional;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
 
    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);
    
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
        log.debug("Buscando usuario por nombre: {}", nombre);
        return repository.findByNombre(nombre);
    }

    @Transactional
    public Optional<User> findByTelefono(String telefono) {
        log.debug("Buscando usuario por teléfono: {}", telefono);
        return repository.findByTelefono(telefono);
    }

    @Transactional
    public Optional<User> findById(Long id) {
        return repository.findById(id);
    }
    
    @Transactional
    public User save(UsuarioRequest usuarioRequest) {
        
        log.info("Iniciando guardado de usuario: {}", usuarioRequest.getNombre());
        
        if (repository.findByNombre(usuarioRequest.getNombre()).isPresent()) {
            String msg = "El nombre de usuario '" + usuarioRequest.getNombre() + "' ya está en uso";
            log.warn(msg);
            throw new co.edu.unicauca.UsuariosMicroService.infra.exception.UserAlreadyExistsException(msg);
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
            log.info("Usuario guardado exitosamente: {} (ID: {})", savedUser.getNombre(), savedUser.getId());
            
            try {
                UserCreateRequest event = new UserCreateRequest();
                event.setUsername(savedUser.getNombre());
                event.setPassword(savedUser.getContrasenia()); 
                event.setEmail(this.generateEmail(savedUser));
                event.setRole(savedUser.getRol() != null ? savedUser.getRol().toLowerCase() : "cliente");

                rabbitTemplate.convertAndSend(RabbitMQConfig.USER_QUEUE_CREATED, event);
                log.debug("Evento RabbitMQ publicado para usuario: {}", savedUser.getNombre());
            } catch (Exception e) {
                log.warn("No se pudo enviar evento RabbitMQ para usuario {}: {}", 
                         savedUser.getNombre(), e.getMessage());
                // El usuario se guardó igual, solo falló la sincronización
            }

            return savedUser; 

        } catch (DataIntegrityViolationException e) {
            log.error("Error de integridad al guardar usuario: {}", e.getMessage());
            String msg = e.getMessage() != null ? e.getMessage() : "Violación de integridad de datos";
            if (msg.toLowerCase().contains("duplicate") || msg.toLowerCase().contains("duplicate entry") || msg.toLowerCase().contains("uc_users_nombre")) {
                throw new co.edu.unicauca.UsuariosMicroService.infra.exception.UserAlreadyExistsException("El nombre de usuario ya existe (violación de unicidad)", e);
            }
            throw new RuntimeException("Error al guardar el usuario: " + msg, e);
        }
        catch (Exception e) {
            log.error("Error inesperado al crear usuario {}: ", usuarioRequest.getNombre(), e);
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
        log.info("Usuario actualizado: {} (ID: {})", updated.getNombre(), updated.getId());

        // Publish update message so AuthMicroService can sync roles / enabled state
        try {
            co.edu.unicauca.UsuariosMicroService.infra.dto.UserUpdateRequest update = new co.edu.unicauca.UsuariosMicroService.infra.dto.UserUpdateRequest();
            update.setInternalId(updated.getId());
            update.setUsername(updated.getNombre());
            update.setRole(updated.getRol());
            update.setEnabled(updated.isEstado());
            rabbitTemplate.convertAndSend(RabbitMQConfig.USER_QUEUE_UPDATED, update);
            log.debug("Evento de actualización publicado para usuario: {}", updated.getNombre());
        } catch (Exception e) {
            log.warn("Error publicando evento de actualización de usuario: {}", e.getMessage());
        }

        return updated;
    }

    public List<User> findAll() throws Exception {
        return repository.findAll();
    }
    
    @Transactional
    public List<User> findBarberos() {
        log.debug("Obteniendo lista de barberos");
        return repository.findByRol("barbero");
    }
    
    @Transactional
    public Optional<User> findBarberoById(Long id) {
        log.debug("Buscando barbero por ID: {}", id);
        Optional<User> usuario = repository.findById(id);
        if (usuario.isPresent() && "barbero".equals(usuario.get().getRol())) {
            return usuario;
        }
        return Optional.empty();
    }

    @Transactional
    public void deleteBarberoById(Long id) {
        log.info("Eliminando barbero con ID: {}", id);
        Optional<User> opt = repository.findById(id);
        if (opt.isPresent()) {
            User user = opt.get();
            repository.deleteById(id);
            log.info("Barbero eliminado exitosamente: {} (ID: {})", user.getNombre(), id);
        }
    }
    
    @Transactional
    public User cambiarEstadoBarbero(Long id, Boolean nuevoEstado) {
        log.info("Cambiando estado del barbero ID {} a {}", id, nuevoEstado);
        
        Optional<User> opt = repository.findById(id);
        if (opt.isEmpty()) {
            throw new RuntimeException("Barbero no encontrado con ID: " + id);
        }
        
        User barbero = opt.get();
        if (!"barbero".equals(barbero.getRol())) {
            throw new RuntimeException("El usuario con ID " + id + " no es un barbero");
        }
        
        barbero.setEstado(nuevoEstado);
        User actualizado = repository.save(barbero);
        
        log.info("Estado del barbero {} (ID: {}) actualizado a {}", 
                actualizado.getNombre(), id, nuevoEstado);
        
        // Publicar evento de actualización
        try {
            co.edu.unicauca.UsuariosMicroService.infra.dto.UserUpdateRequest update = 
                new co.edu.unicauca.UsuariosMicroService.infra.dto.UserUpdateRequest();
            update.setInternalId(actualizado.getId());
            update.setUsername(actualizado.getNombre());
            update.setRole(actualizado.getRol());
            update.setEnabled(actualizado.isEstado());
            rabbitTemplate.convertAndSend(RabbitMQConfig.USER_QUEUE_UPDATED, update);
            log.debug("Evento de actualización de estado publicado para barbero: {}", actualizado.getNombre());
        } catch (Exception e) {
            log.warn("Error publicando evento de actualización de estado del barbero: {}", e.getMessage());
        }

        return actualizado;
    }
    
    private String generateEmail(User user) {
        return user.getTelefono() != null && user.getTelefono().contains("@") ? 
               user.getTelefono() : 
               user.getNombre() + "@barberia.com";
    }
}
