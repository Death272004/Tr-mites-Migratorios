package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/**
 * QA · TASK-20.3 (HU-20): quién puede registrar y leer observaciones, validaciones del texto
 * y registro en auditoría de cada intento, exitoso o denegado. Complementa {@link EstadosTest}. CP-03, CP-09.
 */
class QaObservacionesTest extends PruebaApi {

	private static final String TEXTO = "{\"texto\":\"Adjunte el comprobante legible.\"}";

	@Test
	void soloElClienteTitularYElFuncionarioConPermisoDeObservarEscriben() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String url = "/api/expedientes/{id}/observaciones";

		enviar(cliente, url, TEXTO, id).andExpect(status().isCreated());
		enviar(tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.OBSERVAR), url, TEXTO, id).andExpect(status().isCreated());

		enviar(tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR), url, TEXTO, id).andExpect(status().isForbidden());
		enviar(tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.RESOLVER, Permiso.NOTIFICAR), url, TEXTO, id)
			.andExpect(status().isForbidden());
		enviar(tokenDe(Rol.SUPERVISOR), url, TEXTO, id).andExpect(status().isForbidden());
		enviar(tokenDe(Rol.AUDITOR), url, TEXTO, id).andExpect(status().isForbidden());
		enviar(tokenDe(Rol.ADMIN), url, TEXTO, id).andExpect(status().isForbidden());
		enviar(tokenDe(Rol.SOLICITANTE), url, TEXTO, id).andExpect(status().isNotFound());
		enviar(null, url, TEXTO, id).andExpect(status().isUnauthorized());

		assertThat(jdbc.queryForObject("SELECT count(*) FROM observacion WHERE expediente_id = ?::uuid", Long.class, id))
			.isEqualTo(2);
	}

	@Test
	void elSupervisorYElAuditorLeenPeroElAdministradorNo() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		enviar(cliente, "/api/expedientes/{id}/observaciones", TEXTO, id).andExpect(status().isCreated());

		obtener(tokenDe(Rol.SUPERVISOR), "/api/expedientes/{id}/observaciones", id).andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(1)));
		obtener(tokenDe(Rol.AUDITOR), "/api/expedientes/{id}/observaciones", id).andExpect(status().isOk());
		obtener(tokenDe(Rol.ADMIN), "/api/expedientes/{id}/observaciones", id).andExpect(status().isForbidden());
		obtener(tokenDe(Rol.FUNCIONARIO), "/api/expedientes/{id}/observaciones", id).andExpect(status().isForbidden());
	}

	@Test
	void elTextoSeValidaEnElServidor() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String url = "/api/expedientes/{id}/observaciones";

		enviar(cliente, url, "{\"texto\":\"%s\"}".formatted("a".repeat(2001)), id).andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("texto"));
		enviar(cliente, url, "{\"texto\":\"%s\"}".formatted("a".repeat(2000)), id).andExpect(status().isCreated());
		enviar(cliente, url, "{}", id).andExpect(status().isBadRequest());
		enviar(cliente, url, "{\"texto\":null}", id).andExpect(status().isBadRequest());
		enviar(cliente, url, TEXTO, UUID.randomUUID()).andExpect(status().isNotFound());
		// El HTML se guarda como texto, sin interpretarse: la respuesta lo devuelve tal cual, como dato JSON.
		enviar(cliente, url, "{\"texto\":\"<b>negrita</b>\"}", id).andExpect(status().isCreated())
			.andExpect(jsonPath("$.texto").value("<b>negrita</b>"));
	}

	@Test
	void cadaObservacionYCadaIntentoDenegadoQuedanEnAuditoria() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String id = expediente(token(titular), TRAMITE_SIMPLE);
		Usuario analista = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.OBSERVAR);
		Usuario sinPermiso = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR);
		Usuario supervisor = usuario(Rol.SUPERVISOR);

		enviar(token(analista), "/api/expedientes/{id}/observaciones", TEXTO, id).andExpect(status().isCreated());
		enviar(token(sinPermiso), "/api/expedientes/{id}/observaciones", TEXTO, id).andExpect(status().isForbidden());
		enviar(token(supervisor), "/api/expedientes/{id}/observaciones", TEXTO, id).andExpect(status().isForbidden());

		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND operacion = 'REGISTRAR_OBSERVACION' AND resultado = 'EXITO' AND recurso = ?",
				Long.class, analista.getId(), "expediente/" + id))
			.isEqualTo(1);
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND resultado = 'DENEGADO'", Long.class,
				sinPermiso.getId()))
			.as("intento sin permiso OBSERVAR")
			.isGreaterThanOrEqualTo(1);
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND resultado = 'DENEGADO'", Long.class,
				supervisor.getId()))
			.as("intento del supervisor (fuera de la matriz)")
			.isEqualTo(1);
		// La bitácora no copia el texto de la observación.
		assertThat(jdbc.queryForObject("SELECT count(*) FROM evento_auditoria WHERE detalle LIKE '%comprobante legible%'",
				Long.class))
			.isZero();
	}

}
