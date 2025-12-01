package co.edu.unicauca.microserviceturnos.states;

import co.edu.unicauca.microserviceturnos.Excepciones.AccionInvalidaTurnoException;
import co.edu.unicauca.microserviceturnos.entities.Turno;

public class EstadoNoAsistio extends EstadoTurno {

    public EstadoNoAsistio(Turno turno) {
        super(turno);
    }

    @Override
    public void confirmar() {
        System.out.println("No se puede confirmar; el paciente no asistió.");
        throw new AccionInvalidaTurnoException("No se puede confirmar un turno marcado como no asistió.");
    }

    @Override
    public void iniciar() {
        System.out.println("No se puede iniciar.");
        throw new AccionInvalidaTurnoException("No se puede iniciar un turno marcado como no asistió.");
    }

    @Override
    public void finalizar() {
        System.out.println("No aplica.");
        throw new AccionInvalidaTurnoException("No se puede finalizar un turno marcado como no asistió.");
    }

    @Override
    public void cancelar() {
        System.out.println("No aplica.");
        throw new AccionInvalidaTurnoException("No se puede cancelar un turno marcado como no asistió.");
    }

    @Override
    public void marcarNoAsistio() {
        System.out.println("Ya está marcado como no asistió.");
        throw new AccionInvalidaTurnoException("El turno ya está marcado como no asistió.");
    }
}
