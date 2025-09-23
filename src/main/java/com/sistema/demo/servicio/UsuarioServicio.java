package com.sistema.demo.servicio;

import com.sistema.demo.entidad.Movimiento;
import com.sistema.demo.entidad.Reporte;
import com.sistema.demo.entidad.Solicitud;
import com.sistema.demo.entidad.Usuario;
import com.sistema.demo.repositorio.UsuarioRepositorio;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioServicio {

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    public List<Usuario> listarUsuarios() {
        return usuarioRepositorio.findAll();
    }

    public Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepositorio.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
    }

    public Usuario crearUsuario(Usuario usuario) {
        return usuarioRepositorio.save(usuario);
    }

   public Usuario actualizarUsuario(Long id, Usuario usuarioActualizado) {
        Usuario usuarioExistente = obtenerUsuarioPorId(id);

        usuarioExistente.setNombre(usuarioActualizado.getNombre());
        usuarioExistente.setNombreUsuario(usuarioActualizado.getNombreUsuario());
        usuarioExistente.setContrasenia(usuarioActualizado.getContrasenia());
        usuarioExistente.setRol(usuarioActualizado.getRol());

        return usuarioRepositorio.saveAndFlush(usuarioExistente);
    }

    public void eliminarUsuario(Long id) {
        usuarioRepositorio.deleteById(id);
    }

    public Usuario iniciarSesion(String nombreUsuario, String contrasenia) {
        return usuarioRepositorio.findByNombreUsuarioAndContrasenia(nombreUsuario, contrasenia)
                .orElseThrow(() -> new EntityNotFoundException("Credenciales inválidas"));
    }
/*
    public String registrarPrestamo(Long idUsuario, Solicitud solicitud) {
        Usuario usuario = obtenerUsuarioPorId(idUsuario);
        solicitud.setGeneradoPor(usuario);
        usuario.getSolicitudes().add(solicitud);
        usuarioRepositorio.save(usuario);
        return "Préstamo registrado correctamente.";
    }

    public String registrarMovimiento(Long idUsuario, Movimiento movimiento) {
        Usuario usuario = obtenerUsuarioPorId(idUsuario);
        movimiento.setGeneradoPor(usuario);
        usuario.getMovimientos().add(movimiento);
        usuarioRepositorio.save(usuario);
        return "Movimiento registrado correctamente.";
    }

    public String generarReporte(Long idUsuario, Reporte reporte) {
        Usuario usuario = obtenerUsuarioPorId(idUsuario);
        reporte.setGeneradoPor(usuario);
        usuario.getReportes().add(reporte);
        usuarioRepositorio.save(usuario);
        return "Reporte generado correctamente.";
    }*/
}
