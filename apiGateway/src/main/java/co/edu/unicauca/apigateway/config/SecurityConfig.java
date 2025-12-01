package co.edu.unicauca.apigateway.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtRoleConverter jwtRoleConverter;

    @Bean
    public SecurityWebFilterChain filterChain(ServerHttpSecurity http) {

        http.authorizeExchange(exchanges -> exchanges

                // ------------------------------------
                //          ENDPOINTS PÚBLICOS
                // ------------------------------------
                .pathMatchers("/auth/**").permitAll()
                .pathMatchers("/usuarios/registro").permitAll()
                .pathMatchers("/actuator/health").permitAll()
                .pathMatchers("/catalogo/imagenes/**").permitAll()

                // ------------------------------------
                //          ENDPOINTS PROTEGIDOS
                // ------------------------------------
                .pathMatchers("/usuarios/**").hasRole("ADMINISTRADOR")
                .pathMatchers("/catalogo/**").hasAnyRole("ADMINISTRADOR", "BARBERO", "CLIENTE")
                .pathMatchers("/turnos/**").hasAnyRole("ADMINISTRADOR", "BARBERO", "CLIENTE")

                // Cualquier otro endpoint requiere autenticación
                .anyExchange().authenticated()
        );

        http.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
        );

        http.csrf(ServerHttpSecurity.CsrfSpec::disable);

        return http.build();
    }

    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwtRoleConverter);
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }
}