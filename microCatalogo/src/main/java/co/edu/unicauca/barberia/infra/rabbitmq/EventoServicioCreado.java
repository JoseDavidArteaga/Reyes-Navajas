package co.edu.unicauca.barberia.infra.rabbitmq;

import lombok.Data;

@Data
public class EventoServicioCreado {
    private Long id;
    private String nombre;

    public EventoServicioCreado(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }
}