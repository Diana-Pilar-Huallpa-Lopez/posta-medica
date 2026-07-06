package posta_medica.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.server.ResponseStatusException;
import posta_medica.Service.EmailService;
import posta_medica.model.Cita;
import posta_medica.model.HorarioMedico;
import posta_medica.model.Medico;
import posta_medica.model.Paciente;
import posta_medica.repository.CitaRepository;
import posta_medica.repository.HorarioMedicoRepository;
import posta_medica.repository.MedicoRepository;
import posta_medica.repository.PacienteRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/citas")
@CrossOrigin("*")
public class CitaController {

    @Autowired private CitaRepository citaRepository;
    @Autowired private PacienteRepository pacienteRepository;
    @Autowired private MedicoRepository medicoRepository;
    @Autowired private EmailService emailService;
    @Autowired private HorarioMedicoRepository horarioRepository;

    // ── GET: Listar todas ──────────────────────────────────
    @GetMapping
    public List<Cita> listar() {
        return citaRepository.findAll();
    }

    // ── GET: Buscar por ID ─────────────────────────────────
    @GetMapping("/{id}")
    public Cita buscar(@PathVariable String id) {
        return citaRepository.findById(id).orElse(null);
    }

    // ── GET: Horas ocupadas de un médico en una fecha ──────
    // Usado por el frontend para mostrar disponibilidad
    @GetMapping("/ocupadas")
    public ResponseEntity<?> horasOcupadas(
            @RequestParam String idMedico,
            @RequestParam String fecha) {
        try {
            LocalDate localDate = LocalDate.parse(fecha);
            List<Cita> citas = citaRepository.findByMedicoAndFecha(idMedico, localDate);
            // Devolver solo las horas inicio-fin de cada cita ocupada
            List<Map<String, String>> ocupadas = citas.stream().map(c -> Map.of(
                    "horaInicio", c.getHoraInicio().toString(),
                    "horaFin",    c.getHoraFin().toString(),
                    "idCita",     c.getIdCita()
            )).toList();
            return ResponseEntity.ok(ocupadas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ── POST: Registrar cita ───────────────────────────────
    @PostMapping
    public Cita registrarCita(@RequestBody Cita cita) {

        // 1. Validar horario del médico
        validarHorarioDisponible(cita);

        // 2. Validar que no haya conflicto con otra cita
        validarSinConflicto(cita);

        cita.setFechaCreacion(LocalDateTime.now());
        if (cita.getEstado() == null || cita.getEstado().isBlank()) {
            cita.setEstado("PENDIENTE");
        }

        Cita citaGuardada = citaRepository.save(cita);
        Cita citaCompleta = citaRepository.findById(citaGuardada.getIdCita()).orElse(citaGuardada);

        // Correo al paciente
        try {
            Paciente paciente = citaCompleta.getPaciente();
            if (paciente != null && paciente.getUsuario() != null) {
                String email = paciente.getUsuario().getEmail();
                String nombre = paciente.getNombre() + " " + paciente.getApellido();
                if (email != null && !email.isBlank())
                    emailService.enviarConfirmacionCita(email, nombre, citaCompleta);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Correo paciente: " + e.getMessage());
        }

        // Correo al médico
        try {
            Medico medico = citaCompleta.getMedico();
            if (medico != null && medico.getUsuario() != null) {
                String email = medico.getUsuario().getEmail();
                String nombre = medico.getNombre() + " " + medico.getApellido();
                if (email != null && !email.isBlank())
                    emailService.enviarNotificacionMedico(email, nombre, citaCompleta);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Correo médico: " + e.getMessage());
        }

        return citaGuardada;
    }

    // ── PUT: Actualizar estado ─────────────────────────────
    @PutMapping("/{id}")
    public Cita actualizarEstado(@PathVariable String id, @RequestBody Cita citaActualizada) {
        Cita cita = citaRepository.findById(id).orElse(null);
        if (cita == null) return null;
        cita.setEstado(citaActualizada.getEstado());
        return citaRepository.save(cita);
    }

    // ── DELETE ─────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable String id) {
        citaRepository.deleteById(id);
        return "Cita eliminada";
    }

    // ── VALIDACIONES PRIVADAS ──────────────────────────────

    private void validarSinConflicto(Cita cita) {
        List<Cita> conflictos = citaRepository.findConflictos(
                cita.getMedico().getIdMedico(),
                cita.getFechaCita(),
                cita.getHoraInicio(),
                cita.getHoraFin()
        );
        // Excluir la propia cita si es una actualización
        boolean hayConflicto = conflictos.stream()
                .anyMatch(c -> !c.getIdCita().equals(cita.getIdCita()));

        if (hayConflicto) {
            Cita c = conflictos.get(0);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El médico ya tiene una cita de " +
                            c.getHoraInicio() + " a " + c.getHoraFin() +
                            " en esa fecha. Por favor elige otro horario."
            );
        }
    }

    private void validarHorarioDisponible(Cita cita) {
        if (cita.getMedico() == null || cita.getMedico().getIdMedico() == null
                || cita.getMedico().getIdMedico().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un médico válido.");
        }
        if (cita.getFechaCita() == null || cita.getHoraInicio() == null || cita.getHoraFin() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completa fecha, hora inicio y hora fin.");
        }
        if (!cita.getHoraFin().isAfter(cita.getHoraInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La hora fin debe ser mayor a la hora inicio.");
        }

        String diaSemana = convertirDia(cita.getFechaCita().getDayOfWeek());
        List<HorarioMedico> horarios = horarioRepository.findByMedico_IdMedico(cita.getMedico().getIdMedico());

        boolean dentroDeHorario = horarios.stream().anyMatch(h ->
                diaSemana.equalsIgnoreCase(h.getDiaSemana())
                        && "ACTIVO".equalsIgnoreCase(String.valueOf(h.getEstado()).trim())
                        && h.getHoraInicio() != null && h.getHoraFin() != null
                        && !cita.getHoraInicio().isBefore(h.getHoraInicio())
                        && !cita.getHoraFin().isAfter(h.getHoraFin())
        );

        if (!dentroDeHorario) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El médico no atiende ese día u horario. Revisa su disponibilidad.");
        }
    }

    private String convertirDia(DayOfWeek d) {
        return switch (d) {
            case MONDAY -> "LUNES";
            case TUESDAY -> "MARTES";
            case WEDNESDAY -> "MIERCOLES";
            case THURSDAY -> "JUEVES";
            case FRIDAY -> "VIERNES";
            case SATURDAY -> "SABADO";
            case SUNDAY -> "DOMINGO";
        };
    }
}
