package com.sistema.demo.entidad;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SolicitudRecursoId implements Serializable {

    private Long solicitudId;
    private Long recursoId;

    public SolicitudRecursoId() {}

    public SolicitudRecursoId(Long solicitudId, Long recursoId) {
        this.solicitudId = solicitudId;
        this.recursoId = recursoId;
    }

    public Long getSolicitudId() { return solicitudId; }
    public void setSolicitudId(Long solicitudId) { this.solicitudId = solicitudId; }

    public Long getRecursoId() { return recursoId; }
    public void setRecursoId(Long recursoId) { this.recursoId = recursoId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SolicitudRecursoId)) return false;
        SolicitudRecursoId that = (SolicitudRecursoId) o;
        return Objects.equals(getSolicitudId(), that.getSolicitudId()) &&
               Objects.equals(getRecursoId(), that.getRecursoId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getSolicitudId(), getRecursoId());
    }
}