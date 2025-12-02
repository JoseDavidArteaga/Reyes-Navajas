package co.edu.unicauca.microserviceturnos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    /**
     * Bean de WebClient para llamadas HTTP (internas vía gateway).
     */
    @Bean
    public WebClient webClient() {
        // Aumentar límite de memoria para respuestas grandes
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024)) // 16MB
                .build();

        return WebClient.builder()
                .exchangeStrategies(strategies)
                .build();
    }
}