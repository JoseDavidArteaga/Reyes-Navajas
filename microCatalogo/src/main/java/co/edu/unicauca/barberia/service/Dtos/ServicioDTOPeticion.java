package co.edu.unicauca.barberia.service.Dtos;
import lombok.Data;
@Data
public class ServicioDTOPeticion {
    private String nombre;
    private String descripcion;
    private Integer duracion;
    private Double precio;
}
