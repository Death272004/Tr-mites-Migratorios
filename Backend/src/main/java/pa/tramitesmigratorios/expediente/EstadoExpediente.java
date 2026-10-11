package pa.tramitesmigratorios.expediente;

/** Estados del expediente (HU-19 CA-6), incluidos los complementarios. */
public enum EstadoExpediente {

	BORRADOR, PRESENTADO, EN_REVISION, PENDIENTE_DOCUMENTOS, EN_VALIDACION, LISTO_DECISION, APROBADO, DENEGADO,
	OBSERVADO, CANCELADO, CERRADO;

	/** Decisión final sobre el fondo del trámite. */
	public boolean esDecision() {
		return this == APROBADO || this == DENEGADO;
	}

	/** El expediente ya no admite documentos ni más trámite. */
	public boolean esTerminal() {
		return esDecision() || this == CANCELADO || this == CERRADO;
	}

}
