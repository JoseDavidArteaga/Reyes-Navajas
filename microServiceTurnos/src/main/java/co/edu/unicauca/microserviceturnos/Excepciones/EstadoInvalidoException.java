package co.edu.unicauca.microserviceturnos.Excepciones;

public class EstadoInvalidoException extends RuntimeException {
    public EstadoInvalidoException(String message) {
        super(message);
    }
}