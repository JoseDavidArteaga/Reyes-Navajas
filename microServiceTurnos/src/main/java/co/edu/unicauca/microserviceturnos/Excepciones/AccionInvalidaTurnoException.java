package co.edu.unicauca.microserviceturnos.Excepciones;

public class AccionInvalidaTurnoException extends RuntimeException {

    public AccionInvalidaTurnoException(String mensaje) {
        super(mensaje);
    }
}