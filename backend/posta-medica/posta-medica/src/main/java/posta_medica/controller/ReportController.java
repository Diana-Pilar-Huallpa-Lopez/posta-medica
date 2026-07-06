package posta_medica.controller;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import posta_medica.Service.EmailService;
import posta_medica.model.Atencion;
import posta_medica.repository.AtencionRepository;

import javax.sql.DataSource;
import java.io.InputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/reportes")
@CrossOrigin("*")
public class ReportController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private AtencionRepository atencionRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping("/receta/{idAtencion}")
    public ResponseEntity<byte[]> generarReceta(@PathVariable String idAtencion) {
        try {
            ClassPathResource mainReport = new ClassPathResource("reports/receta_medica.jrxml");
            ClassPathResource subReport = new ClassPathResource("reports/receta_medicamentos.jrxml");

            if (!mainReport.exists()) {
                return ResponseEntity.status(404)
                        .body("Archivo receta_medica.jrxml no encontrado en resources/reports/".getBytes());
            }
            if (!subReport.exists()) {
                return ResponseEntity.status(404)
                        .body("Archivo receta_medicamentos.jrxml no encontrado en resources/reports/".getBytes());
            }

            Map<String, Object> params = new HashMap<>();
            params.put("PARAM_ID_ATENCION", idAtencion);

            try (Connection conn = dataSource.getConnection();
                 InputStream mainStream = mainReport.getInputStream();
                 InputStream subStream = subReport.getInputStream()) {

                JasperReport jasperReport = JasperCompileManager.compileReport(mainStream);
                JasperReport jasperSubReport = JasperCompileManager.compileReport(subStream);
                params.put("PARAM_SUBREPORT", jasperSubReport);

                JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, conn);
                byte[] pdfBytes = JasperExportManager.exportReportToPdf(jasperPrint);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("attachment", "receta_" + idAtencion + ".pdf");
                headers.setContentLength(pdfBytes.length);

                System.out.println("Receta generada correctamente para atencion: " + idAtencion);
                return ResponseEntity.ok().headers(headers).body(pdfBytes);
            }
        } catch (Exception e) {
            System.err.println("Error al generar receta: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(("Error al generar receta: " + e.getMessage()).getBytes());
        }
    }

    @PostMapping("/receta/{idAtencion}/enviar")
    public ResponseEntity<String> enviarReceta(@PathVariable String idAtencion) {
        Optional<Atencion> atencionOpt = atencionRepository.findById(idAtencion);
        if (atencionOpt.isEmpty()) {
            return ResponseEntity.status(404).body("No se encontró la atención " + idAtencion + ".");
        }

        ResponseEntity<byte[]> reporte = generarReceta(idAtencion);
        if (!reporte.getStatusCode().is2xxSuccessful() || reporte.getBody() == null) {
            return ResponseEntity.status(500).body("No se pudo generar el PDF de la receta.");
        }

        boolean enviado = emailService.enviarRecetaPorCorreo(atencionOpt.get(), reporte.getBody());
        if (!enviado) {
            return ResponseEntity.status(502)
                    .body("No se pudo enviar el correo. Verifica el email del paciente y la configuración SMTP.");
        }

        return ResponseEntity.ok("Receta enviada correctamente al correo del paciente.");
    }
}
