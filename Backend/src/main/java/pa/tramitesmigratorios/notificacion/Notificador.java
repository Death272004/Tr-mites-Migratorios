package pa.tramitesmigratorios.notificacion;

import java.util.UUID;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import pa.tramitesmigratorios.comun.Eventos.ConsentimientoRevocado;
import pa.tramitesmigratorios.comun.Eventos.EstadoCambiado;
import pa.tramitesmigratorios.comun.Eventos.ObservacionDelDespacho;
import pa.tramitesmigratorios.comun.Eventos.SolicitudArcoActualizada;
import pa.tramitesmigratorios.comun.Eventos.SolicitudArcoRegistrada;
import pa.tramitesmigratorios.notificacion.Notificacion.Tipo;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;
import pa.tramitesmigratorios.seguridad.Usuario.EstadoCuenta;
import pa.tramitesmigratorios.seguridad.UsuarioRepo;

/**
 * Convierte los eventos de negocio en notificaciones (HU-18, TASK-18.1). Los servicios solo
 * publican el evento; no saben a quién ni cómo se avisa. Los mensajes son plantillas fijas
 * con identificadores, tipos y estados, sin datos personales ni contenido del caso.
 */
@Component
class Notificador {

	private final NotificacionRepo notificaciones;
	private final UsuarioRepo usuarios;

	Notificador(NotificacionRepo notificaciones, UsuarioRepo usuarios) {
		this.notificaciones = notificaciones;
		this.usuarios = usuarios;
	}

	@EventListener
	void alCambiarEstado(EstadoCambiado evento) {
		switch (evento.estadoNuevo()) {
			case "PENDIENTE_DOCUMENTOS" -> avisar(evento.titularId(), evento.expedienteId(), Tipo.PENDIENTE_DOCUMENTOS,
					"El expediente %s tiene documentos pendientes. Revise los requisitos en el portal."
						.formatted(evento.numero()));
			case "APROBADO", "DENEGADO" -> avisar(evento.titularId(), evento.expedienteId(), Tipo.DECISION_FINAL,
					"El expediente %s ya tiene una decisión. Consulte el resultado en el portal."
						.formatted(evento.numero()));
			default -> {
				// Los demás cambios se ven en la línea de tiempo; no generan aviso.
			}
		}
	}

	@EventListener
	void alObservar(ObservacionDelDespacho evento) {
		avisar(evento.titularId(), evento.expedienteId(), Tipo.OBSERVACION,
				"El despacho registró una observación en el expediente %s.".formatted(evento.numero()));
	}

	@EventListener
	void alRevocarConsentimiento(ConsentimientoRevocado evento) {
		avisarAlDespacho(Tipo.CONSENTIMIENTO_REVOCADO,
				"Un cliente revocó el consentimiento %s. Revise el tratamiento de sus datos."
					.formatted(corto(evento.consentimientoId())));
	}

	@EventListener
	void alRegistrarSolicitudArco(SolicitudArcoRegistrada evento) {
		avisarAlDespacho(Tipo.SOLICITUD_ARCO, "Nueva solicitud ARCO %s de tipo %s en la bandeja de atención."
			.formatted(corto(evento.solicitudId()), evento.tipo()));
	}

	@EventListener
	void alAtenderSolicitudArco(SolicitudArcoActualizada evento) {
		avisar(evento.titularId(), null, Tipo.SOLICITUD_ARCO, "Su solicitud ARCO %s de tipo %s pasó a estado %s."
			.formatted(corto(evento.solicitudId()), evento.tipo(), evento.estado()));
	}

	private void avisar(UUID destinatarioId, UUID expedienteId, Tipo tipo, String mensaje) {
		notificaciones.save(new Notificacion(destinatarioId, expedienteId, tipo, mensaje));
	}

	private void avisarAlDespacho(Tipo tipo, String mensaje) {
		for (Usuario funcionario : usuarios.findByRolAndEstadoCuenta(Rol.FUNCIONARIO, EstadoCuenta.ACTIVA)) {
			avisar(funcionario.getId(), null, tipo, mensaje);
		}
	}

	private static String corto(UUID id) {
		return id.toString().substring(0, 8);
	}

}
