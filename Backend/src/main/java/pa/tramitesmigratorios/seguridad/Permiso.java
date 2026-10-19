package pa.tramitesmigratorios.seguridad;

/**
 * Permisos del sistema, los mismos que usa el Frontend (js/utils/perms.js): PORTAL para el
 * cliente, los cinco granulares del personal (06-roles-y-accesos.md §6.4) y los de supervisión,
 * auditoría y administración.
 */
public enum Permiso {

	PORTAL, CONSULTAR, VERIFICAR, OBSERVAR, RESOLVER, NOTIFICAR, REPORTAR, AUDITAR, ADMINISTRAR

}
