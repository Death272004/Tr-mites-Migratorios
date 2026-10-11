package pa.tramitesmigratorios.expediente;

/**
 * Estados del expediente (HU-19 CA-6), con la cadena de Pantallas_y_Datos_Migracion.md que ya
 * usa el Frontend: EN PREPARACIÓN → RECIBIDO → [CON OBSERVACIONES] → EN ANÁLISIS → ADMITIDO →
 * EN RESOLUCIÓN → RESUELTO (APROBADA | NEGADA) → NOTIFICADO → ENTREGADO → ARCHIVADO.
 */
public enum EstadoExpediente {

	EN_PREPARACION, RECIBIDO, CON_OBSERVACIONES, EN_ANALISIS, ADMITIDO, EN_RESOLUCION, RESUELTO, NOTIFICADO,
	ENTREGADO, ARCHIVADO;

	/** Resultado de la resolución; solo existe desde que el expediente llega a RESUELTO. */
	public enum Resultado {

		APROBADA, NEGADA

	}

	/** El expediente ya tiene resolución o está archivado: no admite más documentos. */
	public boolean esTerminal() {
		return this == RESUELTO || this == NOTIFICADO || this == ENTREGADO || this == ARCHIVADO;
	}

}
