package co.edu.unicauca.microserviceturnos.states;

import co.edu.unicauca.microserviceturnos.Excepciones.AccionInvalidaTurnoException;
import co.edu.unicauca.microserviceturnos.entities.Turno;

public class EstadoPendiente extends EstadoTurno{

    public EstadoPendiente(Turno turno) {
        super(turno);
    }

    @Override
    public void confirmar() {
        System.out.println("Turno confirmado.");
        turno.setEstadoTurno(new EstadoConfirmado(turno));
    }

    @Override
    public void iniciar() {
        System.out.println("No se puede iniciar un turno pendiente.");
        turno.setEstadoTurno(new EstadoEnProceso(turno));
    }

    @Override
    public void finalizar() {
        System.out.println("No se puede finalizar un turno pendiente.");
        throw new AccionInvalidaTurnoException("No se puede finalizar un turno pendiente.");
    }

    @Override
    public void cancelar() {
        System.out.println("Turno cancelado.");
        turno.setEstadoTurno(new EstadoCancelado(turno));
    }

    @Override
    public void marcarNoAsistio() {
        System.out.println("No aplica para un turno pendiente.");
        throw new AccionInvalidaTurnoException("No se puede marcar como no asistió un turno pendiente.");
    }
}
