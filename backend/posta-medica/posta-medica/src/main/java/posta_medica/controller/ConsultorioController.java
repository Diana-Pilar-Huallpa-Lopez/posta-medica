package posta_medica.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import posta_medica.model.Consultorio;
import posta_medica.repository.ConsultorioRepository;

import java.util.List;

@RestController
@RequestMapping("/consultorios")
@CrossOrigin("*")
public class ConsultorioController {

    @Autowired
    private ConsultorioRepository consultorioRepository;

    // LISTAR
    @GetMapping
    public List<Consultorio> listar() {
        return consultorioRepository.findAll();
    }

    // BUSCAR
    @GetMapping("/{id}")
    public Consultorio buscar(@PathVariable Integer id) {
        return consultorioRepository.findById(id).orElse(null);
    }

    // REGISTRAR
    @PostMapping
    public Consultorio registrar(
            @RequestBody Consultorio consultorio) {

        return consultorioRepository.save(consultorio);
    }

    // EDITAR
    @PutMapping("/{id}")
    public Consultorio editar(
            @PathVariable Integer id,
            @RequestBody Consultorio datos) {

        Consultorio consultorio =
                consultorioRepository.findById(id).orElse(null);

        if (consultorio != null) {

            consultorio.setNombre(datos.getNombre());
            consultorio.setUbicacion(datos.getUbicacion());
            consultorio.setEstado(datos.getEstado());

            return consultorioRepository.save(consultorio);
        }

        return null;
    }

    // ELIMINAR
    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Integer id) {

        consultorioRepository.deleteById(id);

        return "Consultorio eliminado";
    }

}
