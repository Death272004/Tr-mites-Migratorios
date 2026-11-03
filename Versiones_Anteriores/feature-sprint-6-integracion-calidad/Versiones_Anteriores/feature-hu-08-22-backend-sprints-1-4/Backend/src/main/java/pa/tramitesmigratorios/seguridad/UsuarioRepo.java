package pa.tramitesmigratorios.seguridad;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import pa.tramitesmigratorios.seguridad.Usuario.EstadoCuenta;

public interface UsuarioRepo extends JpaRepository<Usuario, UUID> {

	Optional<Usuario> findByCorreo(String correo);

	boolean existsByCorreo(String correo);

	List<Usuario> findByRolAndEstadoCuenta(Rol rol, EstadoCuenta estadoCuenta);

}
