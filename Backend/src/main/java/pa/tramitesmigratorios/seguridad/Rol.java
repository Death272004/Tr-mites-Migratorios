package pa.tramitesmigratorios.seguridad;

import java.util.EnumSet;
import java.util.Set;

/** Roles técnicos del sistema (HU-13, 06-roles-y-accesos.md §6.3.1). */
public enum Rol {

	SOLICITANTE, FUNCIONARIO, SUPERVISOR, AUDITOR, ADMIN;

	/**
	 * Matriz rol × permisos del Frontend (js/utils/perms.js). Para SOLICITANTE, SUPERVISOR,
	 * AUDITOR y ADMIN son los permisos fijos del rol. Para FUNCIONARIO es el operador completo:
	 * a cada cuenta se le asigna la parte que corresponde a su función.
	 */
	public Set<Permiso> permisosBase() {
		return switch (this) {
			case SOLICITANTE -> EnumSet.of(Permiso.PORTAL);
			case FUNCIONARIO -> EnumSet.of(Permiso.CONSULTAR, Permiso.VERIFICAR, Permiso.OBSERVAR, Permiso.RESOLVER,
					Permiso.NOTIFICAR);
			case SUPERVISOR -> EnumSet.of(Permiso.CONSULTAR, Permiso.REPORTAR);
			case AUDITOR -> EnumSet.of(Permiso.CONSULTAR, Permiso.AUDITAR, Permiso.REPORTAR);
			case ADMIN -> EnumSet.of(Permiso.CONSULTAR, Permiso.ADMINISTRAR);
		};
	}

}
