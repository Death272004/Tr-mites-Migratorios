package pa.tramitesmigratorios.fuentes;

import java.util.Optional;
import java.util.function.Supplier;
import java.util.function.UnaryOperator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.comun.ErrorIntegracion;
import pa.tramitesmigratorios.fuentes.Fuentes.AfiliacionCss;
import pa.tramitesmigratorios.fuentes.Fuentes.ConsultaRegistro;
import pa.tramitesmigratorios.fuentes.Fuentes.ExpedienteSnm;
import pa.tramitesmigratorios.fuentes.Fuentes.PersonaTe;

/**
 * Endpoints {@code /api/mock/*} (HU-08, backlog §5.6). El encabezado {@code X-Scenario} o el
 * parámetro {@code ?scenario=} fuerzan el comportamiento de la fuente para probar el flujo.
 */
@RestController
@RequestMapping("/api/mock")
class MockFuentesController {

	enum Escenario {

		OK, SIN_RESULTADO, ERROR_TECNICO, TIMEOUT, RATE_LIMIT, DATOS_INCOMPLETOS,
		/** Respuesta válida idéntica en cada llamada: sirve para probar la idempotencia. */
		LLENO

	}

	private final Fuentes.Te te;
	private final Fuentes.Css css;
	private final Fuentes.RegistroPublico registro;
	private final Fuentes.Snm snm;
	private final long latenciaMs;

	MockFuentesController(Fuentes.Te te, Fuentes.Css css, Fuentes.RegistroPublico registro, Fuentes.Snm snm,
			@Value("${app.fuentes-simuladas.latencia-ms}") long latenciaMs) {
		this.te = te;
		this.css = css;
		this.registro = registro;
		this.snm = snm;
		this.latenciaMs = latenciaMs;
	}

	@GetMapping("/te/personas/{tipoDoc}/{numero}")
	PersonaTe te(@PathVariable String tipoDoc, @PathVariable String numero,
			@RequestHeader(value = "X-Scenario", required = false) String encabezado,
			@RequestParam(value = "scenario", required = false) String consulta) {
		return simular("TE", encabezado, consulta, () -> te.persona(tipoDoc, numero), PersonaTe::incompleta);
	}

	@GetMapping("/css/afiliaciones/{idPersona}")
	AfiliacionCss css(@PathVariable String idPersona,
			@RequestHeader(value = "X-Scenario", required = false) String encabezado,
			@RequestParam(value = "scenario", required = false) String consulta) {
		return simular("CSS", encabezado, consulta, () -> css.afiliacion(idPersona), AfiliacionCss::incompleta);
	}

	@GetMapping("/registro/consultas/{idPersona}")
	ConsultaRegistro registro(@PathVariable String idPersona,
			@RequestHeader(value = "X-Scenario", required = false) String encabezado,
			@RequestParam(value = "scenario", required = false) String consulta) {
		return simular("REGISTRO_PUBLICO", encabezado, consulta, () -> registro.consulta(idPersona),
				ConsultaRegistro::incompleta);
	}

	@GetMapping("/snm/expedientes/{numero}")
	ExpedienteSnm snm(@PathVariable String numero,
			@RequestHeader(value = "X-Scenario", required = false) String encabezado,
			@RequestParam(value = "scenario", required = false) String consulta) {
		return simular("SNM", encabezado, consulta, () -> snm.expediente(numero), ExpedienteSnm::incompleta);
	}

	private <T> T simular(String fuente, String encabezado, String consulta, Supplier<Optional<T>> fuenteDeDatos,
			UnaryOperator<T> recortar) {
		Escenario escenario = escenario(encabezado != null ? encabezado : consulta);
		esperarLatencia();
		return switch (escenario) {
			case ERROR_TECNICO -> throw new ErrorIntegracion(ErrorIntegracion.Tipo.ERROR_TECNICO, fuente);
			case TIMEOUT -> throw new ErrorIntegracion(ErrorIntegracion.Tipo.TIEMPO_AGOTADO, fuente);
			case RATE_LIMIT -> throw new ErrorIntegracion(ErrorIntegracion.Tipo.LIMITE_EXCEDIDO, fuente);
			case SIN_RESULTADO -> throw sinResultado();
			case OK, LLENO -> fuenteDeDatos.get().orElseThrow(MockFuentesController::sinResultado);
			case DATOS_INCOMPLETOS ->
				recortar.apply(fuenteDeDatos.get().orElseThrow(MockFuentesController::sinResultado));
		};
	}

	private static Escenario escenario(String valor) {
		if (valor == null || valor.isBlank()) {
			return Escenario.OK;
		}
		try {
			return Escenario.valueOf(valor.trim().toUpperCase());
		}
		catch (IllegalArgumentException e) {
			throw ErrorApi.entradaInvalida("X-Scenario", "Escenario no reconocido.");
		}
	}

	/** Un "sin resultado" es una respuesta válida de la fuente, no un fallo técnico (CP-07). */
	private static ErrorApi sinResultado() {
		return new ErrorApi(HttpStatus.NOT_FOUND, "SIN_RESULTADO", "La fuente no tiene resultado para la consulta.");
	}

	private void esperarLatencia() {
		if (latenciaMs <= 0) {
			return;
		}
		try {
			Thread.sleep(latenciaMs);
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
		}
	}

}
