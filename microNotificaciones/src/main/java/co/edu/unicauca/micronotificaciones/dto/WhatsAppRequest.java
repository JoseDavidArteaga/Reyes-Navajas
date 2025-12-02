package co.edu.unicauca.micronotificaciones.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class WhatsAppRequest implements Serializable {
    private String clienteId;
    private String telefonoDestino;
    private String mensajeWhatsapp;
}