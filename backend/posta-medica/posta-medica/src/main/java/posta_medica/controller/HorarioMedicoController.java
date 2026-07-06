package posta_medica.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import posta_medica.model.HorarioMedico;
import posta_medica.repository.HorarioMedicoRepository;

import java.util.List;

@RestController
@RequestMapping("/horarios")
@CrossOrigin("*")
public class HorarioMedicoController {

    @Autowired
    private HorarioMedicoRepository horarioRepository;

    // LISTAR
    @GetMapping
    public List<HorarioMedico> listar() {
        return horarioRepository.findAll();
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public HorarioMedico buscar(@PathVariable Integer id) {
        return horarioRepository.findById(id).orElse(null);
    }

    // BUSCAR HORARIOS DE UN MEDICO
    @GetMapping("/medico/{idMedico}")
    public List<HorarioMedico> buscarPorMedico(
            @PathVariable String idMedico) {

        return horarioRepository.findByMedico_IdMedico(idMedico);
    }

    // REGISTRAR
    @PostMapping
    public HorarioMedico registrar(
            @RequestBody HorarioMedico horario) {

        return horarioRepository.save(horario);
    }

    // EDITAR
    @PutMapping("/{id}")
    public HorarioMedico editar(
            @PathVariable Integer id,
            @RequestBody HorarioMedico datos) {

        HorarioMedico horario =
                horarioRepository.findById(id).orElse(null);

        if (horario != null) {

            horario.setDiaSemana(datos.getDiaSemana());
            horario.setHoraInicio(datos.getHoraInicio());
            horario.setHoraFin(datos.getHoraFin());
            horario.setEstado(datos.getEstado());
            horario.setMedico(datos.getMedico());

            return horarioRepository.save(horario);
        }

        return null;
    }

    // ELIMINAR
    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Integer id) {

        horarioRepository.deleteById(id);

        return "Horario eliminado";
    }
}
