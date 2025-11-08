package com.sistema.demo.controlador;

import com.sistema.demo.entidad.Recurso;
import com.sistema.demo.entidad.enums.Categoria;
import com.sistema.demo.servicio.RecursoServicio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recursos")
public class RecursoControlador {

    @Autowired
    private RecursoServicio recursoServicio;

    @GetMapping
    private ResponseEntity<?> mostrarTodos() {
        List<Recurso> recursos = recursoServicio.mostrarRecursos();
        return ResponseEntity.ok(recursos);
    }

    @GetMapping("/activos")
    private ResponseEntity<?> mostrarActivos(){
        List<Recurso> recursos = recursoServicio.mostrarRecursosActivos();
        return ResponseEntity.ok(recursos);
    }

    @GetMapping("/contar/todosLosRecursos")
    private ResponseEntity<?> contarTodos(){
        return ResponseEntity.ok(recursoServicio.contarRecursos());
    }


    @GetMapping("/contar/alertaStock")
    private ResponseEntity<?> contarAlertas(){
        return ResponseEntity.ok(recursoServicio.contarAlertas());
    }

    @GetMapping("/{id}")
    private ResponseEntity<?> mostrarUno(@PathVariable Long id){
        try{
            return ResponseEntity.ok(recursoServicio.mostrarUnRecurso(id));
        } catch (EntityNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/actualizarStock")
    private ResponseEntity<?> actualizarStock(@PathVariable Long id, @RequestParam("ingreso") Boolean esIngreso, @RequestParam("cant") int cantidad){
        try{
            return ResponseEntity.ok(recursoServicio.actualizarStockRecurso(id, esIngreso, cantidad));
        } catch (EntityNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/estaEnMinimo")
    private ResponseEntity<?> estaEnMinimo(@PathVariable Long id){
        try{
            return ResponseEntity.ok(recursoServicio.esStockMinimo(id));
        } catch (EntityNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/darDeBaja")
    private ResponseEntity<?> darDeBaja(@PathVariable Long id){
        try{
            return ResponseEntity.ok(recursoServicio.darDeBajaRecurso(id));
        } catch (EntityNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Recurso recurso) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recursoServicio.crearRecurso(recurso));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Recurso recurso) {
        try {
            return ResponseEntity.ok(recursoServicio.actualizarRecurso(id, recurso));
        } catch (EntityNotFoundException e) {
            // Maneja errores 404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Recurso no encontrado. " + e.getMessage());
        } catch (Exception e) { // 🆕 Captura cualquier otra excepción, incluyendo las de mapeo/BD
            // Esto podría ser DataIntegrityViolationException (código único), o HttpMessageNotReadableException (tipo de dato)
            // Devolvemos un 400 Bad Request y el mensaje de la excepción de Java
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error de validación o datos: " + e.getMessage());
        }
    }

    @GetMapping("/buscarPorNombre")
    public ResponseEntity<List<Recurso>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(recursoServicio.buscarPorNombre(nombre));
    }

    @GetMapping("/buscarPorCodigo")
    public ResponseEntity<List<Recurso>> buscarPorCodigo(@RequestParam String codigo) {
        return ResponseEntity.ok(recursoServicio.buscarPorCodigo(codigo));
    }

    @GetMapping("/buscarPorCategoria")
    public ResponseEntity<List<Recurso>> buscarPorCategoria(@RequestParam Categoria categoria) {
        return ResponseEntity.ok(recursoServicio.buscarPorCategoria(categoria));
    }

    @GetMapping("/listarStockMinimo")
    public ResponseEntity<?> listarStockMin(){
        return ResponseEntity.ok(recursoServicio.listarStockMinimo());
    }


    @GetMapping("/buscarPorCondicion")
    public ResponseEntity<List<Recurso>> buscarPorCondicion(@RequestParam String condicion) {
        return ResponseEntity.ok(recursoServicio.buscarPorCondicion(condicion));
    }

    @GetMapping("/buscarPorTipo")
    public ResponseEntity<List<Recurso>> buscarPorTipo(@RequestParam String tipo) {
        return ResponseEntity.ok(recursoServicio.buscarPorTipo(tipo));
    }

}
