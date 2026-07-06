package posta_medica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import posta_medica.model.Consultorio;

public interface ConsultorioRepository
        extends JpaRepository<Consultorio, Integer>{
}
