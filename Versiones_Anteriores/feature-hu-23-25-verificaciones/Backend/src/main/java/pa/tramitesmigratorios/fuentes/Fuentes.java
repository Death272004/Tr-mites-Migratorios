package pa.tramitesmigratorios.fuentes;

import java.util.List;
import java.util.Optional;

/**
 * Interfaces de las fuentes externas de verificación (HU-08 CA-6). El producto depende de estas
 * interfaces, no de los simuladores: una futura integración autorizada por convenio las
 * implementa y sustituye a {@link FuentesSimuladas} sin tocar el resto del sistema.
 *
 * Las respuestas no se guardan: de una consulta solo se conserva el resultado mínimo de la
 * verificación (fuente, fecha, resultado y responsable).
 */
public final class Fuentes {

	private Fuentes() {
	}

	/** Tribunal Electoral: verificación de identidad. */
	public interface Te {

		Optional<PersonaTe> persona(String tipoDocumento, String numeroDocumento);

	}

	/** Caja de Seguro Social: condición de afiliado. */
	public interface Css {

		Optional<AfiliacionCss> afiliacion(String idPersona);

	}

	/** Registro Público: información registral autorizada. */
	public interface RegistroPublico {

		Optional<ConsultaRegistro> consulta(String idPersona);

	}

	/**
	 * Clave con la que una fuente identifica a la persona a partir de su documento. CSS y Registro
	 * Público se consultan por esa clave, no por el nombre ni por otros datos del titular.
	 */
	public interface Identificacion {

		Optional<String> idPersona(String tipoDocumento, String numeroDocumento);

	}

	/** Servicio Nacional de Migración: estado de un expediente en el sistema oficial. */
	public interface Snm {

		Optional<ExpedienteSnm> expediente(String numero);

	}

	public record PersonaTe(String tipoDocumento, String numeroDocumento, String nombres, String apellidos,
			String fechaNacimiento, String referencia) {

		PersonaTe incompleta() {
			return new PersonaTe(tipoDocumento, numeroDocumento, nombres, null, null, referencia);
		}

	}

	public record AfiliacionCss(String idPersona, Boolean afiliado, String numeroAsegurado, Integer cuotasRegistradas,
			String fechaFicha, String referencia) {

		AfiliacionCss incompleta() {
			return new AfiliacionCss(idPersona, afiliado, null, null, null, referencia);
		}

	}

	public record Registro(String tipo, String folio, String descripcion) {
	}

	public record ConsultaRegistro(String idPersona, List<Registro> registros, String referencia) {

		ConsultaRegistro incompleta() {
			return new ConsultaRegistro(idPersona, null, referencia);
		}

	}

	public record ExpedienteSnm(String numero, String estado, String fechaActualizacion, String desfase,
			String referencia) {

		ExpedienteSnm incompleta() {
			return new ExpedienteSnm(numero, null, null, desfase, referencia);
		}

	}

}
