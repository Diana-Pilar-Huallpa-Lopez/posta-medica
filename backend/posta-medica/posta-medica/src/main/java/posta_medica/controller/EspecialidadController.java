package posta_medica.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import posta_medica.model.Especialidad;
import posta_medica.model.Medico;
import posta_medica.repository.EspecialidadRepository;

import java.util.List;

@RestController
@RequestMapping("/especialidad")
@CrossOrigin("*")
public class EspecialidadController {

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @GetMapping
    public List<Especialidad> listar() {
        return especialidadRepository.findAll();
    }

    @PostMapping
    public Especialidad registrar(
            @RequestBody Especialidad especialidad) {

        return especialidadRepository.save(especialidad);
    }

    @PutMapping("/{id}")
    public Especialidad actualizar(@PathVariable Integer id,
                                   @RequestBody Especialidad nueva) {

        Especialidad especialidad =
                especialidadRepository.findById(id).orElse(null);

        if (especialidad == null) {
            return null;
        }

        especialidad.setNombre(nueva.getNombre());
        especialidad.setDescripcion(nueva.getDescripcion());

        return especialidadRepository.save(especialidad);
    }

}
