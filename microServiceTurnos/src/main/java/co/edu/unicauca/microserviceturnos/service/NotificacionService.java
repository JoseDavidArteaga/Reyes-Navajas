package co.edu.unicauca.microserviceturnos.service;

import co.edu.unicauca.microserviceturnos.config.RabbitMQConfig;
import co.edu.unicauca.microserviceturnos.dto.TurnoRequest;
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
import java.time.format.DateTimeFormatter;
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

    public void enviarNotificacionAsync(TurnoRequest t) { // Parámetro mensajeTurno eliminado
        CompletableFuture.runAsync(() -> {
            try {
                log.info("Iniciando notificación para usuario {}", t.getClienteId());

                UsuarioResponse usuario = obtenerUsuario(t.getClienteId());

                final String mensajeConfirmacion = String.format(
                        "¡Hola %s! 👋\n\n" +
                                "Tu turno ha sido *registrado con éxito*. Aquí tienes los detalles:\n\n" +
                                "📅 *Fecha y hora:* %s\n" +
                                "\nGracias por reservar con nosotros. ¡Te esperamos! 😁",
                        usuario != null ? usuario.getNombre() : "cliente",
                        t.getFechaHora() != null
                                ? t.getFechaHora().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                                : "Por confirmar");

                if (usuario != null && usuario.getTelefono() != null && !usuario.getTelefono().isEmpty()) {

                    enviarMensajeACola(t.getClienteId(), usuario.getTelefono(), mensajeConfirmacion);
                    log.info("Mensaje publicado en cola para {} (usuario {})",
                            usuario.getTelefono(), t.getClienteId());
                } else {
                    log.warn("Usuario {} sin teléfono", t.getClienteId());
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