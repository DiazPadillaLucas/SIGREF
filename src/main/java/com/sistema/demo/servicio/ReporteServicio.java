package com.sistema.demo.servicio;

import com.sistema.demo.entidad.Recurso;
import com.sistema.demo.entidad.Reporte;
import com.sistema.demo.entidad.Usuario;
import com.sistema.demo.entidad.enums.Tipo;
import com.sistema.demo.entidad.Movimiento;
import com.sistema.demo.repositorio.RecursoRepositorio;
import com.sistema.demo.repositorio.ReporteRepositorio;
import com.sistema.demo.repositorio.UsuarioRepositorio;
import com.sistema.demo.repositorio.MovimientoRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ReporteServicio {

    @Autowired
    private ReporteRepositorio reporteRepositorio;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private RecursoRepositorio recursoRepositorio;
    @Autowired
    private MovimientoRepositorio movimientoRepositorio;


    public List<Reporte> listarReportes() {
        return reporteRepositorio.findAll();
    }

    public Reporte obtenerPorId(Long id) {
        return reporteRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reporte no encontrado con id: " + id));
    }

    public Reporte crear(Reporte reporte) {
        return reporteRepositorio.save(reporte);
    }

    public Reporte actualizar(Long id, Reporte reporteActualizado) {
        Reporte reporteExistente = obtenerPorId(id);

        reporteExistente.setTipo(reporteActualizado.getTipo());
        reporteExistente.setFechaGeneracion(reporteActualizado.getFechaGeneracion());
        reporteExistente.setGeneradoPor(reporteActualizado.getGeneradoPor());

        return reporteRepositorio.saveAndFlush(reporteExistente);
    }

    public void eliminar(Long id) {
        reporteRepositorio.deleteById(id);
    }

    public Object generarReporte(Long idUsuario, String tipoReporte) {
        Usuario usuario = usuarioRepositorio.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Reporte nuevoReporte = new Reporte();
        nuevoReporte.setFechaGeneracion(new Date());
        nuevoReporte.setGeneradoPor(usuario);
        nuevoReporte.setTipo(tipoReporte.toUpperCase());

        reporteRepositorio.save(nuevoReporte);

        switch (tipoReporte.toLowerCase()) {
            case "movimiento":
                List<Movimiento> movimientos = movimientoRepositorio.findAll();
                return movimientos;
            case "inventario":
                List<Recurso> inventario = recursoRepositorio.findAll();
                return inventario;

            case "stock_minimo":
                List<Recurso> stockMinimo = recursoRepositorio.findAll().stream()
                        .filter(r -> r.getCantidad() <= r.getMinimo())
                        // 🌟 CONDICIÓN 1: Filtrar solo por el tipo "Insumo" 🌟
                        .filter(r -> "Insumo".equalsIgnoreCase(r.getTipo()))
                        // 🌟 CONDICIÓN 2: Filtrar donde el estado sea igual a 1 🌟
                        .filter(r -> r.getEstado() == true)
                        .toList();
                return stockMinimo;
            default:
                throw new IllegalArgumentException("Tipo de reporte no válido. Debe ser 'prestamos', 'inventario' o 'stock_minimo'.");
        }
    }
}
