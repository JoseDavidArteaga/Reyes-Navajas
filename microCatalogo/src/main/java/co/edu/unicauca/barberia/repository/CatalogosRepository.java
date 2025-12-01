package co.edu.unicauca.barberia.repository;

import co.edu.unicauca.barberia.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatalogosRepository extends JpaRepository <Servicio, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
}
