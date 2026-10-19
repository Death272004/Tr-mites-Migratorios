package pa.tramitesmigratorios.privacidad;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Consentimiento informado del titular (HU-18b, Ley 81 de 2019). La revocación conserva la evidencia. */
@Entity
@Table(name = "consentimiento")
public class Consentimiento {

	public enum Estado {

		VIGENTE, REVOCADO

	}

	@Id
	private UUID id;

	private UUID titularId;

	private String responsable;

	private String finalidad;

	private String alcance;

	private String baseLegal;

	private Instant fecha;

	private LocalDate vigenciaHasta;

	@Enumerated(EnumType.STRING)
	private Estado estado;

	/** Verdadero cuando cubre datos sensibles (salud, antecedentes penales). */
	private boolean expreso;

	private Instant fechaRevocacion;

	private UUID registradoPorId;

	protected Consentimiento() {
	}

	Consentimiento(UUID titularId, String responsable, String finalidad, String alcance, String baseLegal,
			LocalDate vigenciaHasta, boolean expreso, UUID registradoPorId) {
		this.id = UUID.randomUUID();
		this.titularId = titularId;
		this.responsable = responsable;
		this.finalidad = finalidad;
		this.alcance = alcance;
		this.baseLegal = baseLegal;
		this.fecha = Instant.now();
		this.vigenciaHasta = vigenciaHasta;
		this.estado = Estado.VIGENTE;
		this.expreso = expreso;
		this.registradoPorId = registradoPorId;
	}

	/** Vigente de verdad: no revocado y dentro de su fecha de vigencia. */
	public boolean vigente(LocalDate hoy) {
		return estado == Estado.VIGENTE && (vigenciaHasta == null || !vigenciaHasta.isBefore(hoy));
	}

	void revocar() {
		this.estado = Estado.REVOCADO;
		this.fechaRevocacion = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public UUID getTitularId() {
		return titularId;
	}

	public String getResponsable() {
		return responsable;
	}

	public String getFinalidad() {
		return finalidad;
	}

	public String getAlcance() {
		return alcance;
	}

	public String getBaseLegal() {
		return baseLegal;
	}

	public Instant getFecha() {
		return fecha;
	}

	public LocalDate getVigenciaHasta() {
		return vigenciaHasta;
	}

	public Estado getEstado() {
		return estado;
	}

	public boolean isExpreso() {
		return expreso;
	}

	public Instant getFechaRevocacion() {
		return fechaRevocacion;
	}

}
