/*package com.sistema.demo.servicio;

import com.sistema.demo.entidad.Movimiento;
import com.sistema.demo.entidad.Recurso;
import com.sistema.demo.entidad.Usuario;
import com.sistema.demo.repositorio.MovimientoRepositorio;
import com.sistema.demo.repositorio.RecursoRepositorio;
import com.sistema.demo.repositorio.UsuarioRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;



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
        //movimientoExistente.setNombre_solicitante(movimientoActualizado.getNombre_solicitante());
        movimientoExistente.setFecha(movimientoActualizado.getFecha());
        //movimientoExistente.setTipo(movimientoActualizado.getTipo());
        movimientoExistente.setCantidad(movimientoActualizado.getCantidad());
        movimientoExistente.setObservaciones(movimientoActualizado.getObservaciones());
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

        int cantidad = movimiento.getCantidad();
        if ("INGRESO".equalsIgnoreCase(movimiento.getTipo())) {
            recurso.setCantidad(recurso.getCantidad() + cantidad);
            recursoRepositorio.save(recurso);
        } /*else if ("EGRESO".equalsIgnoreCase(movimiento.getTipo())) {
            if (recurso.getCantidad() < cantidad) {
                throw new IllegalArgumentException("Stock insuficiente para realizar el egreso.");
            }
            recurso.setCantidad(recurso.getCantidad() - cantidad);
        }*/
       /* System.out.println("estamos en registrar nuevo movimiento");

        return movimientoRepositorio.save(movimiento);
    }

    public List<Movimiento> listarUltimos6Movimientos() {
        Pageable limite = PageRequest.of(0, 6); // página 0, máximo 6 resultados
        return movimientoRepositorio.findAllByOrderByFechaDesc(limite);
    }

    public long contarMovimientosDeHoy() {
        return movimientoRepositorio.contarMovimientosDeHoy();
    }

}*/
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
public class MovimientoServicio {

    @Autowired
    private MovimientoRepositorio movimientoRepositorio;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private RecursoRepositorio recursoRepositorio;

    // Listar todos los movimientos
    public List<Movimiento> listarMovimientos() {
        return movimientoRepositorio.findAll();
    }

    // Obtener un movimiento por su ID
    public Movimiento obtenerMovimientoPorId(Long id) {
        return movimientoRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimiento no encontrado con id: " + id));
    }

    // Crear un nuevo movimiento (sin lógica adicional)
    public Movimiento crearMovimiento(Movimiento movimiento) {
        return movimientoRepositorio.save(movimiento);
    }

    // Actualizar un movimiento existente
    public Movimiento actualizarMovimiento(Long id, Movimiento movimientoActualizado) {
        Movimiento movimientoExistente = obtenerMovimientoPorId(id);

        //movimientoExistente.setDestino(movimientoActualizado.getDestino());
        movimientoExistente.setFecha(movimientoActualizado.getFecha());
        movimientoExistente.setCantidad(movimientoActualizado.getCantidad());
        movimientoExistente.setObservaciones(movimientoActualizado.getObservaciones());
        movimientoExistente.setGeneradoPor(movimientoActualizado.getGeneradoPor());
        movimientoExistente.setRecurso(movimientoActualizado.getRecurso());

        return movimientoRepositorio.saveAndFlush(movimientoExistente);
    }

    // Eliminar movimiento por ID
    public void eliminarMovimiento(Long id) {
        if (!movimientoRepositorio.existsById(id)) {
            throw new EntityNotFoundException("Movimiento no encontrado con id: " + id);
        }
        movimientoRepositorio.deleteById(id);
    }

    // Registrar un nuevo movimiento asociado a un usuario y recurso
    public Movimiento registrarNuevoMovimiento(Long idUsuario, Long idRecurso, Movimiento movimiento) {
        Usuario usuario = usuarioRepositorio.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + idUsuario));

        Recurso recurso = recursoRepositorio.findById(idRecurso)
                .orElseThrow(() -> new EntityNotFoundException("Recurso no encontrado con id: " + idRecurso));

        movimiento.setGeneradoPor(usuario);
        movimiento.setRecurso(recurso);

        // Aquí puedes ajustar la lógica de cantidad si aplica (por ejemplo, actualizar stock)
        // Si los movimientos solo se registran sin afectar cantidades, no necesitas modificar el recurso

        return movimientoRepositorio.save(movimiento);
    }

    // Listar los últimos 6 movimientos por fecha descendente
    public List<Movimiento> listarUltimos6Movimientos() {
        Pageable limite = PageRequest.of(0, 6);
        return movimientoRepositorio.findAllByOrderByFechaDesc(limite);
    }

    // Contar cuántos movimientos se registraron hoy
    public long contarMovimientosDeHoy() {
        return movimientoRepositorio.contarMovimientosDeHoy();
    }
}

