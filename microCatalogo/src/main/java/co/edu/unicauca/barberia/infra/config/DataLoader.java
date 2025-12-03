package co.edu.unicauca.barberia.infra.config;
import co.edu.unicauca.barberia.entity.Servicio;
import co.edu.unicauca.barberia.repository.CatalogosRepository;
import co.edu.unicauca.barberia.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.UUID;
@Configuration
@RequiredArgsConstructor
public class DataLoader {
    private final CatalogosRepository catalogosRepository;
    private final FileStorageService fileStorageService;

    @Value("${app.base-url}")
    private String baseUrl;

    @Bean
    public CommandLineRunner loadData() {
        return args -> {

            if (catalogosRepository.count() > 0) {
                System.out.println("DataLoader: Ya existen datos en la BD. No se cargará nada.");
                return;
            }

            System.out.println("DataLoader: Insertando datos iniciales con imágenes...");

            cargarServicioInicial(
                    "Corte Mohicano",
                    "Corte estilo Mohicano clasico",
                    45,
                    25000.0,
                    "corteM.png"
            );

            cargarServicioInicial(
                    "Barba",
                    "Afeitado, limpieza y perfilado profesional",
                    45,
                    18000.0,
                    "barba.png"
            );

            cargarServicioInicial(
                    "Corte + Barba",
                    "Paquete completo con corte degradado",
                    60,
                    35000.0,
                    "corteybarba.png"
            );

            System.out.println("DataLoader: Datos iniciales cargados correctamente.");
        };
    }

    private void cargarServicioInicial(String nombre,
                                       String descripcion,
                                       Integer duracion,
                                       Double precio,
                                       String imagenNombre) throws IOException {

        // 1. Crear entidad base
        Servicio servicio = crearEntidadServicio(nombre, descripcion, duracion, precio);

        // 2. Guardar imagen desde resources
        String imagenUrl = guardarImagenDesdeResources(imagenNombre);

        servicio.setImagenUrl(imagenUrl);

        // 3. Guardar en base de datos
        catalogosRepository.save(servicio);

        System.out.println("   ➜ Servicio cargado: " + nombre);
    }

    private Servicio crearEntidadServicio(String nombre,
                                          String descripcion,
                                          Integer duracion,
                                          Double precio) {

        Servicio s = new Servicio();
        s.setNombre(nombre);
        s.setDescripcion(descripcion);
        s.setDuracion(duracion);
        s.setPrecio(precio);
        s.setEstado(true);
        s.setCreatedAt(new Date());
        return s;
    }

    private String guardarImagenDesdeResources(String imagenNombre) throws IOException {

        // Buscar archivo dentro de resources/imagenes-default/
        ClassPathResource resource =
                new ClassPathResource("imagenes-default/" + imagenNombre);

        if (!resource.exists()) {
            System.err.println(" Imagen NO encontrada en resources: " + imagenNombre);
            return null;
        }

        InputStream is = resource.getInputStream();

        // Obtener extensión del archivo
        String ext = imagenNombre.substring(imagenNombre.lastIndexOf("."));

        // Crear nombre único
        String nuevoNombre = UUID.randomUUID().toString() + ext;

        // Guardarlo en uploads usando FileStorageService
        fileStorageService.guardarArchivoFromStream(is, nuevoNombre);

        // Construir URL final
        return baseUrl + "/catalogo/imagenes/" + nuevoNombre;
    }

    /**
     * Crea una imagen por defecto simple si no existe
     */
    private void crearImagenPorDefecto() {
        try {
            // Verificar si ya existe default-service.jpg en uploads
            String defaultFileName = "default-service.jpg";
            ClassPathResource defaultResource = new ClassPathResource("imagenes-default/" + defaultFileName);
            
            if (defaultResource.exists()) {
                // Si existe en resources, copiarla a uploads
                InputStream is = defaultResource.getInputStream();
                fileStorageService.guardarArchivoFromStream(is, defaultFileName);
                System.out.println("✓ Imagen por defecto copiada: " + defaultFileName);
            } else {
                System.out.println("⚠ No se encontró imagen por defecto en resources/imagenes-default/");
            }
        } catch (IOException e) {
            System.err.println("Error creando imagen por defecto: " + e.getMessage());
        }
    }
}
