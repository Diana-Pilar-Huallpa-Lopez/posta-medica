package posta_medica.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import posta_medica.model.Atencion;
import posta_medica.repository.AtencionRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/atencion")
@CrossOrigin("*")
public class AtencionController {


        @Autowired
        private AtencionRepository atencionRepository;

        // LISTAR
        @GetMapping
        public List<Atencion> listar() {
            return atencionRepository.findAll();
        }

        // BUSCAR POR ID
        @GetMapping("/{id}")
        public Optional<Atencion> buscar(@PathVariable String id) {
            return atencionRepository.findById(id);
        }

        // REGISTRAR
        @PostMapping
        public Atencion registrar(@RequestBody Atencion atencion) {
            return atencionRepository.save(atencion);
        }

        // ACTUALIZAR
        @PutMapping("/{id}")
        public Atencion actualizar(@PathVariable String id,
                                   @RequestBody Atencion atencion) {

            atencion.setIdAtencion(id);

            return atencionRepository.save(atencion);
        }

        // ELIMINAR
        @DeleteMapping("/{id}")
        public void eliminar(@PathVariable String id) {
            atencionRepository.deleteById(id);
        }

}
