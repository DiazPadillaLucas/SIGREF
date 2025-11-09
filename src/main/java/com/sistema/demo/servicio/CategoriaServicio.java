package com.sistema.demo.servicio;
import com.sistema.demo.entidad.Categoria;
import com.sistema.demo.entidad.enums.CategoriaTipo;
import com.sistema.demo.repositorio.CategoriaRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import necesario

import java.util.List;

@Service
public class CategoriaServicio {

    @Autowired
    private CategoriaRepositorio categoriaRepositorio;

    // Método para listar todas las categorías
    @Transactional(readOnly = true)
    public List<Categoria> listarCategorias() {
        return categoriaRepositorio.findAll();
    }

    // Método NUEVO para filtrar categorías por el campo 'tipo' (String)
    /**
     * Filtra y lista categorías por su campo 'tipo' (ej: "BIEN" o "INSUMO").
     * @param tipo El tipo de categoría a filtrar (String).
     * @return Lista de categorías que coinciden con el tipo.
     */
    @Transactional(readOnly = true)
    public List<Categoria> listarCategoriasPorTipo(String tipo) {

        try {
            // 1. CONVERSIÓN: Transforma el String ("BIEN") en el objeto Enum (CategoriaTipo.BIEN)
            CategoriaTipo categoriaTipo = CategoriaTipo.valueOf(tipo);

            // 2. LLAMADA: Llama al repositorio con el objeto Enum, resolviendo el conflicto de tipos.
            return categoriaRepositorio.findByTipo(categoriaTipo);

        } catch (IllegalArgumentException e) {
            // Esto ocurre si el frontend envía un tipo que no existe (ej: ?tipo=X)
            System.err.println("Tipo de categoría inválido en el filtro: " + tipo + ". Error: " + e.getMessage());
            return List.of(); // Devuelve una lista vacía en caso de error en el tipo
        }
    }

    // Método para obtener por ID
    @Transactional(readOnly = true)
    public Categoria obtenerCategoriaPorId(Long id) {
        return categoriaRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Categoria no encontrada con id: " + id));
    }

    // Método para crear una categoría
    @Transactional
    public Categoria crearCategoria(Categoria categoria) {
        return categoriaRepositorio.save(categoria);
    }

    // Método para actualizar una categoría
    @Transactional
    public Categoria actualizarCategoria(Long id, Categoria categoriaActualizada) {
        Categoria existente = obtenerCategoriaPorId(id);

        // Aplica el nuevo nombre
        existente.setNombre(categoriaActualizada.getNombre());

        // Aplica el nuevo tipo (asegurando mayúsculas)
        existente.setTipo(categoriaActualizada.getTipo());

        return categoriaRepositorio.save(existente);
    }

    // Método para eliminar una categoría
    @Transactional
    public void eliminarCategoria(Long id) {
        Categoria existente = obtenerCategoriaPorId(id);
        categoriaRepositorio.delete(existente);
    }
}