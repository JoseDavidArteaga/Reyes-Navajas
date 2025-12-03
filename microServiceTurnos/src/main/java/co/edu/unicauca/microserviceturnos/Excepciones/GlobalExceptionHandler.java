package co.edu.unicauca.microserviceturnos.Excepciones;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;


@ControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<ErrorResponse> buildResponse(
            HttpStatus status, Exception ex, WebRequest request) {

        ErrorResponse error = new ErrorResponse();
        error.setStatus(status.value());
        error.setError(ex.getClass().getSimpleName());
        error.setMessage(ex.getMessage());
        error.setPath(request.getDescription(false));

        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(TurnoNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTurnoNotFound(TurnoNotFoundException ex, WebRequest req) {
        return buildResponse(HttpStatus.NOT_FOUND, ex, req);
    }

    @ExceptionHandler(ValidacionTurnoException.class)
    public ResponseEntity<ErrorResponse> handleValidacion(ValidacionTurnoException ex, WebRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex, req);
    }

    @ExceptionHandler(ListaEsperaException.class)
    public ResponseEntity<ErrorResponse> handleListaEspera(ListaEsperaException ex, WebRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex, req);
    }

    @ExceptionHandler(TurnoSolapadoException.class)
    public ResponseEntity<ErrorResponse> handleSolapado(TurnoSolapadoException ex, WebRequest req) {
        return buildResponse(HttpStatus.CONFLICT, ex, req);
    }

    @ExceptionHandler(EstadoInvalidoException.class)
    public ResponseEntity<ErrorResponse> handleEstadoInvalido(EstadoInvalidoException ex, WebRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex, req);
    }

    // Fallback general
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex, WebRequest req) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex, req);
    }
}