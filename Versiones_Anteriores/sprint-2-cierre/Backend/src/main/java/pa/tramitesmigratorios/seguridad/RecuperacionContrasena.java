package pa.tramitesmigratorios.seguridad;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Enlace temporal de recuperación de contraseña (P-04). Guarda solo el hash del token y sirve una vez. */
@Entity
@Table(name = "recuperacion_contrasena")
public class RecuperacionContrasena {

	@Id
	private UUID id;

	private UUID usuarioId;

	private String tokenHash;

	private Instant creada;

	private Instant expira;

	private boolean usada;

	protected RecuperacionContrasena() {
	}

	RecuperacionContrasena(UUID usuarioId, String tokenHash, Instant expira) {
		this.id = UUID.randomUUID();
		this.usuarioId = usuarioId;
		this.tokenHash = tokenHash;
		this.creada = Instant.now();
		this.expira = expira;
	}

	boolean vigente(Instant ahora) {
		return !usada && expira.isAfter(ahora);
	}

	void usar() {
		this.usada = true;
	}

	UUID getUsuarioId() {
		return usuarioId;
	}

}
