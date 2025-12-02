package co.edu.unicauca.microserviceturnos.repository;

import co.edu.unicauca.microserviceturnos.entities.Turno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TurnoRepository extends JpaRepository<Turno, UUID> {


    List<Turno> findByClienteId(String clienteId);

    List<Turno> findByBarberoId(String barberoId);
    List<Turno> findByBarberoIdAndFechaHoraBetween(String barberoId, LocalDateTime fechaInicio, LocalDateTime  fechaFin);
}
