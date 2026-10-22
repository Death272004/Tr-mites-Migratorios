package pa.tramitesmigratorios.expediente;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Cambio de estado de un expediente: estado anterior y nuevo, autor, fecha y motivo (HU-19 CA-4). */
@Entity
@Table(name = "historial_estado")
public class HistorialEstado {

	@Id
	private UUID id;

	private UUID expedienteId;

	@Enumerated(EnumType.STRING)
	private EstadoExpediente estadoAnterior;

	@Enumerated(EnumType.STRING)
	private EstadoExpediente estadoNuevo;

	private UUID usuarioId;

	private Instant fecha;

	private String motivo;

	protected HistorialEstado() {
	}

	HistorialEstado(UUID expedienteId, EstadoExpediente estadoAnterior, EstadoExpediente estadoNuevo, UUID usuarioId,
			String motivo) {
		this.id = UUID.randomUUID();
		this.expedienteId = expedienteId;
		this.estadoAnterior = estadoAnterior;
		this.estadoNuevo = estadoNuevo;
		this.usuarioId = usuarioId;
		this.fecha = Instant.now();
		this.motivo = motivo;
	}

	public EstadoExpediente getEstadoAnterior() {
		return estadoAnterior;
	}

	public EstadoExpediente getEstadoNuevo() {
		return estadoNuevo;
	}

	public UUID getUsuarioId() {
		return usuarioId;
	}

	public Instant getFecha() {
		return fecha;
	}

	public String getMotivo() {
		return motivo;
	}

}
