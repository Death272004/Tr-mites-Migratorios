package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Representacion;
import pa.tramitesmigratorios.seguridad.RepresentacionRepo;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/** HU-15 y HU-16 (TASK-15.5): registro, validación, titularidad, listado y catálogos. CP-03, CP-05. */
class ExpedienteTest extends PruebaApi {

	@Autowired
	RepresentacionRepo representaciones;

	@Test
	void elSolicitanteRegistraUnExpedienteASuNombre() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String token = token(cliente);

		MvcResult creado = enviar(token, "/api/expedientes", "{\"tipoTramite\":\"RESIDENCIA_TEMPORAL\"}")
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.numero", matchesPattern("EXP-\\d{4}-\\d{6}")))
			.andExpect(jsonPath("$.solicitanteId").value(cliente.getId().toString()))
			.andExpect(jsonPath("$.tipoTramite").value("RESIDENCIA_TEMPORAL"))
			.andExpect(jsonPath("$.estado").value("PRESENTADO"))
			.andExpect(jsonPath("$.fechaCreacion").isNotEmpty())
			.andExpect(jsonPath("$.version").value(0))
			.andReturn();
		String id = leer(creado, "$.id");

		obtener(token, "/api/expedientes/{id}", id).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id));
		obtener(token, "/api/expedientes/{id}/historial", id).andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(1)))
			.andExpect(jsonPath("$[0].estadoNuevo").value("PRESENTADO"))
			.andExpect(jsonPath("$[0].usuarioId").value(cliente.getId().toString()));
		assertThat(eventos("CREAR_EXPEDIENTE", "expediente/" + id)).isEqualTo(1);
	}

	@Test
	void elTipoDeTramiteSeValidaEnElServidorConDetallePorCampo() throws Exception {
		String token = tokenDe(Rol.SOLICITANTE);

		enviar(token, "/api/expedientes", "{\"tipoTramite\":\"NO_EXISTE\"}").andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.codigo").value("ENTRADA_INVALIDA"))
			.andExpect(jsonPath("$.errores[0].campo").value("tipoTramite"));
		enviar(token, "/api/expedientes", "{}").andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("tipoTramite"));
		enviar(token, "/api/expedientes", "{esto no es json").andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.codigo").value("ENTRADA_INVALIDA"));
	}

	@Test
	void nadieCreaExpedientesANombreDeOtroSinRepresentacionAcreditada() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		Usuario abogado = usuario(Rol.SOLICITANTE);
		String cuerpo = "{\"tipoTramite\":\"%s\",\"titularId\":\"%s\"}".formatted(TRAMITE_SIMPLE, titular.getId());

		enviar(token(abogado), "/api/expedientes", cuerpo).andExpect(status().isForbidden())
			.andExpect(jsonPath("$.codigo").value("SIN_REPRESENTACION"));
		assertThat(jdbc.queryForObject("SELECT count(*) FROM expediente WHERE solicitante_id = ?", Long.class,
				titular.getId()))
			.isZero();

		representaciones.save(new Representacion(abogado.getId(), titular.getId(), "PODER_NOTARIADO"));
		MvcResult creado = enviar(token(abogado), "/api/expedientes", cuerpo).andExpect(status().isCreated())
			.andExpect(jsonPath("$.solicitanteId").value(titular.getId().toString()))
			.andReturn();
		String id = leer(creado, "$.id");

		// El titular ve lo presentado por su representante, y el representante lo que presentó.
		obtener(token(titular), "/api/expedientes/{id}", id).andExpect(status().isOk());
		obtener(token(abogado), "/api/expedientes/{id}", id).andExpect(status().isOk());
	}

	@Test
	void unExpedienteAjenoRespondeIgualQueUnoInexistente() throws Exception {
		String id = expediente(tokenDe(Rol.SOLICITANTE), TRAMITE_SIMPLE);
		Usuario otro = usuario(Rol.SOLICITANTE);
		String tokenOtro = token(otro);

		for (String ruta : List.of("/api/expedientes/{id}", "/api/expedientes/{id}/historial",
				"/api/expedientes/{id}/documentos", "/api/expedientes/{id}/observaciones")) {
			MvcResult ajeno = obtener(tokenOtro, ruta, id).andExpect(status().isNotFound()).andReturn();
			assertThat(cuerpo(ajeno)).doesNotContain(id).doesNotContain("EXP-");
		}
		obtener(tokenOtro, "/api/expedientes/{id}", "00000000-0000-0000-0000-000000000000")
			.andExpect(status().isNotFound());
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND resultado = 'DENEGADO' AND recurso = ?",
				Long.class, otro.getId(), "expediente/" + id))
			.isEqualTo(4);
	}

	@Test
	void elListadoSoloTraeLosExpedientesAccesiblesConFiltrosYPaginacion() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String otroCliente = tokenDe(Rol.SOLICITANTE);
		for (int i = 0; i < 3; i++) {
			expediente(cliente, TRAMITE_SIMPLE);
		}
		String naturalizacion = expediente(cliente, "NATURALIZACION");
		expediente(otroCliente, TRAMITE_SIMPLE);

		obtener(cliente, "/api/expedientes").andExpect(status().isOk())
			.andExpect(jsonPath("$.contenido", hasSize(4)))
			.andExpect(jsonPath("$.paginacion.totalElementos").value(4))
			// Más reciente primero.
			.andExpect(jsonPath("$.contenido[0].id").value(naturalizacion));
		obtener(cliente, "/api/expedientes?tipoTramite=NATURALIZACION").andExpect(jsonPath("$.contenido", hasSize(1)));
		obtener(cliente, "/api/expedientes?estado=APROBADO").andExpect(jsonPath("$.contenido", hasSize(0)));
		obtener(cliente, "/api/expedientes?fechaDesde=2999-01-01").andExpect(jsonPath("$.contenido", hasSize(0)));
		obtener(cliente, "/api/expedientes?pagina=1&tamano=3").andExpect(jsonPath("$.contenido", hasSize(1)))
			.andExpect(jsonPath("$.paginacion.pagina").value(1))
			.andExpect(jsonPath("$.paginacion.totalPaginas").value(2));
		obtener(otroCliente, "/api/expedientes").andExpect(jsonPath("$.contenido", hasSize(1)));

		obtener(cliente, "/api/expedientes?tamano=101").andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("tamano"));
		obtener(cliente, "/api/expedientes?estado=INVENTADO").andExpect(status().isBadRequest());
		obtener(cliente, "/api/expedientes?fechaDesde=2026-10-10&fechaHasta=2026-10-01").andExpect(status().isBadRequest());
	}

	@Test
	void elDespachoYElAuditorVenTodoYSuConsultaQuedaEnAuditoria() throws Exception {
		String id = expediente(tokenDe(Rol.SOLICITANTE), TRAMITE_SIMPLE);
		Usuario analista = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR);

		obtener(token(analista), "/api/expedientes/{id}", id).andExpect(status().isOk());
		obtener(tokenDe(Rol.SUPERVISOR), "/api/expedientes/{id}", id).andExpect(status().isOk());
		obtener(tokenDe(Rol.AUDITOR), "/api/expedientes/{id}/historial", id).andExpect(status().isOk());
		obtener(token(analista), "/api/expedientes?tamano=1").andExpect(status().isOk())
			.andExpect(jsonPath("$.contenido", hasSize(1)));

		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND operacion IN ('CONSULTAR_EXPEDIENTE', 'CONSULTAR_EXPEDIENTES')",
				Long.class, analista.getId()))
			.isEqualTo(2);
	}

	@Test
	void elListadoRespondeRapidoConMilExpedientes() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		jdbc.update("""
				INSERT INTO expediente (id, numero, solicitante_id, creado_por_id, tipo_tramite, estado)
				SELECT gen_random_uuid(), 'CARGA-' || left(?::text, 8) || '-' || n, ?, ?, 'PRORROGA_ESTADIA', 'PRESENTADO'
				FROM generate_series(1, 1000) n
				""", cliente.getId(), cliente.getId(), cliente.getId());
		String token = token(cliente);
		obtener(token, "/api/expedientes?tamano=100").andExpect(status().isOk());

		long inicio = System.nanoTime();
		obtener(token, "/api/expedientes?tamano=100&pagina=5").andExpect(status().isOk())
			.andExpect(jsonPath("$.contenido", hasSize(100)))
			.andExpect(jsonPath("$.paginacion.totalElementos").value(1000));
		long milisegundos = (System.nanoTime() - inicio) / 1_000_000;

		assertThat(milisegundos).as("tiempo del listado paginado").isLessThan(1500);
	}

	@Test
	void losCatalogosEntreganTramitesConSusRequisitos() throws Exception {
		String token = tokenDe(Rol.SOLICITANTE);

		obtener(token, "/api/catalogos/tipos-tramite").andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(4)))
			.andExpect(jsonPath("$[?(@.codigo == 'PRORROGA_ESTADIA')].requisitos[*].tipoDocumental",
					org.hamcrest.Matchers.containsInAnyOrder("PASAPORTE", "COMPROBANTE_PAGO", "DECLARACION_JURADA")));
		obtener(token, "/api/catalogos/tipos-documentales").andExpect(status().isOk())
			.andExpect(jsonPath("$[?(@.codigo == 'CERTIFICADO_SALUD')].sensible").value(true))
			.andExpect(jsonPath("$[0].tiposMimePermitidos", hasSize(3)))
			.andExpect(jsonPath("$[0].tamanoMaximoBytes").value(10485760));
	}

}
