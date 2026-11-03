package pa.tramitesmigratorios.verificacion.adaptadores;

import java.text.Normalizer;
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
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.TePort;

/**
 * Adaptador del Tribunal Electoral sobre su fuente simulada (TASK-23.2). Envía solo el tipo y el
 * número de documento; coteja en local el nombre declarado y guarda "coincide" o "no coincide".
 */
@Component
public class TeSimulado extends AdaptadorSimulado implements TePort {

	private final Fuentes.Te te;

	@Autowired
	TeSimulado(Fuentes.Te te, EjecutorFuentes ejecutor,
			@Value("${app.verificaciones.fuentes.te.timeout-ms}") long timeoutMs,
			@Value("${app.verificaciones.fuentes.te.reintentos-maximos}") int reintentos,
			@Value("${app.verificaciones.fuentes.te.espera-base-ms}") long esperaBaseMs) {
		this(te, new Politica(timeoutMs, reintentos, esperaBaseMs), ejecutor.hilos());
	}

	public TeSimulado(Fuentes.Te te, Politica politica, ExecutorService ejecutor) {
		super(politica, ejecutor);
		this.te = te;
	}

	@Override
	public Fuente fuente() {
		return Fuente.TE;
	}

	@Override
	Optional<Hallazgo> consultarFuente(Consulta consulta) {
		return te.persona(tipoEnTe(consulta.tipoDocumento()), consulta.numeroDocumento()).map(persona -> {
			if (persona.nombres() == null || persona.apellidos() == null) {
				throw new RespuestaInvalida();
			}
			boolean coincide = normalizar(persona.nombres() + " " + persona.apellidos())
				.equals(normalizar(consulta.nombreDeclarado()));
			return new Hallazgo(coincide ? ResultadoMinimo.COINCIDE : ResultadoMinimo.NO_COINCIDE,
					persona.referencia());
		});
	}

	/** El TE identifica la cédula de extranjero (CEDULA_E del perfil) como cédula. */
	private static String tipoEnTe(String tipoDocumento) {
		return "CEDULA_E".equals(tipoDocumento) ? "CEDULA" : tipoDocumento;
	}

	private static String normalizar(String nombre) {
		if (nombre == null) {
			return "";
		}
		return Normalizer.normalize(nombre, Normalizer.Form.NFD)
			.replaceAll("\\p{M}", "")
			.trim()
			.replaceAll("\\s+", " ")
			.toLowerCase();
	}

}
