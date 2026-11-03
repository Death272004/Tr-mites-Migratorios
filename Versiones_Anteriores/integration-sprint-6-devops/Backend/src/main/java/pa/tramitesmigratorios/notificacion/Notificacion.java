package pa.tramitesmigratorios.notificacion;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Aviso a un usuario. El mensaje sale de una plantilla fija y no lleva datos personales (HU-18 CA-3). */
@Entity
@Table(name = "notificacion")
public class Notificacion {

	public enum Tipo {

		PENDIENTE_DOCUMENTOS, OBSERVACION, RESULTADO_VERIFICACION, DECISION_FINAL, SOLICITUD_ARCO,
		CONSENTIMIENTO_REVOCADO

	}

	@Id
	private UUID id;

	private UUID destinatarioId;

	private UUID expedienteId;

	@Enumerated(EnumType.STRING)
	private Tipo tipo;

	private String mensaje;

	private Instant fecha;

	private boolean leida;

	protected Notificacion() {
	}

	Notificacion(UUID destinatarioId, UUID expedienteId, Tipo tipo, String mensaje) {
		this.id = UUID.randomUUID();
		this.destinatarioId = destinatarioId;
		this.expedienteId = expedienteId;
		this.tipo = tipo;
		this.mensaje = mensaje;
		this.fecha = Instant.now();
	}

	void marcarLeida() {
		this.leida = true;
	}

	public UUID getId() {
		return id;
	}

	public UUID getDestinatarioId() {
		return destinatarioId;
	}

	public UUID getExpedienteId() {
		return expedienteId;
	}

	public Tipo getTipo() {
		return tipo;
	}

	public String getMensaje() {
		return mensaje;
	}

	public Instant getFecha() {
		return fecha;
	}

	public boolean isLeida() {
		return leida;
	}

}
