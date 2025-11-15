package com.sistema.demo.repositorio;

import com.sistema.demo.entidad.Solicitud;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SolicitudRepositorio extends JpaRepository<Solicitud, Long> {
}