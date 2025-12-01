package co.edu.unicauca.autmicroservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class UserCreateRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;
    
    private String email;

    @NotBlank
    private String role;

}
