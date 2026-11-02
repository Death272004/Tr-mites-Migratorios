package pa.tramitesmigratorios.verificacion;

import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;
import pa.tramitesmigratorios.verificacion.Verificacion.Modo;

/**
 * Matriz de fuentes y finalidad (HU-25, TASK-25.1): fuente → finalidad → base legal →
 * responsable → qué se envía → qué se guarda. Deriva de §4 de
 * {@code 07-marco-legal-y-matriz-fuentes-verificacion.md} y está documentada en
 * {@code Backend/docs/matriz-fuentes-finalidad.md}. Es la única fuente de estas reglas: una
 * verificación que no encaja en una fila no se emite ni se registra (CA-2).
 *
 * El SNM no aparece: no es fuente de datos para el despacho (fila 5, NO APLICABLE).
 */
public final class MatrizFuentes {

	public enum Consentimiento {

		/** Consentimiento informado vigente del titular. */
		VIGENTE,
		/** Consentimiento expreso vigente: datos sensibles (salud/afiliación, antecedentes penales). */
		EXPRESO

	}

	/**
	 * @param camposEnviados datos del titular que pueden salir hacia la fuente; vacío si no se consulta ninguna
	 * @param activadaPor tipo documental cuyo requisito hace que la verificación aplique al trámite;
	 *        {@code "*"} si aplica a todo trámite y {@code null} si solo se crea a pedido del despacho
	 */
	public record Fila(Fuente fuente, String tipoVerificacion, String finalidad, String descripcion,
			String baseLegal, String responsable, Consentimiento consentimiento, Set<Modo> modos,
			List<String> camposEnviados, String seGuarda, String activadaPor) {
	}

	static final String TODO_TRAMITE = "*";

	private static final String RESPONSABLE = "Analista del despacho con permiso VERIFICAR";
	private static final String SE_GUARDA = "Fuente, fecha, resultado mínimo, referencia y responsable";

	public static final List<Fila> FILAS = List.of(
			new Fila(Fuente.TE, "IDENTIDAD", "IDENTIDAD_DEL_TITULAR",
					"Confirmar que el documento de identidad corresponde al titular del expediente.",
					"Verificación de dato público y consentimiento informado (Ley 81 de 2019).", RESPONSABLE,
					Consentimiento.VIGENTE, EnumSet.of(Modo.MANUAL_ASISTIDO, Modo.SIMULADO),
					List.of("tipoDocumento", "numeroDocumento"), SE_GUARDA + " (coincide / no coincide).",
					TODO_TRAMITE),
			new Fila(Fuente.CSS, "AFILIACION", "AFILIACION_DEL_TITULAR",
					"Confirmar la vigencia de la afiliación que exige el trámite (ficha CSS).",
					"Consentimiento expreso: dato de afiliación y salud (Ley 81 de 2019; Decreto 285 de 2021).",
					RESPONSABLE, Consentimiento.EXPRESO, EnumSet.of(Modo.MANUAL_ASISTIDO, Modo.SIMULADO),
					List.of("tipoDocumento", "numeroDocumento"),
					SE_GUARDA + " (vigente / no vigente). No se guardan número de asegurado ni cuotas.",
					"FICHA_CSS"),
			new Fila(Fuente.REGISTRO_PUBLICO, "INFORMACION_REGISTRAL", "INFORMACION_REGISTRAL",
					"Confirmar información registral declarada (sociedades, representación legal).",
					"Dato de acceso público.", RESPONSABLE, Consentimiento.VIGENTE,
					EnumSet.of(Modo.MANUAL_ASISTIDO, Modo.SIMULADO), List.of("tipoDocumento", "numeroDocumento"),
					SE_GUARDA + " (con registros). No se guardan folios ni descripciones.", null),
			new Fila(Fuente.DOCUMENTO_EXTERIOR, "LEGALIZACION", "VIGENCIA_Y_LEGALIZACION",
					"Registrar la vigencia y la apostilla o legalización de los antecedentes penales aportados.",
					"Consentimiento expreso: antecedentes penales (Ley 81 de 2019).", RESPONSABLE,
					Consentimiento.EXPRESO, EnumSet.of(Modo.MANUAL_ASISTIDO), List.of(),
					SE_GUARDA + " (vigente / no vigente).", "ANTECEDENTES_PENALES"));

	private MatrizFuentes() {
	}

	public static Optional<Fila> de(Fuente fuente) {
		return FILAS.stream().filter(f -> f.fuente() == fuente).findFirst();
	}

	/** ¿Aplica al trámite dado el conjunto de tipos documentales que exige? */
	static boolean aplica(Fila fila, Set<String> requisitosDelTramite) {
		if (fila.activadaPor() == null) {
			return false;
		}
		return TODO_TRAMITE.equals(fila.activadaPor()) || requisitosDelTramite.contains(fila.activadaPor());
	}

}
