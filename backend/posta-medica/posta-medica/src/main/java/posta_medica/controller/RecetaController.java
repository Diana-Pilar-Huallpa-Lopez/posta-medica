package posta_medica.controller;

import org.springframework.beans.factory.annotation.*;
import org.springframework.web.bind.annotation.*;
import posta_medica.model.Receta;
import posta_medica.repository.RecetaRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/recetas")
@CrossOrigin("*")
public class RecetaController {

    @Autowired
    private RecetaRepository recetaRepository;

    @GetMapping
    public List<Receta> listar() {
        return recetaRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Receta> buscar(@PathVariable String id) {
        return recetaRepository.findById(id);
    }

    @PostMapping
    public Receta registrar(@RequestBody Receta receta) {
        return recetaRepository.save(receta);
    }

    @PutMapping("/{id}")
    public Receta actualizar(@PathVariable String id,
                             @RequestBody Receta receta) {

        receta.setIdReceta(id);

        return recetaRepository.save(receta);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        recetaRepository.deleteById(id);
    }

}
