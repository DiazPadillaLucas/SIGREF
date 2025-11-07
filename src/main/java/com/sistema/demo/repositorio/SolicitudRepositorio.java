package com.sistema.demo.repositorio;

import com.sistema.demo.entidad.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SolicitudRepositorio extends JpaRepository<Solicitud, Long> {
    Optional<Solicitud> findByNroTramite(String nroTramite);
}