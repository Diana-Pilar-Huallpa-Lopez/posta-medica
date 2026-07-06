package posta_medica.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "receta")
public class Receta {

    @Id
    @Column(name = "id_receta")
    private String idReceta;

    @OneToOne
    @JoinColumn(name = "id_atencion")
    private Atencion atencion;

    @Column(name = "fecha_emision")
    private LocalDateTime fechaEmision;

    private String observaciones;

    private String estado;

    public Receta() {
    }

    public Receta(String idReceta, Atencion atencion, LocalDateTime fechaEmision, String observaciones, String estado) {
        this.idReceta = idReceta;
        this.atencion = atencion;
        this.fechaEmision = fechaEmision;
        this.observaciones = observaciones;
        this.estado = estado;
    }

    public String getIdReceta() {
        return idReceta;
    }

    public void setIdReceta(String idReceta) {
        this.idReceta = idReceta;
    }

    public Atencion getAtencion() {
        return atencion;
    }

    public void setAtencion(Atencion atencion) {
        this.atencion = atencion;
    }

    public LocalDateTime getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDateTime fechaEmision) {
        this.fechaEmision = fechaEmision;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
