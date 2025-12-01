package co.edu.unicauca.barberia.service.Dtos;
import lombok.Data;

@Data
public class ServicioDTORespuesta {
    private Long id;
    private String nombre;
    private String descripcion;
    private Integer duracion;
    private Double precio;
    private String imagenUrl;
}
