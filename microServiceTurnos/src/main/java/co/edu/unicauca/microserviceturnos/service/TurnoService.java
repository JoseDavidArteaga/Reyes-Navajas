package co.edu.unicauca.microserviceturnos.service;


import co.edu.unicauca.microserviceturnos.dto.TurnoRequest;
import co.edu.unicauca.microserviceturnos.dto.TurnoStateResponse;
import co.edu.unicauca.microserviceturnos.dto.TurnoUpdate;
import co.edu.unicauca.microserviceturnos.entities.Turno;
import co.edu.unicauca.microserviceturnos.mappers.TurnoMapper;
import co.edu.unicauca.microserviceturnos.repository.TurnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TurnoService {


    @Autowired
    TurnoRepository turnoRepository;

    @Autowired
    TurnoMapper turnoMapper;

    @Transactional
    public TurnoRequest createTurno(TurnoRequest dto) {
        if (dto == null) {
            throw new IllegalArgumentException("El DTO de Turno no puede ser null.");
        }
        if (dto.getClienteId() == null || dto.getBarberoId() == null || dto.getServicioId() == null) {
            throw new IllegalArgumentException("Faltan datos obligatorios: clienteId, barberoId o servicioId.");
        }
        if (dto.getFechaHora() == null) {
            throw new IllegalArgumentException("La fecha y hora del turno es obligatoria.");
        }

        try {

            dto.setFechaCreacion(LocalDateTime.now());
            Turno turno = turnoMapper.dtoToEntity(dto);
            Turno savedTurno = turnoRepository.save(turno);
            return turnoMapper.entityToDto(savedTurno);

        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
            throw new IllegalArgumentException("Error al convertir el estado del turno: " + e.getMessage(), e);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new RuntimeException("Error al crear el turno en la base de datos: " + e.getMessage(), e);
        }
    }

    @Transactional
    public TurnoRequest updateTurno(UUID id, TurnoUpdate dto) {
        if (id == null) {
            throw new IllegalArgumentException("El ID del turno es obligatorio.");
        }
        if (dto == null) {
            throw new IllegalArgumentException("El DTO de Turno no puede ser null.");
        }
        if (dto.getClienteId() == null || dto.getBarberoId() == null || dto.getServicioId() == null) {
            throw new IllegalArgumentException("Faltan datos obligatorios: clienteId, barberoId o servicioId.");
        }
        if (dto.getFechaHora() == null) {
            throw new IllegalArgumentException("La fecha y hora del turno es obligatoria.");
        }

        try {
            Turno existingTurno = turnoRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("No se encontró el turno con ID: " + id));

            // Actualizar los datos del turno
            existingTurno.setClienteId(dto.getClienteId());
            existingTurno.setBarberoId(dto.getBarberoId());
            existingTurno.setServicioId(dto.getServicioId());
            existingTurno.setFechaHora(dto.getFechaHora());
            existingTurno.setNotas(dto.getNotas());

            Turno updatedTurno = turnoRepository.save(existingTurno);
            return turnoMapper.entityToDto(updatedTurno);

        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
            throw new IllegalArgumentException("Error al actualizar el turno: " + e.getMessage(), e);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new RuntimeException("Error al actualizar el turno en la base de datos: " + e.getMessage(), e);
        }
    }
    public List<TurnoRequest> getAllTurnos() {
        try {
            List<Turno> turnos = turnoRepository.findAll();
            return turnos.stream()
                    .map(turnoMapper::entityToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener todos los turnos: " + e.getMessage(), e);
        }
    }

    public List<TurnoRequest> getTurnoByIdCliente(String clienteId) {
        try {
            List<Turno> turnos = turnoRepository.findByClienteId(clienteId); // Asegúrate de que esta consulta devuelva una lista

            if (!turnos.isEmpty()) {
                return turnos.stream()
                        .map(turnoMapper::entityToDto)
                        .collect(Collectors.toList());
            } else {
                throw new IllegalArgumentException("No se encontraron turnos para el cliente con ID: " + clienteId);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener los turnos con clienteId " + clienteId + ": " + e.getMessage(), e);
        }
    }

    public List<TurnoRequest> getTurnoByIdBarbero(String barberoId) {
        try {
            List<Turno> turnos = turnoRepository.findByBarberoId(barberoId); // Asegúrate de que esta consulta devuelva una lista

            if (!turnos.isEmpty()) {
                return turnos.stream()
                        .map(turnoMapper::entityToDto)
                        .collect(Collectors.toList());
            } else {
                throw new IllegalArgumentException("No se encontraron turnos para el barbero con ID: " + barberoId);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener los turnos con barberoId " + barberoId + ": " + e.getMessage(), e);
        }
    }


    public TurnoStateResponse confirmarTurno(UUID id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        if (turno.getEstadoTurno() == null) {
            turno.setEstadoTurno(turno.getEstadoTurnoObjeto()); // Instancia el objeto de estado
        }
        turno.confirmar();
        turnoRepository.save(turno);
        return turnoMapper.entityToTurnoStateResponse(turno);
    }

    public TurnoStateResponse iniciarTurno(UUID id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        turno.iniciar();
        return turnoMapper.entityToTurnoStateResponse(turno);
    }

    public TurnoStateResponse finalizarTurno(UUID id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        turno.finalizar();
        return turnoMapper.entityToTurnoStateResponse(turno);
    }

    public TurnoStateResponse cancelarTurno(UUID id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        turno.cancelar();
        return turnoMapper.entityToTurnoStateResponse(turno);
    }

    public TurnoStateResponse marcarNoAsistio(UUID id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        turno.noAsistio();
        return turnoMapper.entityToTurnoStateResponse(turno);
    }

}



