package com.sistema.demo.servicio;

import com.sistema.demo.entidad.Usuario;
import com.sistema.demo.entidad.enums.Rol;
import com.sistema.demo.repositorio.UsuarioRepositorio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UsuarioServicioTest {

    @Mock
    private UsuarioRepositorio usuarioRepositorio; // Mock del repositorio

    @InjectMocks
    private UsuarioServicio usuarioServicio; // Clase a probar, inyectando los mocks

    // Caso de Prueba: Lógica de creación del servicio
    @Test
    @DisplayName("Test de servicio para crear un usuario")
    void testCrearUsuario() {
        // 1. Datos de Prueba
        Usuario usuarioEntrada = new Usuario(null, "Nuevo", "newuser", "pass456", Rol.OPERADOR, null, null);
        Usuario usuarioSalida = new Usuario(2L, "Nuevo", "newuser", "pass456", Rol.OPERADOR, null, null);

        // 2. Configuración del Mock:
        // Cuando se llame a usuarioRepositorio.save(CUALQUIER Usuario),
        // Mockito debe devolver el usuarioSalida (simulando el comportamiento de la DB).
        given(usuarioRepositorio.save(any(Usuario.class))).willReturn(usuarioSalida);

        // 3. Ejecución
        Usuario usuarioCreado = usuarioServicio.crearUsuario(usuarioEntrada);

        // 4. Verificación
        // Verifica que el resultado no es nulo y tiene el ID asignado
        assertThat(usuarioCreado).isNotNull();
        assertThat(usuarioCreado.getId()).isEqualTo(2L);

        // Verifica que el método save fue llamado una vez
        verify(usuarioRepositorio).save(usuarioEntrada);
    }
}