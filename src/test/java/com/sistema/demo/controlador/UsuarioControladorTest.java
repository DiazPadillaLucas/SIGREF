package com.sistema.demo.controlador;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.mock.http.server.reactive.MockServerHttpRequest.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistema.demo.entidad.Usuario;
import com.sistema.demo.entidad.enums.Rol;
import com.sistema.demo.servicio.UsuarioServicio;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;


import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioControlador.class)
class UsuarioControladorTest {

    @Autowired
    private MockMvc mockMvc; // Permite simular peticiones HTTP

    @MockBean
    private UsuarioServicio usuarioServicio; // Crea un mock del servicio

    @Autowired
    private ObjectMapper objectMapper; // Para convertir objetos Java a JSON

    private Usuario usuarioValido;

    @BeforeEach
    void setup() {
        // Inicializa un objeto Usuario que se usará en los tests
        usuarioValido = new Usuario(null, "Test User", "testuser", "pass123", Rol.OPERADOR, null, null);
    }

    // Caso de Prueba 1: Creación Exitosa de un usuario
    @Test
    @DisplayName("Test para crear un Usuario exitosamente (Status 201)")
    void testCrearUsuario_Exitoso() throws Exception {
        // 1. Configuración del Mock:
        // Cuando se llame a crearUsuario con CUALQUIER Usuario,
        // Mockito debe devolver el mismo usuario pero con un ID asignado (simulando la DB).
        Usuario usuarioConId = new Usuario(1L, "Test User", "testuser", "pass123", Rol.OPERADOR, null, null);
        given(usuarioServicio.crearUsuario(any(Usuario.class))).willReturn(usuarioConId);

        // 2. Ejecución del Test (Llamada al Endpoint /api/usuarios con POST):
        ResultActions response = mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioValido))); // Body de la petición

        // 3. Verificación de Resultados:
        response.andExpect(status().isCreated()) // Verifica el Status HTTP 201
                .andExpect(jsonPath("$.id").value(1L)) // Verifica que el ID fue asignado
                .andExpect(jsonPath("$.nombreUsuario").value(usuarioConId.getNombreUsuario()));
    }

    // Caso de Prueba 2 (Ejemplo de Error del Servicio, se crea un usuario ya existente):
    @Test
    @DisplayName("Test de falla: Lanza IllegalArgumentException y devuelve 400")
    void testCrearUsuario_MapeoExcepcion() throws Exception {
        String expectedMessage = "El nombre de usuario ya existe";

        // 1. Configuración del Mock
        given(usuarioServicio.crearUsuario(any(Usuario.class)))
                .willThrow(new IllegalArgumentException(expectedMessage));

        // 2. Ejecución y Verificación:
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usuarioValido)))

                // 1. Verificamos el estado 400
                .andExpect(status().isBadRequest())

                // 2. Verificamos que el cuerpo devuelto sea el mensaje de la excepción (devuelto por el @ExceptionHandler)
                .andExpect(content().string(expectedMessage));
    }

    //Caso de prueva 3: Devolver una lista de usuarios exitosamente (Status 200).
    @Test
    @DisplayName("Test GET /api/usuarios: Listar todos los usuarios (Status 200)")
    void testListarUsuarios_Exitoso() throws Exception {
        // 1. Configuración del Mock:
        Usuario usuario2 = new Usuario(2L, "Otro User", "otro", "pass456", Rol.OPERADOR, null, null);
        List<Usuario> usuarios = Arrays.asList(usuarioValido, usuario2);

        // El servicio devuelve una lista de dos usuarios
        given(usuarioServicio.listarUsuarios()).willReturn(usuarios);

        // 2. Ejecución y Verificación:
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk()) // Verifica Status HTTP 200
                .andExpect(jsonPath("$.size()").value(2)) // Verifica que hay dos elementos
                .andExpect(jsonPath("$[0].nombreUsuario").value(usuarioValido.getNombreUsuario()));
    }
    // //Caso de prueva 4:Devolver una lista vacía (Status 200).
    @Test
    @DisplayName("Test GET /api/usuarios: Lista vacía (Status 200)")
    void testListarUsuarios_ListaVacia() throws Exception {
        // 1. Configuración del Mock:
        // El servicio devuelve una lista vacía
        given(usuarioServicio.listarUsuarios()).willReturn(Collections.emptyList());

        // 2. Ejecución y Verificación:
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk()) // Verifica Status HTTP 200
                .andExpect(jsonPath("$.size()").value(0)); // Verifica que la lista está vacía
    }


    //Caso de prueva 5: Obtener un usuario existente (Status 200).
    @Test
    @DisplayName("Test GET /api/usuarios/{id}: Obtener por ID existente (Status 200)")
    void testObtenerPorId_Existente() throws Exception {
        Long id = 1L;
        Usuario usuarioExistente = new Usuario(id, "Test User", "testuser", "pass123", Rol.OPERADOR, null, null);

        // El servicio devuelve el usuario simulado
        given(usuarioServicio.obtenerUsuarioPorId(id)).willReturn(usuarioExistente);

        // Ejecución y Verificación:
        mockMvc.perform(get("/api/usuarios/{id}", id))
                .andExpect(status().isOk()) // Verifica Status HTTP 200
                .andExpect(jsonPath("$.nombreUsuario").value(usuarioExistente.getNombreUsuario()));
    }
//Caso de prueva 6: Obtener un usuario no existente (Status 404).
    @Test
    @DisplayName("Test GET /api/usuarios/{id}: Obtener por ID no existente (Status 404)")
    void testObtenerPorId_NoExistente() throws Exception {
        Long id = 99L;
        String errorMessage = "Usuario no encontrado con id: " + id;

        // El servicio lanza la excepción esperada
        given(usuarioServicio.obtenerUsuarioPorId(id)).willThrow(new EntityNotFoundException(errorMessage));

        // Ejecución y Verificación:
        mockMvc.perform(get("/api/usuarios/{id}", id))
                .andExpect(status().isNotFound()) // Verifica Status HTTP 404
                .andExpect(content().string(errorMessage)); // Verifica el mensaje devuelto por el controlador
    }

    /*Caso de prueva 7: Actualizar un usuario existente (Status 200).
    @Test
    @DisplayName("Test PUT /api/usuarios/{id}: Actualización exitosa (Status 200)")
    void testActualizarUsuario_Exitoso() throws Exception {
        Long id = 1L;
        Usuario usuarioActualizadoRequest = new Usuario(id, "Nombre Actualizado", "nuevo_user", "new_pass", Rol.ADMINISTRADOR, null, null);

        // El servicio devuelve el usuario actualizado
        given(usuarioServicio.actualizarUsuario(eq(id), any(Usuario.class))).willReturn(usuarioActualizadoRequest);

        // Ejecución y Verificación:
        mockMvc.perform((org.springframework.test.web.servlet.RequestBuilder) put("/api/usuarios/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.valueOf(objectMapper.writeValueAsString(usuarioActualizadoRequest))))
                .andExpect(status().isOk()) // Verifica Status HTTP 200
                .andExpect(jsonPath("$.nombre").value("Nombre Actualizado"))
                .andExpect(jsonPath("$.rol").value(Rol.ADMINISTRADOR.name()));
    }
    //Caso de prueva 8: Actualizar un usuario no existente (Status 404).
    @Test
    @DisplayName("Test PUT /api/usuarios/{id}: Actualizar usuario no existente (Status 404)")
    void testActualizarUsuario_NoExistente() throws Exception {
        Long id = 99L;
        String errorMessage = "Usuario no encontrado con id: " + id;
        Usuario usuarioActualizadoRequest = new Usuario(id, "Nombre Actualizado", "nuevo_user", "new_pass", Rol.ADMINISTRADOR, null, null);

        // El servicio lanza la excepción esperada
        given(usuarioServicio.actualizarUsuario(eq(id), any(Usuario.class))).willThrow(new EntityNotFoundException(errorMessage));

        // Ejecución y Verificación:
        mockMvc.perform((org.springframework.test.web.servlet.RequestBuilder) put("/api/usuarios/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.valueOf(objectMapper.writeValueAsString(usuarioActualizadoRequest))))
                .andExpect(status().isNotFound()) // Verifica Status HTTP 404
                .andExpect(content().string(errorMessage));
    }
*/

    //Caso de prueva 9: Eliminar un usuario  existente (Status 200).

    @Test
    @DisplayName("Test PATCH /api/usuarios/{id}: Eliminación exitosa (Status 200)")
    void testEliminarUsuario_Exitoso() throws Exception {
        Long id = 1L;

        // El servicio no lanza excepción (void return)
        doNothing().when(usuarioServicio).eliminarUsuario(id);

        // Ejecución y Verificación:
        mockMvc.perform(patch("/api/usuarios/{id}", id))
                .andExpect(status().isOk()) // Verifica Status HTTP 200
                .andExpect(content().string("Usuario eliminado")); // Verifica el mensaje de éxito

        // Verifica que el método del servicio fue llamado
        verify(usuarioServicio, times(1)).eliminarUsuario(id);
    }
    //Caso de prueva 10: Eliminar un usuario no existente (Status 404).
    // *** DENTRO DE UsuarioControladorTest.java ***

    @Test
    @DisplayName("Test PATCH /api/usuarios/{id}: Eliminar usuario no existente (Status 404)")
    void testEliminarUsuario_NoExistente() throws Exception {
        Long id = 99L;
        // Usa el mensaje que el controlador espera devolver en caso de error
        String errorMessage = "Usuario no encontrado para eliminar: " + id;

        // ** CORRECCIÓN: Usar EntityNotFoundException **
        // Asumo que el servicio lanzaría EntityNotFoundException si el ID no existe.
        doThrow(new EntityNotFoundException(errorMessage))
                .when(usuarioServicio).eliminarUsuario(id);

        // Ejecución y Verificación:
        mockMvc.perform(patch("/api/usuarios/{id}", id))
                // El controlador captura el error y devuelve el mensaje de la excepción (Status 404)
                .andExpect(status().isNotFound())
                .andExpect(content().string(errorMessage));

        // Si quieres usar el mensaje original de tu código:
        // String originalMessage = "No se pudo eliminar el usuario";
        // .andExpect(content().string(originalMessage));
    }

    //Caso de prueba 11: Credenciales válidas (Status 200).
    @Test
    @DisplayName("Test POST /login: Inicio de sesión exitoso (Status 200)")
    void testLogin_Exitoso() throws Exception {
        String user = "testuser";
        String pass = "pass123";
        Usuario usuarioLogueado = new Usuario(1L, "Test User", user, pass, Rol.OPERADOR, null, null);

        // El servicio devuelve el usuario
        given(usuarioServicio.iniciarSesion(user, pass)).willReturn(usuarioLogueado);

        // Ejecución y Verificación:
        mockMvc.perform(post("/api/usuarios/login")
                        .param("nombreUsuario", user) // Usamos .param para @RequestParam
                        .param("contrasenia", pass))
                .andExpect(status().isOk()) // Verifica Status HTTP 200
                .andExpect(jsonPath("$.nombreUsuario").value(user));
    }
    //Credenciales inválidas (Status 401 Unauthorized).
    @Test
    @DisplayName("Test POST /login: Credenciales inválidas (Status 401)")
    void testLogin_CredencialesInvalidas() throws Exception {
        String user = "baduser";
        String pass = "badpass";
        String errorMessage = "Credenciales inválidas";

        // El servicio lanza la excepción esperada
        given(usuarioServicio.iniciarSesion(user, pass)).willThrow(new EntityNotFoundException(errorMessage));

        // Ejecución y Verificación:
        mockMvc.perform(post("/api/usuarios/login")
                        .param("nombreUsuario", user)
                        .param("contrasenia", pass))
                .andExpect(status().isUnauthorized()) // Verifica Status HTTP 401
                .andExpect(content().string(errorMessage));
    }














}