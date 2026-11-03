package pa.tramitesmigratorios.expediente;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ExpedienteRepo extends JpaRepository<Expediente, UUID>, JpaSpecificationExecutor<Expediente> {

	Optional<Expediente> findByNumero(String numero);

	@Query(value = "select nextval('expediente_numero_seq')", nativeQuery = true)
	long siguienteNumero();

}

interface HistorialEstadoRepo extends JpaRepository<HistorialEstado, UUID> {

	List<HistorialEstado> findByExpedienteIdOrderByFecha(UUID expedienteId);

}

interface ObservacionRepo extends JpaRepository<Observacion, UUID> {

	List<Observacion> findByExpedienteIdOrderByFecha(UUID expedienteId);

}
