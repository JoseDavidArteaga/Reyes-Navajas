package co.edu.unicauca.UsuariosMicroService.infra.config;

import com.rabbitmq.client.ConnectionFactory;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String USER_QUEUE_CREATED = "UsuariosQueue";    
    public static final String USER_QUEUE_UPDATED = "UsuariosUpdatedQueue";    
    @Bean
    public Queue UsuarioCreatedQueue() {
        return new Queue(USER_QUEUE_CREATED , true);
    }
    @Bean
    public Queue UsuarioUpdatedQueue() {
        return new Queue(USER_QUEUE_UPDATED , true);
    }
    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}

