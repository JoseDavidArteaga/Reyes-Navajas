package co.edu.unicauca.microserviceturnos.states;

import co.edu.unicauca.microserviceturnos.entities.Turno;


public abstract class EstadoTurno {

    protected Turno turno;

    public EstadoTurno(Turno turno) {
        this.turno = turno;
    }

    public abstract void confirmar();
    public abstract void iniciar();
    public abstract void finalizar();
    public abstract void cancelar();
    public abstract void marcarNoAsistio();
}
