package pa.tramitesmigratorios.seguridad;

import java.util.Set;
import java.util.UUID;

/** Usuario autenticado de la petición. Es lo único que los controladores reciben de la sesión. */
public record UsuarioActual(UUID id, Rol rol, Set<Permiso> permisos, UUID sesionId) {

	public boolean es(Rol... roles) {
		for (Rol r : roles) {
			if (r == rol) {
				return true;
			}
		}
		return false;
	}

	public boolean tiene(Permiso permiso) {
		return permisos.contains(permiso);
	}

}
