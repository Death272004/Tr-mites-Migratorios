package pa.tramitesmigratorios.seguridad;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

/** Entrega mensajes al servidor SMTP local incluido en el entorno Docker. */
@Component
@ConditionalOnProperty(name = "app.correo.modo", havingValue = "smtp")
class CorreoSmtp implements Correo {

	private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
		.withZone(ZoneId.of("America/Panama"));

	private final JavaMailSender remitenteSmtp;
	private final String remitente;
	private final String portalUrl;

	CorreoSmtp(JavaMailSender remitenteSmtp,
			@Value("${app.correo.remitente}") String remitente,
			@Value("${app.correo.portal-url}") String portalUrl) {
		this.remitenteSmtp = remitenteSmtp;
		this.remitente = remitente;
		this.portalUrl = portalUrl.replaceAll("/+$", "");
	}

	@Override
	public void enviarRecuperacion(String destinatario, String token, Instant expira) {
		String enlace = UriComponentsBuilder.fromUriString(portalUrl + "/recuperar-clave")
			.queryParam("token", token)
			.build()
			.encode()
			.toUriString();

		SimpleMailMessage mensaje = new SimpleMailMessage();
		mensaje.setFrom(remitente);
		mensaje.setTo(destinatario);
		mensaje.setSubject("Restablecimiento de contraseña — Trámites Migratorios");
		mensaje.setText("Se solicitó restablecer la contraseña de su cuenta.\n\n"
			+ "Abra este enlace local para continuar:\n" + enlace + "\n\n"
			+ "El enlace vence el " + FECHA.format(expira) + ".\n"
			+ "Si usted no realizó esta solicitud, puede ignorar este mensaje.");
		remitenteSmtp.send(mensaje);
	}
}
