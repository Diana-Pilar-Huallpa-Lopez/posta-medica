package posta_medica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import posta_medica.model.Usuario;

import java.util.Optional;

public interface UsuarioRepository
        extends JpaRepository<Usuario,String> {

    Optional<Usuario>findByUsername(String username);

    Optional<Usuario>findByEmail(String email);
}
