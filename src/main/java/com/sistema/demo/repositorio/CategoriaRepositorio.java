package com.sistema.demo.repositorio;

import com.sistema.demo.entidad.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepositorio extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findByNombreIgnoreCase(String nombre);
    // MÉTODO NUEVO: Consulta derivada para filtrar por el campo 'tipo' (String)
    List<Categoria> findByTipo(com.sistema.demo.entidad.enums.CategoriaTipo tipo);
}
