package co.edu.unicauca.UsuariosMicroService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // disable CSRF - not required for stateless API endpoints in this example
            .csrf(csrf -> csrf.disable())
            // allow all requests (no authentication required)
            .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll())
            // do not create sessions
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // disable HTTP basic auth
            .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }

}
