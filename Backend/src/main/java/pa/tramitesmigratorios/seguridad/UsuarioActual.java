package pa.tramitesmigratorios.seguridad;

import java.util.Set;
import java.util.UUID;

/** Usuario autenticado de la petición, incluido su ámbito institucional. */
public record UsuarioActual(UUID id, Rol rol, Set<Permiso> permisos, UUID sesionId,
		AreaInstitucional areaInstitucional) {

	/** Compatibilidad con servicios y pruebas que aún no pasan un área. */
	public UsuarioActual(UUID id, Rol rol, Set<Permiso> permisos, UUID sesionId) {
		this(id, rol, permisos, sesionId, AreaInstitucional.BUFETE);
	}

	public AreaInstitucional area() {
		return areaInstitucional == null ? AreaInstitucional.BUFETE : areaInstitucional;
	}

	public boolean es(Rol... roles) {
		for (Rol r : roles) {
			if (r == rol) {
				return true;
			}
		}
		return false;
	}

	public boolean tiene(Permiso permiso) {
		return permisos.contains(permiso) && PoliticaAreas.permitePermiso(area(), permiso);
	}

}
