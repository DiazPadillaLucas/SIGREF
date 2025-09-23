package com.sistema.demo.controlador;

import com.sistema.demo.entidad.Movimiento;
import com.sistema.demo.entidad.Reporte;
import com.sistema.demo.entidad.Solicitud;
import com.sistema.demo.entidad.Usuario;
import com.sistema.demo.servicio.UsuarioServicio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioControlador {

    @Autowired
    private UsuarioServicio usuarioServicio;

    @GetMapping
    public ResponseEntity<List<Usuario>> listar() {
        return ResponseEntity.ok(usuarioServicio.listarUsuarios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioServicio.obtenerUsuarioPorId(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Usuario> crear(@RequestBody Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioServicio.crearUsuario(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        try {
            return ResponseEntity.ok(usuarioServicio.actualizarUsuario(id, usuario));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }



    @PatchMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            usuarioServicio.eliminarUsuario(id);
            return ResponseEntity.ok("Usuario eliminado");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String nombreUsuario, @RequestParam String contrasenia) {
        try {
            return ResponseEntity.ok(usuarioServicio.iniciarSesion(nombreUsuario, contrasenia));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }
    }

    /*@PostMapping("/{id}/registrarPrestamo")
    public ResponseEntity<?> registrarPrestamo(@PathVariable Long id, @RequestBody Solicitud solicitud) {
        try {
            return ResponseEntity.ok(usuarioServicio.registrarPrestamo(id, solicitud));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/registrarMovimiento")
    public ResponseEntity<?> registrarMovimiento(@PathVariable Long id, @RequestBody Movimiento movimiento) {
        try {
            return ResponseEntity.ok(usuarioServicio.registrarMovimiento(id, movimiento));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/generarReporte")
    public ResponseEntity<?> generarReporte(@PathVariable Long id, @RequestBody Reporte reporte) {
        try {
            return ResponseEntity.ok(usuarioServicio.generarReporte(id, reporte));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }*/
}
