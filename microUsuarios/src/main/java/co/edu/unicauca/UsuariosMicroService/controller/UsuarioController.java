package co.edu.unicauca.UsuariosMicroService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import co.edu.unicauca.UsuariosMicroService.entities.User;
import co.edu.unicauca.UsuariosMicroService.infra.dto.UsuarioRequest;
import co.edu.unicauca.UsuariosMicroService.service.UsuarioService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    // -------------------------------------------
    // 1. REGISTRO PÚBLICO (solo clientes)
    // -------------------------------------------
    @PostMapping("/registro")
    public ResponseEntity<User> registrarCliente(@RequestBody UsuarioRequest newUser) {
        newUser.setRol("cliente");        // Asigna rol CLIENTE automáticamente
        newUser.setEstado(true);          // El cliente se registra activo
        User saved = service.save(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }


    // -------------------------------------------
    // 2. CREAR USUARIO (solo ADMIN)
    // -------------------------------------------
    @PostMapping("")
    public ResponseEntity<User> createUser(@RequestBody UsuarioRequest newUser) {
        // Aquí se respeta el rol enviado: administrador, barbero, cliente
        User saved = service.save(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
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
    @PutMapping("/{username}")
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


    // -------------------------------------------
    // 5. OBTENER USUARIOS (solo ADMIN)
    // -------------------------------------------
    @GetMapping("")
    public ResponseEntity<List<User>> getAllUsuarios() throws Exception {
        List<User> users = service.findAll();
        return ResponseEntity.ok(users);
    }
}
