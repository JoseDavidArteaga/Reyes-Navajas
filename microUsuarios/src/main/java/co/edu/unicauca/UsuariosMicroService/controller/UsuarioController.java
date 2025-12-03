package co.edu.unicauca.UsuariosMicroService.controller;

import co.edu.unicauca.UsuariosMicroService.infra.dto.UsuarioResumenDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;

import co.edu.unicauca.UsuariosMicroService.entities.User;
import co.edu.unicauca.UsuariosMicroService.infra.dto.UsuarioRequest;
import co.edu.unicauca.UsuariosMicroService.service.UsuarioService;
import co.edu.unicauca.UsuariosMicroService.infra.exception.UserAlreadyExistsException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private static final Logger log = LoggerFactory.getLogger(UsuarioController.class);

    @Autowired
    private UsuarioService service;

    // -------------------------------------------
    // 1. REGISTRO PÚBLICO (solo clientes)
    // -------------------------------------------
    @PostMapping("/registro")
    public ResponseEntity<?> registrarCliente(@RequestBody UsuarioRequest newUser) {
        try {
            // Validaciones básicas
            if (newUser.getNombre() == null || newUser.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "El nombre es requerido"));
            }
            
            if (newUser.getTelefono() == null || newUser.getTelefono().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "El teléfono es requerido"));
            }
            
            if (newUser.getContrasenia() == null || newUser.getContrasenia().length() < 6) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "La contraseña debe tener mínimo 6 caracteres"));
            }
            
            log.info("Iniciando registro de nuevo cliente: {}", newUser.getNombre());
            
            // Asignar rol por defecto
            newUser.setRol("cliente");
            newUser.setEstado(true);
            
            // Guardar usuario
            User saved = service.save(newUser);
            
            log.info("Cliente registrado exitosamente: {} (ID: {})", saved.getNombre(), saved.getId());
            
            // Respuesta exitosa
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Usuario registrado exitosamente");
            response.put("id", saved.getId());
            response.put("nombre", saved.getNombre());
            response.put("telefono", saved.getTelefono());
            response.put("rol", saved.getRol());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (UserAlreadyExistsException e) {
            log.warn("Intento de registro con usuario duplicado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "success", false, 
                    "message", "El nombre de usuario '" + newUser.getNombre() + "' ya está registrado"
                ));
        } catch (DataIntegrityViolationException e) {
            log.warn("Violación de integridad al registrar usuario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "success", false, 
                    "message", "El nombre de usuario ya está registrado"
                ));
        } catch (Exception e) {
            log.error("Error inesperado al registrar cliente: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false, 
                    "message", "Error interno del servidor al crear la cuenta"
                ));
        }
    }


    // -------------------------------------------
    // 2. CREAR USUARIO (solo ADMIN)
    // -------------------------------------------
    @PostMapping("/barberos")
    public ResponseEntity<?> createUser(@RequestBody UsuarioRequest newUser) {
        log.info("Creando usuario: {} con rol: {}", newUser.getNombre(), newUser.getRol());
        // Aquí se respeta el rol enviado: administrador, barbero, cliente
        try {
            User saved = service.save(newUser);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (UserAlreadyExistsException e) {
            log.warn("Intento de crear usuario duplicado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "success", false,
                    "message", "El nombre de usuario '" + newUser.getNombre() + "' ya está registrado"
                ));
        } catch (DataIntegrityViolationException e) {
            log.warn("Violación de integridad al crear usuario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "success", false,
                    "message", "El nombre de usuario ya está registrado"
                ));
        } catch (Exception e) {
            log.error("Error inesperado al crear usuario: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Error interno del servidor al crear el usuario"
                ));
        }
    }


    // -------------------------------------------
    // 3. VALIDAR USUARIO (LEGACY - opcional)
    //    Este endpoint ya NO se usa para login real.
    // -------------------------------------------
    @PostMapping("/validar")
    public ResponseEntity<User> validarUsuario(@RequestBody UsuarioRequest loginRequest) {
        return service.findByNombreAndContrasenia(loginRequest.getNombre(), loginRequest.getContrasenia())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }


    // -------------------------------------------
    // 4. ACTUALIZAR USUARIO (solo ADMIN)
    // -------------------------------------------
    @PutMapping("/barberos/username/{username}")
    public ResponseEntity<User> updateUser(
            @PathVariable String username,
            @RequestBody UsuarioRequest updatedData) {

        Optional<User> opt = service.findByNombre(username);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            User updated = service.updateUsuario(opt.get(), updatedData);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/barberos/{id}")
    public ResponseEntity<?> updateBarberoById(
            @PathVariable Long id,
            @RequestBody UsuarioRequest updatedData) {

        log.info("Actualizando barbero con ID: {}", id);
        Optional<User> opt = service.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Barbero no encontrado"));
        }

        try {
            User updated = service.updateUsuario(opt.get(), updatedData);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error actualizando barbero id {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error interno al actualizar barbero"));
        }
    }


    // -------------------------------------------
    // 5. OBTENER USUARIOS (solo ADMIN)
    // -------------------------------------------
    @GetMapping("")
    public ResponseEntity<List<User>> getAllUsuarios() throws Exception {
        List<User> users = service.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUsuarioById(@PathVariable String id) {

        Optional<User> opt = service.findById(Long.valueOf(id));
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Usuario no encontrado");
        }

        User u = opt.get();

        UsuarioResumenDTO dto = new UsuarioResumenDTO();
        dto.setId(String.valueOf(u.getId()));
        dto.setNombre(u.getNombre());
        dto.setTelefono(u.getTelefono());
        dto.setRol(u.getRol());

        return ResponseEntity.ok(dto);
    }
  
    @GetMapping("/name/{name}")
    public ResponseEntity<?> getUsuarioByName(@PathVariable String name) {

        Optional<User> opt = service.findByNombre(name);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Usuario no encontrado");
        }

        User u = opt.get();

        UsuarioResumenDTO dto = new UsuarioResumenDTO();
        dto.setId(String.valueOf(u.getId()));
        dto.setNombre(u.getNombre());
        dto.setTelefono(u.getTelefono());
        dto.setRol(u.getRol());

        return ResponseEntity.ok(dto);
    }

    // -------------------------------------------
    // 6. ENDPOINTS PARA BARBEROS
    // -------------------------------------------
    @GetMapping("/barberos")
    public ResponseEntity<?> getAllBarberos() throws Exception {
        log.info("Obteniendo lista de barberos");
        List<User> barberos = service.findBarberos();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", barberos);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/barberos/{id}")
    public ResponseEntity<?> getBarberoById(@PathVariable String id) {
        log.info("Obteniendo barbero con ID: {}", id);
        Optional<User> opt = service.findBarberoById(Long.valueOf(id));
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Barbero no encontrado"));
        }

        User barbero = opt.get();
        UsuarioResumenDTO dto = new UsuarioResumenDTO();
        dto.setId(String.valueOf(barbero.getId()));
        dto.setNombre(barbero.getNombre());
        dto.setTelefono(barbero.getTelefono());
        dto.setRol(barbero.getRol());

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/barberos/{id}")
    public ResponseEntity<?> deleteBarberoById(@PathVariable Long id) {
        log.info("Eliminando barbero con ID: {}", id);
        Optional<User> opt = service.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Barbero no encontrado"));
        }

        try {
            service.deleteBarberoById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Barbero eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error eliminando barbero id {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error interno al eliminar barbero"));
        }
    }
}

