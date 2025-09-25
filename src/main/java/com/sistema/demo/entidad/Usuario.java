package com.sistema.demo.entidad;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sistema.demo.entidad.enums.Rol;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String nombreUsuario;
    private String contrasenia;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    @JsonIgnore
    @OneToMany(mappedBy = "generadoPor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reporte> reportes;

    @JsonIgnore
    @OneToMany(mappedBy = "generadoPor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Movimiento> movimientos;

    @JsonIgnore
    @OneToMany(mappedBy = "generadoPor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Solicitud> solicitudes;

}
