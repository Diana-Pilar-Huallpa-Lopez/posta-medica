package posta_medica.controller;

import org.springframework.beans.factory.annotation.*;
import org.springframework.web.bind.annotation.*;
import posta_medica.model.Medicamento;
import posta_medica.repository.MedicamentoRepository;

import java.util.List;

@RestController
@RequestMapping("/medicamentos")
@CrossOrigin("*")
public class MedicamentoController {

    @Autowired
    private MedicamentoRepository medicamentoRepository;

    @GetMapping
    public List<Medicamento> listar() {
        return medicamentoRepository.findAll();
    }

    @PostMapping
    public Medicamento registrar(@RequestBody Medicamento medicamento) {
        return medicamentoRepository.save(medicamento);
    }

    @PutMapping("/{id}")
    public Medicamento actualizar(@PathVariable String id,
                                  @RequestBody Medicamento medicamento) {

        medicamento.setIdMedicamento(id);

        return medicamentoRepository.save(medicamento);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        medicamentoRepository.deleteById(id);
    }

}
