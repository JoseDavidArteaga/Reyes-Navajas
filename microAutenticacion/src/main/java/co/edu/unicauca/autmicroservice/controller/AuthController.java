package co.edu.unicauca.autmicroservice.controller;

import co.edu.unicauca.autmicroservice.dto.*;
import co.edu.unicauca.autmicroservice.service.KeycloakAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth/usuarios")
@Validated
public class AuthController {

    private final KeycloakAdminService keycloakAdminService;

    public AuthController(KeycloakAdminService keycloakAdminService) {
        this.keycloakAdminService = keycloakAdminService;
    }

    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody @Valid UserCreateRequest req) {
        String userId = keycloakAdminService.createUser(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(userId);
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<Void> updateRoles(@PathVariable("id") String id, @RequestBody @Valid RoleUpdateRequest req) {
        // prefer path param first
        if (req.getUserId() == null || req.getUserId().isBlank()) req.setUserId(id);
        keycloakAdminService.updateUserRoles(req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") String id) {
        keycloakAdminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

}
