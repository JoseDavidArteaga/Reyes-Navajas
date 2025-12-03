package co.edu.unicauca.microserviceturnos.service;

import co.edu.unicauca.microserviceturnos.Excepciones.ListaEsperaException;
import co.edu.unicauca.microserviceturnos.Excepciones.TurnoSolapadoException;
import co.edu.unicauca.microserviceturnos.Excepciones.ValidacionTurnoException;
import co.edu.unicauca.microserviceturnos.dto.TurnoRequest;
import co.edu.unicauca.microserviceturnos.entities.Turno;
import co.edu.unicauca.microserviceturnos.mappers.TurnoMapper;
import co.edu.unicauca.microserviceturnos.repository.ListaEsperaRepository;
import co.edu.unicauca.microserviceturnos.repository.TurnoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TurnoServiceTest {

    @Mock
    TurnoRepository turnoRepository;

    @Mock
    TurnoMapper turnoMapper;

    @Mock
    NotificacionService notificacionService;

    @Mock
    ListaEsperaRepository listaEsperaRepository;

    @Mock
    ListaEsperaService listaEsperaService;

    @InjectMocks
    TurnoService turnoService;

    @BeforeEach
    void setup() {
        // Ensure default config values are set
        ReflectionTestUtils.setField(turnoService, "minDurationMinutes", 45);
        ReflectionTestUtils.setField(turnoService, "bufferMinutes", 5);
    }

    @Test
    void createTurno_nullDto_throwsValidacion() {
        assertThrows(ValidacionTurnoException.class, () -> turnoService.createTurno(null));
    }

    @Test
    void createTurno_pastDate_throwsValidacion() {
        TurnoRequest dto = new TurnoRequest();
        dto.setClienteId("cliente1");
        dto.setBarberoId("barbero1");
        dto.setServicioId("serv1");
        dto.setFechaHora(LocalDateTime.now().minusDays(1));

        assertThrows(ValidacionTurnoException.class, () -> turnoService.createTurno(dto));
    }

    @Test
    void createTurno_overlap_addsToListaAndThrowsTurnoSolapado() {
        // Arrange
        TurnoRequest dto = new TurnoRequest();
        dto.setClienteId("cliente1");
        dto.setBarberoId("barbero1");
        dto.setServicioId("serv1");
        LocalDateTime inicio = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);
        dto.setFechaHora(inicio);

        when(turnoRepository.findByClienteId("cliente1")).thenReturn(new ArrayList<>());
        when(listaEsperaRepository.existsByClienteIdAndBarberoId("cliente1", "barbero1")).thenReturn(false);

        // Create existing turno that overlaps (e.g., at same time)
        Turno existing = new Turno("otra", "barbero1", "s", inicio, "");
        existing.setDuracionMinutos(45);
        List<Turno> ocupados = new ArrayList<>();
        ocupados.add(existing);

        when(turnoRepository.findByBarberoIdAndFechaHoraBetween(any(), any(), any())).thenReturn(ocupados);

        // Act & Assert
        assertThrows(TurnoSolapadoException.class, () -> turnoService.createTurno(dto));

        // Verify that the cliente was agregado a lista de espera
        verify(listaEsperaService, times(1)).guardarEnLista(any());
    }

    @Test
    void getDisponibilidadBarbero_excludesOccupiedHour() {
        String barberoId = "barbero1";
        LocalDate fecha = LocalDate.now().plusDays(2);
        LocalDateTime ocupada = fecha.atTime(LocalTime.of(11,0));

        Turno t = new Turno("c1", barberoId, "s1", ocupada, "");
        List<Turno> ocupados = List.of(t);

        when(turnoRepository.findByBarberoIdAndFechaHoraBetween(eq(barberoId), any(), any())).thenReturn(ocupados);

        var disp = turnoService.getDisponibilidadBarbero(barberoId, fecha.toString(), 1);

        assertNotNull(disp);
        assertEquals(barberoId, disp.getBarberoId());
        assertFalse(disp.getHorarios().isEmpty());

        // The occupied hour "11:00" should not be in available hours
        var horas = disp.getHorarios().get(0).getHorasDisponibles();
        assertFalse(horas.contains("11:00"));
    }
}
