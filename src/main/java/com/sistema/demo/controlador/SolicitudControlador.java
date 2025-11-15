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
    public ResponseEntity<?> listar() {
        try {
            List<Solicitud> lista = solicitudServicio.listar();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            // Log en consola del servidor y devolver el mensaje para debug temporal
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al listar solicitudes: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(solicitudServicio.obtenerPorId(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Solicitud solicitud) {
        try {
            Solicitud creada = solicitudServicio.crearSolicitud(solicitud);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            // Errores 400 por validación de solicitante o bien
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // NUEVA CAPTURA PARA EL ERROR DE DUPLICIDAD (409 Conflict)
            // Buscamos el mensaje para ver si es el nro_tramite
            if (e.getMessage() != null && e.getMessage().contains("UK_nro_tramite")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                        "Ya existe una solicitud con el número de trámite ingresado. Por favor, ingrese un valor único.");
            }
            // Si es otro error de integridad, devolvemos un 400
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error de integridad de datos: " + e.getMostSpecificCause().getMessage());
        }
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
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Solicitud> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        Solicitud solicitudActualizada = solicitudServicio.actualizarEstado(id, estado);
        return solicitudActualizada != null ? ResponseEntity.ok(solicitudActualizada)
                : ResponseEntity.notFound().build();
    }
}