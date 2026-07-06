package posta_medica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import posta_medica.model.Atencion;

public interface AtencionRepository
        extends JpaRepository<Atencion, String> {
}
