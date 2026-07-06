package posta_medica.Service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import posta_medica.model.Cita;

@Service
public class EmailService {

    // Spring inyecta automáticamente el JavaMailSender
    // configurado en application.properties
    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remitente;

    // ─────────────────────────────────────────────────────
    // MÉTODO BASE: envía cualquier correo HTML
    // ─────────────────────────────────────────────────────
    private void enviarCorreo(String destinatario, String asunto, String cuerpoHtml) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();

            // MimeMessageHelper de Spring simplifica el armado del correo
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(remitente, "Posta Médica");
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // true = es HTML

            mailSender.send(mensaje);
            System.out.println("✅ Correo enviado a: " + destinatario);

        } catch (Exception e) {
            System.err.println("❌ Error al enviar correo a " + destinatario + ": " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────
    // CORREO 1: Bienvenida al registrarse
    // ─────────────────────────────────────────────────────
    public void enviarBienvenida(String destinatario, String nombrePaciente, String username) {
        String asunto = "¡Bienvenido/a a Posta Médica, " + nombrePaciente + "!";
        String html = """
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f7fb;border-radius:10px;overflow:hidden">
              <div style="background:#0f766e;padding:32px 28px;text-align:center">
                <div style="display:inline-block;background:#fff;border-radius:8px;width:50px;height:50px;line-height:50px;font-size:28px;font-weight:900;color:#0f766e;text-align:center">+</div>
                <h1 style="color:#fff;margin:12px 0 0;font-size:24px">Posta Médica</h1>
              </div>
              <div style="background:#fff;padding:32px 28px">
                <h2 style="color:#16212a;margin:0 0 12px">¡Hola, %s!</h2>
                <p style="color:#607080;line-height:1.6;margin:0 0 16px">
                  Tu cuenta ha sido creada exitosamente en el sistema de <strong>Posta Médica</strong>.
                  Ya puedes acceder y reservar tus citas médicas en línea.
                </p>
                <div style="background:#f0faf8;border-left:4px solid #0f766e;border-radius:0 8px 8px 0;padding:14px 16px;margin:20px 0">
                  <p style="margin:0;color:#0f766e;font-weight:700">Tus datos de acceso</p>
                  <p style="margin:6px 0 0;color:#324350">Usuario: <strong>%s</strong></p>
                </div>
                <p style="color:#607080;font-size:13px;margin:20px 0 0">
                  Si no creaste esta cuenta, ignora este correo o contáctanos.
                </p>
              </div>
              <div style="background:#f8fafc;padding:16px 28px;text-align:center;border-top:1px solid #d9e2e7">
                <p style="color:#9ab0bd;font-size:12px;margin:0">© 2026 Posta Médica — Sistema de Gestión Clínica</p>
              </div>
            </div>
            """.formatted(nombrePaciente, username);

        enviarCorreo(destinatario, asunto, html);
    }

    // ─────────────────────────────────────────────────────
    // CORREO 2: Confirmación de cita al paciente
    // ─────────────────────────────────────────────────────
    public void enviarConfirmacionCita(String destinatario, String nombrePaciente, Cita cita) {
        String medico = (cita.getMedico() != null)
                ? "Dr(a). " + cita.getMedico().getNombre() + " " + cita.getMedico().getApellido()
                : "Por asignar";
        String especialidad = (cita.getMedico() != null && cita.getMedico().getEspecialidad() != null)
                ? cita.getMedico().getEspecialidad().getNombre() : "—";
        String consultorio = (cita.getConsultorio() != null)
                ? cita.getConsultorio().getNombre() : "Por asignar";
        String fecha    = cita.getFechaCita()   != null ? cita.getFechaCita().toString()   : "—";
        String horaIni  = cita.getHoraInicio()  != null ? cita.getHoraInicio().toString()  : "—";
        String horaFin  = cita.getHoraFin()     != null ? cita.getHoraFin().toString()     : "—";
        String motivo   = cita.getMotivo()      != null ? cita.getMotivo()                 : "—";

        String asunto = "✅ Cita registrada — " + fecha + " | Posta Médica";
        String html = """
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f7fb;border-radius:10px;overflow:hidden">
              <div style="background:#0f766e;padding:28px;text-align:center">
                <div style="display:inline-block;background:#fff;border-radius:8px;width:48px;height:48px;line-height:48px;font-size:26px;font-weight:900;color:#0f766e;text-align:center">+</div>
                <h1 style="color:#fff;margin:10px 0 0;font-size:22px">Posta Médica</h1>
                <p style="color:#a7d8d2;margin:4px 0 0;font-size:14px">Confirmación de cita médica</p>
              </div>
              <div style="background:#fff;padding:28px">
                <h2 style="color:#16212a;margin:0 0 8px">Hola, %s</h2>
                <p style="color:#607080;line-height:1.6;margin:0 0 20px">
                  Tu cita ha sido registrada correctamente. A continuación los detalles:
                </p>
                <table style="width:100%%;border-collapse:collapse">
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700;width:40%%">Médico</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700">Especialidad</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700">Fecha</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700">Horario</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a">%s — %s</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700">Consultorio</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700">Motivo</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700">Estado</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7">
                      <span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700">PENDIENTE</span>
                    </td>
                  </tr>
                </table>
                <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:14px 16px;margin:20px 0 0">
                  <p style="margin:0;color:#92400e;font-size:13px">
                    ⚠️ Por favor, preséntate 10 minutos antes de tu cita. Si necesitas cancelar, hazlo con anticipación desde el sistema.
                  </p>
                </div>
              </div>
              <div style="background:#f8fafc;padding:16px 28px;text-align:center;border-top:1px solid #d9e2e7">
                <p style="color:#9ab0bd;font-size:12px;margin:0">© 2026 Posta Médica — Sistema de Gestión Clínica</p>
              </div>
            </div>
            """.formatted(nombrePaciente, medico, especialidad, fecha, horaIni, horaFin, consultorio, motivo);

        enviarCorreo(destinatario, asunto, html);
    }

    // ─────────────────────────────────────────────────────
    // CORREO 3: Notificación al médico de nueva cita
    // ─────────────────────────────────────────────────────
    public void enviarNotificacionMedico(String destinatario, String nombreMedico, Cita cita) {
        String paciente = (cita.getPaciente() != null)
                ? cita.getPaciente().getNombre() + " " + cita.getPaciente().getApellido() : "—";
        String fecha   = cita.getFechaCita()   != null ? cita.getFechaCita().toString()   : "—";
        String horaIni = cita.getHoraInicio()  != null ? cita.getHoraInicio().toString()  : "—";
        String horaFin = cita.getHoraFin()     != null ? cita.getHoraFin().toString()     : "—";
        String motivo  = cita.getMotivo()      != null ? cita.getMotivo()                 : "—";

        String asunto = "📋 Nueva cita asignada — " + fecha + " | Posta Médica";
        String html = """
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f7fb;border-radius:10px;overflow:hidden">
              <div style="background:#102a32;padding:28px;text-align:center">
                <div style="display:inline-block;background:#0f766e;border-radius:8px;width:48px;height:48px;line-height:48px;font-size:26px;font-weight:900;color:#fff;text-align:center">+</div>
                <h1 style="color:#fff;margin:10px 0 0;font-size:22px">Posta Médica</h1>
                <p style="color:#7a9ca5;margin:4px 0 0;font-size:14px">Notificación para el médico</p>
              </div>
              <div style="background:#fff;padding:28px">
                <h2 style="color:#16212a;margin:0 0 8px">Dr(a). %s</h2>
                <p style="color:#607080;line-height:1.6;margin:0 0 20px">
                  Se ha registrado una nueva cita en su agenda:
                </p>
                <table style="width:100%%;border-collapse:collapse">
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700;width:40%%">Paciente</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a;font-weight:700">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700">Fecha</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700">Horario</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a">%s — %s</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 14px;background:#f8fafc;border:1px solid #d9e2e7;color:#455767;font-size:13px;font-weight:700">Motivo</td>
                    <td style="padding:11px 14px;border:1px solid #d9e2e7;color:#16212a">%s</td>
                  </tr>
                </table>
                <div style="background:#dbeafe;border:1px solid #93c5fd;border-radius:8px;padding:14px 16px;margin:20px 0 0">
                  <p style="margin:0;color:#1d4ed8;font-size:13px">
                    ℹ️ Puedes ver el detalle completo en el sistema de gestión de Posta Médica.
                  </p>
                </div>
              </div>
              <div style="background:#f8fafc;padding:16px 28px;text-align:center;border-top:1px solid #d9e2e7">
                <p style="color:#9ab0bd;font-size:12px;margin:0">© 2026 Posta Médica — Sistema de Gestión Clínica</p>
              </div>
            </div>
            """.formatted(nombreMedico, paciente, fecha, horaIni, horaFin, motivo);

        enviarCorreo(destinatario, asunto, html);
    }

    // ─────────────────────────────────────────────────────
    // CORREO 4: Receta médica con PDF adjunto al paciente
    // ─────────────────────────────────────────────────────
    public boolean enviarRecetaPorCorreo(posta_medica.model.Atencion atencion, byte[] pdfBytes) {
        try {
            String emailPaciente = atencion.getCita().getPaciente().getUsuario().getEmail();
            String nombrePaciente = atencion.getCita().getPaciente().getNombre()
                    + " " + atencion.getCita().getPaciente().getApellido();
            String nombreMedico = "Dr(a). " + atencion.getCita().getMedico().getNombre()
                    + " " + atencion.getCita().getMedico().getApellido();

            if (emailPaciente == null || emailPaciente.isBlank()) {
                System.err.println("⚠️ No se puede enviar receta: el paciente no tiene email.");
                return false;
            }

            String asunto = "📋 Tu receta médica — Posta Médica";
            String html = """
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f7fb;border-radius:10px;overflow:hidden">
                  <div style="background:#0f766e;padding:28px;text-align:center">
                    <div style="display:inline-block;background:#fff;border-radius:8px;width:48px;height:48px;line-height:48px;font-size:26px;font-weight:900;color:#0f766e;text-align:center">+</div>
                    <h1 style="color:#fff;margin:10px 0 0;font-size:22px">Posta Médica</h1>
                    <p style="color:#a7d8d2;margin:4px 0 0;font-size:14px">Receta médica adjunta</p>
                  </div>
                  <div style="background:#fff;padding:28px">
                    <h2 style="color:#16212a;margin:0 0 8px">Hola, %s</h2>
                    <p style="color:#607080;line-height:1.6;margin:0 0 16px">
                      Tu médico <strong>%s</strong> ha generado tu receta médica.
                      Encuéntrala adjunta en este correo en formato PDF.
                    </p>
                    <div style="background:#f0faf8;border-left:4px solid #0f766e;border-radius:0 8px 8px 0;padding:14px 16px;margin:16px 0">
                      <p style="margin:0;color:#0f766e;font-size:13px">
                        Archivo adjunto: <strong>receta_medica.pdf</strong>
                      </p>
                    </div>
                    <p style="color:#607080;font-size:13px;margin:16px 0 0">
                      Conserva este documento para tu historial médico personal.
                    </p>
                  </div>
                  <div style="background:#f8fafc;padding:16px 28px;text-align:center;border-top:1px solid #d9e2e7">
                    <p style="color:#9ab0bd;font-size:12px;margin:0">© 2026 Posta Médica</p>
                  </div>
                </div>
                """.formatted(nombrePaciente, nombreMedico);

            jakarta.mail.internet.MimeMessage mensaje = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper =
                    new org.springframework.mail.javamail.MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(remitente, "Posta Médica");
            helper.setTo(emailPaciente);
            helper.setSubject(asunto);
            helper.setText(html, true);
            helper.addAttachment("receta_medica.pdf",
                    new org.springframework.core.io.ByteArrayResource(pdfBytes),
                    "application/pdf");

            mailSender.send(mensaje);
            System.out.println("✅ Receta enviada por correo a: " + emailPaciente);
            return true;

        } catch (Exception e) {
            System.err.println("❌ Error al enviar receta: " + e.getMessage());
            return false;
        }
    }

}
