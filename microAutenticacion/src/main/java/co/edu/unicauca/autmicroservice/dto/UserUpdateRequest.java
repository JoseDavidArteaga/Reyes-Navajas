package co.edu.unicauca.autmicroservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private Long internalId;
    private String username;
    private String role;
    private Boolean enabled;
}
