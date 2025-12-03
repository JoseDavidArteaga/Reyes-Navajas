package co.edu.unicauca.microserviceturnos.Excepciones;

public class TurnoNotFoundException extends RuntimeException {
    public TurnoNotFoundException(String message) {
        super(message);
    }
}
