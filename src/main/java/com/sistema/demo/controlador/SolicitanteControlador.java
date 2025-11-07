package com.sistema.demo.controlador;

import com.sistema.demo.entidad.Solicitante;
import com.sistema.demo.servicio.SolicitanteServicio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitantes")
public class SolicitanteControlador {

    @Autowired
    private SolicitanteServicio solicitanteServicio;

    @GetMapping
    public ResponseEntity<List<Solicitante>> listar() {
        return ResponseEntity.ok(solicitanteServicio.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(solicitanteServicio.obtenerPorId(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Solicitante> crear(@RequestBody Solicitante s) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitanteServicio.crear(s));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Solicitante s) {
        try {
            return ResponseEntity.ok(solicitanteServicio.actualizar(id, s));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            solicitanteServicio.eliminar(id);
            return ResponseEntity.ok("Solicitante eliminado");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}