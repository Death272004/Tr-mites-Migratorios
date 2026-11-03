package pa.tramitesmigratorios.seguridad;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Correo simulado: registra solo que se solicitó un envío de prueba, sin destinatario ni
 * token de recuperación. No entrega mensajes; un proveedor de correo debe implementar
 * Correo para entregar enlaces de recuperación de forma privada.
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
		log.info("[CORREO SIMULADO] Envío de recuperación simulado; no se entrega ningún enlace.");
	}

}
