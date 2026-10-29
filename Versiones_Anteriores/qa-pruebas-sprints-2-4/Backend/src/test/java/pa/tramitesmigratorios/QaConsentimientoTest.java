package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.privacidad.ConsentimientoServicio;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/**
 * QA · TASK-18b.5 (HU-18b): alta, revocación, limitación del tratamiento sin consentimiento
 * vigente, vencimiento y auditoría. Complementa {@link PrivacidadTest} y {@link DocumentoTest}. CP-09, CP-11, CP-13.
 */
class QaConsentimientoTest extends PruebaApi {

	@Autowired
	ConsentimientoServicio servicio;

	private static String cuerpo(Usuario titular, boolean expreso, String extra) {
		return """
				{"titularId":"%s","finalidad":"Trámite de residencia","alcance":"Identidad y documentos del trámite",
				 "baseLegal":"Ley 81 de 2019","expreso":%s%s}""".formatted(titular.getId(), expreso, extra);
	}

	@Test
	void sinConsentimientoElTratamientoSeLimitaALoContractual() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);

		// Lo contractual funciona sin consentimiento: crear el expediente y adjuntar documentos no sensibles.
		String id = expediente(cliente, "RESIDENCIA_TEMPORAL");
		adjuntar(cliente, id, "PASAPORTE", "p.pdf", "application/pdf", PDF).andExpect(status().isCreated());
		// Lo que va más allá queda limitado: la regla de negocio lo rechaza…
		assertThat(servicio.tieneVigente(titular.getId())).isFalse();
		assertThatThrownBy(() -> servicio.exigirVigente(titular.getId())).isInstanceOf(ErrorApi.class)
			.hasMessageContaining("se limita a lo contractual");
		// …y los datos sensibles se bloquean.
		adjuntar(cliente, id, "CERTIFICADO_SALUD", "s.pdf", "application/pdf", PDF).andExpect(status().isForbidden())
			.andExpect(jsonPath("$.codigo").value("CONSENTIMIENTO_EXPRESO_REQUERIDO"));

		String consentimiento = leer(enviar(cliente, "/api/consentimientos", cuerpo(titular, false, ""))
			.andExpect(status().isCreated()).andReturn(), "$.id");
		assertThatCode(() -> servicio.exigirVigente(titular.getId())).doesNotThrowAnyException();

		modificar(cliente, "/api/consentimientos/{id}", "", consentimiento).andExpect(status().isOk());
		assertThatThrownBy(() -> servicio.exigirVigente(titular.getId())).isInstanceOf(ErrorApi.class);
	}

	@Test
	void unConsentimientoVencidoCuentaComoNoVigente() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		String id = expediente(cliente, "RESIDENCIA_TEMPORAL");
		String consentimiento = leer(enviar(cliente, "/api/consentimientos",
				cuerpo(titular, true, ",\"vigenciaHasta\":\"" + LocalDate.now().plusDays(30) + "\""))
			.andExpect(status().isCreated()).andReturn(), "$.id");
		adjuntar(cliente, id, "CERTIFICADO_SALUD", "s1.pdf", "application/pdf", PDF).andExpect(status().isCreated());

		jdbc.update("UPDATE consentimiento SET vigencia_hasta = current_date - 1 WHERE id = ?::uuid", consentimiento);

		assertThat(servicio.tieneVigente(titular.getId())).isFalse();
		adjuntar(cliente, id, "CERTIFICADO_SALUD", "s2.pdf", "application/pdf", PDF).andExpect(status().isForbidden());
	}

	@Test
	void quienPuedeConsultarYQuienNoLosConsentimientosDeUnCliente() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		enviar(token(titular), "/api/consentimientos", cuerpo(titular, false, "")).andExpect(status().isCreated());
		String url = "/api/consentimientos?titularId=" + titular.getId();

		obtener(tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR), url).andExpect(status().isOk());
		obtener(tokenDe(Rol.AUDITOR), url).andExpect(status().isOk());
		obtener(tokenDe(Rol.SUPERVISOR), url).andExpect(status().isForbidden());
		obtener(tokenDe(Rol.ADMIN), url).andExpect(status().isForbidden());
		obtener(null, url).andExpect(status().isUnauthorized());
		// El auditor consulta, pero no registra ni revoca.
		enviar(tokenDe(Rol.AUDITOR), "/api/consentimientos", cuerpo(titular, false, "")).andExpect(status().isForbidden());
	}

	@Test
	void cadaAltaYRevocacionQuedaAuditadaConActorYResultado() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		Usuario recepcion = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR);
		String id = leer(enviar(token(recepcion), "/api/consentimientos", cuerpo(titular, false, ""))
			.andExpect(status().isCreated()).andReturn(), "$.id");
		modificar(token(titular), "/api/consentimientos/{id}", "", id).andExpect(status().isOk());

		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND operacion = 'REGISTRAR_CONSENTIMIENTO' AND recurso = ? AND resultado = 'EXITO'",
				Long.class, recepcion.getId(), "consentimiento/" + id))
			.as("alta registrada por recepción a nombre del cliente")
			.isEqualTo(1);
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND operacion = 'REVOCAR_CONSENTIMIENTO' AND recurso = ? AND resultado = 'EXITO'",
				Long.class, titular.getId(), "consentimiento/" + id))
			.isEqualTo(1);
		// La evidencia no se borra: el registro sigue en la base con su revocación.
		assertThat(jdbc.queryForObject("SELECT estado FROM consentimiento WHERE id = ?::uuid", String.class, id))
			.isEqualTo("REVOCADO");
		assertThat(jdbc.queryForObject("SELECT registrado_por_id FROM consentimiento WHERE id = ?::uuid", java.util.UUID.class, id))
			.isEqualTo(recepcion.getId());
	}

}
