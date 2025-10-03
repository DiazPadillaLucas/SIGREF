package com.sistema.demo.repositorio;

import com.sistema.demo.entidad.Movimiento;
import com.sistema.demo.entidad.Recurso;
import com.sistema.demo.entidad.enums.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface MovimientoRepositorio extends JpaRepository<Movimiento, Long> {
    List<Movimiento> findAllByOrderByFechaDesc(Pageable pageable);
}
