package com.sistema.demo.controlador;

import com.sistema.demo.entidad.Solicitud;
import com.sistema.demo.servicio.SolicitudServicio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudControlador {

    @Autowired
    private SolicitudServicio solicitudServicio;


    @GetMapping
    public ResponseEntity<List<Solicitud>> listar() {
        return ResponseEntity.ok(solicitudServicio.listarSolicitudes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(solicitudServicio.obtenerPorId(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Solicitud> crear(@RequestBody Solicitud solicitud) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitudServicio.crear(solicitud));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Solicitud solicitud) {
        try {
            return ResponseEntity.ok(solicitudServicio.actualizar(id, solicitud));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            solicitudServicio.eliminar(id);
            return ResponseEntity.ok("Solicitud eliminada");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestParam Long idUsuario, @RequestParam Long idRecurso, @RequestBody Solicitud solicitud) {
        try {
            return ResponseEntity.ok(solicitudServicio.registrar(idUsuario, idRecurso, solicitud));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<Solicitud>> pendientes() {
        return ResponseEntity.ok(solicitudServicio.solicitudesPendientes());
    }

    @PostMapping("/devolucion")
    public ResponseEntity<?> registrarDevolucion(@RequestParam String codigoSolicitud, @RequestBody Solicitud devolucion) {
        String resultado = solicitudServicio.registrarDevolucion(codigoSolicitud, devolucion);
        if (resultado.startsWith("Error")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }
}
