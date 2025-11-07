package com.sistema.demo.servicio;

import com.sistema.demo.entidad.SolicitudRecurso;
import com.sistema.demo.entidad.SolicitudRecursoId;
import com.sistema.demo.repositorio.SolicitudRecursoRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitudRecursoServicio {

    @Autowired
    private SolicitudRecursoRepositorio solicitudRecursoRepositorio;

    public List<SolicitudRecurso> listar() {
        return solicitudRecursoRepositorio.findAll();
    }

    public SolicitudRecurso obtenerPorId(SolicitudRecursoId id) {
        return solicitudRecursoRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SolicitudRecurso no encontrada"));
    }

    public SolicitudRecurso crear(SolicitudRecurso sr) {
        return solicitudRecursoRepositorio.save(sr);
    }

    public void eliminar(SolicitudRecursoId id) {
        SolicitudRecurso existente = obtenerPorId(id);
        solicitudRecursoRepositorio.delete(existente);
    }
}