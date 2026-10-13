package pa.tramitesmigratorios.seguridad;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface SesionRepo extends JpaRepository<Sesion, UUID> {

	Optional<Sesion> findByTokenHash(String tokenHash);

	@Modifying
	@Query("update Sesion s set s.revocada = true where s.usuarioId = :usuarioId and s.id <> :conservar and s.revocada = false")
	int revocarOtras(UUID usuarioId, UUID conservar);

	@Modifying
	@Query("update Sesion s set s.revocada = true where s.usuarioId = :usuarioId and s.revocada = false")
	int revocarTodas(UUID usuarioId);

}
