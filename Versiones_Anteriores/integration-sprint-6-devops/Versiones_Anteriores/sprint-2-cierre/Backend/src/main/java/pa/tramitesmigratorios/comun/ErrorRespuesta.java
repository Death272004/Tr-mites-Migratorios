package pa.tramitesmigratorios.comun;

import java.util.List;

/** Cuerpo de error uniforme del contrato (esquema {@code Error} de openapi.yaml). */
public record ErrorRespuesta(String codigo, String mensaje, String correlacionId, List<ErrorDeCampo> errores) {

	public static ErrorRespuesta de(String codigo, String mensaje) {
		return new ErrorRespuesta(codigo, mensaje, Correlacion.actual(), null);
	}

	/** Para los filtros de seguridad, que responden antes de llegar a los controladores. */
	public String json() {
		return "{\"codigo\":\"%s\",\"mensaje\":\"%s\",\"correlacionId\":\"%s\"}".formatted(codigo, mensaje, correlacionId);
	}

}
