package com.sistema.demo.entidad;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Date; // Usaremos java.util.Date para control manual
import java.util.Set; // Usaremos Set para la relación Muchos a Muchos

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // nroTramite debe ser único
    @Column(unique = true, nullable = false)
    private String nroTramite;

    // Relación Muchos a Uno con Solicitante (campo 'solicitante' de la FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitante_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Solicitante solicitante; // Representa el "nombre del solicitante" (a través del objeto)

    private String area;

    @Column(nullable = false)
    private String estado = "PENDIENTE"; // Valores posibles: PENDIENTE, ACEPTADA, RECHAZADA

    // La fecha de la solicitud, sin autogenerar
    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date fechaSolicitud;

    // Relación Muchos a Muchos: La tabla intermedia la manejaremos con un Set
    // Nota: Aunque JPA puede manejar la tabla intermedia automáticamente,
    // es mejor crear la entidad intermedia explícitamente para añadir atributos
    // (como cantidad de recurso).
    @ManyToMany
    @JoinTable(name = "solicitud_recurso", // JPA creará y gestionará esta tabla por sí mismo
            joinColumns = @JoinColumn(name = "solicitud_id"), inverseJoinColumns = @JoinColumn(name = "recurso_id"))
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Recurso> bienesSolicitados; // Cambiamos el nombre para reflejar el objeto final

}