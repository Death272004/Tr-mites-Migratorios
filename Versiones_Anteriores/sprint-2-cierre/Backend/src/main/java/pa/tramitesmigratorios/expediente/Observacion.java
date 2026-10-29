package pa.tramitesmigratorios.expediente;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Observación del despacho o respuesta del cliente. No es una decisión ni cambia el estado (HU-20 CA-4). */
@Entity
@Table(name = "observacion")
public class Observacion {

	@Id
	private UUID id;

	private UUID expedienteId;

	private UUID autorId;

	private Instant fecha;

	private String texto;

	protected Observacion() {
	}

	Observacion(UUID expedienteId, UUID autorId, String texto) {
		this.id = UUID.randomUUID();
		this.expedienteId = expedienteId;
		this.autorId = autorId;
		this.fecha = Instant.now();
		this.texto = texto;
	}

	public UUID getId() {
		return id;
	}

	public UUID getExpedienteId() {
		return expedienteId;
	}

	public UUID getAutorId() {
		return autorId;
	}

	public Instant getFecha() {
		return fecha;
	}

	public String getTexto() {
		return texto;
	}

}
