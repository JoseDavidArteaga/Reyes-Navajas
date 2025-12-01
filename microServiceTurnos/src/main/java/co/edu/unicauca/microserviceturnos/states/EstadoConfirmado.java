package co.edu.unicauca.microserviceturnos.states;
import co.edu.unicauca.microserviceturnos.Excepciones.AccionInvalidaTurnoException;
import co.edu.unicauca.microserviceturnos.entities.Turno;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class EstadoConfirmado  extends EstadoTurno{

    public EstadoConfirmado(Turno turno) {
        super(turno);
    }

    @Override
    public void confirmar() {
        System.out.println("El turno ya está confirmado.");
        throw new AccionInvalidaTurnoException("El turno ya está confirmado.");
    }

    @Override
    public void iniciar() {
        System.out.println("Turno en proceso.");
        turno.setEstadoTurno(new EstadoEnProceso(turno));
    }

    @Override
    public void finalizar() {
        System.out.println("No se puede finalizar sin iniciar.");
        throw new AccionInvalidaTurnoException("No se puede finalizar un turno que aún no ha iniciado.");
    }

    @Override
    public void cancelar() {
        System.out.println("Turno cancelado.");
        turno.setEstadoTurno(new EstadoCancelado(turno));
    }

    @Override
    public void marcarNoAsistio() {
        System.out.println("Paciente no asistió.");
        turno.setEstadoTurno(new EstadoNoAsistio(turno));
    }
}
