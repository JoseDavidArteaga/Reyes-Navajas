package co.edu.unicauca.microserviceturnos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class WhatsAppRequest {
    private String clienteId;
    private String telefonoDestino;
    private String mensajeWhatsapp;
}
