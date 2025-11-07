package com.sistema.demo.repositorio;

import com.sistema.demo.entidad.SolicitudRecurso;
import com.sistema.demo.entidad.SolicitudRecursoId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitudRecursoRepositorio extends JpaRepository<SolicitudRecurso, SolicitudRecursoId> {
}