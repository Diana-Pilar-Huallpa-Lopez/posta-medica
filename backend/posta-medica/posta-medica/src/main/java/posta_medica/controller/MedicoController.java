package posta_medica.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import posta_medica.model.Medico;
import posta_medica.model.Usuario;
import posta_medica.repository.MedicoRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/medicos")
@CrossOrigin("*")
public class MedicoController {

    @Autowired
    private MedicoRepository medicoRepository;

    // LISTAR
    @GetMapping
    public List<Medico> listar() {
        return medicoRepository.findAll();
    }

    // BUSCAR
    @GetMapping("/{id}")
    public Medico buscar(@PathVariable String id) {
        return medicoRepository.findById(id).orElse(null);
    }

    // REGISTRAR
    @PostMapping
    public Medico registrar(@RequestBody Medico medico) {
        return medicoRepository.save(medico);
    }

    // ELIMINAR
    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable String id) {

        medicoRepository.deleteById(id);

        return "Medico eliminado";
    }

    // ACTUALIZAR
    @PutMapping("/{id}")
    public Medico actualizar(@PathVariable String id,
                             @RequestBody Medico medicoActualizado) {

        Medico medico = medicoRepository.findById(id).orElse(null);

        if (medico == null) {
            return null;
        }

        medico.setNombre(medicoActualizado.getNombre());
        medico.setApellido(medicoActualizado.getApellido());
        medico.setTelefono(medicoActualizado.getTelefono());
        medico.setDireccion(medicoActualizado.getDireccion());
        medico.setFechaNacimiento(medicoActualizado.getFechaNacimiento());
        medico.setSexo(medicoActualizado.getSexo());
        medico.setEspecialidad(medicoActualizado.getEspecialidad());
        medico.setUsuario(medicoActualizado.getUsuario());

        return medicoRepository.save(medico);
    }

}
