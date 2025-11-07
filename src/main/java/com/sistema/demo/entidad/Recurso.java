package com.sistema.demo.entidad;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sistema.demo.entidad.enums.Categoria;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Recurso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String descripcion;
    private String codigo;
    private int cantidad;
    private int minimo;
    private String ubicacion;
    private Boolean estado;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    @JsonIgnore
    @OneToMany(mappedBy = "recurso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Movimiento> movimientos;
    // Relación Muchos a Muchos (a través de la entidad intermedia)
    @JsonIgnore
    @OneToMany(mappedBy = "recurso", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SolicitudRecurso> solicitudesAsociadas;


}
