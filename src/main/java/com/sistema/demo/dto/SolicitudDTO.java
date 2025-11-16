package com.sistema.demo.dto;

import java.util.Date;
import java.util.Set;

public class SolicitudDTO {
    public Long id;
    public String nroTramite;
    public String area;
    public String estado;
    public Date fechaSolicitud;
    public Long solicitanteId;
    public String solicitanteNombre;
    public Set<Long> bienesIds;
}