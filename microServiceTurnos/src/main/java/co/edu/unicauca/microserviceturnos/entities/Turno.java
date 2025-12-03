package co.edu.unicauca.microserviceturnos.entities;


import co.edu.unicauca.microserviceturnos.states.*;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.UUID;

@Entity
@Data
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    private String clienteId;
    private String barberoId;
    private String servicioId;


    private LocalDateTime fechaHora;
    private LocalDateTime fechaCreacion;
    
    // Duración en minutos del turno
    private Integer duracionMinutos;


    @Enumerated(EnumType.STRING)
    private EstadoTurnoEnum estado;

    private String notas;


    @Transient
    private EstadoTurno estadoTurno;


    public Turno() {}

    public Turno(String clienteId, String barberoId, String servicioId,
                 LocalDateTime fechaHora, String notas) {
        this.clienteId = clienteId;
        this.barberoId = barberoId;
        this.servicioId = servicioId;
        this.fechaHora = fechaHora;
        this.estado = EstadoTurnoEnum.PENDIENTE;
        this.estadoTurno = new EstadoPendiente(this);
        this.notas = notas;
    }

    public EstadoTurno getEstadoTurnoObjeto() {
        switch (this.estado) {
            case PENDIENTE: return new EstadoPendiente(this);
            case CONFIRMADO: return new EstadoConfirmado(this);
            case EN_PROCESO: return new EstadoEnProceso(this);
            case FINALIZADO: return new EstadoFinalizado(this);
            case CANCELADO: return new EstadoCancelado(this);
            case NO_ASISTIO: return new EstadoNoAsistio(this);
            default: throw new IllegalStateException("Estado desconocido: " + estado);
        }
    }
    public void setEstadoTurno(EstadoTurno nuevoEstado) {
        this.estado = mapEstadoTurnoToEnum(nuevoEstado);
        this.estadoTurno = nuevoEstado;
    }
    private EstadoTurnoEnum mapEstadoTurnoToEnum(EstadoTurno estadoTurno) {
        if (estadoTurno instanceof EstadoPendiente) return EstadoTurnoEnum.PENDIENTE;
        if (estadoTurno instanceof EstadoConfirmado) return EstadoTurnoEnum.CONFIRMADO;
        if (estadoTurno instanceof EstadoEnProceso) return EstadoTurnoEnum.EN_PROCESO;
        if (estadoTurno instanceof EstadoFinalizado) return EstadoTurnoEnum.FINALIZADO;
        if (estadoTurno instanceof EstadoCancelado) return EstadoTurnoEnum.CANCELADO;
        if (estadoTurno instanceof EstadoNoAsistio) return EstadoTurnoEnum.NO_ASISTIO;
        throw new IllegalArgumentException("Estado desconocido: " + estadoTurno.getClass());
    }
    private void ensureEstadoTurnoInitialized() {
        if (this.estadoTurno == null) {
            if (this.estado != null) {
                this.estadoTurno = getEstadoTurnoObjeto();
            } else {
                // Fallback: default to PENDIENTE
                this.estado = EstadoTurnoEnum.PENDIENTE;
                this.estadoTurno = new EstadoPendiente(this);
            }
        }
    }

    public void confirmar() {
        ensureEstadoTurnoInitialized();
        estadoTurno.confirmar();
    }

    public void iniciar() {
        ensureEstadoTurnoInitialized();
        estadoTurno.iniciar();
    }

    public void finalizar() {
        ensureEstadoTurnoInitialized();
        estadoTurno.finalizar();
    }

    public void cancelar() {
        ensureEstadoTurnoInitialized();
        estadoTurno.cancelar();
    }

    public void noAsistio() {
        ensureEstadoTurnoInitialized();
        estadoTurno.marcarNoAsistio();
    }
}
