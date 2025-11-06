package com.sistema.demo.servicio;

import com.sistema.demo.entidad.Recurso;
import com.sistema.demo.entidad.enums.Categoria;
import com.sistema.demo.repositorio.RecursoRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
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

    public Recurso crearRecurso(Recurso recurso) {
        recurso.setEstado(true);
        return recursoRepositorio.save(recurso);
    }

    public Recurso actualizarRecurso(Long id, Recurso recursoActualizado) {
        Recurso recursoExistente = this.mostrarUnRecurso(id);

        recursoExistente.setNombre(recursoActualizado.getNombre());
        recursoExistente.setDescripcion(recursoActualizado.getDescripcion());
        recursoExistente.setCodigo(recursoActualizado.getCodigo());
        recursoExistente.setCantidad(recursoActualizado.getCantidad());
        recursoExistente.setMinimo(recursoActualizado.getMinimo());
        recursoExistente.setUbicacion(recursoActualizado.getUbicacion());
        recursoExistente.setCategoria(recursoActualizado.getCategoria());
        recursoExistente.setEstado(recursoActualizado.getEstado());

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
}
