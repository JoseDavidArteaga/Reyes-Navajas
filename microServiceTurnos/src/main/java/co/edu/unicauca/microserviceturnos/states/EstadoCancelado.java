package co.edu.unicauca.microserviceturnos.states;

import co.edu.unicauca.microserviceturnos.Excepciones.AccionInvalidaTurnoException;
import co.edu.unicauca.microserviceturnos.entities.Turno;

public class EstadoCancelado extends EstadoTurno {

    public EstadoCancelado(Turno turno) {
        super(turno);
    }

    @Override
    public void confirmar() {
        System.out.println("No se puede confirmar un turno cancelado.");
        throw new AccionInvalidaTurnoException("No se puede confirmar un turno cancelado.");
    }

    @Override
    public void iniciar() {
        System.out.println("No se puede iniciar un turno cancelado.");
        throw new AccionInvalidaTurnoException("No se puede iniciar un turno cancelado.");
    }

    @Override
    public void finalizar() {
        System.out.println("No se puede finalizar un turno cancelado.");
        throw new AccionInvalidaTurnoException("No se puede finalizar un turno cancelado.");
    }

    @Override
    public void cancelar() {
        System.out.println("El turno ya está cancelado.");
        throw new AccionInvalidaTurnoException("El turno ya está cancelado.");
    }

    @Override
    public void marcarNoAsistio() {
        System.out.println("No aplica.");
        throw new AccionInvalidaTurnoException("No aplica.");
    }
}
