package com.sistema.demo.entidad;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @Column(unique = true)
    private String codigo;
    private int cantidad; //no es necesario para un bien
    private int minimo; //no se necesario para un bien
    private String ubicacion; //Si es necesario, no para un insumo.
    private String condicion; // Hay mas condiciones? Solo para bienes. Campo para la condición del recurso (ej: "Nuevo", "Usado", "Deteriorado")
    @Column(name = "tipo_recurso", nullable = false)
    private String tipo; // Esta variable almacena "Bien" o "Insumo"
    private Boolean estado;

       @ManyToOne
       @JoinColumn(name = "categoria_id", nullable = false)
    private com.sistema.demo.entidad.Categoria categoria;



    @JsonIgnore
    @OneToMany(mappedBy = "recurso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Movimiento> movimientos;
    // Relación Muchos a Muchos (a través de la entidad intermedia)
    @JsonIgnore
    @OneToMany(mappedBy = "recurso", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SolicitudRecurso> solicitudesAsociadas;


}
