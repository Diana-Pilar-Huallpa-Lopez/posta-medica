package posta_medica.model;

import jakarta.persistence.Entity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "atencion")
public class Atencion {

    @Id
    @Column(name = "id_atencion")
    private String idAtencion;

    @OneToOne
    @JoinColumn(name = "id_cita")
    private Cita cita;

    @Column(name = "fecha_atencion")
    private LocalDateTime fechaAtencion;

    @Column(name = "motivo_consulta")
    private String motivoConsulta;

    private String diagnostico;

    public Atencion() {
    }

    public Atencion(String idAtencion, Cita cita, String motivoConsulta, LocalDateTime fechaAtencion, String diagnostico) {
        this.idAtencion = idAtencion;
        this.cita = cita;
        this.motivoConsulta = motivoConsulta;
        this.fechaAtencion = fechaAtencion;
        this.diagnostico = diagnostico;
    }

    public String getIdAtencion() {
        return idAtencion;
    }

    public void setIdAtencion(String idAtencion) {
        this.idAtencion = idAtencion;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    public LocalDateTime getFechaAtencion() {
        return fechaAtencion;
    }

    public void setFechaAtencion(LocalDateTime fechaAtencion) {
        this.fechaAtencion = fechaAtencion;
    }

    public String getMotivoConsulta() {
        return motivoConsulta;
    }

    public void setMotivoConsulta(String motivoConsulta) {
        this.motivoConsulta = motivoConsulta;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

}
