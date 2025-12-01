package co.edu.unicauca.microserviceturnos.controller;


import co.edu.unicauca.microserviceturnos.Excepciones.AccionInvalidaTurnoException;
import co.edu.unicauca.microserviceturnos.dto.TurnoRequest;
import co.edu.unicauca.microserviceturnos.dto.TurnoStateResponse;
import co.edu.unicauca.microserviceturnos.dto.TurnoUpdate;
import co.edu.unicauca.microserviceturnos.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin("*")
public class TurnoController {

    @Autowired
    private TurnoService turnoService;


    @PostMapping
    public ResponseEntity<?> createTurno(@RequestBody TurnoRequest dto) {
        try {
            TurnoRequest response = turnoService.createTurno(dto);
            return ResponseEntity.status(201).body(response); // 201 Created

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // 400 Bad Request

        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage()); // 500 Internal Server Error
        }
    }

    @PutMapping("/{id}")
        public ResponseEntity<?> updateTurno(@PathVariable UUID id, @RequestBody TurnoUpdate dto) {
        try {
            TurnoRequest response = turnoService.updateTurno(id, dto);
            return ResponseEntity.ok(response); // 200 OK

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // 400 Bad Request

        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage()); // 500 Internal Server Error
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllTurnos() {
        try {
            List<TurnoRequest> response = turnoService.getAllTurnos();
            return ResponseEntity.ok(response); // 200 OK
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // 400 Bad Request
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage()); // 500 Internal Server Error
        }
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<?> getTurnosByIdCliente(@PathVariable String id) {
        try {
            List<TurnoRequest> response = turnoService.getTurnoByIdCliente(id);
            return ResponseEntity.ok(response); // 200 OK
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // 400 Bad Request
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage()); // 500 Internal Server Error
        }
    }

    @GetMapping("/barbero/{id}")
    public ResponseEntity<?> getTurnosByIdBarbero(@PathVariable String id) {
        try {
            List<TurnoRequest> response = turnoService.getTurnoByIdBarbero(id);
            return ResponseEntity.ok(response); // 200 OK
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // 400 Bad Request
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage()); // 500 Internal Server Error
        }
    }

    @PostMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmar(@PathVariable UUID id) {
        try {
            TurnoStateResponse turno = turnoService.confirmarTurno(id);
            return ResponseEntity.ok(turno);
        } catch (AccionInvalidaTurnoException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
    @PostMapping("/{id}/iniciar")
    public ResponseEntity<?> iniciar(@PathVariable UUID id) {
        try {
            TurnoStateResponse turno = turnoService.iniciarTurno(id);
            return ResponseEntity.ok(turno);
        } catch (AccionInvalidaTurnoException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizar(@PathVariable UUID id) {
        try {
            TurnoStateResponse turno = turnoService.finalizarTurno(id);
            return ResponseEntity.ok(turno);
        } catch (AccionInvalidaTurnoException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(@PathVariable UUID id) {
        try {
            TurnoStateResponse turno = turnoService.cancelarTurno(id);
            return ResponseEntity.ok(turno);
        } catch (AccionInvalidaTurnoException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @PostMapping("/{id}/no_asistio")
    public ResponseEntity<?> noAsistio(@PathVariable UUID id) {
        try {
            TurnoStateResponse turno = turnoService.marcarNoAsistio(id);
            return ResponseEntity.ok(turno);
        } catch (AccionInvalidaTurnoException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }



}
