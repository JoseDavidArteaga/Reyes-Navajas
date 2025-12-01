package co.edu.unicauca.UsuariosMicroService.infra.dto;

import java.time.Instant;

/** Simple API error response */
public class ErrorResponse {
    private Instant timestamp = Instant.now();
    private String message;
    private String detail;

    public ErrorResponse() {}

    public ErrorResponse(String message) {
        this.message = message;
    }

    public ErrorResponse(String message, String detail) {
        this.message = message;
        this.detail = detail;
    }

    public Instant getTimestamp() { return timestamp; }
    public String getMessage() { return message; }
    public String getDetail() { return detail; }
    public void setMessage(String message) { this.message = message; }
    public void setDetail(String detail) { this.detail = detail; }
}
