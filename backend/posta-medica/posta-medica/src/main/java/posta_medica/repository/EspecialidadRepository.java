package posta_medica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import posta_medica.model.Especialidad;

public interface EspecialidadRepository
    extends JpaRepository<Especialidad, Integer>{

    }



