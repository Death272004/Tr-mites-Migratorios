package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;
import pa.tramitesmigratorios.verificacion.Verificaciones;

/**
 * HU-24 y HU-25: orquestación de verificaciones con reintentos e idempotencia, minimización y
 * trazabilidad, sobre la aplicación completa. CP-06, CP-07, CP-08, CP-11.
 */
class VerificacionesTest extends PruebaApi {

	/** Persona P-0002 del fixture maestro: 9 cuotas en la CSS y registros en el Registro Público. */
	private static final String DOCUMENTO = "XF0000002";
	private static final String NOMBRE = "Tomas Titular Ficticio";

	private static final String TE_MANUAL = """
			{"fuente":"TE","tipoVerificacion":"IDENTIDAD","modo":"MANUAL_ASISTIDO","finalidad":"IDENTIDAD_DEL_TITULAR",
			 "fechaResultado":"%s","resultadoMinimo":"COINCIDE","referenciaOrigen":"Consulta pública TE"}""";
	private static final String TE_SIMULADO = """
			{"fuente":"TE","tipoVerificacion":"IDENTIDAD","modo":"SIMULADO","finalidad":"IDENTIDAD_DEL_TITULAR"}""";
	private static final String CSS_SIMULADO = """
			{"fuente":"CSS","tipoVerificacion":"AFILIACION","modo":"SIMULADO","finalidad":"AFILIACION_DEL_TITULAR"}""";

	@Autowired
	Verificaciones orquestador;

	/** Cliente con el documento del fixture, su consentimiento y un expediente; y un analista del despacho. */
	private final class Caso {

		final Usuario titular = usuario(Rol.SOLICITANTE);
		final String cliente = token(titular);
		final Usuario analista = funcionarioCompleto();
		final String despacho = token(analista);
		final String expediente;

		Caso(String tramite, boolean conDocumento, Boolean consentimientoExpreso) throws Exception {
			if (conDocumento) {
				jdbc.update("UPDATE usuario SET tipo_documento = NULL, numero_documento = NULL WHERE numero_documento = ?",
						DOCUMENTO);
				jdbc.update("UPDATE usuario SET nombre = ?, tipo_documento = 'PASAPORTE', numero_documento = ? WHERE id = ?",
						NOMBRE, DOCUMENTO, titular.getId());
			}
			if (consentimientoExpreso != null) {
				enviar(cliente, "/api/consentimientos", """
						{"titularId":"%s","finalidad":"Trámite migratorio","alcance":"Identidad, afiliación y antecedentes",
						 "baseLegal":"Consentimiento informado","expreso":%s}""".formatted(titular.getId(), consentimientoExpreso))
					.andExpect(status().isCreated());
			}
			expediente = expediente(cliente, tramite);
		}

		ResultActions registrar(String json) throws Exception {
			return enviar(despacho, "/api/expedientes/{id}/verificaciones", json, expediente);
		}

		ResultActions registrar(String json, String escenario, String clave) throws Exception {
			var peticion = con(despacho, post("/api/expedientes/{id}/verificaciones", expediente))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json)
				.header("X-Scenario", escenario);
			if (clave != null) {
				peticion.header("Idempotency-Key", clave);
			}
			return mvc.perform(peticion);
		}

		ResultActions reintentar(String verificacionId, String escenario) throws Exception {
			return mvc.perform(con(despacho, post("/api/expedientes/{id}/verificaciones/{v}/reintento", expediente,
					verificacionId)).header("X-Scenario", escenario));
		}

	}

	private static String hace(long segundos) {
		return Instant.now().minusSeconds(segundos).toString();
	}

	/** TASK-24.2: las verificaciones que aplican salen de la matriz y de los requisitos del trámite. */
	@Test
	void laPreparacionCreaLasQueAplicanAlTramiteSinDuplicar() throws Exception {
		Caso permanente = new Caso("RESIDENCIA_PERMANENTE", false, null);
		enviar(permanente.despacho, "/api/expedientes/{id}/verificaciones/preparacion", "", permanente.expediente)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$[*].fuente", containsInAnyOrder("TE", "CSS", "DOCUMENTO_EXTERIOR")))
			.andExpect(jsonPath("$[*].estado", containsInAnyOrder("PENDIENTE", "PENDIENTE", "PENDIENTE")))
			.andExpect(jsonPath("$[*].modo", containsInAnyOrder("MANUAL_ASISTIDO", "MANUAL_ASISTIDO", "MANUAL_ASISTIDO")));
		enviar(permanente.despacho, "/api/expedientes/{id}/verificaciones/preparacion", "", permanente.expediente)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$", hasSize(0)));

		Caso prorroga = new Caso(TRAMITE_SIMPLE, false, null);
		enviar(prorroga.despacho, "/api/expedientes/{id}/verificaciones/preparacion", "", prorroga.expediente)
			.andExpect(jsonPath("$[*].fuente", containsInAnyOrder("TE")));
	}

	/** CA-2 y CA-6: el registro manual asistido guarda responsable, fecha, fuente y resultado, y completa la pendiente. */
	@Test
	void elRegistroManualAsistidoGuardaElResponsableHumano() throws Exception {
		Caso caso = new Caso(TRAMITE_SIMPLE, false, false);
		MvcResult preparada = enviar(caso.despacho, "/api/expedientes/{id}/verificaciones/preparacion", "",
				caso.expediente).andReturn();
		String pendiente = leer(preparada, "$[0].id");
		enviar(caso.despacho, "/api/expedientes/{id}/verificaciones/{v}/atencion", "", caso.expediente, pendiente)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("EN_ATENCION"));

		caso.registrar(TE_MANUAL.formatted(hace(3600)))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.id").value(pendiente))
			.andExpect(jsonPath("$.estado").value("RESPONDIDA"))
			.andExpect(jsonPath("$.modo").value("MANUAL_ASISTIDO"))
			.andExpect(jsonPath("$.resultadoMinimo").value("COINCIDE"))
			.andExpect(jsonPath("$.responsableId").value(caso.analista.getId().toString()))
			.andExpect(jsonPath("$.finalidad").value("IDENTIDAD_DEL_TITULAR"));
		assertThat(eventos("REGISTRAR_VERIFICACION", "verificacion/" + pendiente)).isEqualTo(1);

		// La fecha del cotejo no puede estar en el futuro y el resultado debe corresponder a la fuente.
		Caso otro = new Caso(TRAMITE_SIMPLE, false, false);
		otro.registrar(TE_MANUAL.formatted(Instant.now().plusSeconds(3600))).andExpect(status().isBadRequest());
		otro.registrar(TE_MANUAL.formatted(hace(60)).replace("COINCIDE", "VIGENTE")).andExpect(status().isBadRequest());
	}

	/** HU-25 CA-2: sin finalidad autorizada, fuente de la matriz o consentimiento, la verificación no se realiza. */
	@Test
	void sinFinalidadFuenteOConsentimientoNoSeVerifica() throws Exception {
		Caso sinConsentimiento = new Caso(TRAMITE_SIMPLE, true, null);
		sinConsentimiento.registrar(TE_MANUAL.formatted(hace(60)))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.codigo").value("CONSENTIMIENTO_REQUERIDO"));

		Caso caso = new Caso(TRAMITE_SIMPLE, true, false);
		caso.registrar(TE_SIMULADO.replace("IDENTIDAD_DEL_TITULAR", "MERCADEO"))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.codigo").value("FINALIDAD_NO_AUTORIZADA"));
		caso.registrar("""
				{"fuente":"SNM","tipoVerificacion":"ESTADO","modo":"SIMULADO","finalidad":"ESTADO_DEL_TRAMITE"}""")
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.codigo").value("FUENTE_NO_AUTORIZADA"));
		// La CSS es un dato sensible: pide consentimiento expreso.
		caso.registrar(CSS_SIMULADO)
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.codigo").value("CONSENTIMIENTO_EXPRESO_REQUERIDO"));
		// Un cliente o un analista sin VERIFICAR no registran verificaciones.
		enviar(caso.cliente, "/api/expedientes/{id}/verificaciones", TE_SIMULADO, caso.expediente)
			.andExpect(status().isForbidden());
		enviar(tokenDe(Rol.FUNCIONARIO, pa.tramitesmigratorios.seguridad.Permiso.CONSULTAR),
				"/api/expedientes/{id}/verificaciones", TE_SIMULADO, caso.expediente)
			.andExpect(status().isForbidden());

		assertThat(jdbc.queryForObject("SELECT count(*) FROM verificacion WHERE expediente_id = ?::uuid", Long.class,
				caso.expediente)).isZero();
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE operacion = 'REGISTRAR_VERIFICACION' AND resultado = 'DENEGADO' AND recurso = ?",
				Long.class, "expediente/" + caso.expediente)).isGreaterThanOrEqualTo(3);
	}

	@Test
	void elModoSimuladoConsultaLasFuentesYGuardaSoloElResultadoMinimo() throws Exception {
		Caso caso = new Caso("RESIDENCIA_PERMANENTE", true, true);
		caso.registrar(TE_SIMULADO, "OK", null)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.modo").value("SIMULADO"))
			.andExpect(jsonPath("$.estado").value("RESPONDIDA"))
			.andExpect(jsonPath("$.resultadoMinimo").value("COINCIDE"))
			.andExpect(jsonPath("$.intentos").value(1))
			.andExpect(jsonPath("$.correlacionId").isNotEmpty());
		caso.registrar(CSS_SIMULADO, "OK", null)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.resultadoMinimo").value("VIGENTE"));
		caso.registrar("""
				{"fuente":"REGISTRO_PUBLICO","tipoVerificacion":"INFORMACION_REGISTRAL","modo":"SIMULADO",
				 "finalidad":"INFORMACION_REGISTRAL"}""", "SIN_RESULTADO", null)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.estado").value("SIN_RESULTADO"));
		// Los documentos del exterior solo se cotejan a mano.
		caso.registrar("""
				{"fuente":"DOCUMENTO_EXTERIOR","tipoVerificacion":"LEGALIZACION","modo":"SIMULADO",
				 "finalidad":"VIGENCIA_Y_LEGALIZACION"}""", "OK", null)
			.andExpect(status().isBadRequest());

		// HU-25 CA-4 y CA-5: ni la verificación ni la auditoría guardan datos del titular ni de la fuente.
		List<Map<String, Object>> filas = jdbc.queryForList("SELECT * FROM verificacion WHERE expediente_id = ?::uuid",
				caso.expediente);
		List<Map<String, Object>> auditoria = jdbc.queryForList(
				"SELECT recurso, detalle FROM evento_auditoria WHERE detalle LIKE ?", "%" + caso.expediente + "%");
		assertThat(filas).hasSize(3);
		assertThat(auditoria).isNotEmpty();
		for (Object valor : filas.stream().flatMap(f -> f.values().stream()).toList()) {
			assertThat(String.valueOf(valor)).doesNotContain(DOCUMENTO, "Tomas", "P-0002", "000-00-0002", "F-00000");
		}
		assertThat(auditoria.toString()).doesNotContain(DOCUMENTO, "Tomas");
	}

	@Test
	void sinDocumentoDelTitularElModoSimuladoNoSeEmite() throws Exception {
		Caso caso = new Caso(TRAMITE_SIMPLE, false, false);
		caso.registrar(TE_SIMULADO, "OK", null)
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("DOCUMENTO_DEL_TITULAR_FALTANTE"));
	}

	/**
	 * CP-07: un error técnico no es un resultado negativo, no cambia el expediente ni permite
	 * resolverlo; el reintento programado recupera la verificación cuando la fuente vuelve.
	 */
	@Test
	void unErrorTecnicoProgramaUnReintentoYNuncaEsResultadoNegativo() throws Exception {
		Caso caso = new Caso(TRAMITE_SIMPLE, true, false);
		MvcResult fallida = caso.registrar(TE_SIMULADO, "ERROR_TECNICO", null)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.estado").value("REINTENTO_PROGRAMADO"))
			.andExpect(jsonPath("$.ultimoFallo").value("ERROR_TECNICO"))
			.andExpect(jsonPath("$.resultadoMinimo").doesNotExist())
			.andExpect(jsonPath("$.proximoIntento").isNotEmpty())
			.andReturn();
		String id = leer(fallida, "$.id");

		// Mientras tanto otra petición simulada de la misma fuente no la duplica.
		caso.registrar(TE_SIMULADO, "OK", null)
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("VERIFICACION_EN_CURSO"));

		cambiarEstado(caso.despacho, caso.despacho, caso.expediente, "EN_ANALISIS", "Inicio").andExpect(status().isOk());
		cambiarEstado(caso.despacho, caso.despacho, caso.expediente, "ADMITIDO", "Conforme").andExpect(status().isOk());
		adjuntar(caso.cliente, caso.expediente, "PASAPORTE", "pasaporte.pdf", "application/pdf", PDF)
			.andExpect(status().isCreated());
		adjuntar(caso.cliente, caso.expediente, "COMPROBANTE_PAGO", "pago.pdf", "application/pdf", PDF)
			.andExpect(status().isCreated());
		cambiarEstado(caso.despacho, caso.despacho, caso.expediente, "EN_RESOLUCION", "Listo")
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("REQUISITOS_INCOMPLETOS"));
		obtener(caso.despacho, "/api/expedientes/{id}", caso.expediente).andExpect(jsonPath("$.estado").value("ADMITIDO"));

		// La fuente vuelve: el reintento programado vencido la resuelve (espera 0 en pruebas).
		assertThat(orquestador.procesarReintentosVencidos(Instant.now().plusSeconds(1))).isGreaterThanOrEqualTo(1);
		obtener(caso.despacho, "/api/expedientes/{id}/verificaciones", caso.expediente)
			.andExpect(jsonPath("$[0].id").value(id))
			.andExpect(jsonPath("$[0].estado").value("RESPONDIDA"))
			.andExpect(jsonPath("$[0].resultadoMinimo").value("COINCIDE"))
			.andExpect(jsonPath("$[0].intentos").value(2));
		cambiarEstado(caso.despacho, caso.despacho, caso.expediente, "EN_RESOLUCION", "Listo").andExpect(status().isOk());
		assertThat(eventos("REINTENTO_PROGRAMADO_VERIFICACION", "verificacion/" + id)).isEqualTo(1);
	}

	/** Reintentos limitados: agotado el tope queda en ERROR_TECNICO y se resuelve a mano. */
	@Test
	void losReintentosTienenTopeYLuegoSeCotejaAMano() throws Exception {
		Caso caso = new Caso(TRAMITE_SIMPLE, true, false);
		String id = leer(caso.registrar(TE_SIMULADO, "TIMEOUT", null)
			.andExpect(jsonPath("$.ultimoFallo").value("TIEMPO_AGOTADO"))
			.andReturn(), "$.id");
		caso.reintentar(id, "TIMEOUT").andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("REINTENTO_PROGRAMADO"));
		caso.reintentar(id, "RATE_LIMIT")
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("ERROR_TECNICO"))
			.andExpect(jsonPath("$.intentos").value(3))
			.andExpect(jsonPath("$.resultadoMinimo").doesNotExist());
		caso.reintentar(id, "OK")
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("REINTENTO_NO_PERMITIDO"));

		caso.registrar(TE_MANUAL.formatted(hace(60)))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.id").value(id))
			.andExpect(jsonPath("$.estado").value("RESPONDIDA"))
			.andExpect(jsonPath("$.modo").value("MANUAL_ASISTIDO"));
	}

	/** CP-08: la misma petición repetida no crea una segunda verificación ni vuelve a consultar la fuente. */
	@Test
	void unaPeticionRepetidaNoDuplicaLaOperacion() throws Exception {
		Caso caso = new Caso(TRAMITE_SIMPLE, true, false);
		String clave = "clave-" + UUID.randomUUID();
		String id = leer(caso.registrar(TE_SIMULADO, "LLENO", clave).andExpect(status().isCreated()).andReturn(), "$.id");

		caso.registrar(TE_SIMULADO, "LLENO", clave)
			.andExpect(status().isOk())
			.andExpect(header().string("Idempotent-Replayed", "true"))
			.andExpect(jsonPath("$.id").value(id))
			.andExpect(jsonPath("$.intentos").value(1));
		// Aunque el segundo envío trajera otro escenario, se devuelve lo ya registrado.
		caso.registrar(TE_SIMULADO, "ERROR_TECNICO", clave)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("RESPONDIDA"));

		assertThat(jdbc.queryForObject("SELECT count(*) FROM verificacion WHERE expediente_id = ?::uuid", Long.class,
				caso.expediente)).isEqualTo(1);
		assertThat(eventos("REGISTRAR_VERIFICACION", "verificacion/" + id)).isEqualTo(1);
		caso.registrar(TE_SIMULADO, "OK", "corta").andExpect(status().isBadRequest());
	}

	/** HU-26 CA-5: el cliente ve el estado agregado, sin resultado, responsable ni datos técnicos. */
	@Test
	void elClienteSoloVeElEstadoAgregado() throws Exception {
		Caso caso = new Caso(TRAMITE_SIMPLE, true, false);
		caso.registrar(TE_SIMULADO, "ERROR_TECNICO", null).andExpect(status().isCreated());

		obtener(caso.cliente, "/api/expedientes/{id}/verificaciones", caso.expediente)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].estado").value("PENDIENTE"))
			.andExpect(jsonPath("$[0].fuente").value("TE"))
			.andExpect(jsonPath("$[0].resultadoMinimo").doesNotExist())
			.andExpect(jsonPath("$[0].responsableId").doesNotExist())
			.andExpect(jsonPath("$[0].ultimoFallo").doesNotExist())
			.andExpect(jsonPath("$[0].intentos").doesNotExist())
			.andExpect(jsonPath("$[0].finalidad").doesNotExist());
		// Un cliente ajeno no ve que el expediente existe (CP-03).
		obtener(tokenDe(Rol.SOLICITANTE), "/api/expedientes/{id}/verificaciones", caso.expediente)
			.andExpect(status().isNotFound());
	}

	@Test
	void laMatrizDeFuentesYFinalidadEsConsultable() throws Exception {
		obtener(tokenDe(Rol.AUDITOR), "/api/verificaciones/matriz")
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].fuente", containsInAnyOrder("TE", "CSS", "REGISTRO_PUBLICO", "DOCUMENTO_EXTERIOR")))
			.andExpect(jsonPath("$[?(@.fuente == 'CSS')].consentimiento", containsInAnyOrder("EXPRESO")));
		obtener(tokenDe(Rol.SOLICITANTE), "/api/verificaciones/matriz").andExpect(status().isForbidden());
	}

}
