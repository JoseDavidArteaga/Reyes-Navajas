package co.edu.unicauca.microserviceturnos.dto;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class TurnoUpdate {

    private String clienteId;
    private String barberoId;
    private String servicioId;
    private LocalDateTime fechaHora;
    private String notas;


    public String getClienteId() { return clienteId; }
    public String getBarberoId() { return barberoId; }
    public String getServicioId() { return servicioId; }
    public LocalDateTime getFechaHora() { return fechaHora; }
}
