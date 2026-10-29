package pa.tramitesmigratorios.auditoria;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EventoAuditoriaRepo
		extends JpaRepository<EventoAuditoria, UUID>, JpaSpecificationExecutor<EventoAuditoria> {

	long countByOperacion(String operacion);

}
