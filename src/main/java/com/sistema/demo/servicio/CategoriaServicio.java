package com.sistema.demo.servicio;

import com.sistema.demo.entidad.Categoria;
import com.sistema.demo.repositorio.CategoriaRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaServicio {

    @Autowired
    private CategoriaRepositorio categoriaRepositorio;

    public List<Categoria> listarCategorias() {
        return categoriaRepositorio.findAll();
    }

    public Categoria obtenerCategoriaPorId(Long id) {
        return categoriaRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Categoria no encontrada con id: " + id));
    }

    public Categoria crearCategoria(Categoria categoria) {
        return categoriaRepositorio.save(categoria);
    }

    public Categoria actualizarCategoria(Long id, Categoria categoriaActualizada) {
        Categoria existente = obtenerCategoriaPorId(id);
        existente.setNombre(categoriaActualizada.getNombre());
        existente.setTipo(categoriaActualizada.getTipo());
        return categoriaRepositorio.save(existente);
    }

    public void eliminarCategoria(Long id) {
        Categoria existente = obtenerCategoriaPorId(id);
        categoriaRepositorio.delete(existente);
    }
}