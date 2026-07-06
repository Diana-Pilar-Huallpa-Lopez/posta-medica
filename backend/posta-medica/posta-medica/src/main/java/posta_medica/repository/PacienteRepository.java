package posta_medica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import posta_medica.model.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, String> {

    Paciente findByDni(String dni);
}
