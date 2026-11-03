package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/**
 * QA · TASK-18c.5 (HU-18c): registro de los cuatro derechos ARCO, plazo de atención,
 * titularidad por rol, auditoría y no exposición de datos. Complementa {@link PrivacidadTest}. CP-03, CP-11, CP-14.
 */
class QaArcoTest extends PruebaApi {

	@Test
	void losCuatroDerechosSeRegistranConElPlazoConfigurado() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);

		for (String tipo : new String[] { "ACCESO", "RECTIFICACION", "CANCELACION", "OPOSICION" }) {
			MvcResult creada = enviar(cliente, "/api/solicitudes-arco",
					"{\"tipo\":\"%s\",\"descripcion\":\"Solicitud de prueba %s\"}".formatted(tipo, tipo))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.tipo").value(tipo))
				.andExpect(jsonPath("$.estado").value("RECIBIDA"))
				.andReturn();
			// Plazo de atención = fecha de registro + app.arco.plazo-dias (10 por defecto).
			assertThat(LocalDate.parse(leer(creada, "$.plazoAtencion"))).isEqualTo(LocalDate.now().plusDays(10));
			assertThat(eventos("REGISTRAR_SOLICITUD_ARCO", "solicitud-arco/" + leer(creada, "$.id"))).isEqualTo(1);
		}
		obtener(cliente, "/api/solicitudes-arco").andExpect(jsonPath("$", hasSize(4)));
	}

	@Test
	void cadaRolAccedeSoloALoQueLeCorresponde() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = leer(enviar(cliente, "/api/solicitudes-arco", "{\"tipo\":\"ACCESO\",\"descripcion\":\"Mis datos\"}")
			.andExpect(status().isCreated()).andReturn(), "$.id");
		String auditor = tokenDe(Rol.AUDITOR);

		// El auditor consulta la bandeja, pero no la atiende.
		obtener(auditor, "/api/solicitudes-arco/{id}", id).andExpect(status().isOk());
		modificar(auditor, "/api/solicitudes-arco/{id}", "{\"estado\":\"EN_ATENCION\"}", id).andExpect(status().isForbidden());
		// Supervisor y administrador no entran a los derechos ARCO.
		for (String token : new String[] { tokenDe(Rol.SUPERVISOR), tokenDe(Rol.ADMIN) }) {
			obtener(token, "/api/solicitudes-arco").andExpect(status().isForbidden());
			obtener(token, "/api/solicitudes-arco/{id}", id).andExpect(status().isForbidden());
		}
		// El personal no crea solicitudes en nombre propio: el derecho es del titular.
		enviar(tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR), "/api/solicitudes-arco",
				"{\"tipo\":\"ACCESO\",\"descripcion\":\"x\"}").andExpect(status().isForbidden());
		obtener(null, "/api/solicitudes-arco").andExpect(status().isUnauthorized());
		obtener(cliente, "/api/solicitudes-arco/{id}", UUID.randomUUID()).andExpect(status().isNotFound());
		obtener(cliente, "/api/solicitudes-arco/{id}", "no-es-uuid").andExpect(status().isBadRequest());
	}

	@Test
	void laAtencionQuedaAuditadaConElResponsableYElRechazoConSuMotivo() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		Usuario analista = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR);
		String despacho = token(analista);
		String id = leer(enviar(cliente, "/api/solicitudes-arco", "{\"tipo\":\"OPOSICION\",\"descripcion\":\"No acepto publicidad\"}")
			.andExpect(status().isCreated()).andReturn(), "$.id");

		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"EN_ATENCION\"}", id).andExpect(status().isOk());
		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"RECHAZADA\",\"motivoRechazo\":\"Obligación legal\"}", id)
			.andExpect(status().isOk());

		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND operacion = 'ATENDER_SOLICITUD_ARCO' AND recurso = ? AND resultado = 'EXITO'",
				Long.class, analista.getId(), "solicitud-arco/" + id))
			.isEqualTo(2);
		assertThat(jdbc.queryForObject("SELECT responsable_id FROM solicitud_arco WHERE id = ?::uuid", UUID.class, id))
			.isEqualTo(analista.getId());
	}

	@Test
	void niLaRespuestaNiLosAvisosDelDespachoExponenDatosDelTitular() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		String despacho = token(usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR));
		String id = leer(enviar(cliente, "/api/solicitudes-arco",
				"{\"tipo\":\"CANCELACION\",\"descripcion\":\"Eliminar mi cédula 8-888-8888\"}").andExpect(status().isCreated())
			.andReturn(), "$.id");

		String respuesta = cuerpo(obtener(cliente, "/api/solicitudes-arco/{id}", id).andReturn());
		assertThat(respuesta).doesNotContain(titular.getCorreo()).doesNotContain("contrasena");
		String avisos = cuerpo(obtener(despacho, "/api/notificaciones?tamano=100").andReturn());
		assertThat(avisos).contains(id.substring(0, 8)).doesNotContain("8-888-8888").doesNotContain(titular.getCorreo());
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE recurso = ? AND detalle LIKE '%8-888-8888%'", Long.class,
				"solicitud-arco/" + id))
			.as("la bitácora no copia la descripción del titular")
			.isZero();
	}

}
