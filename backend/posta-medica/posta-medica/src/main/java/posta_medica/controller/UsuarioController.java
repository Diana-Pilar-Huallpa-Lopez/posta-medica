package posta_medica.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import posta_medica.Service.EmailService;
import posta_medica.model.Paciente;
import posta_medica.repository.PacienteRepository;
import posta_medica.repository.UsuarioRepository;
import posta_medica.model.Usuario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin("*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private EmailService emailService;

    //Listar Usuario - Get

    @GetMapping
    public List<Usuario>listarUusuarios(){
        return usuarioRepository.findAll();
    }



    // ── POST: Registrar usuario + correo de bienvenida ──────
    @PostMapping
    public Object registrarUsuario(@RequestBody Usuario usuario) {

        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            return "El correo ya existe";
        }
        if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
            return "El username ya existe";
        }

        usuario.setFechaCreacion(LocalDateTime.now());
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        // Buscar si tiene paciente asociado para usar su nombre completo
        // Si no, usamos el username como nombre
        try {
            Optional<Paciente> pacienteOpt = pacienteRepository.findAll().stream()
                    .filter(p -> p.getUsuario() != null
                            && p.getUsuario().getIdUsuario().equals(usuarioGuardado.getIdUsuario()))
                    .findFirst();

            String nombreMostrar = pacienteOpt
                    .map(p -> p.getNombre() + " " + p.getApellido())
                    .orElse(usuarioGuardado.getUsername());

            // Enviar correo de bienvenida en hilo separado para no bloquear la respuesta
            new Thread(() -> emailService.enviarBienvenida(
                    usuarioGuardado.getEmail(),
                    nombreMostrar,
                    usuarioGuardado.getUsername()
            )).start();

        } catch (Exception e) {
            System.err.println("⚠️ No se pudo enviar correo de bienvenida: " + e.getMessage());
        }

        return usuarioGuardado;
    }

    // =========================================
    // ACTUALIZAR USUARIO
    // PUT: /usuarios/USR-001
    // =========================================

    @PutMapping("/{id}")
    public ResponseEntity<Object> actualizarUsuario(
            @PathVariable String id,
            @RequestBody Usuario datosUsuario) {

        Optional<Usuario> optionalUsuario = usuarioRepository.findById(id);

        if (optionalUsuario.isPresent()) {
            Usuario usuario = optionalUsuario.get();

            // Actualizar campos básicos
            usuario.setUsername(datosUsuario.getUsername());
            usuario.setEmail(datosUsuario.getEmail());
            usuario.setEstado(datosUsuario.getEstado());

            // ✅ Actualizar rol si viene en el body
            if (datosUsuario.getRol() != null) {
                usuario.setRol(datosUsuario.getRol());
            }

            // ✅ Solo actualizar contraseña si viene y no está vacía
            if (datosUsuario.getPasswordHash() != null
                    && !datosUsuario.getPasswordHash().isBlank()) {
                usuario.setPasswordHash(datosUsuario.getPasswordHash());
            }

            return ResponseEntity.ok(usuarioRepository.save(usuario));
        }

        return ResponseEntity.status(404).body("Usuario no encontrado: " + id);
    }

    // =========================================
    // ELIMINAR USUARIO
    // DELETE: /usuarios/USR-001
    // =========================================

    @DeleteMapping("/{id}")
    public String eliminarUsuario(@PathVariable String id){

        usuarioRepository.deleteById(id);

        return "Usuario eliminado correctamente";
    }

    // =========================
    // BUSCAR POR EMAIL
    // =========================
    @GetMapping("/email/{email}")
    public Optional<Usuario> buscarPorEmail(@PathVariable String email) {
        return usuarioRepository.findByEmail(email);
    }

}
