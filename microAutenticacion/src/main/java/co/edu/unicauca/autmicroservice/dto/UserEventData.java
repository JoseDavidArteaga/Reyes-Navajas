package co.edu.unicauca.autmicroservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO para eventos de usuario - Este archivo contiene DTOs duplicados 
 * que ya existen en archivos separados. Se mantiene temporalmente para compatibilidad.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEventData {
    private String eventType;
    private String username;
    private String email;
    private String role;
    private Boolean enabled;
}