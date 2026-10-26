package pa.tramitesmigratorios.seguridad;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Correo simulado: con CORREO_SIMULADO=true escribe el mensaje en el registro del servidor en
 * lugar de enviarlo, para poder probar la recuperación en desarrollo local. Desactivado no
 * entrega nada, y el token nunca llega al registro.
 */
@Component
class CorreoSimulado implements Correo {

	private static final Logger log = LoggerFactory.getLogger(CorreoSimulado.class);

	private final boolean activo;

	CorreoSimulado(@Value("${app.correo.simulado}") boolean activo) {
		this.activo = activo;
	}

	@Override
	public void enviarRecuperacion(String destinatario, String token, Instant expira) {
		if (!activo) {
			log.warn("No hay proveedor de correo configurado: el enlace de recuperación no se envió.");
			return;
		}
		log.info("[CORREO SIMULADO] Recuperación de contraseña para {}: token {} (vence {})", destinatario, token,
				expira);
	}

}
