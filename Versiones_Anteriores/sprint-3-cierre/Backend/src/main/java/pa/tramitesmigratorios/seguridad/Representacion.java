package pa.tramitesmigratorios.seguridad;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Representación acreditada (P-08): poder notariado, parentesco o carácter jurídico. */
@Entity
@Table(name = "representacion")
public class Representacion {

	@Id
	private UUID id;

	private UUID representanteId;

	private UUID titularId;

	private String tipo;

	private boolean vigente;

	private Instant fecha;

	protected Representacion() {
	}

	public Representacion(UUID representanteId, UUID titularId, String tipo) {
		this.id = UUID.randomUUID();
		this.representanteId = representanteId;
		this.titularId = titularId;
		this.tipo = tipo;
		this.vigente = true;
		this.fecha = Instant.now();
	}

	public UUID getId() {
		return id;
	}

}
