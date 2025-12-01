package co.edu.unicauca.barberia.infra;
import org.springframework.context.annotation.Bean;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Configuration;

@Configuration
public class mapper {
    @Bean
    public ModelMapper crearMapper() {
        ModelMapper objMapeador= new ModelMapper();
        return objMapeador;//El objeto retornado se almacena en el contenedor de Spring
    }
}
