package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/**
 * QA · TASK-13.4 (HU-13): casos de autorización que complementan {@link AutorizacionTest}:
 * sesiones inválidas, intentos de escalar privilegios y operaciones fuera de la matriz. CP-01, CP-02, CP-03.
 */
class QaAutorizacionTest extends PruebaApi {

	@Test
	void unTokenFalsoMalFormadoOSinPrefijoBearerNoAutentica() throws Exception {
		obtener(UUID.randomUUID().toString(), "/api/perfil").andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
		obtener("", "/api/perfil").andExpect(status().isUnauthorized());
		String valido = tokenDe(Rol.SOLICITANTE);
		mvc.perform(get("/api/perfil").header(HttpHeaders.AUTHORIZATION, valido)).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/perfil").header(HttpHeaders.AUTHORIZATION, "Basic " + valido))
			.andExpect(status().isUnauthorized());
		obtener(valido + "x", "/api/perfil").andExpect(status().isUnauthorized());
	}

	@Test
	void unaSesionCerradaVencidaODeUnaCuentaDeshabilitadaYaNoSirve() throws Exception {
		String cerrada = tokenDe(Rol.SOLICITANTE);
		obtener(cerrada, "/api/perfil").andExpect(status().isOk());
		enviar(cerrada, "/api/auth/logout", "").andExpect(status().isNoContent());
		obtener(cerrada, "/api/perfil").andExpect(status().isUnauthorized());

		Usuario conSesionVencida = usuario(Rol.SOLICITANTE);
		String vencida = token(conSesionVencida);
		jdbc.update("UPDATE sesion SET expira = now() - interval '1 minute' WHERE usuario_id = ?", conSesionVencida.getId());
		obtener(vencida, "/api/perfil").andExpect(status().isUnauthorized());

		Usuario deshabilitado = funcionarioCompleto();
		String delDeshabilitado = token(deshabilitado);
		jdbc.update("UPDATE usuario SET estado_cuenta = 'DESHABILITADA' WHERE id = ?", deshabilitado.getId());
		obtener(delDeshabilitado, "/api/expedientes").andExpect(status().isUnauthorized());
	}

	@Test
	void elClienteNoPuedeCambiarSuRolNiSusPermisosDesdeElPerfil() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String token = token(cliente);

		int estado = modificar(token, "/api/perfil", "{\"rol\":\"ADMIN\",\"permisos\":[\"AUDITAR\",\"RESOLVER\"]}")
			.andReturn()
			.getResponse()
			.getStatus();

		assertThat(estado).as("el cambio de perfil no debe fallar con 5xx").isLessThan(500);
		assertThat(jdbc.queryForObject("SELECT rol FROM usuario WHERE id = ?", String.class, cliente.getId()))
			.isEqualTo("SOLICITANTE");
		assertThat(jdbc.queryForObject("SELECT count(*) FROM usuario_permiso WHERE usuario_id = ? AND permiso <> 'PORTAL'",
				Long.class, cliente.getId()))
			.isZero();
		obtener(token, "/api/auditoria/eventos").andExpect(status().isForbidden());
	}

	@Test
	void cadaRolSoloHaceLoQueLeTocaSobreUnMismoExpediente() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String documentoId = leer(adjuntar(cliente, id, "PASAPORTE", "p.pdf", "application/pdf", PDF).andReturn(), "$.id");
		String supervisor = tokenDe(Rol.SUPERVISOR);
		String auditor = tokenDe(Rol.AUDITOR);
		String admin = tokenDe(Rol.ADMIN);

		// El supervisor lee y descarga, pero no escribe.
		obtener(supervisor, "/api/expedientes/{id}", id).andExpect(status().isOk());
		obtener(supervisor, "/api/expedientes/{id}/documentos/{d}/contenido", id, documentoId).andExpect(status().isOk());
		enviar(supervisor, "/api/expedientes/{id}/observaciones", "{\"texto\":\"x\"}", id).andExpect(status().isForbidden());
		adjuntar(supervisor, id, "COMPROBANTE_PAGO", "c.pdf", "application/pdf", PDF).andExpect(status().isForbidden());
		// El auditor ve metadatos y la bitácora, pero no contenidos ni escrituras.
		obtener(auditor, "/api/expedientes/{id}/documentos/{d}/contenido", id, documentoId).andExpect(status().isForbidden());
		adjuntar(auditor, id, "COMPROBANTE_PAGO", "c.pdf", "application/pdf", PDF).andExpect(status().isForbidden());
		obtener(auditor, "/api/auditoria/eventos").andExpect(status().isOk());
		// El administrador no toca expedientes ni la bitácora.
		obtener(admin, "/api/expedientes/{id}/historial", id).andExpect(status().isForbidden());
		obtener(admin, "/api/expedientes/{id}/documentos/{d}/contenido", id, documentoId).andExpect(status().isForbidden());
		// Las fuentes simuladas son solo del despacho.
		obtener(cliente, "/api/mock/te/personas/CEDULA/8-123-456").andExpect(status().isForbidden());
		obtener(supervisor, "/api/mock/te/personas/CEDULA/8-123-456").andExpect(status().isForbidden());
	}

	@Test
	void unFuncionarioSinPermisoDeConsultaNoDescargaDocumentos() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String documentoId = leer(adjuntar(cliente, id, "PASAPORTE", "p.pdf", "application/pdf", PDF).andReturn(), "$.id");

		int estado = obtener(tokenDe(Rol.FUNCIONARIO, Permiso.OBSERVAR), "/api/expedientes/{id}/documentos/{d}/contenido", id,
				documentoId)
			.andReturn()
			.getResponse()
			.getStatus();

		assertThat(estado).isIn(403, 404);
	}

	@Test
	void unMetodoQueNoEstaEnLaMatrizSeDeniegaParaTodos() throws Exception {
		String id = expediente(tokenDe(Rol.SOLICITANTE), TRAMITE_SIMPLE);

		for (String token : new String[] { token(funcionarioCompleto()), tokenDe(Rol.ADMIN), tokenDe(Rol.SUPERVISOR) }) {
			mvc.perform(con(token, delete("/api/expedientes/{id}", id))).andExpect(status().isForbidden());
		}
		mvc.perform(delete("/api/expedientes/{id}", id)).andExpect(status().isUnauthorized());
		assertThat(jdbc.queryForObject("SELECT count(*) FROM expediente WHERE id = ?::uuid", Long.class, id)).isEqualTo(1);
	}

}
