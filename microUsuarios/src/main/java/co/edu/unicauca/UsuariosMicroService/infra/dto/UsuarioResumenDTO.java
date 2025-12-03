package co.edu.unicauca.UsuariosMicroService.infra.dto;

import lombok.Data;

@Data
public class UsuarioResumenDTO {
    private String id;
    private String nombre;
    private String telefono;
    private String rol;
    private boolean estado; // Agregar campo estado
}