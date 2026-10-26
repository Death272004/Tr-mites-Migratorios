package pa.tramitesmigratorios.seguridad;

import java.time.Instant;

/** Salida de correo de la cuenta. El MVP no tiene proveedor de correo: ver {@link CorreoSimulado}. */
public interface Correo {

	/** Entrega al titular el token del enlace temporal de recuperación de contraseña (P-04). */
	void enviarRecuperacion(String destinatario, String token, Instant expira);

}
