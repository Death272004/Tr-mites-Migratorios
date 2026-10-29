package pa.tramitesmigratorios.comun;

import java.util.UUID;

/**
 * Eventos de dominio que publican los servicios de negocio. Las notificaciones los escuchan
 * sin que los servicios conozcan cómo se avisa al usuario (HU-18 CA-1). No llevan datos
 * personales: solo identificadores, tipos y estados.
 */
public final class Eventos {

	private Eventos() {
	}

	public record EstadoCambiado(UUID expedienteId, String numero, UUID titularId, String estadoNuevo) {
	}

	public record ObservacionDelDespacho(UUID expedienteId, String numero, UUID titularId) {
	}

	public record ConsentimientoRevocado(UUID consentimientoId) {
	}

	public record SolicitudArcoRegistrada(UUID solicitudId, String tipo) {
	}

	public record SolicitudArcoActualizada(UUID solicitudId, UUID titularId, String tipo, String estado) {
	}

}
