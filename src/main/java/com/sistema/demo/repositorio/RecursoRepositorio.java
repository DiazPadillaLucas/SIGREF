package com.sistema.demo.repositorio;

import com.sistema.demo.entidad.Recurso;
import com.sistema.demo.entidad.enums.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecursoRepositorio extends JpaRepository<Recurso, Long> {
    List<Recurso> findByNombreContainingIgnoreCase(String nombre);
    List<Recurso> findByCodigoContainingIgnoreCase(String codigo);
    List<Recurso> findByCategoria(Categoria categoria);
    List<Recurso> findByEstado(Boolean estado);
    List<Recurso> findByCondicionContainingIgnoreCase(String condicion);
    List<Recurso> findByTipoContainingIgnoreCase(String tipo);
    Boolean existsByCodigo(String codigo);
    List<Recurso> findByTipoContainingIgnoreCaseAndEstado(String tipo, Boolean estado);
}

