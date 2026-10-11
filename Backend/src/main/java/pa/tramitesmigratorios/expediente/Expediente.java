package pa.tramitesmigratorios.expediente;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "expediente")
public class Expediente {

	@Id
	private UUID id;

	private String numero;

	/** Titular del expediente. */
	private UUID solicitanteId;

	/** Quien lo presentó: el titular o su representante acreditado (P-08). */
	private UUID creadoPorId;

	private String tipoTramite;

	@Enumerated(EnumType.STRING)
	private EstadoExpediente estado;

	private Instant fechaCreacion;

	private Instant fechaActualizacion;

	/** Control de concurrencia optimista (HU-19 CA-5). */
	@Version
	private long version;

	protected Expediente() {
	}

	Expediente(String numero, UUID solicitanteId, UUID creadoPorId, String tipoTramite, EstadoExpediente estado) {
		this.id = UUID.randomUUID();
		this.numero = numero;
		this.solicitanteId = solicitanteId;
		this.creadoPorId = creadoPorId;
		this.tipoTramite = tipoTramite;
		this.estado = estado;
		this.fechaCreacion = Instant.now();
		this.fechaActualizacion = this.fechaCreacion;
	}

	void cambiarEstado(EstadoExpediente nuevo) {
		this.estado = nuevo;
		this.fechaActualizacion = Instant.now();
	}

	public boolean perteneceA(UUID usuarioId) {
		return solicitanteId.equals(usuarioId) || creadoPorId.equals(usuarioId);
	}

	public UUID getId() {
		return id;
	}

	public String getNumero() {
		return numero;
	}

	public UUID getSolicitanteId() {
		return solicitanteId;
	}

	public UUID getCreadoPorId() {
		return creadoPorId;
	}

	public String getTipoTramite() {
		return tipoTramite;
	}

	public EstadoExpediente getEstado() {
		return estado;
	}

	public Instant getFechaCreacion() {
		return fechaCreacion;
	}

	public Instant getFechaActualizacion() {
		return fechaActualizacion;
	}

	public long getVersion() {
		return version;
	}

}
