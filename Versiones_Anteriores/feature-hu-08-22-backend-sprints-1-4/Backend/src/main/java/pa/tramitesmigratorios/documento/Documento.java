package pa.tramitesmigratorios.documento;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Metadatos de un documento. El archivo vive en el almacén protegido, fuera de la base (HU-17 CA-2). */
@Entity
@Table(name = "documento")
public class Documento {

	public enum EstadoRevision {

		PENDIENTE, VALIDO, RECHAZADO

	}

	@Id
	private UUID id;

	private UUID expedienteId;

	private String tipoDocumental;

	private String nombreArchivo;

	private String tipoMime;

	private long tamanoBytes;

	private String sha256;

	private String rutaAlmacen;

	@Enumerated(EnumType.STRING)
	private EstadoRevision estadoRevision;

	private UUID cargadoPorId;

	private Instant fechaCarga;

	protected Documento() {
	}

	Documento(UUID expedienteId, String tipoDocumental, String nombreArchivo, String tipoMime, long tamanoBytes,
			String sha256, String rutaAlmacen, UUID cargadoPorId) {
		this.id = UUID.randomUUID();
		this.expedienteId = expedienteId;
		this.tipoDocumental = tipoDocumental;
		this.nombreArchivo = nombreArchivo;
		this.tipoMime = tipoMime;
		this.tamanoBytes = tamanoBytes;
		this.sha256 = sha256;
		this.rutaAlmacen = rutaAlmacen;
		this.estadoRevision = EstadoRevision.PENDIENTE;
		this.cargadoPorId = cargadoPorId;
		this.fechaCarga = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public UUID getExpedienteId() {
		return expedienteId;
	}

	public String getTipoDocumental() {
		return tipoDocumental;
	}

	public String getNombreArchivo() {
		return nombreArchivo;
	}

	public String getTipoMime() {
		return tipoMime;
	}

	public long getTamanoBytes() {
		return tamanoBytes;
	}

	String getRutaAlmacen() {
		return rutaAlmacen;
	}

	public EstadoRevision getEstadoRevision() {
		return estadoRevision;
	}

	public Instant getFechaCarga() {
		return fechaCarga;
	}

}
