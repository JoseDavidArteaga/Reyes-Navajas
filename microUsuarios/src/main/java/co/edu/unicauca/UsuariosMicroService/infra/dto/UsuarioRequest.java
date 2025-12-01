package co.edu.unicauca.UsuariosMicroService.infra.dto;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class UsuarioRequest {         
    private String nombre;    
    private String contrasenia;
    private String rol;
    private String telefono;
    private boolean estado;

}
