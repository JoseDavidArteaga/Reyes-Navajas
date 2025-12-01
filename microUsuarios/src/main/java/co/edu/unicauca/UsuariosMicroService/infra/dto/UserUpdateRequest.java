package co.edu.unicauca.UsuariosMicroService.infra.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private Long internalId; // local DB id
    private String username;
    private String role;
    private Boolean enabled;
}
