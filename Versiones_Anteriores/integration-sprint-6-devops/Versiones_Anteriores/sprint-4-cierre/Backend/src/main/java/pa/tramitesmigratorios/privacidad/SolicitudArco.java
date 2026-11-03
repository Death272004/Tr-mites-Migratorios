package pa.tramitesmigratorios.privacidad;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Solicitud de acceso, rectificación, cancelación u oposición del titular (HU-18c). */
@Entity
@Table(name = "solicitud_arco")
public class SolicitudArco {

	public enum Tipo {

		ACCESO, RECTIFICACION, CANCELACION, OPOSICION

	}

	public enum Estado {

		RECIBIDA, EN_ATENCION, ATENDIDA, RECHAZADA;

		boolean abierta() {
			return this == RECIBIDA || this == EN_ATENCION;
		}

		/** RECIBIDA → EN_ATENCION → ATENDIDA o RECHAZADA. */
		boolean puedePasarA(Estado nuevo) {
			return (this == RECIBIDA && nuevo == EN_ATENCION)
					|| (this == EN_ATENCION && (nuevo == ATENDIDA || nuevo == RECHAZADA));
		}

	}

	@Id
	private UUID id;

	private UUID titularId;

	@Enumerated(EnumType.STRING)
	private Tipo tipo;

	private String descripcion;

	private Instant fechaCreacion;

	private Instant fechaActualizacion;

	@Enumerated(EnumType.STRING)
	private Estado estado;

	private UUID responsableId;

	private LocalDate plazoAtencion;

	private String motivoRechazo;

	protected SolicitudArco() {
	}

	SolicitudArco(UUID titularId, Tipo tipo, String descripcion, LocalDate plazoAtencion) {
		this.id = UUID.randomUUID();
		this.titularId = titularId;
		this.tipo = tipo;
		this.descripcion = descripcion;
		this.fechaCreacion = Instant.now();
		this.fechaActualizacion = this.fechaCreacion;
		this.estado = Estado.RECIBIDA;
		this.plazoAtencion = plazoAtencion;
	}

	void atender(Estado nuevo, UUID responsableId, String motivoRechazo) {
		this.estado = nuevo;
		this.responsableId = responsableId;
		this.motivoRechazo = motivoRechazo;
		this.fechaActualizacion = Instant.now();
	}

	/** Alerta de vencimiento: no cambia el estado de atención (HU-18c CA-3). */
	public boolean fueraDePlazo(LocalDate hoy) {
		return estado.abierta() && hoy.isAfter(plazoAtencion);
	}

	public UUID getId() {
		return id;
	}

	public UUID getTitularId() {
		return titularId;
	}

	public Tipo getTipo() {
		return tipo;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public Instant getFechaCreacion() {
		return fechaCreacion;
	}

	public Estado getEstado() {
		return estado;
	}

	public UUID getResponsableId() {
		return responsableId;
	}

	public LocalDate getPlazoAtencion() {
		return plazoAtencion;
	}

	public String getMotivoRechazo() {
		return motivoRechazo;
	}

}
