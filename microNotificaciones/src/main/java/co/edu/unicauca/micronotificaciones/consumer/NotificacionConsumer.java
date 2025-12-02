package co.edu.unicauca.micronotificaciones.consumer;

import co.edu.unicauca.micronotificaciones.config.RabbitMQConfig;
import co.edu.unicauca.micronotificaciones.dto.WhatsAppRequest;
import co.edu.unicauca.micronotificaciones.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificacionConsumer {

    private final NotificacionService notificacionService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NOTIFICACIONES)
    public void recibirMensaje(WhatsAppRequest msg) {

        System.out.println("📥 Notificación recibida desde Turnos:");
        System.out.println("→ Cliente ID: " + msg.getClienteId());
        System.out.println("→ Teléfono: " + msg.getTelefonoDestino());
        System.out.println("→ Mensaje: " + msg.getMensajeWhatsapp());

        notificacionService.enviarWhatsapp(msg);
    }
}