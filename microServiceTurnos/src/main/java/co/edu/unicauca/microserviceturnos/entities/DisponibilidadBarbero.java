package co.edu.unicauca.microserviceturnos.entities;


import lombok.Data;

import java.util.List;

@Data
public class DisponibilidadBarbero {
    private String barberoId;
    private List<HorarioDisponible> horarios;

}