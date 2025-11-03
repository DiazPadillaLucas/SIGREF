package com.sistema.demo.servicio;

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

}
