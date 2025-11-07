package com.sistema.demo.servicio;

import com.sistema.demo.entidad.Solicitante;
import com.sistema.demo.repositorio.SolicitanteRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitanteServicio {

    @Autowired
    private SolicitanteRepositorio solicitanteRepositorio;

    public List<Solicitante> listar() {
        return solicitanteRepositorio.findAll();
    }

    public Solicitante obtenerPorId(Long id) {
        return solicitanteRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitante no encontrado: " + id));
    }

    public Solicitante crear(Solicitante s) {
        return solicitanteRepositorio.save(s);
    }

    public Solicitante actualizar(Long id, Solicitante actualizado) {
        Solicitante existente = obtenerPorId(id);
        existente.setDni(actualizado.getDni());
        existente.setNombre(actualizado.getNombre());
        existente.setPuesto(actualizado.getPuesto());
        return solicitanteRepositorio.save(existente);
    }

    public void eliminar(Long id) {
        Solicitante existente = obtenerPorId(id);
        solicitanteRepositorio.delete(existente);
    }
}