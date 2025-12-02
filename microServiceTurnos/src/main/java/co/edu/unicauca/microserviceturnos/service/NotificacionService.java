package co.edu.unicauca.microserviceturnos.service;

import co.edu.unicauca.microserviceturnos.config.RabbitMQConfig;
import co.edu.unicauca.microserviceturnos.dto.UsuarioResponse;
import co.edu.unicauca.microserviceturnos.dto.WhatsAppRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
public class NotificacionService {

    @Value("${usuarios.service.url}")
    private String usuariosServiceUrl;

    @Autowired
    private WebClient webClient;

    @Autowired
    private RabbitTemplate rabbitTemplate;


    public void enviarNotificacionAsync(String usuarioId) { // Parámetro mensajeTurno eliminado
        CompletableFuture.runAsync(() -> {
            try {
                log.info("Iniciando notificación para usuario {}", usuarioId);

                UsuarioResponse usuario = obtenerUsuario(usuarioId);

                final String mensajeConfirmacion = String.format(
                        "Hola %s, ¡tu turno ha sido confirmado con éxito! Gracias por preferir nuestros servicios.",
                        usuario != null ? usuario.getNombre() : "cliente"
                );


                if (usuario != null && usuario.getTelefono() != null && !usuario.getTelefono().isEmpty()) {

                    enviarMensajeACola(usuarioId, usuario.getTelefono(), mensajeConfirmacion);
                    log.info("Mensaje publicado en cola para {} (usuario {})",
                            usuario.getTelefono(), usuarioId);
                } else {
                    log.warn("Usuario {} sin teléfono", usuarioId);
                }

            } catch (Exception e) {
                log.error("Error en notificación: {}", e.getMessage());
            }
        });
    }


    private UsuarioResponse obtenerUsuario(String usuarioId) {
        String url = usuariosServiceUrl + "/" + usuarioId;

        try {
            log.debug("Llamando via gateway: {}", url);

            return webClient
                    .get()
                    .uri(url)
                    .header("X-Internal-Call", "true")
                    .header("X-Service-Name", "TurnosMicroService")
                    .retrieve()
                    .bodyToMono(UsuarioResponse.class)
                    .timeout(Duration.ofSeconds(10)) // Timeout aumentado a 10s
                    .block();

        } catch (WebClientResponseException.NotFound e) {
            log.error("Usuario {} no encontrado", usuarioId);
            return null;

        } catch (WebClientResponseException e) {
            log.error("Error HTTP {}: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Error al obtener usuario", e);

        } catch (Exception e) {
            log.error("Error: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener usuario", e);
        }
    }

    private void enviarMensajeACola(String clienteId, String telefono, String mensaje) {
        WhatsAppRequest request = WhatsAppRequest.builder()
                .clienteId(clienteId)
                .telefonoDestino(telefono)
                .mensajeWhatsapp(mensaje)
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_NOTIFICACIONES, request);
    }

}