package com.sistema.demo.controlador;

import com.sistema.demo.entidad.SolicitudRecurso;
import com.sistema.demo.entidad.SolicitudRecursoId;
import com.sistema.demo.servicio.SolicitudRecursoServicio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/solicitud-recursos")
public class SolicitudRecursoControlador {

    @Autowired
    private SolicitudRecursoServicio servicio;

    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(servicio.listar());
    }

    @GetMapping("/{solicitudId}/{recursoId}")
    public ResponseEntity<?> obtener(@PathVariable Long solicitudId, @PathVariable Long recursoId) {
        try {
            SolicitudRecursoId id = new SolicitudRecursoId(solicitudId, recursoId);
            return ResponseEntity.ok(servicio.obtenerPorId(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody SolicitudRecurso sr) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crear(sr));
    }

    @DeleteMapping("/{solicitudId}/{recursoId}")
    public ResponseEntity<?> eliminar(@PathVariable Long solicitudId, @PathVariable Long recursoId) {
        try {
            servicio.eliminar(new SolicitudRecursoId(solicitudId, recursoId));
            return ResponseEntity.ok("Eliminado");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}