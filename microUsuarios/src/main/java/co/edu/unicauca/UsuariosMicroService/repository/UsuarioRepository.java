package co.edu.unicauca.UsuariosMicroService.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import co.edu.unicauca.UsuariosMicroService.entities.User;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<User, Long>  {
    Optional<User> findByNombreAndContrasenia(String nombre, String password);

    Optional<User> findByNombre(String nombre);
}

