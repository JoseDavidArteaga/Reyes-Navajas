package co.edu.unicauca.UsuariosMicroService.entities;
import jakarta.persistence.Entity;

import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uc_users_nombre", columnNames = {"nombre"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ← clave
    private Long id;
    private String nombre;
    private String contrasenia;
    private String rol;
    private String telefono;
    private boolean estado;
}