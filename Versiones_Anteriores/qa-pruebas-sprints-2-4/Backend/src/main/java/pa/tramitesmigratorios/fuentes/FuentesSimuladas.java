package pa.tramitesmigratorios.fuentes;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.boot.json.JsonParserFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import pa.tramitesmigratorios.expediente.ExpedienteRepo;
import pa.tramitesmigratorios.fuentes.Fuentes.AfiliacionCss;
import pa.tramitesmigratorios.fuentes.Fuentes.ConsultaRegistro;
import pa.tramitesmigratorios.fuentes.Fuentes.ExpedienteSnm;
import pa.tramitesmigratorios.fuentes.Fuentes.PersonaTe;
import pa.tramitesmigratorios.fuentes.Fuentes.Registro;

/**
 * Fuentes de verificación simuladas de TE, CSS, Registro Público y SNM (HU-08). Leen el
 * conjunto maestro de datos ficticios de {@code fixtures/fuentes-simuladas.json}, que es la
 * única fuente de esos datos (TASK-08.1).
 *
 * El modo de producción es la verificación manual asistida; estos simuladores existen para la
 * demostración y representan integraciones futuras, sujetas a convenio.
 */
@Component
class FuentesSimuladas implements Fuentes.Te, Fuentes.Css, Fuentes.RegistroPublico, Fuentes.Snm {

	static final String FIXTURE = "fixtures/fuentes-simuladas.json";

	private final List<Map<String, Object>> personas;
	private final List<Map<String, Object>> expedientesSnm;
	private final ExpedienteRepo expedientes;

	@SuppressWarnings("unchecked")
	FuentesSimuladas(ExpedienteRepo expedientes) {
		this.expedientes = expedientes;
		Map<String, Object> fixture = JsonParserFactory.getJsonParser().parseMap(leer());
		this.personas = (List<Map<String, Object>>) fixture.get("personas");
		this.expedientesSnm = (List<Map<String, Object>>) fixture.get("expedientesSnm");
	}

	private static String leer() {
		try (InputStream entrada = new ClassPathResource(FIXTURE).getInputStream()) {
			return new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
		}
		catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}

	@Override
	public Optional<PersonaTe> persona(String tipoDocumento, String numeroDocumento) {
		return personas.stream()
			.filter(p -> texto(p, "tipoDocumento").equalsIgnoreCase(tipoDocumento)
					&& texto(p, "numeroDocumento").equalsIgnoreCase(numeroDocumento))
			.findFirst()
			.map(p -> new PersonaTe(texto(p, "tipoDocumento"), texto(p, "numeroDocumento"), texto(p, "nombres"),
					texto(p, "apellidos"), texto(p, "fechaNacimiento"),
					referencia("TE", tipoDocumento + "/" + numeroDocumento)));
	}

	@Override
	@SuppressWarnings("unchecked")
	public Optional<AfiliacionCss> afiliacion(String idPersona) {
		return porId(idPersona).map(p -> {
			Map<String, Object> css = (Map<String, Object>) p.get("css");
			return new AfiliacionCss(texto(p, "idPersona"), (Boolean) css.get("afiliado"),
					(String) css.get("numeroAsegurado"), ((Number) css.get("cuotasRegistradas")).intValue(),
					(String) css.get("fechaFicha"), referencia("CSS", idPersona));
		});
	}

	@Override
	@SuppressWarnings("unchecked")
	public Optional<ConsultaRegistro> consulta(String idPersona) {
		return porId(idPersona).map(p -> {
			List<Registro> registros = ((List<Map<String, Object>>) p.get("registros")).stream()
				.map(r -> new Registro(texto(r, "tipo"), texto(r, "folio"), texto(r, "descripcion")))
				.toList();
			return new ConsultaRegistro(texto(p, "idPersona"), registros, referencia("RP", idPersona));
		});
	}

	/**
	 * Si el número es de un expediente de la plataforma, el SNM simulado refleja su estado
	 * (coherencia, CA-7). Si es un expediente solo del fixture, la respuesta explica el desfase.
	 */
	@Override
	public Optional<ExpedienteSnm> expediente(String numero) {
		Optional<ExpedienteSnm> dePlataforma = expedientes.findByNumero(numero)
			.map(e -> new ExpedienteSnm(e.getNumero(), e.getEstado().name(), e.getFechaActualizacion().toString(),
					null, referencia("SNM", numero)));
		if (dePlataforma.isPresent()) {
			return dePlataforma;
		}
		return expedientesSnm.stream()
			.filter(e -> texto(e, "numero").equalsIgnoreCase(numero))
			.findFirst()
			.map(e -> new ExpedienteSnm(texto(e, "numero"), texto(e, "estado"), texto(e, "fechaActualizacion"),
					"El expediente existe en el sistema oficial simulado pero no está registrado en la plataforma del despacho.",
					referencia("SNM", numero)));
	}

	private Optional<Map<String, Object>> porId(String idPersona) {
		return personas.stream().filter(p -> texto(p, "idPersona").equalsIgnoreCase(idPersona)).findFirst();
	}

	private static String texto(Map<String, Object> mapa, String clave) {
		return Objects.toString(mapa.get(clave), "");
	}

	/**
	 * Referencia determinista: la misma consulta devuelve siempre la misma referencia, lo que
	 * permite comprobar la idempotencia con el escenario LLENO (respuesta válida duplicada).
	 */
	private static String referencia(String fuente, String consulta) {
		return "SIM-%s-%08X".formatted(fuente, consulta.toUpperCase().hashCode());
	}

}
