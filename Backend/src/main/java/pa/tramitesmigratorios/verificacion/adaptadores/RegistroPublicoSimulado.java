package pa.tramitesmigratorios.verificacion.adaptadores;

import java.util.Optional;
import java.util.concurrent.ExecutorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import pa.tramitesmigratorios.fuentes.Fuentes;
import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;
import pa.tramitesmigratorios.verificacion.Verificacion.ResultadoMinimo;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Consulta;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Politica;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.RegistroPublicoPort;

/**
 * Adaptador del Registro Público sobre su fuente simulada (TASK-23.4). Solo se conserva que
 * existe información registral y la referencia de la consulta; folios y descripciones no.
 */
@Component
public class RegistroPublicoSimulado extends AdaptadorSimulado implements RegistroPublicoPort {

	private final Fuentes.Identificacion identificacion;
	private final Fuentes.RegistroPublico registro;

	@Autowired
	RegistroPublicoSimulado(Fuentes.Identificacion identificacion, Fuentes.RegistroPublico registro,
			EjecutorFuentes ejecutor,
			@Value("${app.verificaciones.fuentes.registro-publico.timeout-ms}") long timeoutMs,
			@Value("${app.verificaciones.fuentes.registro-publico.reintentos-maximos}") int reintentos,
			@Value("${app.verificaciones.fuentes.registro-publico.espera-base-ms}") long esperaBaseMs) {
		this(identificacion, registro, new Politica(timeoutMs, reintentos, esperaBaseMs), ejecutor.hilos());
	}

	public RegistroPublicoSimulado(Fuentes.Identificacion identificacion, Fuentes.RegistroPublico registro,
			Politica politica, ExecutorService ejecutor) {
		super(politica, ejecutor);
		this.identificacion = identificacion;
		this.registro = registro;
	}

	@Override
	public Fuente fuente() {
		return Fuente.REGISTRO_PUBLICO;
	}

	@Override
	Optional<Hallazgo> consultarFuente(Consulta consulta) {
		return identificacion.idPersona(consulta.tipoDocumento(), consulta.numeroDocumento())
			.flatMap(registro::consulta)
			.flatMap(respuesta -> {
				if (respuesta.registros() == null) {
					throw new RespuestaInvalida();
				}
				return respuesta.registros().isEmpty() ? Optional.empty()
						: Optional.of(new Hallazgo(ResultadoMinimo.CON_REGISTROS, respuesta.referencia()));
			});
	}

}
