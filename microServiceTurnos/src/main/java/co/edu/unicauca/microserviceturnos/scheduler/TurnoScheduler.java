package co.edu.unicauca.microserviceturnos.scheduler;

import co.edu.unicauca.microserviceturnos.dto.TurnoRequest;
import co.edu.unicauca.microserviceturnos.entities.ListaEspera;
import co.edu.unicauca.microserviceturnos.entities.Turno;
import co.edu.unicauca.microserviceturnos.repository.ListaEsperaRepository;
import co.edu.unicauca.microserviceturnos.repository.TurnoRepository;
import co.edu.unicauca.microserviceturnos.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import static co.edu.unicauca.microserviceturnos.entities.EstadoTurnoEnum.PENDIENTE;

@Component
@RequiredArgsConstructor
@Slf4j
public class TurnoScheduler {

    private final TurnoRepository turnoRepository;
    private final ListaEsperaRepository listaEsperaRepository;
    private final NotificacionService notificacionService;

    // Ejecutar cada 1 minuto
    @Scheduled(fixedRateString = "${turnos.scheduler-rate-ms:60000}")
    @Transactional
    public void procesarNoShowsYReasignaciones() {
        log.debug("Scheduler: buscando turnos para marcar como NO_ASISTIO...");

        LocalDateTime now = LocalDateTime.now();

        for (Turno t : turnoRepository.findAll()) {
            try {
                if (t.getFechaHora() == null) continue;

                // Solo procesar turnos en estado PENDIENTE o CONFIRMADO
                if (t.getEstado() == null) continue;
                switch (t.getEstado()) {
                    case CONFIRMADO:
                        int tolerancia = 10;
                        LocalDateTime limite = t.getFechaHora().plusMinutes(tolerancia);

                        if (now.isAfter(limite)) {
                            log.info("Marcando turno {} como NO_ASISTIO", t.getId());

                            try {
                                t.noAsistio();
                                turnoRepository.save(t);
                            } catch (Exception e) {
                                log.error("Transición inválida para turno {}: {}", t.getId(), e.getMessage());
                                break; // evitar continuar con reasignación
                            }

                            // Reasignación desde lista de espera
                            Optional<ListaEspera> opt = listaEsperaRepository.findFirstByBarberoIdOrderByFechaSolicitudAsc(t.getBarberoId());
                            if (opt.isPresent()) {
                                ListaEspera le = opt.get();

                                Turno nuevo = new Turno(
                                        le.getClienteId(),
                                        le.getBarberoId(),
                                        le.getServicioId(),
                                        t.getFechaHora(),
                                        "Reasignado desde lista de espera"
                                );
                                nuevo.setDuracionMinutos(t.getDuracionMinutos());
                                nuevo.setFechaCreacion(LocalDateTime.now());

                                Turno saved = turnoRepository.save(nuevo);

                                TurnoRequest tr = new TurnoRequest();
                                tr.setId(saved.getId().toString());
                                tr.setClienteId(saved.getClienteId());
                                tr.setBarberoId(saved.getBarberoId());
                                tr.setServicioId(saved.getServicioId());
                                tr.setFechaHora(saved.getFechaHora());
                                tr.setNotas(saved.getNotas());
                                tr.setFechaCreacion(saved.getFechaCreacion());
                                notificacionService.enviarNotificacionAsync(tr);

                                listaEsperaRepository.delete(le);
                                log.info("Reasignado turno {} a cliente {} desde lista de espera", saved.getId(), le.getClienteId());
                            }
                        }
                        break;

                    case PENDIENTE:
                        // No marcar pendiente como no asistió
                        break;

                    default:
                        break;
                }

            } catch (Exception e) {
                log.error("Error procesando turno {}: {}", t.getId(), e.getMessage(), e);
            }
        }
    }
}
