package co.edu.unicauca.barberia.infra.rabbitmq;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CatalogoPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routingKey}")
    private String routingKey;

    public void enviarServicioCreado(Object mensaje) {
        rabbitTemplate.convertAndSend(exchange, routingKey, mensaje);
        System.out.println("[Catalogo] Mensaje enviado a RabbitMQ: " + mensaje);
    }
}
