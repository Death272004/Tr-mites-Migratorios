package pa.tramitesmigratorios.documento;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pa.tramitesmigratorios.documento.Documento.EstadoRevision;

public interface DocumentoRepo extends JpaRepository<Documento, UUID> {

	List<Documento> findByExpedienteIdOrderByFechaCarga(UUID expedienteId);

	Optional<Documento> findByIdAndExpedienteId(UUID id, UUID expedienteId);

	boolean existsByExpedienteIdAndTipoDocumentalAndEstadoRevisionNot(UUID expedienteId, String tipoDocumental,
			EstadoRevision estadoRevision);

	/** Tipos documentales que el expediente ya tiene cubiertos (los rechazados no cuentan). */
	@Query("select distinct d.tipoDocumental from Documento d where d.expedienteId = :expedienteId and d.estadoRevision <> 'RECHAZADO'")
	Set<String> tiposCubiertos(UUID expedienteId);

}
