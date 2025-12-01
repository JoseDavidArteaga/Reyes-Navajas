package co.edu.unicauca.barberia.infra.rabbitmq;
import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.queue}")
    private String queue;

    @Value("${app.rabbitmq.routingKey}")
    private String routingKey;

    @Bean
    public TopicExchange catalogoExchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Queue catalogoQueue() {
        return new Queue(queue, true);
    }

    @Bean
    public Binding binding() {
        return BindingBuilder
                .bind(catalogoQueue())
                .to(catalogoExchange())
                .with(routingKey);
    }
}
