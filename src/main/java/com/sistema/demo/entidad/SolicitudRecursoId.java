package com.sistema.demo.entidad;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// Entidad para la Clave Primaria Compuesta
@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SolicitudRecursoId implements Serializable {
    private Long solicitudId;
    private Long recursoId;
}