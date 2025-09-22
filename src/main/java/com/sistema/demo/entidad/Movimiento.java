package com.sistema.demo.entidad;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Movimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre_solicitante;
    private String destino;
    private Date fecha;
    private String tipo;
    private int cantidad;
    private String motivo;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario generadoPor;

    @ManyToOne
    @JoinColumn(name = "recurso_id")
    private Recurso recurso;

}
