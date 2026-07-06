package posta_medica.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import posta_medica.model.Paciente;
import posta_medica.repository.PacienteRepository;

import java.util.List;

@RestController
@RequestMapping("/pacientes")
@CrossOrigin("*")
public class PacienteController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @GetMapping
    public List<Paciente> listarPacientes(){
        return pacienteRepository.findAll();
    }

    @GetMapping("/dni/{dni}")
    public Paciente buscarPorDni(@PathVariable String Dni) {
        return pacienteRepository.findByDni(Dni);
    }

    // REGISTRAR
    @PostMapping
    public Paciente registrarPaciente(@RequestBody Paciente paciente) {
        return pacienteRepository.save(paciente);
    }

    // EDITAR
    @PutMapping("/{id}")
    public Paciente editarPaciente(@PathVariable String id,
                                   @RequestBody Paciente datos) {

        Paciente paciente = pacienteRepository.findById(id).orElse(null);

        if (paciente != null) {

            paciente.setNombre(datos.getNombre());
            paciente.setApellido(datos.getApellido());
            paciente.setTelefono(datos.getTelefono());
            paciente.setDireccion(datos.getDireccion());
            paciente.setFechaNacimiento(datos.getFechaNacimiento());
            paciente.setSexo(datos.getSexo());
            paciente.setDni(datos.getDni());

            return pacienteRepository.save(paciente);
        }

        return null;
    }

    // ELIMINAR
    @DeleteMapping("/{id}")
    public String eliminarPaciente(@PathVariable String id) {

        pacienteRepository.deleteById(id);

        return "Paciente eliminado";
    }

}
