package co.edu.unicauca.microserviceturnos.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class TurnoStateResponse {

    private UUID id;
    private String estado;
}
