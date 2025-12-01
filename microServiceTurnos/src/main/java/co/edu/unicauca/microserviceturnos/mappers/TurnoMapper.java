package co.edu.unicauca.microserviceturnos.mappers;

import co.edu.unicauca.microserviceturnos.dto.TurnoRequest;
import co.edu.unicauca.microserviceturnos.entities.EstadoTurnoEnum;
import co.edu.unicauca.microserviceturnos.entities.Turno;
import co.edu.unicauca.microserviceturnos.dto.TurnoStateResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface TurnoMapper {


    @Mapping(source = "estado", target = "estado", qualifiedByName = "stringToEnum")
    Turno dtoToEntity(TurnoRequest dto);

    @Mapping(source = "estado", target = "estado", qualifiedByName = "enumToString")
    TurnoRequest entityToDto(Turno turno);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "estado", target = "estado")
    TurnoStateResponse entityToTurnoStateResponse(Turno turno);

    @Named("stringToEnum")
    default EstadoTurnoEnum stringToEnum(String estado) {
        if (estado == null) return EstadoTurnoEnum.PENDIENTE; // valor por defecto
        return EstadoTurnoEnum.valueOf(estado);
    }

    @Named("enumToString")
    default String enumToString(EstadoTurnoEnum estado) {
        return estado != null ? estado.name() : null;
    }
}