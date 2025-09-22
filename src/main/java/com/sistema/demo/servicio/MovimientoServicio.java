package com.sistema.demo.servicio;

import com.sistema.demo.entidad.Movimiento;
import com.sistema.demo.entidad.Recurso;
import com.sistema.demo.entidad.Usuario;
import com.sistema.demo.repositorio.MovimientoRepositorio;
import com.sistema.demo.repositorio.RecursoRepositorio;
import com.sistema.demo.repositorio.UsuarioRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovimientoServicio {

    @Autowired
    private MovimientoRepositorio movimientoRepositorio;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private RecursoRepositorio recursoRepositorio;

    public List<Movimiento> listarMovimientos() {
        return movimientoRepositorio.findAll();
    }

    public Movimiento obtenerMovimientoPorId(Long id) {
        return movimientoRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimiento no encontrado con id: " + id));
    }

    public Movimiento crearMovimiento(Movimiento movimiento) {
        return movimientoRepositorio.save(movimiento);
    }

    public Movimiento actualizarMovimiento(Long id, Movimiento movimientoActualizado) {
        Movimiento movimientoExistente = obtenerMovimientoPorId(id);

        movimientoExistente.setDestino(movimientoActualizado.getDestino());
        movimientoExistente.setNombre_solicitante(movimientoActualizado.getNombre_solicitante());
        movimientoExistente.setFecha(movimientoActualizado.getFecha());
        movimientoExistente.setTipo(movimientoActualizado.getTipo());
        movimientoExistente.setCantidad(movimientoActualizado.getCantidad());
        movimientoExistente.setMotivo(movimientoActualizado.getMotivo());
        movimientoExistente.setGeneradoPor(movimientoActualizado.getGeneradoPor());
        movimientoExistente.setRecurso(movimientoActualizado.getRecurso());

        return movimientoRepositorio.saveAndFlush(movimientoExistente);
    }

    public void eliminarMovimiento(Long id) {
        movimientoRepositorio.deleteById(id);
    }

    public Movimiento registrarNuevoMovimiento(Long idUsuario, Long idRecurso, Movimiento movimiento) {
        Usuario usuario = usuarioRepositorio.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Recurso recurso = recursoRepositorio.findById(idRecurso)
                .orElseThrow(() -> new EntityNotFoundException("Recurso no encontrado"));

        movimiento.setGeneradoPor(usuario);
        movimiento.setRecurso(recurso);

        return movimientoRepositorio.save(movimiento);
    }
}
