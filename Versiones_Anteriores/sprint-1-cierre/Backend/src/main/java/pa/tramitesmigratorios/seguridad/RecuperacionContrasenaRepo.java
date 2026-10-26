package pa.tramitesmigratorios.seguridad;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface RecuperacionContrasenaRepo extends JpaRepository<RecuperacionContrasena, UUID> {

	Optional<RecuperacionContrasena> findByTokenHash(String tokenHash);

	@Modifying
	@Query("update RecuperacionContrasena r set r.usada = true where r.usuarioId = :usuarioId and r.usada = false")
	int anularPendientes(UUID usuarioId);

}
