package pa.tramitesmigratorios.expediente;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import pa.tramitesmigratorios.expediente.EstadoExpediente.Resultado;

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

	/** Formulario completo del asistente, sin archivos binarios. */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	private Map<String, Object> datosSolicitud = new LinkedHashMap<>();

	@Enumerated(EnumType.STRING)
	private EstadoExpediente estado;

	/** APROBADA o NEGADA; vacío mientras no haya resolución. */
	@Enumerated(EnumType.STRING)
	private Resultado resultado;

	private Instant fechaCreacion;

	private Instant fechaActualizacion;

	/** Control de concurrencia optimista (HU-19 CA-5). */
	@Version
	private long version;

	protected Expediente() {
	}

	Expediente(String numero, UUID solicitanteId, UUID creadoPorId, String tipoTramite, EstadoExpediente estado) {
		this(numero, solicitanteId, creadoPorId, tipoTramite, estado, Map.of());
	}

	Expediente(String numero, UUID solicitanteId, UUID creadoPorId, String tipoTramite, EstadoExpediente estado,
			Map<String, Object> datosSolicitud) {
		this.id = UUID.randomUUID();
		this.numero = numero;
		this.solicitanteId = solicitanteId;
		this.creadoPorId = creadoPorId;
		this.tipoTramite = tipoTramite;
		this.datosSolicitud = datosSolicitud == null ? new LinkedHashMap<>() : new LinkedHashMap<>(datosSolicitud);
		this.estado = estado;
		this.fechaCreacion = Instant.now();
		this.fechaActualizacion = this.fechaCreacion;
	}

	void cambiarEstado(EstadoExpediente nuevo, Resultado resultado) {
		this.estado = nuevo;
		if (nuevo == EstadoExpediente.RESUELTO) {
			this.resultado = resultado;
		}
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

	public Map<String, Object> getDatosSolicitud() {
		return new LinkedHashMap<>(datosSolicitud);
	}

	public EstadoExpediente getEstado() {
		return estado;
	}

	public Resultado getResultado() {
		return resultado;
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
