package posta_medica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import posta_medica.model.Cita;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface CitaRepository
        extends JpaRepository<Cita, String> {

    // Buscar citas de un médico en una fecha y rango de horas
    // para detectar solapamientos
    @Query("""
        SELECT c FROM Cita c
        WHERE c.medico.idMedico = :idMedico
          AND c.fechaCita = :fecha
          AND c.estado NOT IN ('CANCELADA')
          AND (
              (c.horaInicio < :horaFin AND c.horaFin > :horaInicio)
          )
    """)
    List<Cita> findConflictos(
            @Param("idMedico")   String idMedico,
            @Param("fecha")      LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin")    LocalTime horaFin
    );

    // Citas de un médico en una fecha específica (para mostrar horas ocupadas)
    @Query("""
        SELECT c FROM Cita c
        WHERE c.medico.idMedico = :idMedico
          AND c.fechaCita = :fecha
          AND c.estado NOT IN ('CANCELADA')
        ORDER BY c.horaInicio
    """)
    List<Cita> findByMedicoAndFecha(
            @Param("idMedico") String idMedico,
            @Param("fecha")    LocalDate fecha
    );
}


