package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/**
 * QA · TASK-14.4 (HU-14): un caso por cada código de error del contrato (400, 401, 403, 404,
 * 409, 415, 429, 500, 504) y revisión de que ninguno expone trazas, esquema ni datos personales. CP-02, CP-11.
 */
class QaCodigosErrorTest extends PruebaApi {

	private static final String TE = "/api/mock/te/personas/CEDULA/8-123-456";

	@Test
	void cadaCodigoDeErrorRespondeConElCuerpoUniformeYSinDetallesInternos() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		String despacho = token(funcionarioCompleto());
		String id = expediente(cliente, TRAMITE_SIMPLE);
		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", "Inicio").andExpect(status().isOk());

		Map<Integer, MvcResult> errores = new LinkedHashMap<>();
		errores.put(400, enviar(cliente, "/api/expedientes", "{\"tipoTramite\":").andReturn());
		errores.put(401, obtener(null, "/api/expedientes/{id}", id).andReturn());
		errores.put(403, obtener(cliente, "/api/auditoria/eventos").andReturn());
		errores.put(404, obtener(cliente, "/api/expedientes/{id}", UUID.randomUUID()).andReturn());
		errores.put(409, modificar(despacho, "/api/expedientes/{id}/estado",
				"{\"estadoNuevo\":\"ARCHIVADO\",\"motivo\":\"Desiste\",\"version\":0}", id).andReturn());
		errores.put(415, mvc.perform(con(cliente, post("/api/expedientes")).contentType(MediaType.TEXT_PLAIN)
			.content("tipoTramite=PRORROGA_ESTADIA")).andReturn());
		errores.put(429, mvc.perform(con(despacho, get(TE)).header("X-Scenario", "RATE_LIMIT")).andReturn());
		errores.put(500, mvc.perform(con(despacho, get(TE)).header("X-Scenario", "ERROR_TECNICO")).andReturn());
		errores.put(504, mvc.perform(con(despacho, get(TE)).header("X-Scenario", "TIMEOUT")).andReturn());

		for (Map.Entry<Integer, MvcResult> error : errores.entrySet()) {
			MvcResult respuesta = error.getValue();
			String cuerpo = cuerpo(respuesta);
			assertThat(respuesta.getResponse().getStatus()).as("código esperado").isEqualTo(error.getKey());
			assertThat(this.<String>leer(respuesta, "$.codigo")).as("codigo de " + error.getKey()).isNotBlank();
			assertThat(this.<String>leer(respuesta, "$.mensaje")).as("mensaje de " + error.getKey()).isNotBlank();
			assertThat(this.<String>leer(respuesta, "$.correlacionId")).as("correlación de " + error.getKey())
				.isEqualTo(respuesta.getResponse().getHeader("X-Correlation-Id"));
			assertThat(cuerpo).as("cuerpo de " + error.getKey())
				.doesNotContain("Exception")
				.doesNotContain("org.springframework")
				.doesNotContain("org.hibernate")
				.doesNotContain("pa.tramitesmigratorios")
				.doesNotContain("\tat ")
				.doesNotContainIgnoringCase("select ")
				.doesNotContain("evento_auditoria")
				.doesNotContain(titular.getCorreo())
				.doesNotContain(CLAVE);
		}
		assertThat(this.<String>leer(errores.get(409), "$.codigo")).isEqualTo("VERSION_DESACTUALIZADA");
		assertThat(this.<String>leer(errores.get(415), "$.codigo")).isEqualTo("FORMATO_NO_SOPORTADO");
		assertThat(this.<String>leer(errores.get(500), "$.codigo")).isEqualTo("ERROR_TECNICO");
		assertThat(this.<String>leer(errores.get(504), "$.codigo")).isEqualTo("TIEMPO_AGOTADO");
	}

	@Test
	void elLoginFallidoNoRevelaSiElCorreoExiste() throws Exception {
		Usuario existente = usuario(Rol.SOLICITANTE);

		MvcResult claveMala = enviar(null, "/api/auth/login",
				"{\"correo\":\"%s\",\"contrasena\":\"Clave-Incorrecta-1\"}".formatted(existente.getCorreo()))
			.andReturn();
		MvcResult correoInexistente = enviar(null, "/api/auth/login",
				"{\"correo\":\"nadie-%s@prueba.pa\",\"contrasena\":\"Clave-Incorrecta-1\"}".formatted(UUID.randomUUID()))
			.andReturn();

		assertThat(claveMala.getResponse().getStatus()).isEqualTo(correoInexistente.getResponse().getStatus())
			.isEqualTo(401);
		assertThat(this.<String>leer(claveMala, "$.codigo")).isEqualTo(leer(correoInexistente, "$.codigo"));
		assertThat(this.<String>leer(claveMala, "$.mensaje")).isEqualTo(leer(correoInexistente, "$.mensaje"));
		assertThat(cuerpo(claveMala)).doesNotContain(existente.getCorreo());
	}

	@Test
	void losErroresDeValidacionSeñalanElCampoSinDevolverElValorEnviado() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String inyeccion = "<script>alert(1)</script>' OR 1=1 --";

		MvcResult respuesta = enviar(cliente, "/api/expedientes", "{\"tipoTramite\":\"%s\"}".formatted(inyeccion.replace("\"", "")))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("tipoTramite"))
			.andReturn();

		assertThat(cuerpo(respuesta)).doesNotContain("<script>").doesNotContain("OR 1=1");
	}

	@Test
	void unaFuenteCaidaNoSeConfundeConUnResultadoNegativo() throws Exception {
		String despacho = token(funcionarioCompleto());

		// Sin resultado es una respuesta válida de la fuente (4xx); el fallo técnico es 5xx.
		int sinResultado = mvc.perform(con(despacho, get(TE)).header("X-Scenario", "SIN_RESULTADO"))
			.andReturn()
			.getResponse()
			.getStatus();
		int caida = mvc.perform(con(despacho, get(TE)).header("X-Scenario", "ERROR_TECNICO"))
			.andReturn()
			.getResponse()
			.getStatus();

		assertThat(sinResultado).isBetween(400, 499);
		assertThat(caida).isBetween(500, 599);
	}

}
