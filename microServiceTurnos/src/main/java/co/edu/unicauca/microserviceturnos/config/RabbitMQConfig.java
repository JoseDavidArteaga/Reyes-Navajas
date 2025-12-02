package co.edu.unicauca.microserviceturnos.config;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.amqp.core.Queue;


@Configuration
public class RabbitMQConfig {

    // Nombre de la cola que el Microservicio de Notificaciones está escuchando
    public static final String QUEUE_NOTIFICACIONES = "TurnoNotificacionesQueue";

    /**
     * Define y registra la cola en RabbitMQ si no existe.
     */
    @Bean
    public Queue notificacionQueue() {
        // La cola es duradera (durable: true)
        return new Queue(QUEUE_NOTIFICACIONES, true);
    }
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}