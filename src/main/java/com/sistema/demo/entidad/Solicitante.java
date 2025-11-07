package com.sistema.demo.entidad;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public class Solicitante {
        // Identificador generado (ID), aunque DNI es la clave primaria
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // DNI como Clave Primaria (Id) según la solicitud
        @Column(unique = true, nullable = false)
        private String dni;

        private String nombre;

        private String puesto;

    // Relación: Un Solicitante (Uno) tiene una lista de Solicitudes (Muchos)
    @JsonIgnore
    @OneToMany(mappedBy = "solicitante", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Solicitud> solicitudes; // Mapeado por el campo 'solicitante' en la entidad Solicitud
}
