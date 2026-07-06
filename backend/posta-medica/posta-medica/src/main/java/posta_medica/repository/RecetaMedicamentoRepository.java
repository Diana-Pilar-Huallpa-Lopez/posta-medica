package posta_medica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import posta_medica.model.RecetaMedicamento;

public interface RecetaMedicamentoRepository
        extends JpaRepository<RecetaMedicamento, String> {
}
