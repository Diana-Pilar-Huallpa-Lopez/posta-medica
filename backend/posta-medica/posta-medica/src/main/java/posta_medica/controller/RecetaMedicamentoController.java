package posta_medica.controller;

import org.springframework.beans.factory.annotation.*;
import org.springframework.web.bind.annotation.*;
import posta_medica.model.RecetaMedicamento;
import posta_medica.repository.RecetaMedicamentoRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/receta-medicamentos")
@CrossOrigin("*")
public class RecetaMedicamentoController {

    @Autowired
    private RecetaMedicamentoRepository recetaMedicamentoRepository;

    @GetMapping
    public List<RecetaMedicamento> listar() {
        return recetaMedicamentoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<RecetaMedicamento> buscar(@PathVariable String id) {
        return recetaMedicamentoRepository.findById(id);
    }

    @PostMapping
    public RecetaMedicamento registrar(
            @RequestBody RecetaMedicamento recetaMedicamento) {

        return recetaMedicamentoRepository.save(recetaMedicamento);
    }

    @PutMapping("/{id}")
    public RecetaMedicamento actualizar(@PathVariable String id,
                                        @RequestBody RecetaMedicamento recetaMedicamento) {

        recetaMedicamento.setIdRecetaMedicamento(id);

        return recetaMedicamentoRepository.save(recetaMedicamento);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        recetaMedicamentoRepository.deleteById(id);
    }
}
