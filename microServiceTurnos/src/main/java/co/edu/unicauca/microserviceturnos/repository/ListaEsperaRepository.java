package co.edu.unicauca.microserviceturnos.repository;

import co.edu.unicauca.microserviceturnos.entities.ListaEspera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ListaEsperaRepository extends JpaRepository<ListaEspera, UUID> {

    Optional<ListaEspera> findFirstByBarberoIdOrderByFechaSolicitudAsc(String barberoId);
    boolean existsByClienteIdAndBarberoId(String clienteId, String barberoId);

}
