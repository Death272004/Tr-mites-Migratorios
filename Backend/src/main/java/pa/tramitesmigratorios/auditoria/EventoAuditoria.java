package pa.tramitesmigratorios.auditoria;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.Immutable;

/**
 * Evento de la bitácora (HU-22). Es inmutable: no tiene modificadores y la base de datos
 * rechaza cualquier UPDATE o DELETE. No guarda contraseñas, tokens ni datos personales.
 */
@Entity
@Immutable
@Table(name = "evento_auditoria")
public class EventoAuditoria {

	public enum Resultado {

		EXITO, DENEGADO, FALLO

	}

	@Id
	private UUID id;

	private UUID actorId;

	private String operacion;

	private String recurso;

	private Instant fecha;

	@Enumerated(EnumType.STRING)
	private Resultado resultado;

	private String correlacionId;

	private String detalle;

	protected EventoAuditoria() {
	}

	EventoAuditoria(UUID actorId, String operacion, String recurso, Resultado resultado, String correlacionId,
			String detalle) {
		this.id = UUID.randomUUID();
		this.actorId = actorId;
		this.operacion = operacion;
		this.recurso = recurso;
		this.fecha = Instant.now();
		this.resultado = resultado;
		this.correlacionId = correlacionId;
		this.detalle = detalle;
	}

	public UUID getId() {
		return id;
	}

	public UUID getActorId() {
		return actorId;
	}

	public String getOperacion() {
		return operacion;
	}

	public String getRecurso() {
		return recurso;
	}

	public Instant getFecha() {
		return fecha;
	}

	public Resultado getResultado() {
		return resultado;
	}

	public String getCorrelacionId() {
		return correlacionId;
	}

	public String getDetalle() {
		return detalle;
	}

}
