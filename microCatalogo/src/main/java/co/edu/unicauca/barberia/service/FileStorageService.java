package co.edu.unicauca.barberia.service;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;
@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path dirPath = Paths.get(uploadDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear el directorio de uploads", e);
        }
    }

    public String guardarArchivo(MultipartFile archivo) throws IOException {
        if (archivo == null || archivo.isEmpty()) {
            return null;
        }

        if (archivo.getContentType() == null || !archivo.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen");
        }

        String originalName = archivo.getOriginalFilename();
        String ext = "";

        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }

        String nombreArchivo = UUID.randomUUID().toString() + ext;

        Path ruta = Paths.get(uploadDir).resolve(nombreArchivo);
        Files.copy(archivo.getInputStream(), ruta, StandardCopyOption.REPLACE_EXISTING);

        return nombreArchivo;
    }

    public Resource cargarArchivo(String nombreArchivo) throws IOException {
        Path ruta = Paths.get(uploadDir).resolve(nombreArchivo).normalize();
        Resource resource = new UrlResource(ruta.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("Archivo no encontrado");
        }
    }

    // NUEVO: eliminar archivo
    public void eliminarArchivo(String nombreArchivo) throws IOException {
        Path ruta = Paths.get(uploadDir).resolve(nombreArchivo).normalize();
        Files.deleteIfExists(ruta);
    }
    public void guardarArchivoFromStream(InputStream inputStream, String nuevoNombre) throws IOException {

        Path ruta = Paths.get(uploadDir).resolve(nuevoNombre);

        // Crear directorios si no existen
        if (!Files.exists(ruta.getParent())) {
            Files.createDirectories(ruta.getParent());
        }

        Files.copy(inputStream, ruta, StandardCopyOption.REPLACE_EXISTING);
    }

}

