package co.edu.unicauca.microserviceturnos.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class ListaEspera {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String clienteId;
    private String barberoId;
    private String servicioId;
    private LocalDateTime fechaSolicitud;
    private Integer prioridad; // menor valor = mayor prioridad

    public ListaEspera() {}
}
