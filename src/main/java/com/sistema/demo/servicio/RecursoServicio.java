package com.sistema.demo.servicio;

import com.sistema.demo.entidad.Recurso;
import com.sistema.demo.entidad.enums.Categoria;
import com.sistema.demo.repositorio.RecursoRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecursoServicio {

    @Autowired
    private RecursoRepositorio recursoRepositorio;

    //Construir un metodo que devuelve solo los que estan en estado = true
    public List<Recurso> mostrarRecursos() {
        return recursoRepositorio.findAll();
    }

    public List<Recurso> mostrarRecursosActivos() {
        return recursoRepositorio.findByEstado(true);
    }

    public Long contarRecursos(){
        return recursoRepositorio.count();
    }

    public int contarAlertas() {
        List<Recurso> recursos = this.mostrarRecursos().stream().toList();
        int cant = 0;
        for (Recurso recurso : recursos){
            if (this.esStockMinimo(recurso.getId())){
                cant++;
            }
        }
        return cant;
    }

    public Recurso mostrarUnRecurso(Long id) {
        return recursoRepositorio.findById(id).orElseThrow(() -> new EntityNotFoundException("Recurso no encontrado"));
    }

    public Recurso actualizarStockRecurso(Long id, Boolean esIngreso, int cantidad) {
        Recurso recurso = this.mostrarUnRecurso(id);
        int cantidadActualizada;
        if (esIngreso) {
            cantidadActualizada = recurso.getCantidad() + cantidad;
        } else {
            cantidadActualizada = recurso.getCantidad() - cantidad;
        }

        recurso.setCantidad(cantidadActualizada);

        return recursoRepositorio.saveAndFlush(recurso);
    }

    public Boolean esStockMinimo(Long id){
        Recurso recurso = this.mostrarUnRecurso(id);
        return recurso.getCantidad() <= recurso.getMinimo();
    }

    public String darDeBajaRecurso(Long id){
        Recurso recurso = this.mostrarUnRecurso(id);
        if (recurso.getEstado()){
            recurso.setEstado(false);
            recursoRepositorio.saveAndFlush(recurso);
            return "El recurso fue dado de baja con éxito.";
        }

        return "El recurso ya fue dado de baja anteriormente.";
    }


    // En RecursoServicio.java

    public Recurso crearRecurso(Recurso recurso) {

        // 1. Validar la unicidad SOLO si el usuario ingresó un código (Bienes).
        // Si el código es nulo o vacío, asumimos que es un Insumo y que necesita ser generado.
        if (recurso.getCodigo() != null && !recurso.getCodigo().trim().isEmpty()) {
            // Verificamos si este código manual ya existe.
            if (recursoRepositorio.existsByCodigo(recurso.getCodigo())) {
                // Lanzamos una excepción que el controlador capturará (409 Conflict).
                throw new DataIntegrityViolationException("El código '" + recurso.getCodigo() + "' ya está registrado. Por favor, ingrese un código único.");
            }
        }
        // 2. Persistir inicialmente para que Hibernate/JPA asigne el ID (Identity Strategy).
        recurso.setEstado(true);
        Recurso recursoGuardado = recursoRepositorio.save(recurso);
        // 3. Generar Código si es un INSUMO.
        if ("Insumo".equalsIgnoreCase(recursoGuardado.getTipo())) {
            // Se asegura que el ID no sea null (aunque no debería con GenerationType.IDENTITY)
            if (recursoGuardado.getId() == null) {
                throw new IllegalStateException("El ID del recurso no se generó después de la persistencia inicial.");
            }
            // Asignar el código como el ID en negativo, convertido a String.
            String codigoGenerado = String.valueOf(-recursoGuardado.getId());
            recursoGuardado.setCodigo(codigoGenerado);
            // 4. Guardar de nuevo para persistir el código generado.
            // Usamos saveAndFlush para forzar la escritura inmediata.
            return recursoRepositorio.saveAndFlush(recursoGuardado);
        }
        // Si es un Bien, devolvemos el recurso con el código manual (o vacío si el usuario lo dejó así).
        return recursoGuardado;
    }

    public Recurso actualizarRecurso(Long id, Recurso recursoActualizado) {
        Recurso recursoExistente = this.mostrarUnRecurso(id);

        recursoExistente.setNombre(recursoActualizado.getNombre());
        recursoExistente.setDescripcion(recursoActualizado.getDescripcion());
        //recursoExistente.setCodigo(recursoActualizado.getCodigo());
        recursoExistente.setCantidad(recursoActualizado.getCantidad());
        recursoExistente.setMinimo(recursoActualizado.getMinimo());
        recursoExistente.setUbicacion(recursoActualizado.getUbicacion());
        recursoExistente.setCategoria(recursoActualizado.getCategoria());
        recursoExistente.setEstado(recursoActualizado.getEstado());
        recursoExistente.setCondicion(recursoActualizado.getCondicion()); // Nuevo campo
        recursoExistente.setTipo(recursoActualizado.getTipo());           // Nuevo campo

        return recursoRepositorio.saveAndFlush(recursoExistente);
    }

    public List<Recurso> buscarPorNombre(String nombre) {
        return recursoRepositorio.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Recurso> buscarPorCodigo(String codigo) {
        return recursoRepositorio.findByCodigoContainingIgnoreCase(codigo);
    }
    public List<Recurso> buscarPorCategoria(Categoria categoria) {
        return recursoRepositorio.findByCategoria(categoria);
    }

    public List<Recurso> listarStockMinimo(){
        List<Recurso> stockMinimo = recursoRepositorio.findAll().stream()
                .filter(r -> r.getCantidad() <= r.getMinimo())
                .toList();
        return stockMinimo;
    }
    public List<Recurso> buscarPorCondicion(String condicion) {
        // Necesita un método findByCondicionContainingIgnoreCase en el Repositorio
        return recursoRepositorio.findByCondicionContainingIgnoreCase(condicion);
    }

    public List<Recurso> buscarPorTipo(String tipo) {
        // Necesita un método findByTipoContainingIgnoreCase en el Repositorio
        return recursoRepositorio.findByTipoContainingIgnoreCase(tipo);
    }
}

