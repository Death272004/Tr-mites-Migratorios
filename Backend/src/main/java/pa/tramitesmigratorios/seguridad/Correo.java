package pa.tramitesmigratorios.seguridad;

import java.time.Instant;

/** Salida de correo de la cuenta. En local se entrega al servidor institucional de Docker. */
public interface Correo {

	/** Entrega al titular el token del enlace temporal de recuperación de contraseña (P-04). */
	void enviarRecuperacion(String destinatario, String token, Instant expira);

}
