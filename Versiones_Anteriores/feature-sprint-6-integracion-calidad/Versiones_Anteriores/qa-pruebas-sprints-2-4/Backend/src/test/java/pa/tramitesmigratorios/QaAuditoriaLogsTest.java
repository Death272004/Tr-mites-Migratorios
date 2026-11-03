package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/**
 * QA · TASK-22.5 (HU-22): cobertura de los eventos críticos en la bitácora (meta 100 %) y
 * revisión de que ni la bitácora ni los registros del servidor guardan contraseñas, tokens
 * ni datos del caso. Complementa {@link AuditoriaTest}. CP-09, CP-11.
 */
@ExtendWith(OutputCaptureExtension.class)
class QaAuditoriaLogsTest extends PruebaApi {

	private static final String CLAVE_EQUIVOCADA = "Clave-Equivocada-QA-2026";
	private static final String TEXTO_CASO = "Observación confidencial QA-7781";
	private static final String DESCRIPCION_ARCO = "Mi cédula 8-777-7777 está mal";

	@Test
	void cadaOperacionCriticaDejaSuEventoYNingunSecretoSaleEnLaBitacoraNiEnLosRegistros(CapturedOutput salida)
			throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		Usuario resolutor = funcionarioCompleto();
		Usuario auditor = usuario(Rol.AUDITOR);

		// Inicio de sesión fallido y exitoso.
		enviar(null, "/api/auth/login", "{\"correo\":\"%s\",\"contrasena\":\"%s\"}".formatted(titular.getCorreo(),
				CLAVE_EQUIVOCADA)).andExpect(status().isUnauthorized());
		String cliente = token(titular);
		String despacho = token(resolutor);
		// Expediente, documento, descarga, estado, observación.
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String documentoId = leer(adjuntar(cliente, id, "PASAPORTE", "p.pdf", "application/pdf", PDF).andReturn(), "$.id");
		obtener(despacho, "/api/expedientes/{id}/documentos/{d}/contenido", id, documentoId).andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", "Inicio").andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "RESUELTO", "Sin resultado ni requisitos").andExpect(status().isBadRequest());
		cambiarEstado(despacho, despacho, id, "ENTREGADO", "Transición inválida").andExpect(status().isConflict());
		enviar(despacho, "/api/expedientes/{id}/observaciones", "{\"texto\":\"%s\"}".formatted(TEXTO_CASO), id)
			.andExpect(status().isCreated());
		// Privacidad.
		String consentimiento = leer(enviar(cliente, "/api/consentimientos", """
				{"titularId":"%s","finalidad":"Trámite","alcance":"Identidad","baseLegal":"Ley 81 de 2019","expreso":false}"""
			.formatted(titular.getId())).andReturn(), "$.id");
		modificar(cliente, "/api/consentimientos/{id}", "", consentimiento).andExpect(status().isOk());
		String arco = leer(enviar(cliente, "/api/solicitudes-arco",
				"{\"tipo\":\"RECTIFICACION\",\"descripcion\":\"%s\"}".formatted(DESCRIPCION_ARCO)).andReturn(), "$.id");
		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"EN_ATENCION\"}", arco).andExpect(status().isOk());
		// Acceso denegado, cambio de contraseña fallido, auditoría y exportación, fallo técnico y cierre de sesión.
		obtener(cliente, "/api/auditoria/eventos").andExpect(status().isForbidden());
		reemplazar(cliente, "/api/auth/contrasena",
				"{\"contrasenaActual\":\"%s\",\"contrasenaNueva\":\"Otra-Clave-Segura-2026\"}".formatted(CLAVE_EQUIVOCADA))
			.andExpect(status().isBadRequest());
		String tokenAuditor = token(auditor);
		obtener(tokenAuditor, "/api/auditoria/eventos/exportacion?actorId=" + titular.getId()).andExpect(status().isOk());
		mvc.perform(con(despacho, get("/api/mock/te/personas/CEDULA/8-123-456")).header("X-Scenario", "ERROR_TECNICO"))
			.andExpect(status().isInternalServerError());
		enviar(cliente, "/api/auth/logout", "").andExpect(status().isNoContent());

		// 1) Cobertura: cada operación crítica tiene su evento.
		List<String> operaciones = jdbc.queryForList(
				"SELECT DISTINCT operacion || ':' || resultado FROM evento_auditoria WHERE actor_id IN (?, ?, ?) OR (actor_id IS NULL AND recurso = 'sesion')",
				String.class, titular.getId(), resolutor.getId(), auditor.getId());
		assertThat(operaciones).contains("INICIO_SESION:FALLO", "INICIO_SESION:EXITO", "CREAR_EXPEDIENTE:EXITO",
				"CARGAR_DOCUMENTO:EXITO", "DESCARGAR_DOCUMENTO:EXITO", "CAMBIAR_ESTADO:EXITO", "CAMBIAR_ESTADO:FALLO",
				"REGISTRAR_OBSERVACION:EXITO", "REGISTRAR_CONSENTIMIENTO:EXITO", "REVOCAR_CONSENTIMIENTO:EXITO",
				"REGISTRAR_SOLICITUD_ARCO:EXITO", "ATENDER_SOLICITUD_ARCO:EXITO", "ACCESO_DENEGADO:DENEGADO",
				"CAMBIO_CONTRASENA:FALLO", "EXPORTAR_AUDITORIA:EXITO", "CIERRE_SESION:EXITO");

		// 2) Ningún evento lleva contraseñas, tokens ni contenido del caso.
		List<String> detalles = jdbc.queryForList(
				"SELECT concat_ws(' | ', operacion, recurso, detalle) FROM evento_auditoria WHERE actor_id IN (?, ?, ?)",
				String.class, titular.getId(), resolutor.getId(), auditor.getId());
		for (String evento : detalles) {
			assertThat(evento).doesNotContain(CLAVE, CLAVE_EQUIVOCADA, cliente, despacho, tokenAuditor, TEXTO_CASO,
					DESCRIPCION_ARCO, "8-777-7777");
		}

		// 3) Los registros del servidor tampoco.
		assertThat(salida.getAll()).doesNotContain(CLAVE)
			.doesNotContain(CLAVE_EQUIVOCADA)
			.doesNotContain(cliente)
			.doesNotContain(despacho)
			.doesNotContain(tokenAuditor)
			.doesNotContain(TEXTO_CASO)
			.doesNotContain("8-777-7777")
			.doesNotContain("contenido ficticio de prueba");
		// El fallo técnico sí queda registrado, sin traza ni datos personales.
		assertThat(salida.getAll()).contains("Fallo técnico de la fuente TE");
	}

}
