package posta_medica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import posta_medica.model.Medicamento;

public interface MedicamentoRepository
        extends JpaRepository<Medicamento, String> {
}
