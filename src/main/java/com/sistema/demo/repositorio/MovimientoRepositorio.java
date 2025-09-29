package com.sistema.demo.repositorio;

import com.sistema.demo.entidad.Movimiento;
import com.sistema.demo.entidad.Recurso;
import com.sistema.demo.entidad.enums.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoRepositorio extends JpaRepository<Movimiento, Long> {

}
