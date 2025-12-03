package co.edu.unicauca.microserviceturnos.controller;

import co.edu.unicauca.microserviceturnos.dto.TurnoRequest;
import co.edu.unicauca.microserviceturnos.dto.TurnoStateResponse;
import co.edu.unicauca.microserviceturnos.dto.TurnoUpdate;
import co.edu.unicauca.microserviceturnos.entities.DisponibilidadBarbero;
import co.edu.unicauca.microserviceturnos.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/turnos")
@CrossOrigin("*")
public class TurnoController {

    @Autowired
    private TurnoService turnoService;

    // -----------------------------
    // CREAR TURNO
    // -----------------------------
    @PostMapping
    public ResponseEntity<TurnoRequest> createTurno(@RequestBody TurnoRequest dto) {
        TurnoRequest response = turnoService.createTurno(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // -----------------------------
    // ACTUALIZAR TURNO
    // -----------------------------
    @PutMapping("/{id}")
    public ResponseEntity<TurnoRequest> updateTurno(
            @PathVariable UUID id,
            @RequestBody TurnoUpdate dto) {

        TurnoRequest response = turnoService.updateTurno(id, dto);
        return ResponseEntity.ok(response);
    }

    // -----------------------------
    // OBTENER TODOS LOS TURNOS
    // -----------------------------
    @GetMapping
    public ResponseEntity<List<TurnoRequest>> getAllTurnos() {
        return ResponseEntity.ok(turnoService.getAllTurnos());
    }

    // -----------------------------
    // OBTENER TURNOS POR CLIENTE
    // -----------------------------
    @GetMapping("/cliente/{id}")
    public ResponseEntity<List<TurnoRequest>> getTurnosByIdCliente(@PathVariable String id) {
        return ResponseEntity.ok(turnoService.getTurnoByIdCliente(id));
    }

    // -----------------------------
    // OBTENER TURNOS POR BARBERO
    // -----------------------------
    @GetMapping("/barbero/{id}")
    public ResponseEntity<List<TurnoRequest>> getTurnosByIdBarbero(@PathVariable String id) {
        return ResponseEntity.ok(turnoService.getTurnoByIdBarbero(id));
    }

    // -----------------------------
    // CAMBIOS DE ESTADO
    // -----------------------------
    @PostMapping("/{id}/confirmar")
    public ResponseEntity<TurnoStateResponse> confirmar(@PathVariable UUID id) {
        return ResponseEntity.ok(turnoService.confirmarTurno(id));
    }

    @PostMapping("/{id}/iniciar")
    public ResponseEntity<TurnoStateResponse> iniciar(@PathVariable UUID id) {
        return ResponseEntity.ok(turnoService.iniciarTurno(id));
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<TurnoStateResponse> finalizar(@PathVariable UUID id) {
        return ResponseEntity.ok(turnoService.finalizarTurno(id));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<TurnoStateResponse> cancelar(@PathVariable UUID id) {
        return ResponseEntity.ok(turnoService.cancelarTurno(id));
    }

    @PostMapping("/{id}/no_asistio")
    public ResponseEntity<TurnoStateResponse> noAsistio(@PathVariable UUID id) {
        return ResponseEntity.ok(turnoService.marcarNoAsistio(id));
    }

    // -----------------------------
    // DISPONIBILIDAD DEL BARBERO
    // -----------------------------
    @GetMapping("/barberos/{barberoId}/disponibilidad")
    public ResponseEntity<DisponibilidadBarbero> getDisponibilidadBarbero(
            @PathVariable String barberoId,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) Integer dias) {

        return ResponseEntity.ok(
                turnoService.getDisponibilidadBarbero(barberoId, fechaInicio, dias)
        );
    }
}
