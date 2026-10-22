package pa.tramitesmigratorios.fuentes;

import pa.tramitesmigratorios.comun.ErrorApi;

/**
 * Comportamiento forzado de una fuente simulada (backlog §5.6). Llega en el encabezado
 * {@code X-Scenario} o el parámetro {@code ?scenario=}, tanto en los endpoints {@code /api/mock/*}
 * como al registrar una verificación en modo simulado. Una integración real lo ignora.
 */
public enum Escenario {

	OK, SIN_RESULTADO, ERROR_TECNICO, TIMEOUT, RATE_LIMIT, DATOS_INCOMPLETOS,
	/** Respuesta válida idéntica en cada llamada: sirve para probar la idempotencia. */
	LLENO;

	/** Sin valor equivale a {@link #OK}; un valor desconocido es un error de entrada. */
	public static Escenario de(String valor) {
		if (valor == null || valor.isBlank()) {
			return OK;
		}
		try {
			return valueOf(valor.trim().toUpperCase());
		}
		catch (IllegalArgumentException e) {
			throw ErrorApi.entradaInvalida("X-Scenario", "Escenario no reconocido.");
		}
	}

}
