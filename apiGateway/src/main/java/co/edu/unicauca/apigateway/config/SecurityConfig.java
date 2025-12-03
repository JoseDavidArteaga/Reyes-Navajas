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
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtRoleConverter jwtRoleConverter;

    @Bean
    public SecurityWebFilterChain filterChain(ServerHttpSecurity http) {

        http.authorizeExchange(exchanges -> exchanges
                // Allow CORS preflight requests
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ------------------------------------
                //          ENDPOINTS PÚBLICOS
                // ------------------------------------
                .pathMatchers("/auth/**").permitAll()
                .pathMatchers("/usuarios/registro").permitAll()
                .pathMatchers("/actuator/health").permitAll()
                .pathMatchers("/catalogo/imagenes/**").permitAll()

                // ------------------------------------
                //     LLAMADAS INTERNAS (sin JWT)
                // ------------------------------------
                // Solo accesibles con header X-Internal-Call: true
                .pathMatchers("/usuarios/**")
                .access((authentication, context) -> {
                    String internalCall = context.getExchange()
                            .getRequest()
                            .getHeaders()
                            .getFirst("X-Internal-Call");

                    String serviceName = context.getExchange()
                            .getRequest()
                            .getHeaders()
                            .getFirst("X-Service-Name");

                    // Si es llamada interna, permitir
                    if ("true".equals(internalCall) && serviceName != null) {
                        return Mono.just(
                                new org.springframework.security.authorization.AuthorizationDecision(true)
                        );
                    }

                    // Si no, debe tener JWT y rol ADMINISTRADOR
                    return authentication
                            .map(auth -> new org.springframework.security.authorization.AuthorizationDecision(
                                    auth.isAuthenticated() &&
                                            auth.getAuthorities().stream()
                                                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"))
                            ))
                            .defaultIfEmpty(
                                    new org.springframework.security.authorization.AuthorizationDecision(false)
                            );
                })

                // ------------------------------------
                //          ENDPOINTS PROTEGIDOS
                // ------------------------------------
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

        @Bean
        public CorsWebFilter corsWebFilter() {
                CorsConfiguration config = new CorsConfiguration();
                // Permitir todos los orígenes (CORS abierto)
                config.setAllowedOriginPatterns(Arrays.asList("*"));
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList("*"));
                // Permitir credenciales si es necesario (cookies/authorization)
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return new CorsWebFilter(source);
        }
}