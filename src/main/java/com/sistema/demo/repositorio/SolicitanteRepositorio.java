package com.sistema.demo.repositorio;

import com.sistema.demo.entidad.Solicitante;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SolicitanteRepositorio extends JpaRepository<Solicitante, Long> {
    Optional<Solicitante> findByDni(String dni);
}