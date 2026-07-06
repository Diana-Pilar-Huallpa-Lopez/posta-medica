package posta_medica.model;

import jakarta.persistence.*;

@Entity
@Table(name = "receta_medicamento")
public class RecetaMedicamento {

    @Id
    @Column(name = "id_receta_medicamento")
    private String idRecetaMedicamento;

    @ManyToOne
    @JoinColumn(name = "id_receta")
    private Receta receta;

    @ManyToOne
    @JoinColumn(name = "id_medicamento")
    private Medicamento medicamento;

    private String dosis;

    private String frecuencia;

    private String duracion;

    private String indicaciones;


    public RecetaMedicamento() {
    }

    public RecetaMedicamento(String idRecetaMedicamento, Medicamento medicamento, Receta receta, String dosis, String frecuencia, String duracion, String indicaciones) {
        this.idRecetaMedicamento = idRecetaMedicamento;
        this.medicamento = medicamento;
        this.receta = receta;
        this.dosis = dosis;
        this.frecuencia = frecuencia;
        this.duracion = duracion;
        this.indicaciones = indicaciones;
    }

    public String getIdRecetaMedicamento() {
        return idRecetaMedicamento;
    }

    public void setIdRecetaMedicamento(String idRecetaMedicamento) {
        this.idRecetaMedicamento = idRecetaMedicamento;
    }

    public Receta getReceta() {
        return receta;
    }

    public void setReceta(Receta receta) {
        this.receta = receta;
    }

    public String getDosis() {
        return dosis;
    }

    public void setDosis(String dosis) {
        this.dosis = dosis;
    }

    public Medicamento getMedicamento() {
        return medicamento;
    }

    public void setMedicamento(Medicamento medicamento) {
        this.medicamento = medicamento;
    }

    public String getFrecuencia() {
        return frecuencia;
    }

    public void setFrecuencia(String frecuencia) {
        this.frecuencia = frecuencia;
    }

    public String getDuracion() {
        return duracion;
    }

    public void setDuracion(String duracion) {
        this.duracion = duracion;
    }

    public String getIndicaciones() {
        return indicaciones;
    }

    public void setIndicaciones(String indicaciones) {
        this.indicaciones = indicaciones;
    }
}
