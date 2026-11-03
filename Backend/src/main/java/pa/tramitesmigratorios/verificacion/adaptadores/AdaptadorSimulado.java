package pa.tramitesmigratorios.verificacion.adaptadores;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import pa.tramitesmigratorios.comun.ErrorIntegracion;
import pa.tramitesmigratorios.fuentes.Escenario;
import pa.tramitesmigratorios.verificacion.Verificacion.ResultadoMinimo;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Consulta;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.EstadoTecnico;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Politica;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.PuertoFuente;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Respuesta;

/**
 * Base de los adaptadores sobre las fuentes simuladas (TASK-23.2 a 23.4): aplica el escenario
 * forzado, el timeout de la fuente y traduce cualquier fallo a un estado técnico. Los registros
 * solo llevan fuente, correlación y estado; nunca el documento ni el nombre del titular (HU-25 CA-5).
 */
abstract class AdaptadorSimulado implements PuertoFuente {

	/** La fuente respondió algo que no cumple su contrato (p. ej. DATOS_INCOMPLETOS). */
	static final class RespuestaInvalida extends RuntimeException {

		RespuestaInvalida() {
			super("Respuesta incompleta de la fuente");
		}

	}

	private static final Logger log = LoggerFactory.getLogger(AdaptadorSimulado.class);

	private final Politica politica;
	private final ExecutorService ejecutor;

	AdaptadorSimulado(Politica politica, ExecutorService ejecutor) {
		this.politica = politica;
		this.ejecutor = ejecutor;
	}

	/** Resultado mínimo y referencia que devolvió la fuente; nada más de su respuesta se conserva. */
	record Hallazgo(ResultadoMinimo resultado, String referencia) {
	}

	/**
	 * Consulta la fuente con los datos autorizados y devuelve el hallazgo; vacío si la fuente no
	 * tiene resultado. Lanza {@link RespuestaInvalida} si la respuesta está incompleta.
	 */
	abstract Optional<Hallazgo> consultarFuente(Consulta consulta);

	@Override
	public Politica politica() {
		return politica;
	}

	@Override
	public Respuesta consultar(Consulta consulta) {
		Respuesta respuesta = ejecutar(consulta);
		log.info("Verificación {} en {}: {}", consulta.correlacion(), fuente(), respuesta.estadoTecnico());
		return respuesta;
	}

	private Respuesta ejecutar(Consulta consulta) {
		Future<Optional<Hallazgo>> llamada = ejecutor.submit(() -> {
			simularEscenario(consulta);
			return consulta.escenario() == Escenario.SIN_RESULTADO ? Optional.<Hallazgo>empty()
					: consultarFuente(consulta);
		});
		try {
			Optional<Hallazgo> hallazgo = llamada.get(politica.timeoutMs(), TimeUnit.MILLISECONDS);
			return hallazgo
				.map(h -> new Respuesta(fuente(), EstadoTecnico.RESPONDIDA, h.resultado(), h.referencia(), Instant.now(),
						null))
				.orElseGet(() -> new Respuesta(fuente(), EstadoTecnico.SIN_RESULTADO, ResultadoMinimo.SIN_RESULTADO, null,
						Instant.now(), null));
		}
		catch (TimeoutException e) {
			llamada.cancel(true);
			return Respuesta.fallo(fuente(), EstadoTecnico.TIEMPO_AGOTADO);
		}
		catch (InterruptedException e) {
			llamada.cancel(true);
			Thread.currentThread().interrupt();
			return Respuesta.fallo(fuente(), EstadoTecnico.ERROR_TECNICO);
		}
		catch (CancellationException e) {
			return Respuesta.fallo(fuente(), EstadoTecnico.ERROR_TECNICO);
		}
		catch (ExecutionException e) {
			return Respuesta.fallo(fuente(), traducir(e.getCause()));
		}
	}

	private EstadoTecnico traducir(Throwable causa) {
		if (causa instanceof RespuestaInvalida) {
			return EstadoTecnico.RESPUESTA_INVALIDA;
		}
		if (causa instanceof ErrorIntegracion integracion) {
			return switch (integracion.tipo()) {
				case TIEMPO_AGOTADO -> EstadoTecnico.TIEMPO_AGOTADO;
				case LIMITE_EXCEDIDO -> EstadoTecnico.LIMITE_EXCEDIDO;
				case ERROR_TECNICO -> EstadoTecnico.ERROR_TECNICO;
			};
		}
		// Sin el mensaje ni la traza: podrían contener datos de la consulta.
		log.warn("Fallo no previsto del adaptador de {}: {}", fuente(), causa.getClass().getSimpleName());
		return EstadoTecnico.ERROR_TECNICO;
	}

	/** Mismos escenarios que {@code /api/mock/*}; TIMEOUT se comporta como una fuente que no contesta. */
	private void simularEscenario(Consulta consulta) throws InterruptedException {
		switch (consulta.escenario()) {
			case ERROR_TECNICO -> throw new ErrorIntegracion(ErrorIntegracion.Tipo.ERROR_TECNICO, fuente().name());
			case RATE_LIMIT -> throw new ErrorIntegracion(ErrorIntegracion.Tipo.LIMITE_EXCEDIDO, fuente().name());
			case TIMEOUT -> Thread.sleep(politica.timeoutMs() * 4 + 1000);
			case DATOS_INCOMPLETOS -> throw new RespuestaInvalida();
			case SIN_RESULTADO, OK, LLENO -> {
			}
		}
	}

}
