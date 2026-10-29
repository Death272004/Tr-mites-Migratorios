package pa.tramitesmigratorios.verificacion.adaptadores;

import java.time.Instant;
import java.util.UUID;

import pa.tramitesmigratorios.fuentes.Escenario;
import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;
import pa.tramitesmigratorios.verificacion.Verificacion.ResultadoMinimo;

/**
 * Puertos de las fuentes de verificación (HU-23, TASK-23.1). La orquestación solo conoce estas
 * interfaces y la {@link Respuesta} normalizada: hoy las implementan los adaptadores sobre las
 * fuentes simuladas; una integración autorizada por convenio las implementaría igual, sin tocar
 * la lógica del expediente (ver {@code Backend/docs/sustitucion-adaptadores.md}).
 */
public final class Puertos {

	private Puertos() {
	}

	/** Contrato común: un adaptador nunca lanza por un fallo de la fuente, lo devuelve como estado técnico. */
	public interface PuertoFuente {

		Fuente fuente();

		Politica politica();

		Respuesta consultar(Consulta consulta);

	}

	/** Tribunal Electoral: identidad del titular. */
	public interface TePort extends PuertoFuente {
	}

	/** Caja de Seguro Social: vigencia de la afiliación. */
	public interface CssPort extends PuertoFuente {
	}

	/** Registro Público: existencia de información registral. */
	public interface RegistroPublicoPort extends PuertoFuente {
	}

	/**
	 * Lo único que sale hacia la fuente: el documento del titular (HU-25). El nombre declarado no
	 * se envía; el adaptador lo usa para cotejar en local y lo descarta. El escenario solo lo
	 * atienden las fuentes simuladas.
	 */
	public record Consulta(String tipoDocumento, String numeroDocumento, String nombreDeclarado, String correlacion,
			Escenario escenario) {

		@Override
		public String toString() {
			// Evita que un log descuidado escriba el documento o el nombre del titular.
			return "Consulta[correlacion=" + correlacion + ", escenario=" + escenario + "]";
		}

	}

	/** Estado técnico de la respuesta. Solo los dos primeros son una respuesta de la fuente. */
	public enum EstadoTecnico {

		RESPONDIDA, SIN_RESULTADO, ERROR_TECNICO, TIEMPO_AGOTADO, LIMITE_EXCEDIDO, RESPUESTA_INVALIDA;

		/** Un fallo técnico no es un resultado: nunca equivale a "no coincide" (CP-07). */
		public boolean esFallo() {
			return this != RESPONDIDA && this != SIN_RESULTADO;
		}

	}

	/**
	 * Formato normalizado común al modo simulado y al registro manual asistido (HU-23 CA-2).
	 * {@code resultado} es nulo cuando hubo un fallo técnico.
	 */
	public record Respuesta(Fuente fuente, EstadoTecnico estadoTecnico, ResultadoMinimo resultado, String referencia,
			Instant fecha, UUID responsableId) {

		static Respuesta fallo(Fuente fuente, EstadoTecnico estado) {
			return new Respuesta(fuente, estado, null, null, Instant.now(), null);
		}

	}

	/** Timeout y reintentos de una fuente; solo aplican al modo simulado (HU-23 CA-4). */
	public record Politica(long timeoutMs, int reintentosMaximos, long esperaBaseMs) {

		/** Primer intento más los reintentos. */
		public int intentosMaximos() {
			return 1 + reintentosMaximos;
		}

		/** Espera exponencial antes del reintento número {@code intento} (1, 2, ...). */
		public long esperaAntesDe(int intento) {
			return esperaBaseMs * (1L << Math.max(0, Math.min(intento - 1, 10)));
		}

	}

}
