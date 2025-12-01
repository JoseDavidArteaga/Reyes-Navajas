package co.edu.unicauca.barberia.service;

import co.edu.unicauca.barberia.entity.Servicio;
import co.edu.unicauca.barberia.infra.excepciones.EstadoInvalidoException;
import co.edu.unicauca.barberia.infra.excepciones.RecursoNoEncontradoException;
import co.edu.unicauca.barberia.infra.excepciones.RecursoYaExisteException;
import co.edu.unicauca.barberia.infra.rabbitmq.CatalogoPublisher;
import co.edu.unicauca.barberia.infra.rabbitmq.EventoServicioCreado;
import co.edu.unicauca.barberia.repository.CatalogosRepository;
import co.edu.unicauca.barberia.service.Dtos.ServicioDTOPeticion;
import co.edu.unicauca.barberia.service.Dtos.ServicioDTORespuesta;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogoService {

    private final CatalogosRepository catalogoRepository;
    private final FileStorageService fileStorageService;
    private final ModelMapper modelMapper;
    private final CatalogoPublisher publisher;


    @Value("${app.base-url}")
    private String baseUrl;


    // CREAR SERVICIO
    public ServicioDTORespuesta crearServicio(ServicioDTOPeticion dto, MultipartFile imagen) {

        // 1. Validar servicio duplicado por nombre
        if (catalogoRepository.existsByNombreIgnoreCase(dto.getNombre())) {
            throw new RecursoYaExisteException(
                    "Ya existe un servicio con el nombre: " + dto.getNombre());
        }

        // 2. Mapear DTO -> Entidad
        Servicio servicio = modelMapper.map(dto, Servicio.class);
        servicio.setEstado(true);
        servicio.setCreatedAt(new Date());

        // 3. Manejo de imagen (opcional)
        try {
            if (imagen != null && !imagen.isEmpty()) {
                String nombreArchivo = fileStorageService.guardarArchivo(imagen);
                servicio.setImagenUrl(baseUrl + "/catalogo/imagenes/" + nombreArchivo);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar la imagen", e);
        }

        // 4. Guardar servicio en BD
        Servicio guardado = catalogoRepository.save(servicio);

        // 5. Crear DTO del evento (solo id + nombre)
        EventoServicioCreado evento = new EventoServicioCreado(
                guardado.getId(),
                guardado.getNombre()
        );

        // 6. Enviar evento por RabbitMQ
        publisher.enviarServicioCreado(evento);

        System.out.println(" Evento enviado a RabbitMQ: " + evento.getId() + " - " + evento.getNombre());

        // 7. Retornar DTO de respuesta al frontend
        return modelMapper.map(guardado, ServicioDTORespuesta.class);
    }



    // OBTENER TODOS LOS SERVICIOS
    public List<ServicioDTORespuesta> obtenerTodos() {
        List<Servicio> servicios = catalogoRepository.findAll();

        return servicios.stream()
                .map(servicio -> modelMapper.map(servicio, ServicioDTORespuesta.class))
                .collect(Collectors.toList());
    }

    // OBTENER SERVICIO POR ID
    public ServicioDTORespuesta obtenerPorId(Long id) {
        Servicio servicio = catalogoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Servicio no encontrado con id: " + id));

        if (Boolean.FALSE.equals(servicio.getEstado())) {
            throw new EstadoInvalidoException(
                    "El servicio con id " + id + " está inactivo o ha sido eliminado");
        }
        return modelMapper.map(servicio, ServicioDTORespuesta.class);
    }

    // ACTUALIZAR SERVICIO

    public ServicioDTORespuesta actualizarServicio(Long id, ServicioDTOPeticion dto, MultipartFile nuevaImagen) {

        Servicio servicio = catalogoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Servicio no encontrado con id: " + id));
        if (Boolean.FALSE.equals(servicio.getEstado())) {
            throw new EstadoInvalidoException(
                    "El servicio con id " + id + " está inactivo o ha sido eliminado");
        }

        // Actualizar campos básicos
        servicio.setNombre(dto.getNombre());
        servicio.setDescripcion(dto.getDescripcion());
        servicio.setDuracion(dto.getDuracion());
        servicio.setPrecio(dto.getPrecio());

        try {
            // Si viene nueva imagen
            if (nuevaImagen != null && !nuevaImagen.isEmpty()) {

                // si ya tenía imagen, borrar archivo viejo
                if (servicio.getImagenUrl() != null) {
                    String nombreArchivoViejo = extraerNombreArchivo(servicio.getImagenUrl());
                    fileStorageService.eliminarArchivo(nombreArchivoViejo);
                }

                // guardar nueva imagen
                String nombreArchivoNuevo = fileStorageService.guardarArchivo(nuevaImagen);
                servicio.setImagenUrl(baseUrl + "/catalogo/imagenes/" + nombreArchivoNuevo);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al actualizar la imagen del servicio", e);
        }

        Servicio actualizado = catalogoRepository.save(servicio);
        return modelMapper.map(actualizado, ServicioDTORespuesta.class);
    }

    // ELIMINAR SERVICIO

    public void eliminarServicio(Long id) {
        Servicio servicio = catalogoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Servicio no encontrado con id: " + id));
        if (Boolean.FALSE.equals(servicio.getEstado())) {
            throw new EstadoInvalidoException(
                    "El servicio con id " + id + " está inactivo o ha sido eliminado");
        }

        // borrar imagen si existe
        if (servicio.getImagenUrl() != null) {
            String nombreArchivo = extraerNombreArchivo(servicio.getImagenUrl());
            try {
                fileStorageService.eliminarArchivo(nombreArchivo);
            } catch (IOException e) {
                // puedes loggear el error, pero no necesariamente abortar el borrado del servicio
                throw new RuntimeException("Error al eliminar la imagen asociada al servicio", e);
            }
        }

        catalogoRepository.delete(servicio);
    }

    private String extraerNombreArchivo(String urlImagen) {
        int index = urlImagen.lastIndexOf("/");
        return (index != -1) ? urlImagen.substring(index + 1) : urlImagen;
    }
}
