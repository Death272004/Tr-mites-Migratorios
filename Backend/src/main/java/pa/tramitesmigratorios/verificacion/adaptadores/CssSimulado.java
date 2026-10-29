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
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.CssPort;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Politica;

/**
 * Adaptador de la Caja de Seguro Social sobre su fuente simulada (TASK-23.3). De la ficha solo
 * se conserva si la afiliación está vigente; el número de asegurado y las cuotas se descartan.
 */
@Component
public class CssSimulado extends AdaptadorSimulado implements CssPort {

	/** Cuotas que exige el trámite para dar por vigente la afiliación (07-marco-legal §4, fila 4). */
	static final int CUOTAS_MINIMAS = 9;

	private final Fuentes.Identificacion identificacion;
	private final Fuentes.Css css;

	@Autowired
	CssSimulado(Fuentes.Identificacion identificacion, Fuentes.Css css,
			EjecutorFuentes ejecutor,
			@Value("${app.verificaciones.fuentes.css.timeout-ms}") long timeoutMs,
			@Value("${app.verificaciones.fuentes.css.reintentos-maximos}") int reintentos,
			@Value("${app.verificaciones.fuentes.css.espera-base-ms}") long esperaBaseMs) {
		this(identificacion, css, new Politica(timeoutMs, reintentos, esperaBaseMs), ejecutor.hilos());
	}

	public CssSimulado(Fuentes.Identificacion identificacion, Fuentes.Css css, Politica politica,
			ExecutorService ejecutor) {
		super(politica, ejecutor);
		this.identificacion = identificacion;
		this.css = css;
	}

	@Override
	public Fuente fuente() {
		return Fuente.CSS;
	}

	@Override
	Optional<Hallazgo> consultarFuente(Consulta consulta) {
		return identificacion.idPersona(consulta.tipoDocumento(), consulta.numeroDocumento())
			.flatMap(css::afiliacion)
			.map(ficha -> {
				if (ficha.afiliado() == null || ficha.cuotasRegistradas() == null) {
					throw new RespuestaInvalida();
				}
				boolean vigente = ficha.afiliado() && ficha.cuotasRegistradas() >= CUOTAS_MINIMAS;
				return new Hallazgo(vigente ? ResultadoMinimo.VIGENTE : ResultadoMinimo.NO_VIGENTE, ficha.referencia());
			});
	}

}
