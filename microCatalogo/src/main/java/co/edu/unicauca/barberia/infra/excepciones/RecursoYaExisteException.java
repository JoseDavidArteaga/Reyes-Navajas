package co.edu.unicauca.barberia.infra.excepciones;

public class RecursoYaExisteException extends RuntimeException {
    public RecursoYaExisteException(String mensaje) {
        super(mensaje);
    }
}
