package co.edu.unicauca.barberia.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "servicios")
@Data
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(length = 500)
    private String descripcion;

    private Integer duracion; // minutos

    private Double precio;

    private String imagenUrl;

    private Boolean estado;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
}