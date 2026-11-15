package pa.tramitesmigratorios.seguridad;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import pa.tramitesmigratorios.seguridad.AreaInstitucional;
import pa.tramitesmigratorios.seguridad.Usuario.EstadoCuenta;
import pa.tramitesmigratorios.seguridad.Usuario.TipoSolicitante;

public interface UsuarioRepo extends JpaRepository<Usuario, UUID> {

	Optional<Usuario> findByCorreo(String correo);

	boolean existsByCorreo(String correo);

	boolean existsByTipoDocumentoAndNumeroDocumento(Usuario.TipoDocumento tipoDocumento, String numeroDocumento);

	List<Usuario> findByRolAndEstadoCuenta(Rol rol, EstadoCuenta estadoCuenta);

	Optional<Usuario> findFirstByDemoAutocompletableTrueAndRolAndTipoSolicitanteAndEstadoCuentaOrderByFechaCreacionAsc(
			Rol rol, TipoSolicitante tipoSolicitante, EstadoCuenta estadoCuenta);

	Optional<Usuario> findFirstByDemoAutocompletableTrueAndRolAndEstadoCuentaOrderByFechaCreacionAsc(
			Rol rol, EstadoCuenta estadoCuenta);

	Optional<Usuario> findFirstByDemoAutocompletableTrueAndRolAndAreaInstitucionalAndEstadoCuentaOrderByFechaCreacionAsc(
			Rol rol, AreaInstitucional areaInstitucional, EstadoCuenta estadoCuenta);

}
