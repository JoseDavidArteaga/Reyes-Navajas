package co.edu.unicauca.microserviceturnos.entities;

import lombok.Data;
import java.util.List;

@Data
public class HorarioDisponible {
    private String fecha;
    private List<String> horasDisponibles;

}