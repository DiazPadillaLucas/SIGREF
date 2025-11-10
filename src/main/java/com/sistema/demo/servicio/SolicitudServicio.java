package com.sistema.demo.servicio;

import com.sistema.demo.repositorio.RecursoRepositorio;
import com.sistema.demo.repositorio.SolicitudRepositorio;
import com.sistema.demo.repositorio.SolicitanteRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.sistema.demo.entidad.Solicitud;
import com.sistema.demo.entidad.Solicitante;
import com.sistema.demo.entidad.Recurso;

@Service
public class SolicitudServicio {

    @Autowired
    private SolicitudRepositorio solicitudRepositorio;

    @Autowired
    private SolicitanteRepositorio solicitanteRepositorio;

    @Autowired
    private RecursoRepositorio recursoRepositorio;

    @Autowired

    public java.util.List<Solicitud> listar() {
        return solicitudRepositorio.findAll();
    }

    public Solicitud obtenerPorId(Long id) {
        return solicitudRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitud no encontrada: " + id));
    }

    @Autowired
    private EntityManager entityManager; // <-- Inyectar EntityManager

    @Transactional
    public Solicitud crearSolicitud(Solicitud solicitud) {
        // 1. VALIDACIÓN y ASIGNACIÓN DE SOLICITANTE
        if (solicitud.getSolicitante() == null || solicitud.getSolicitante().getId() == null) {
            throw new IllegalArgumentException("Solicitante requerido con id");
        }
        Solicitante solicitante = solicitanteRepositorio.findById(solicitud.getSolicitante().getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Solicitante no encontrado: " + solicitud.getSolicitante().getId()));
        solicitud.setSolicitante(solicitante);

        // 1. EXTRAER los Bienes/Recursos entrantes (que ahora son un Set<Recurso>)
        Set<Recurso> bienesEntrantes = solicitud.getBienesSolicitados();

        // Dejamos la colección vacía temporalmente para evitar la cascada con objetos
        // 'detached'
        solicitud.setBienesSolicitados(new HashSet<>());

        // Guardar la Solicitud principal
        Solicitud savedSolicitud = solicitudRepositorio.save(solicitud);

        // 2. BUSCAR y adjuntar los Recursos gestionados
        if (bienesEntrantes != null && !bienesEntrantes.isEmpty()) {
            Set<Recurso> bienesGestionados = new HashSet<>();
            for (Recurso bien : bienesEntrantes) {

                // Busca la entidad Recurso completa para adjuntarla
                Recurso recurso = recursoRepositorio.findById(bien.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Bien no encontrado: " + bien.getId()));

                bienesGestionados.add(recurso);
            }

            // 3. Asignar la colección de Bienes gestionados a la Solicitud
            savedSolicitud.setBienesSolicitados(bienesGestionados);

            // El @Transactional guarda la colección automáticamente aquí.
        }

        return savedSolicitud;
    }

    @Transactional
    public Solicitud actualizar(Long id, Solicitud actualizado) {
        Solicitud existente = obtenerPorId(id);
        existente.setNroTramite(actualizado.getNroTramite());
        existente.setArea(actualizado.getArea());
        existente.setFechaSolicitud(actualizado.getFechaSolicitud());
        // no manejo aquí la actualización de relaciones complejas (podemos agregarlo si
        // hace falta)
        return solicitudRepositorio.save(existente);
    }

    public void eliminar(Long id) {
        Solicitud existente = obtenerPorId(id);
        solicitudRepositorio.delete(existente);
    }

    public Solicitud actualizarEstado(Long id, String nuevoEstado) {
        Solicitud solicitud = solicitudRepositorio.findById(id).orElse(null);
        if (solicitud != null) {
            solicitud.setEstado(nuevoEstado);
            return solicitudRepositorio.save(solicitud);
        }
        return null;
    }
}