
package com.sistema.demo.entidad;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SolicitudRecurso {

    // Clave primaria compuesta
    @EmbeddedId
    private SolicitudRecursoId id;

    // Campo adicional para la relación
    private Integer cantidadSolicitada;

    // Mapeo de la clave foránea a Solicitud
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("solicitudId") // Mapea al campo 'solicitudId' de la clave compuesta
    @JoinColumn(name = "solicitud_id")
    private Solicitud solicitud;

    // Mapeo de la clave foránea a Recurso
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("recursoId") // Mapea al campo 'recursoId' de la clave compuesta
    @JoinColumn(name = "recurso_id")
    private Recurso recurso;
}