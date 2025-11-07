package com.sistema.demo.servicio;

import com.sistema.demo.entidad.*;
import com.sistema.demo.repositorio.RecursoRepositorio;
import com.sistema.demo.repositorio.SolicitudRepositorio;
import com.sistema.demo.repositorio.SolicitudRecursoRepositorio;
import com.sistema.demo.repositorio.SolicitanteRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class SolicitudServicio {

    @Autowired
    private SolicitudRepositorio solicitudRepositorio;

    @Autowired
    private SolicitanteRepositorio solicitanteRepositorio;

    @Autowired
    private RecursoRepositorio recursoRepositorio;

    @Autowired
    private SolicitudRecursoRepositorio solicitudRecursoRepositorio;

    public java.util.List<Solicitud> listar() {
        return solicitudRepositorio.findAll();
    }

    public Solicitud obtenerPorId(Long id) {
        return solicitudRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitud no encontrada: " + id));
    }

    @Transactional
    public Solicitud crearSolicitud(Solicitud solicitud) {
        // validar solicitante
        if (solicitud.getSolicitante() == null || solicitud.getSolicitante().getId() == null) {
            throw new IllegalArgumentException("Solicitante requerido con id");
        }
        Solicitante solicitante = solicitanteRepositorio.findById(solicitud.getSolicitante().getId())
                .orElseThrow(() -> new EntityNotFoundException("Solicitante no encontrado: " + solicitud.getSolicitante().getId()));
        solicitud.setSolicitante(solicitante);

        // extraer recursos asociados (no persistidos aún)
        Set<SolicitudRecurso> recursos = solicitud.getRecursosAsociados();
        solicitud.setRecursosAsociados(new HashSet<>()); // guardar solicitud primero sin relaciones

        Solicitud savedSolicitud = solicitudRepositorio.save(solicitud);

        if (recursos != null) {
            Set<SolicitudRecurso> guardados = new HashSet<>();
            for (SolicitudRecurso sr : recursos) {
                if (sr.getRecurso() == null || sr.getRecurso().getId() == null) {
                    throw new IllegalArgumentException("Recurso con id requerido en SolicitudRecurso");
                }
                Recurso recurso = recursoRepositorio.findById(sr.getRecurso().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Recurso no encontrado: " + sr.getRecurso().getId()));

                // crear clave compuesta y linkear
                SolicitudRecursoId id = new SolicitudRecursoId(savedSolicitud.getId(), recurso.getId());
                sr.setId(id);
                sr.setSolicitud(savedSolicitud);
                sr.setRecurso(recurso);

                // Persistir cada relación
                SolicitudRecurso srSaved = solicitudRecursoRepositorio.save(sr);
                guardados.add(srSaved);
            }
            savedSolicitud.setRecursosAsociados(guardados);
            // opcional: actualizar la solicitud con las relaciones cargadas
            savedSolicitud = solicitudRepositorio.save(savedSolicitud);
        }

        return savedSolicitud;
    }

    @Transactional
    public Solicitud actualizar(Long id, Solicitud actualizado) {
        Solicitud existente = obtenerPorId(id);
        existente.setNroTramite(actualizado.getNroTramite());
        existente.setArea(actualizado.getArea());
        existente.setFechaSolicitud(actualizado.getFechaSolicitud());
        // no manejo aquí la actualización de relaciones complejas (podemos agregarlo si hace falta)
        return solicitudRepositorio.save(existente);
    }

    public void eliminar(Long id) {
        Solicitud existente = obtenerPorId(id);
        solicitudRepositorio.delete(existente);
    }
}