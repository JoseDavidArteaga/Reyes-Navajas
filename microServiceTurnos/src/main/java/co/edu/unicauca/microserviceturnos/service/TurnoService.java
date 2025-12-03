package co.edu.unicauca.microserviceturnos.service;

import java.util.Optional;

import co.edu.unicauca.microserviceturnos.Excepciones.*;
import co.edu.unicauca.microserviceturnos.dto.TurnoRequest;
import co.edu.unicauca.microserviceturnos.dto.TurnoStateResponse;
import co.edu.unicauca.microserviceturnos.dto.TurnoUpdate;
import co.edu.unicauca.microserviceturnos.entities.DisponibilidadBarbero;
import co.edu.unicauca.microserviceturnos.entities.EstadoTurnoEnum;
import co.edu.unicauca.microserviceturnos.entities.HorarioDisponible;
import co.edu.unicauca.microserviceturnos.entities.Turno;
import co.edu.unicauca.microserviceturnos.mappers.TurnoMapper;
import co.edu.unicauca.microserviceturnos.repository.TurnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import co.edu.unicauca.microserviceturnos.repository.ListaEsperaRepository;
import co.edu.unicauca.microserviceturnos.entities.ListaEspera;

@Service
public class TurnoService {


    @Autowired
    TurnoRepository turnoRepository;

    @Autowired
    TurnoMapper turnoMapper;

    @Autowired
    NotificacionService notificacionService;

    @Autowired
    ListaEsperaRepository listaEsperaRepository;

    @Autowired
    private ListaEsperaService listaEsperaService;


    @Value("${turnos.min-duration-minutes:45}")
    private int minDurationMinutes;

    @Value("${turnos.buffer-minutes:5}")
    private int bufferMinutes;

    @Transactional
    public TurnoRequest createTurno(TurnoRequest dto) {

        // -------------------------------
        // VALIDACIONES DEL DTO
        // -------------------------------
        if (dto == null) {
            throw new ValidacionTurnoException("El DTO de Turno no puede ser null.");
        }
        if (dto.getClienteId() == null || dto.getBarberoId() == null || dto.getServicioId() == null) {
            throw new ValidacionTurnoException("Faltan datos obligatorios: clienteId, barberoId o servicioId.");
        }
        if (dto.getFechaHora() == null) {
            throw new ValidacionTurnoException("La fecha y hora del turno es obligatoria.");
        }
        if (dto.getFechaHora().isBefore(LocalDateTime.now())) {
            throw new ValidacionTurnoException("No puedes reservar un turno en el pasado.");
        }

        // -------------------------------
        // VALIDACIÓN: CLIENTE YA TIENE TURNO FUTURO CON ESTE BARBERO
        // -------------------------------
        boolean yaTieneTurno = turnoRepository.findByClienteId(dto.getClienteId())
                .stream()
                .anyMatch(t ->
                        t.getBarberoId().equals(dto.getBarberoId()) &&
                                t.getFechaHora().isAfter(LocalDateTime.now()) &&
                                t.getEstado() != EstadoTurnoEnum.CANCELADO &&
                                t.getEstado() != EstadoTurnoEnum.NO_ASISTIO
                );

        if (yaTieneTurno) {
            throw new ValidacionTurnoException("Ya tienes un turno agendado con este barbero.");
        }

        // -------------------------------
        // VALIDACIÓN: YA ESTÁ EN LISTA DE ESPERA
        // -------------------------------
        if (listaEsperaRepository.existsByClienteIdAndBarberoId(dto.getClienteId(), dto.getBarberoId())) {
            throw new ListaEsperaException("Ya estás en lista de espera para este barbero.");
        }

        // -------------------------------
        // DURACIÓN DEL TURNO
        // -------------------------------
        dto.setFechaCreacion(LocalDateTime.now());

        Integer duracion = (dto.getDuracionMinutos() != null)
                ? dto.getDuracionMinutos()
                : minDurationMinutes;

        if (duracion < minDurationMinutes) {
            throw new ValidacionTurnoException(
                    "La duración del servicio es inferior a la mínima permitida (" +
                            minDurationMinutes + " minutos)."
            );
        }

        // -------------------------------
        // DETECCIÓN DE SOLAPAMIENTO
        // -------------------------------
        LocalDateTime inicio = dto.getFechaHora();
        LocalDateTime fin = inicio.plusMinutes(duracion);

        LocalDateTime ventanaInicio = inicio.minusMinutes(duracion + bufferMinutes);
        LocalDateTime ventanaFin = fin.plusMinutes(bufferMinutes);

        List<Turno> turnosSolapados = turnoRepository.findByBarberoIdAndFechaHoraBetween(
                dto.getBarberoId(), ventanaInicio, ventanaFin);

        for (Turno t : turnosSolapados) {

            // Ignorar turnos cancelados o no asistidos
            if (t.getEstado() == EstadoTurnoEnum.CANCELADO ||
                    t.getEstado() == EstadoTurnoEnum.NO_ASISTIO) {
                continue;
            }

            int durExist = (t.getDuracionMinutos() != null)
                    ? t.getDuracionMinutos()
                    : minDurationMinutes;

            LocalDateTime inicioExist = t.getFechaHora().minusMinutes(bufferMinutes);
            LocalDateTime finExist = t.getFechaHora().plusMinutes(durExist + bufferMinutes);

            boolean overlap = inicio.isBefore(finExist) && fin.isAfter(inicioExist);

            if (overlap) {

                ListaEspera le = new ListaEspera();
                le.setClienteId(dto.getClienteId());
                le.setBarberoId(dto.getBarberoId());
                le.setServicioId(dto.getServicioId());
                le.setFechaSolicitud(LocalDateTime.now());
                le.setPrioridad(0);

                listaEsperaService.guardarEnLista(le);  // <-- ahora sí se guarda SIEMPRE

                throw new TurnoSolapadoException(
                        "Horario ocupado. Se te ha agregado automáticamente a la lista de espera."
                );
            }
        }

        // -------------------------------
        // CREAR TURNO SI TODO ES VÁLIDO
        // -------------------------------
        dto.setDuracionMinutos(duracion);
        Turno turno = turnoMapper.dtoToEntity(dto);

        Turno saved = turnoRepository.save(turno);

        // Notificación asíncrona
        try {
            notificacionService.enviarNotificacionAsync(dto);
        } catch (Exception e) {
            System.out.println("Error enviando notificación: " + e.getMessage());
        }

        return turnoMapper.entityToDto(saved);
    }

    @Transactional
    public TurnoRequest updateTurno(UUID id, TurnoUpdate dto) {

        if (id == null)
            throw new ValidacionTurnoException("El ID del turno es obligatorio.");

        if (dto == null)
            throw new ValidacionTurnoException("El DTO del turno no puede ser null.");

        if (dto.getClienteId() == null || dto.getBarberoId() == null || dto.getServicioId() == null)
            throw new ValidacionTurnoException("Faltan datos obligatorios: clienteId, barberoId o servicioId.");

        if (dto.getFechaHora() == null)
            throw new ValidacionTurnoException("La fecha y hora del turno es obligatoria.");

        if (dto.getFechaHora().isBefore(LocalDateTime.now()))
            throw new ValidacionTurnoException("No puedes mover un turno al pasado.");

        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new TurnoNotFoundException("No existe el turno con ID: " + id));

        // Actualización de campos
        turno.setClienteId(dto.getClienteId());
        turno.setBarberoId(dto.getBarberoId());
        turno.setServicioId(dto.getServicioId());
        turno.setFechaHora(dto.getFechaHora());
        turno.setNotas(dto.getNotas());

        Turno updated = turnoRepository.save(turno);

        return turnoMapper.entityToDto(updated);
    }

    public List<TurnoRequest> getAllTurnos() {
        List<Turno> turnos = turnoRepository.findAll();
        return turnos.stream()
                .map(turnoMapper::entityToDto)
                .collect(Collectors.toList());
    }


    public List<TurnoRequest> getTurnoByIdCliente(String clienteId) {

        if (clienteId == null || clienteId.isBlank())
            throw new ValidacionTurnoException("El ID del cliente es obligatorio.");

        List<Turno> turnos = turnoRepository.findByClienteId(clienteId);

        if (turnos.isEmpty())
            throw new TurnoNotFoundException("No se encontraron turnos para el cliente con ID: " + clienteId);

        return turnos.stream()
                .map(turnoMapper::entityToDto)
                .collect(Collectors.toList());
    }

    public List<TurnoRequest> getTurnoByIdBarbero(String barberoId) {

        if (barberoId == null || barberoId.isBlank())
            throw new ValidacionTurnoException("El ID del barbero es obligatorio.");

        List<Turno> turnos = turnoRepository.findByBarberoId(barberoId);

        if (turnos.isEmpty())
            throw new TurnoNotFoundException("No se encontraron turnos para el barbero con ID: " + barberoId);

        return turnos.stream()
                .map(turnoMapper::entityToDto)
                .collect(Collectors.toList());
    }


    public TurnoStateResponse confirmarTurno(UUID id) {

        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new TurnoNotFoundException("Turno no encontrado"));

        // Validar estado
        if (turno.getEstado() == EstadoTurnoEnum.CONFIRMADO) {
            throw new EstadoInvalidoException("El turno ya está confirmado.");
        }

        if (turno.getEstado() == EstadoTurnoEnum.CANCELADO ||
                turno.getEstado() == EstadoTurnoEnum.FINALIZADO ||
                turno.getEstado() == EstadoTurnoEnum.NO_ASISTIO) {
            throw new EstadoInvalidoException("Este turno ya no se puede confirmar.");
        }

        // Validar límite de tiempo (2 horas antes)
        if (turno.getFechaHora().minusHours(2).isBefore(LocalDateTime.now())) {
            throw new EstadoInvalidoException("Debes confirmar tu turno al menos 2 horas antes.");
        }

        // Cambiar estado
        turno.confirmar();

        turnoRepository.save(turno);

        return turnoMapper.entityToTurnoStateResponse(turno);
    }

    public TurnoStateResponse iniciarTurno(UUID id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new TurnoNotFoundException("No existe el turno con ID: " + id));
        try {
            turno.iniciar();
        } catch (Exception ex) {
            throw new EstadoInvalidoException("No es posible iniciar el turno: " + ex.getMessage());
        }
        turnoRepository.save(turno);
        return turnoMapper.entityToTurnoStateResponse(turno);
    }

    public TurnoStateResponse finalizarTurno(UUID id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new TurnoNotFoundException("No existe el turno con ID: " + id));

        try {
            turno.finalizar();
        } catch (Exception ex) {
            throw new EstadoInvalidoException("No es posible finalizar el turno: " + ex.getMessage());
        }

        turnoRepository.save(turno);
        return turnoMapper.entityToTurnoStateResponse(turno);
    }

    @Transactional
    public TurnoStateResponse cancelarTurno(UUID id) {

        // Buscar el turno
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new TurnoNotFoundException("No existe el turno con ID: " + id));

        // Validar transición de estado
        try {
            turno.cancelar();
        } catch (Exception ex) {
            throw new EstadoInvalidoException("No es posible cancelar el turno: " + ex.getMessage());
        }

        // Guardar el turno cancelado
        turnoRepository.save(turno);

        // ================================
        //  REASIGNACIÓN AUTOMÁTICA
        // ================================

        Optional<ListaEspera> opt = listaEsperaRepository
                .findFirstByBarberoIdOrderByFechaSolicitudAsc(turno.getBarberoId());

        if (opt.isPresent()) {

            ListaEspera clienteEspera = opt.get();

            // Crear el nuevo turno asignado al cliente de lista de espera
            Turno nuevoTurno = new Turno(
                    clienteEspera.getClienteId(),
                    clienteEspera.getBarberoId(),
                    clienteEspera.getServicioId(),
                    turno.getFechaHora(), // ⬅ MISMO horario que dejó libre cliente cancelado
                    "Turno reasignado automáticamente por cancelación"
            );

            nuevoTurno.setDuracionMinutos(
                    turno.getDuracionMinutos() != null ? turno.getDuracionMinutos() : 45
            );
            nuevoTurno.setFechaCreacion(LocalDateTime.now());

            // Guardar turno reasignado
            Turno saved = turnoRepository.save(nuevoTurno);

            // Notificar al cliente que ahora tiene el turno
            TurnoRequest tr = new TurnoRequest();
            tr.setId(saved.getId().toString());
            tr.setClienteId(saved.getClienteId());
            tr.setBarberoId(saved.getBarberoId());
            tr.setServicioId(saved.getServicioId());
            tr.setFechaHora(saved.getFechaHora());
            tr.setNotas(saved.getNotas());
            tr.setFechaCreacion(saved.getFechaCreacion());

            try {
                notificacionService.enviarNotificacionAsync(tr);
            } catch (Exception e) {
                System.out.println("⚠ No se pudo enviar notificación al cliente reasignado: " + e.getMessage());
            }

            // Eliminar de lista de espera
            listaEsperaRepository.delete(clienteEspera);

            System.out.println("✔ Reasignado turno automáticamente a cliente en lista de espera.");
        }

        // Respuesta del turno cancelado (estándar)
        return turnoMapper.entityToTurnoStateResponse(turno);
    }


    public TurnoStateResponse marcarNoAsistio(UUID id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new TurnoNotFoundException("No existe el turno con ID: " + id));

        try {
            turno.noAsistio();
        } catch (Exception ex) {
            throw new EstadoInvalidoException("No es posible marcar el turno como no asistido: " + ex.getMessage());
        }

        turnoRepository.save(turno);
        return turnoMapper.entityToTurnoStateResponse(turno);
    }


    public DisponibilidadBarbero getDisponibilidadBarbero(String barberoId, String fechaInicioStr, Integer dias) {
        LocalDate fechaInicio;
        try {
            if (fechaInicioStr != null && !fechaInicioStr.isEmpty()) {
                fechaInicio = LocalDate.parse(fechaInicioStr); // Formato yyyy-MM-dd
            } else {
                fechaInicio = LocalDate.now();
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Fecha inválida: " + fechaInicioStr);
        }

        int numDias = (dias != null) ? dias : 7;

        // Convertir fechas a LocalDateTime para la consulta
        LocalDateTime fechaHoraInicio = fechaInicio.atStartOfDay();
        LocalDateTime fechaHoraFin = fechaInicio.plusDays(numDias).atStartOfDay();

        // Consultar todos los turnos del barbero en el rango de fechas
        List<Turno> turnosOcupados = turnoRepository.findByBarberoIdAndFechaHoraBetween(
                barberoId,
                fechaHoraInicio,
                fechaHoraFin
        );

        List<HorarioDisponible> horarios = new ArrayList<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 0; i < numDias; i++) {
            LocalDate fecha = fechaInicio.plusDays(i);

            // Filtrar turnos ocupados para esta fecha específica
            List<LocalTime> horasOcupadas = turnosOcupados.stream()
                    .filter(t -> t.getFechaHora().toLocalDate().equals(fecha))
                    .map(t -> t.getFechaHora().toLocalTime())
                    .collect(Collectors.toList());

            // Generar todas las horas posibles del día
            List<String> horasDisponibles = generarHorasDisponibles(horasOcupadas);

            HorarioDisponible hd = new HorarioDisponible();
            hd.setFecha(fecha.format(dateFormatter));
            hd.setHorasDisponibles(horasDisponibles);
            horarios.add(hd);
        }

        DisponibilidadBarbero disponibilidad = new DisponibilidadBarbero();
        disponibilidad.setBarberoId(barberoId);
        disponibilidad.setHorarios(horarios);

        return disponibilidad;
    }

    private List<String> generarHorasDisponibles(List<LocalTime> horasOcupadas) {

        LocalTime HORA_INICIO = LocalTime.of(9, 0);
        LocalTime HORA_FIN = LocalTime.of(18, 0);
        int DURACION_TURNO_MINUTOS = 60;

        List<String> horasDisponibles = new ArrayList<>();
        LocalTime horaActual = HORA_INICIO;
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        while (horaActual.isBefore(HORA_FIN)) {
            // Si la hora no está ocupada, agregarla a disponibles
            final LocalTime horaComparar = horaActual;
            boolean estaOcupada = horasOcupadas.stream()
                    .anyMatch(horaOcupada ->
                            horaOcupada.getHour() == horaComparar.getHour() &&
                                    horaOcupada.getMinute() == horaComparar.getMinute()
                    );

            if (!estaOcupada) {
                horasDisponibles.add(horaActual.format(timeFormatter));
            }

            horaActual = horaActual.plusMinutes(DURACION_TURNO_MINUTOS);
        }
        return horasDisponibles;
    }
}



