package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/** HU-22 y HU-18: bitácora de auditoría (consulta, exportación, inmutabilidad) y notificaciones. CP-09, CP-11. */
class AuditoriaTest extends PruebaApi {

	@Test
	void lasOperacionesCriticasQuedanRegistradasConActorRecursoResultadoYCorrelacion() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		Usuario resolutor = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.RESOLVER, Permiso.OBSERVAR);
		String despacho = token(resolutor);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String documentoId = leer(adjuntar(cliente, id, "PASAPORTE", "p.pdf", "application/pdf", PDF).andReturn(), "$.id");
		obtener(despacho, "/api/expedientes/{id}/documentos/{d}/contenido", id, documentoId).andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "EN_REVISION", "Inicio").andExpect(status().isOk());
		enviar(despacho, "/api/expedientes/{id}/observaciones", "{\"texto\":\"Revise la foto\"}", id).andExpect(status().isCreated());
		enviar(cliente, "/api/solicitudes-arco", "{\"tipo\":\"ACCESO\",\"descripcion\":\"Quiero ver mis datos\"}").andExpect(status().isCreated());
		enviar(cliente, "/api/auth/logout", "").andExpect(status().isNoContent());

		// Meta del 100 %: cada operación crítica esperada aparece en la bitácora.
		List<String> delCliente = jdbc.queryForList("SELECT operacion FROM evento_auditoria WHERE actor_id = ? ORDER BY fecha",
				String.class, titular.getId());
		assertThat(delCliente).containsExactly("INICIO_SESION", "CREAR_EXPEDIENTE", "CARGAR_DOCUMENTO",
				"REGISTRAR_SOLICITUD_ARCO", "CIERRE_SESION");
		List<String> delDespacho = jdbc.queryForList("SELECT operacion FROM evento_auditoria WHERE actor_id = ? ORDER BY fecha",
				String.class, resolutor.getId());
		assertThat(delDespacho).contains("INICIO_SESION", "DESCARGAR_DOCUMENTO", "CONSULTAR_EXPEDIENTE", "CAMBIAR_ESTADO",
				"REGISTRAR_OBSERVACION");
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id IN (?, ?) AND (correlacion_id = 'sin-correlacion' AND operacion <> 'INICIO_SESION' OR recurso = '' OR resultado IS NULL)",
				Long.class, titular.getId(), resolutor.getId()))
			.isZero();
	}

	@Test
	void soloElAuditorConsultaLaBitacoraConFiltrosYPaginacion() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		expediente(cliente, TRAMITE_SIMPLE);
		String auditor = tokenDe(Rol.AUDITOR);
		String hoy = LocalDate.now(ZoneOffset.UTC).toString();

		obtener(auditor, "/api/auditoria/eventos?actorId=" + titular.getId()).andExpect(status().isOk())
			.andExpect(jsonPath("$.contenido", hasSize(3)))
			.andExpect(jsonPath("$.paginacion.totalElementos").value(3))
			.andExpect(jsonPath("$.contenido[*].actorId", everyItem(is(titular.getId().toString()))))
			.andExpect(jsonPath("$.contenido[0].operacion").value("CREAR_EXPEDIENTE"))
			.andExpect(jsonPath("$.contenido[0].resultado").value("EXITO"))
			.andExpect(jsonPath("$.contenido[0].correlacionId").isNotEmpty())
			.andExpect(jsonPath("$.contenido[0].fecha").isNotEmpty());
		obtener(auditor, "/api/auditoria/eventos?actorId=%s&operacion=CREAR_EXPEDIENTE&tamano=1".formatted(titular.getId()))
			.andExpect(jsonPath("$.contenido", hasSize(1)))
			.andExpect(jsonPath("$.paginacion.totalPaginas").value(2));
		obtener(auditor, "/api/auditoria/eventos?recurso=" + id).andExpect(jsonPath("$.contenido", hasSize(1)))
			.andExpect(jsonPath("$.contenido[0].recurso").value("expediente/" + id));
		obtener(auditor, "/api/auditoria/eventos?actorId=%s&fechaDesde=%s&fechaHasta=%s".formatted(titular.getId(), hoy, hoy))
			.andExpect(jsonPath("$.contenido", hasSize(3)));
		obtener(auditor, "/api/auditoria/eventos?actorId=%s&fechaDesde=2999-01-01".formatted(titular.getId()))
			.andExpect(jsonPath("$.contenido", hasSize(0)));
		obtener(auditor, "/api/auditoria/eventos?fechaDesde=ayer").andExpect(status().isBadRequest());

		for (String token : List.of(cliente, token(funcionarioCompleto()), tokenDe(Rol.SUPERVISOR), tokenDe(Rol.ADMIN))) {
			obtener(token, "/api/auditoria/eventos").andExpect(status().isForbidden());
			obtener(token, "/api/auditoria/eventos/exportacion").andExpect(status().isForbidden());
		}
	}

	@Test
	void laExportacionCsvAplicaLosFiltrosYQuedaAuditada() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String id = expediente(token(titular), TRAMITE_SIMPLE);
		Usuario auditor = usuario(Rol.AUDITOR);

		MvcResult csv = obtener(token(auditor), "/api/auditoria/eventos/exportacion?actorId=" + titular.getId())
			.andExpect(status().isOk())
			.andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"))
			.andExpect(header().string("Content-Disposition", "attachment; filename=\"auditoria.csv\""))
			.andReturn();

		String[] lineas = cuerpo(csv).split("\r\n");
		assertThat(lineas[0]).isEqualTo("id,actorId,operacion,recurso,fecha,resultado,correlacionId");
		assertThat(lineas).hasSize(3);
		assertThat(lineas[1]).contains(titular.getId().toString(), "\"CREAR_EXPEDIENTE\"", "\"expediente/" + id + "\"", "EXITO");
		assertThat(eventos("EXPORTAR_AUDITORIA", "auditoria/eventos")).isGreaterThanOrEqualTo(1);
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND operacion = 'EXPORTAR_AUDITORIA'", Long.class,
				auditor.getId()))
			.isEqualTo(1);
	}

	@Test
	void losEventosNoSePuedenModificarNiEliminar() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		expediente(token(titular), TRAMITE_SIMPLE);
		String auditor = tokenDe(Rol.AUDITOR);

		// La API no ofrece ninguna operación de escritura sobre la bitácora…
		enviar(auditor, "/api/auditoria/eventos", "{}").andExpect(status().isForbidden());
		modificar(auditor, "/api/auditoria/eventos", "{}").andExpect(status().isForbidden());
		// …y la base de datos también lo impide.
		assertThatThrownBy(
				() -> jdbc.update("UPDATE evento_auditoria SET resultado = 'FALLO' WHERE actor_id = ?", titular.getId()))
			.hasMessageContaining("no se modifican");
		assertThatThrownBy(() -> jdbc.update("DELETE FROM evento_auditoria WHERE actor_id = ?", titular.getId()))
			.hasMessageContaining("no se modifican");
	}

	@Test
	void cadaUsuarioVeYMarcaSoloSusNotificaciones() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.OBSERVAR);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		enviar(despacho, "/api/expedientes/{id}/observaciones", "{\"texto\":\"Uno\"}", id).andExpect(status().isCreated());
		enviar(despacho, "/api/expedientes/{id}/observaciones", "{\"texto\":\"Dos\"}", id).andExpect(status().isCreated());
		MvcResult avisos = obtener(cliente, "/api/notificaciones?leida=false").andExpect(status().isOk())
			.andExpect(jsonPath("$.contenido", hasSize(2)))
			.andExpect(jsonPath("$.paginacion.totalElementos").value(2))
			.andReturn();
		String aviso = leer(avisos, "$.contenido[0].id");

		// Marcar como leída es idempotente y no crea avisos nuevos.
		reemplazar(cliente, "/api/notificaciones/{id}/leida", "", aviso).andExpect(status().isNoContent());
		reemplazar(cliente, "/api/notificaciones/{id}/leida", "", aviso).andExpect(status().isNoContent());
		obtener(cliente, "/api/notificaciones?leida=true").andExpect(jsonPath("$.contenido", hasSize(1)))
			.andExpect(jsonPath("$.contenido[0].id").value(aviso));
		obtener(cliente, "/api/notificaciones?leida=false").andExpect(jsonPath("$.contenido", hasSize(1)));
		obtener(cliente, "/api/notificaciones?tamano=1").andExpect(jsonPath("$.contenido", hasSize(1)))
			.andExpect(jsonPath("$.paginacion.totalPaginas").value(2));

		// Una notificación ajena responde como inexistente.
		String ajeno = tokenDe(Rol.SOLICITANTE);
		reemplazar(ajeno, "/api/notificaciones/{id}/leida", "", aviso).andExpect(status().isNotFound());
		obtener(ajeno, "/api/notificaciones").andExpect(jsonPath("$.contenido", hasSize(0)));
		obtener(tokenDe(Rol.AUDITOR), "/api/notificaciones").andExpect(status().isForbidden());
	}

}
