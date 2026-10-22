package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.jayway.jsonpath.JsonPath;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MvcResult;
import org.yaml.snakeyaml.Yaml;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.verificacion.Verificacion;
import pa.tramitesmigratorios.verificacion.VerificacionRepo;

/**
 * HU-08 (TASK-08.6): pruebas de contrato de las fuentes simuladas contra docs/openapi.yaml.
 * Cada respuesta se compara con el contrato: código HTTP declarado, campos y tipos del esquema.
 * CP-06, CP-07.
 */
class FuentesSimuladasTest extends PruebaApi {

	private static final List<String> ESCENARIOS = List.of("OK", "SIN_RESULTADO", "ERROR_TECNICO", "TIMEOUT",
			"RATE_LIMIT", "DATOS_INCOMPLETOS", "LLENO");

	/** Ruta del contrato → una consulta con datos del fixture maestro. */
	private static final Map<String, String> CONSULTAS = Map.of(
			"/api/mock/te/personas/{tipoDoc}/{numero}", "/api/mock/te/personas/CEDULA/8-000-0001",
			"/api/mock/css/afiliaciones/{idPersona}", "/api/mock/css/afiliaciones/P-0001",
			"/api/mock/registro/consultas/{idPersona}", "/api/mock/registro/consultas/P-0002",
			"/api/mock/snm/expedientes/{numero}", "/api/mock/snm/expedientes/SNM-2026-000001");

	private static Map<String, Object> contrato;

	@Autowired
	VerificacionRepo verificaciones;

	@BeforeAll
	static void cargarContrato() throws Exception {
		try (InputStream entrada = Files.newInputStream(Path.of("docs", "openapi.yaml"))) {
			contrato = new Yaml().load(entrada);
		}
	}

	@Test
	void cadaFuenteCumpleElContratoEnTodosLosEscenarios() throws Exception {
		String token = tokenDe(Rol.FUNCIONARIO, Permiso.VERIFICAR);
		List<String> incumplimientos = new ArrayList<>();
		for (Map.Entry<String, String> consulta : CONSULTAS.entrySet()) {
			Map<String, Object> respuestas = en(contrato, "paths", consulta.getKey(), "get", "responses");
			for (String escenario : ESCENARIOS) {
				MvcResult resultado = mvc.perform(con(token, get(consulta.getValue())).header("X-Scenario", escenario)).andReturn();
				String estado = String.valueOf(resultado.getResponse().getStatus());
				String caso = consulta.getValue() + " [" + escenario + "] -> " + estado;
				if (!respuestas.containsKey(estado)) {
					incumplimientos.add(caso + ": código no declarado en el contrato");
					continue;
				}
				Map<String, Object> esquema = esquemaDe(respuestas.get(estado));
				Map<String, Object> json = JsonPath.read(cuerpo(resultado), "$");
				incumplimientos.addAll(validar(caso, json, esquema));
			}
		}
		assertThat(incumplimientos).isEmpty();
	}

	@Test
	void cadaEscenarioProduceLaRespuestaQueLeCorresponde() throws Exception {
		String token = tokenDe(Rol.FUNCIONARIO, Permiso.VERIFICAR);
		String te = "/api/mock/te/personas/CEDULA/8-000-0001";

		obtener(token, te).andExpect(status().isOk())
			.andExpect(jsonPath("$.nombres").value("Carla"))
			.andExpect(jsonPath("$.apellidos").value("Cliente Ficticia"))
			.andExpect(jsonPath("$.referencia").isNotEmpty());
		// Un "sin resultado" es una respuesta válida; un error técnico es otra cosa (CP-07).
		mvc.perform(con(token, get(te)).header("X-Scenario", "SIN_RESULTADO")).andExpect(status().isNotFound())
			.andExpect(jsonPath("$.codigo").value("SIN_RESULTADO"));
		mvc.perform(con(token, get(te)).header("X-Scenario", "ERROR_TECNICO")).andExpect(status().isInternalServerError())
			.andExpect(jsonPath("$.codigo").value("ERROR_TECNICO"));
		mvc.perform(con(token, get(te)).header("X-Scenario", "TIMEOUT")).andExpect(status().isGatewayTimeout())
			.andExpect(jsonPath("$.codigo").value("TIEMPO_AGOTADO"));
		mvc.perform(con(token, get(te)).header("X-Scenario", "RATE_LIMIT")).andExpect(status().isTooManyRequests())
			.andExpect(jsonPath("$.codigo").value("LIMITE_EXCEDIDO"));
		mvc.perform(con(token, get(te)).header("X-Scenario", "DATOS_INCOMPLETOS")).andExpect(status().isOk())
			.andExpect(jsonPath("$.nombres").value("Carla"))
			.andExpect(jsonPath("$.apellidos").doesNotExist())
			.andExpect(jsonPath("$.fechaNacimiento").doesNotExist());
		// También por parámetro, sin distinguir mayúsculas; un escenario desconocido es entrada inválida.
		obtener(token, te + "?scenario=rate_limit").andExpect(status().isTooManyRequests());
		obtener(token, te + "?scenario=INVENTADO").andExpect(status().isBadRequest());
		// Una persona que no está en el fixture no tiene resultado.
		obtener(token, "/api/mock/te/personas/CEDULA/0-000-0000").andExpect(status().isNotFound())
			.andExpect(jsonPath("$.codigo").value("SIN_RESULTADO"));
		obtener(token, "/api/mock/css/afiliaciones/P-0003").andExpect(jsonPath("$.afiliado").value(false))
			.andExpect(jsonPath("$.cuotasRegistradas").value(0));
		obtener(token, "/api/mock/registro/consultas/P-0002").andExpect(jsonPath("$.registros.length()").value(2));
	}

	@Test
	void elEscenarioLlenoDevuelveLaMismaRespuestaEnCadaLlamada() throws Exception {
		String token = tokenDe(Rol.FUNCIONARIO, Permiso.VERIFICAR);
		String css = "/api/mock/css/afiliaciones/P-0001";

		String primera = cuerpo(mvc.perform(con(token, get(css)).header("X-Scenario", "LLENO")).andExpect(status().isOk()).andReturn());
		String segunda = cuerpo(mvc.perform(con(token, get(css)).header("X-Scenario", "LLENO")).andExpect(status().isOk()).andReturn());

		assertThat(segunda).isEqualTo(primera);
		assertThat(JsonPath.<String>read(primera, "$.referencia")).startsWith("SIM-CSS-");
	}

	@Test
	void elSnmSimuladoEsCoherenteConLosExpedientesDeLaPlataforma() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.OBSERVAR);
		MvcResult creado = enviar(cliente, "/api/expedientes", "{\"tipoTramite\":\"%s\"}".formatted(TRAMITE_SIMPLE)).andReturn();
		String id = leer(creado, "$.id");
		String numero = leer(creado, "$.numero");

		obtener(despacho, "/api/mock/snm/expedientes/{numero}", numero).andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("RECIBIDO"))
			.andExpect(jsonPath("$.desfase").doesNotExist());
		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", "Inicio").andExpect(status().isOk());
		obtener(despacho, "/api/mock/snm/expedientes/{numero}", numero).andExpect(jsonPath("$.estado").value("EN_ANALISIS"));
		// Un expediente que solo existe en el sistema oficial simulado explica el desfase.
		obtener(despacho, "/api/mock/snm/expedientes/SNM-2026-000002").andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("RESUELTO"))
			.andExpect(jsonPath("$.desfase").isNotEmpty());
	}

	@Test
	void lasFuentesSimuladasSoloLasConsultaElPersonalDelDespacho() throws Exception {
		String te = "/api/mock/te/personas/CEDULA/8-000-0001";
		obtener(null, te).andExpect(status().isUnauthorized());
		obtener(tokenDe(Rol.SOLICITANTE), te).andExpect(status().isForbidden());
		obtener(tokenDe(Rol.AUDITOR), te).andExpect(status().isForbidden());
	}

	/** CA-8: el registro manual asistido y el modo simulado producen la misma entidad de verificación. */
	@Test
	void elRegistroManualYElSimuladoProducenLaMismaEntidad() throws Exception {
		String expedienteId = expediente(tokenDe(Rol.SOLICITANTE), TRAMITE_SIMPLE);
		UUID id = UUID.fromString(expedienteId);
		UUID responsable = funcionarioCompleto().getId();

		Verificacion manual = verificaciones.save(Verificacion.manualAsistida(id, Verificacion.Fuente.TE, "IDENTIDAD",
				"Verificar la identidad del titular", responsable, Instant.now(), Verificacion.ResultadoMinimo.COINCIDE, "Consulta pública TE"));
		Verificacion simulada = Verificacion.simulada(id, Verificacion.Fuente.TE, "IDENTIDAD",
				"Verificar la identidad del titular");
		simulada.responder(Verificacion.ResultadoMinimo.COINCIDE, "SIM-TE-0001");
		verificaciones.save(simulada);

		List<Map<String, Object>> filas = jdbc.queryForList(
				"SELECT modo, estado, fuente, tipo_verificacion, resultado_minimo, fecha_resultado IS NOT NULL AS con_fecha FROM verificacion WHERE expediente_id = ? ORDER BY modo",
				id);
		assertThat(filas).hasSize(2);
		assertThat(filas.get(0).get("modo")).isEqualTo("MANUAL_ASISTIDO");
		assertThat(filas.get(1).get("modo")).isEqualTo("SIMULADO");
		for (String campo : List.of("estado", "fuente", "tipo_verificacion", "resultado_minimo", "con_fecha")) {
			assertThat(filas.get(0).get(campo)).as(campo).isEqualTo(filas.get(1).get(campo));
		}
		assertThat(manual.getResponsableId()).isEqualTo(responsable);
		// Minimización: la tabla no tiene dónde guardar la respuesta de la fuente.
		assertThat(jdbc.queryForList(
				"SELECT column_name FROM information_schema.columns WHERE table_name = 'verificacion'", String.class))
			.containsExactlyInAnyOrder("id", "expediente_id", "fuente", "tipo_verificacion", "modo", "estado", "finalidad",
					"fecha_solicitud", "fecha_resultado", "resultado_minimo", "referencia_origen", "responsable_id", "nota",
					// Sprint 5: solo datos técnicos de la orquestación (HU-24).
					"version", "intentos", "proximo_intento", "ultimo_fallo", "clave_idempotencia", "correlacion_id");
	}

	// ---------- Validación mínima de un objeto JSON contra un esquema del contrato ----------

	@SuppressWarnings("unchecked")
	private static Map<String, Object> en(Map<String, Object> raiz, String... claves) {
		Map<String, Object> actual = raiz;
		for (String clave : claves) {
			actual = (Map<String, Object>) actual.get(clave);
			assertThat(actual).as("El contrato no define " + String.join(" > ", claves)).isNotNull();
		}
		return actual;
	}

	@SuppressWarnings("unchecked")
	private static Map<String, Object> resolver(Object nodo) {
		Map<String, Object> mapa = (Map<String, Object>) nodo;
		Object referencia = mapa.get("$ref");
		if (referencia == null) {
			return mapa;
		}
		String[] partes = referencia.toString().substring(2).split("/");
		return resolver(en(contrato, partes));
	}

	@SuppressWarnings("unchecked")
	private static Map<String, Object> esquemaDe(Object respuesta) {
		Map<String, Object> contenido = (Map<String, Object>) resolver(respuesta).get("content");
		return resolver(en(contenido, "application/json").get("schema"));
	}

	@SuppressWarnings("unchecked")
	private static List<String> validar(String caso, Map<String, Object> json, Map<String, Object> esquema) {
		List<String> fallos = new ArrayList<>();
		Map<String, Object> propiedades = (Map<String, Object>) esquema.get("properties");
		for (Object requerido : (List<Object>) esquema.getOrDefault("required", List.of())) {
			if (json.get(requerido.toString()) == null) {
				fallos.add(caso + ": falta el campo obligatorio " + requerido);
			}
		}
		for (Map.Entry<String, Object> campo : json.entrySet()) {
			if (!propiedades.containsKey(campo.getKey())) {
				fallos.add(caso + ": el campo " + campo.getKey() + " no está en el contrato");
				continue;
			}
			String tipo = String.valueOf(resolver(propiedades.get(campo.getKey())).get("type"));
			Object valor = campo.getValue();
			boolean coincide = switch (tipo) {
				case "string" -> valor instanceof String;
				case "integer" -> valor instanceof Integer || valor instanceof Long;
				case "boolean" -> valor instanceof Boolean;
				case "array" -> valor instanceof List;
				case "object" -> valor instanceof Map;
				default -> true;
			};
			if (!coincide) {
				fallos.add(caso + ": el campo " + campo.getKey() + " debería ser " + tipo);
			}
		}
		return fallos;
	}

}
