package pa.tramitesmigratorios.seguridad;

import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;

/** Reglas de mínimo privilegio para cuentas internas por área. */
public final class PoliticaAreas {

	private PoliticaAreas() {
	}

	public static boolean esInstitucional(AreaInstitucional area) {
		return area != null && area != AreaInstitucional.BUFETE;
	}

	/** Área BUFETE no limita fuentes; cada pasante institucional queda limitado a una. */
	public static boolean permiteFuente(AreaInstitucional area, Fuente fuente) {
		if (!esInstitucional(area)) {
			return true;
		}
		if (fuente == null) {
			return false;
		}
		return switch (area) {
			case RP -> fuente == Fuente.REGISTRO_PUBLICO;
			case CSS -> fuente == Fuente.CSS;
			case TE -> fuente == Fuente.TE;
			case BUFETE -> true;
		};
	}


	/** Área institucional que puede atender una fuente concreta. */
	public static AreaInstitucional areaParaFuente(Fuente fuente) {
		if (fuente == null) return null;
		return switch (fuente) {
			case REGISTRO_PUBLICO -> AreaInstitucional.RP;
			case CSS -> AreaInstitucional.CSS;
			case TE -> AreaInstitucional.TE;
			case SNM, DOCUMENTO_EXTERIOR -> null;
		};
	}

	public static boolean puedeAtenderFuente(AreaInstitucional area, Fuente fuente) {
		return areaParaFuente(fuente) == area;
	}

	/** Las cuentas institucionales no pueden resolver ni notificar expedientes. */
	public static boolean permitePermiso(AreaInstitucional area, Permiso permiso) {
		return !esInstitucional(area)
				|| permiso == Permiso.CONSULTAR
				|| permiso == Permiso.VERIFICAR
				|| permiso == Permiso.OBSERVAR;
	}

}
