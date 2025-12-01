package co.edu.unicauca.microserviceturnos.states;

import co.edu.unicauca.microserviceturnos.Excepciones.AccionInvalidaTurnoException;
import co.edu.unicauca.microserviceturnos.entities.Turno;

public class EstadoEnProceso extends EstadoTurno{

    public EstadoEnProceso(Turno turno) {
        super(turno);
    }

    @Override
    public void confirmar() {
        System.out.println("El turno ya está en proceso.");
        throw new AccionInvalidaTurnoException("No se puede confirmar un turno que ya está en proceso.");
    }

    @Override
    public void iniciar() {
        System.out.println("El turno ya inició.");
        throw new AccionInvalidaTurnoException("No se puede iniciar un turno que ya está en proceso.");
    }

    @Override
    public void finalizar() {
        System.out.println("Turno finalizado.");
        turno.setEstadoTurno(new EstadoFinalizado(turno));
    }

    @Override
    public void cancelar() {
        System.out.println("No se puede cancelar un turno en proceso.");
        throw new AccionInvalidaTurnoException("No se puede cancelar un turno que ya está en proceso.");
    }

    @Override
    public void marcarNoAsistio() {
        System.out.println("No se puede marcar no asistió mientras está en proceso.");
        throw new AccionInvalidaTurnoException("No se puede marcar como no asistió un turno que está en proceso.");
    }
}
