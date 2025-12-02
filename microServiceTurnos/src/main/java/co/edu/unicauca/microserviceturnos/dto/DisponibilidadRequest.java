package co.edu.unicauca.microserviceturnos.dto;

import lombok.Data;

@Data
public class DisponibilidadRequest {
    private String fechaInicio;
    private Integer dias;
}
