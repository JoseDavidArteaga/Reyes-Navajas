package co.edu.unicauca.microserviceturnos.service;

import co.edu.unicauca.microserviceturnos.repository.ListaEsperaRepository;
import co.edu.unicauca.microserviceturnos.entities.ListaEspera;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;


@Service
public class ListaEsperaService {
    @Autowired
    ListaEsperaRepository listaEsperaRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void guardarEnLista(ListaEspera le) {
        listaEsperaRepository.save(le);
    }
}
