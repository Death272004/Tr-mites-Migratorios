package pa.tramitesmigratorios.seguridad;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Sesión de un usuario. Guarda solo el hash del token, nunca el token. */
@Entity
@Table(name = "sesion")
public class Sesion {

	@Id
	private UUID id;

	private UUID usuarioId;

	private String tokenHash;

	private Instant creada;

	private Instant expira;

	private boolean revocada;

	protected Sesion() {
	}

	Sesion(UUID usuarioId, String tokenHash, Instant expira) {
		this.id = UUID.randomUUID();
		this.usuarioId = usuarioId;
		this.tokenHash = tokenHash;
		this.creada = Instant.now();
		this.expira = expira;
	}

	boolean vigente(Instant ahora) {
		return !revocada && expira.isAfter(ahora);
	}

	void revocar() {
		this.revocada = true;
	}

	UUID getId() {
		return id;
	}

	UUID getUsuarioId() {
		return usuarioId;
	}

}
