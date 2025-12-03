package co.edu.unicauca.microserviceturnos.Excepciones;

public class ValidacionTurnoException extends RuntimeException {
    public ValidacionTurnoException(String message) {
        super(message);
    }
}