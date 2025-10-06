package com.sistema.demo.controlador;

import com.sistema.demo.entidad.Movimiento;
import com.sistema.demo.servicio.MovimientoServicio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoControlador {

    @Autowired
    private MovimientoServicio movimientoServicio;

    @GetMapping
    public ResponseEntity<List<Movimiento>> listar() {
        return ResponseEntity.ok(movimientoServicio.listarMovimientos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(movimientoServicio.obtenerMovimientoPorId(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Movimiento> crear(@RequestBody Movimiento movimiento) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movimientoServicio.crearMovimiento(movimiento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Movimiento movimiento) {
        try {
            return ResponseEntity.ok(movimientoServicio.actualizarMovimiento(id, movimiento));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            movimientoServicio.eliminarMovimiento(id);
            return ResponseEntity.ok("Movimiento eliminado");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarNuevoMovimiento(@RequestParam Long idUsuario, @RequestParam Long idRecurso,
            @RequestBody Movimiento movimiento) {
        try {
            return ResponseEntity.ok(movimientoServicio.registrarNuevoMovimiento(idUsuario, idRecurso, movimiento));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/ultimos")
    public ResponseEntity<List<Movimiento>> listarUltimos() {
        return ResponseEntity.ok(movimientoServicio.listarUltimos6Movimientos());
    }

    @GetMapping("/contar/hoy")
    public long contarMovimientosDeHoy() {
        return movimientoServicio.contarMovimientosDeHoy();
    }
}
