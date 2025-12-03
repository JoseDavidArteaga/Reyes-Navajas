package co.edu.unicauca.microserviceturnos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MicroServiceTurnosApplication {

    public static void main(String[] args) {
        SpringApplication.run(MicroServiceTurnosApplication.class, args);
    }

}
