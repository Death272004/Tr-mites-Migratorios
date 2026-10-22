package pa.tramitesmigratorios.verificacion;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificacionRepo extends JpaRepository<Verificacion, UUID> {

	List<Verificacion> findByExpedienteId(UUID expedienteId);

	List<Verificacion> findByExpedienteIdOrderByFechaSolicitud(UUID expedienteId);

	Optional<Verificacion> findByIdAndExpedienteId(UUID id, UUID expedienteId);

	Optional<Verificacion> findByExpedienteIdAndClaveIdempotencia(UUID expedienteId, String claveIdempotencia);

	List<Verificacion> findTop50ByEstadoAndProximoIntentoLessThanEqualOrderByProximoIntento(Verificacion.Estado estado,
			Instant hasta);

}
