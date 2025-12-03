package co.edu.unicauca.barberia.controller;

import co.edu.unicauca.barberia.service.CatalogoService;
import co.edu.unicauca.barberia.service.Dtos.ServicioDTOPeticion;
import co.edu.unicauca.barberia.service.Dtos.ServicioDTORespuesta;
import co.edu.unicauca.barberia.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("/catalogo")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService catalogoService;
    private final FileStorageService storageService;

    // -------------------------------------------------------------
    // 1. CREAR SERVICIO
    // -------------------------------------------------------------
    @PostMapping("/servicios")
    public ResponseEntity<ServicioDTORespuesta> crearServicio(
            @RequestParam("nombre") String nombre,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("duracion") Integer duracion,
            @RequestParam("precio") Double precio,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

        ServicioDTOPeticion dto = new ServicioDTOPeticion();
        dto.setNombre(nombre);
        dto.setDescripcion(descripcion);
        dto.setDuracion(duracion);
        dto.setPrecio(precio);

        ServicioDTORespuesta creado = catalogoService.crearServicio(dto, imagen);

        // Location: /catalogo/servicios/{id}
        URI location = URI.create("/catalogo/servicios/" + creado.getId());

        return ResponseEntity
                .created(location)
                .body(creado);
    }

    // -------------------------------------------------------------
    // 2. OBTENER TODOS LOS SERVICIOS
    // -------------------------------------------------------------
    @GetMapping("/servicios")
    public ResponseEntity<List<ServicioDTORespuesta>> obtenerTodos() {
        List<ServicioDTORespuesta> servicios = catalogoService.obtenerTodos();
        return ResponseEntity.ok(servicios);
    }

    // -------------------------------------------------------------
    // 3. OBTENER SERVICIO POR ID
    // -------------------------------------------------------------
    @GetMapping("/servicios/{id}")
    public ResponseEntity<ServicioDTORespuesta> obtenerPorId(@PathVariable Long id) {
        ServicioDTORespuesta servicio = catalogoService.obtenerPorId(id);
        return ResponseEntity.ok(servicio);
    }

    // -------------------------------------------------------------
    // 4. ACTUALIZAR SERVICIO (CON O SIN IMAGEN)
    // -------------------------------------------------------------
    @PutMapping("/servicios/{id}")
    public ResponseEntity<ServicioDTORespuesta> actualizarServicio(
            @PathVariable Long id,
            @RequestParam("nombre") String nombre,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("duracion") Integer duracion,
            @RequestParam("precio") Double precio,
            @RequestParam(value = "imagen", required = false) MultipartFile nuevaImagen) {

        ServicioDTOPeticion dto = new ServicioDTOPeticion();
        dto.setNombre(nombre);
        dto.setDescripcion(descripcion);
        dto.setDuracion(duracion);
        dto.setPrecio(precio);

        ServicioDTORespuesta actualizado =
                catalogoService.actualizarServicio(id, dto, nuevaImagen);

        return ResponseEntity.ok(actualizado);
    }

    // -------------------------------------------------------------
    // 5. ELIMINAR SERVICIO (BORRA LA IMAGEN TAMBIÉN)
    // -------------------------------------------------------------
    @DeleteMapping("/servicios/{id}")
    public ResponseEntity<Void> eliminarServicio(@PathVariable Long id) {
        catalogoService.eliminarServicio(id);
        // 204 No Content
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------
    // 6. CAMBIAR ESTADO DEL SERVICIO (ACTIVAR/DESACTIVAR)
    // -------------------------------------------------------------
    @PutMapping("/servicios/{id}/estado")
    public ResponseEntity<ServicioDTORespuesta> cambiarEstadoServicio(
            @PathVariable Long id,
            @RequestParam("estado") Boolean nuevoEstado) {
        
        ServicioDTORespuesta actualizado = catalogoService.cambiarEstadoServicio(id, nuevoEstado);
        return ResponseEntity.ok(actualizado);
    }

    // -------------------------------------------------------------
    // 6. OBTENER IMAGEN
    // -------------------------------------------------------------
    @GetMapping("/imagenes/{nombre}")
    public ResponseEntity<Resource> obtenerImagen(@PathVariable String nombre) throws Exception {
        Resource recurso = storageService.cargarArchivo(nombre);

        String contentType = Files.probeContentType(recurso.getFile().toPath());
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(recurso);
    }

    // -------------------------------------------------------------
    // 7. OBTENER IMAGEN POR DEFECTO DESDE RESOURCES
    // -------------------------------------------------------------
    @GetMapping("/imagenes-default/{nombre}")
    public ResponseEntity<Resource> obtenerImagenPorDefecto(@PathVariable String nombre) throws Exception {
        try {
            Resource recurso = new org.springframework.core.io.ClassPathResource("imagenes-default/" + nombre);
            
            if (!recurso.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(recurso.getFile().toPath());
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(recurso);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
