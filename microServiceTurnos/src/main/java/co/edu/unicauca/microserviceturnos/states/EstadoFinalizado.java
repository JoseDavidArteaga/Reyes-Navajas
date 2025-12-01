package co.edu.unicauca.microserviceturnos.states;

import co.edu.unicauca.microserviceturnos.Excepciones.AccionInvalidaTurnoException;
import co.edu.unicauca.microserviceturnos.entities.Turno;

public class EstadoFinalizado extends EstadoTurno{

    public EstadoFinalizado(Turno turno) {
        super(turno);
    }

    @Override
    public void confirmar() {
        System.out.println("El turno ya finalizó.");
        throw new AccionInvalidaTurnoException("No se puede confirmar un turno que ya finalizó.");
    }

    @Override
    public void iniciar() {
        System.out.println("El turno ya finalizó.");
        throw new AccionInvalidaTurnoException("No se puede iniciar un turno que ya finalizó.");
    }

    @Override
    public void finalizar() {
        System.out.println("El turno ya está finalizado.");
        throw new AccionInvalidaTurnoException("El turno ya se encuentra finalizado.");
    }

    @Override
    public void cancelar() {
        System.out.println("No se puede cancelar un turno finalizado.");
        throw new AccionInvalidaTurnoException("No se puede cancelar un turno finalizado.");
    }

    @Override
    public void marcarNoAsistio() {
        System.out.println("No se puede marcar no asistió.");
        throw new AccionInvalidaTurnoException("No se puede marcar como no asistió un turno finalizado.");
    }
}
