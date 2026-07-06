package posta_medica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import posta_medica.model.HorarioMedico;

import java.util.List;

public interface HorarioMedicoRepository
        extends JpaRepository<HorarioMedico, Integer> {

    List<HorarioMedico> findByMedico_IdMedico(String idMedico);

}
