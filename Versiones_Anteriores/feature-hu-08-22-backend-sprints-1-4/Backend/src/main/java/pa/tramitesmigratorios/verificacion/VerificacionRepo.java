package pa.tramitesmigratorios.verificacion;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificacionRepo extends JpaRepository<Verificacion, UUID> {

	List<Verificacion> findByExpedienteId(UUID expedienteId);

}
