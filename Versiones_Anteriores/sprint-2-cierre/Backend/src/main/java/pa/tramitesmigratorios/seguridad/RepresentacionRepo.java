package pa.tramitesmigratorios.seguridad;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RepresentacionRepo extends JpaRepository<Representacion, UUID> {

	boolean existsByRepresentanteIdAndTitularIdAndVigenteTrue(UUID representanteId, UUID titularId);

}
