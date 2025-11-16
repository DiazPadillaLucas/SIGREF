package com.sistema.demo.repositorio;

import com.sistema.demo.entidad.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepositorio extends JpaRepository<Solicitud, Long> {

    // carga solicitante y recursos en una sola consulta para evitar
    // LazyInitializationException
    @Query("SELECT DISTINCT s FROM Solicitud s LEFT JOIN FETCH s.solicitante LEFT JOIN FETCH s.bienesSolicitados")
    List<Solicitud> findAllWithRelations();
}