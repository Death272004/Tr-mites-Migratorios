package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/**
 * QA · TASK-16.4 (HU-16): titularidad del listado con muchos expedientes ajenos, límites de la
 * paginación y rendimiento (P95) del listado con unos 1,000 expedientes. CP-03, CP-10.
 */
class QaListadoTitularidadTest extends PruebaApi {

	private void sembrar(Usuario dueno, int cantidad) {
		jdbc.update("""
				INSERT INTO expediente (id, numero, solicitante_id, creado_por_id, tipo_tramite, estado)
				SELECT gen_random_uuid(), 'QA-' || left(?::text, 8) || '-' || n, ?, ?, 'PRORROGA_ESTADIA', 'RECIBIDO'
				FROM generate_series(1, ?) n
				""", dueno.getId(), dueno.getId(), dueno.getId(), cantidad);
	}

	@Test
	void entreMilExpedientesAjenosElClienteSoloVeLosSuyos() throws Exception {
		Usuario otro = usuario(Rol.SOLICITANTE);
		sembrar(otro, 1000);
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String token = token(cliente);
		List<String> propios = new ArrayList<>();
		for (int i = 0; i < 3; i++) {
			propios.add(expediente(token, TRAMITE_SIMPLE));
		}

		MvcResult listado = obtener(token, "/api/expedientes?tamano=100").andExpect(status().isOk())
			.andExpect(jsonPath("$.contenido", hasSize(3)))
			.andExpect(jsonPath("$.paginacion.totalElementos").value(3))
			.andReturn();
		List<String> solicitantes = leer(listado, "$.contenido[*].solicitanteId");
		assertThat(solicitantes).containsOnly(cliente.getId().toString());
		assertThat(this.<List<String>>leer(listado, "$.contenido[*].id")).containsExactlyInAnyOrderElementsOf(propios);
		assertThat(cuerpo(listado)).doesNotContain(otro.getId().toString()).doesNotContain(otro.getCorreo());

		// Uno ajeno, buscado directamente, responde como inexistente.
		String ajeno = jdbc.queryForObject("SELECT id::text FROM expediente WHERE solicitante_id = ? LIMIT 1", String.class,
				otro.getId());
		obtener(token, "/api/expedientes/{id}", ajeno).andExpect(status().isNotFound());
		// Filtrar por estado o tipo tampoco abre la puerta a lo ajeno.
		obtener(token, "/api/expedientes?estado=RECIBIDO&tipoTramite=PRORROGA_ESTADIA&tamano=100")
			.andExpect(jsonPath("$.paginacion.totalElementos").value(3));
	}

	@Test
	void elDespachoElSupervisorYElAuditorVenElTotalYElClienteNo() throws Exception {
		Usuario a = usuario(Rol.SOLICITANTE);
		sembrar(a, 5);
		long total = jdbc.queryForObject("SELECT count(*) FROM expediente", Long.class);

		for (String token : List.of(tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR), tokenDe(Rol.SUPERVISOR), tokenDe(Rol.AUDITOR))) {
			Integer visto = leer(obtener(token, "/api/expedientes?tamano=1").andExpect(status().isOk()).andReturn(),
					"$.paginacion.totalElementos");
			assertThat(visto.longValue()).isGreaterThanOrEqualTo(total);
		}
		obtener(token(a), "/api/expedientes?tamano=1").andExpect(jsonPath("$.paginacion.totalElementos").value(5));
	}

	@Test
	void laPaginacionRespetaSusLimites() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		sembrar(cliente, 25);
		String token = token(cliente);

		obtener(token, "/api/expedientes?pagina=0&tamano=10").andExpect(jsonPath("$.contenido", hasSize(10)))
			.andExpect(jsonPath("$.paginacion.totalPaginas").value(3));
		obtener(token, "/api/expedientes?pagina=2&tamano=10").andExpect(jsonPath("$.contenido", hasSize(5)));
		obtener(token, "/api/expedientes?pagina=99&tamano=10").andExpect(status().isOk())
			.andExpect(jsonPath("$.contenido", hasSize(0)))
			.andExpect(jsonPath("$.paginacion.totalElementos").value(25));
		obtener(token, "/api/expedientes?pagina=-1").andExpect(status().isBadRequest());
		obtener(token, "/api/expedientes?tamano=0").andExpect(status().isBadRequest());
		obtener(token, "/api/expedientes?tamano=abc").andExpect(status().isBadRequest());

		// Sin solapamientos entre páginas.
		List<String> todas = new ArrayList<>();
		for (int pagina = 0; pagina < 3; pagina++) {
			todas.addAll(leer(obtener(token, "/api/expedientes?pagina=%d&tamano=10".formatted(pagina)).andReturn(),
					"$.contenido[*].id"));
		}
		assertThat(todas).hasSize(25).doesNotHaveDuplicates();
	}

	@Test
	void elP95DelListadoConMilExpedientesQuedaPorDebajoDeMedioSegundo() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		sembrar(cliente, 1000);
		sembrar(usuario(Rol.SOLICITANTE), 1000);
		String token = token(cliente);
		String despacho = tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR);
		obtener(token, "/api/expedientes?tamano=100").andExpect(status().isOk());

		List<Long> cliente95 = medir(token, 30);
		List<Long> despacho95 = medir(despacho, 30);
		long p95Cliente = p95(cliente95);
		long p95Despacho = p95(despacho95);

		Path metricas = Path.of("target", "qa-metricas", "listado-1000.txt");
		Files.createDirectories(metricas.getParent());
		Files.writeString(metricas, """
				Listado paginado (tamano=100) con 1,000 expedientes del cliente y 2,000+ en total
				Muestras por perfil: 30 · página aleatoria entre 0 y 9
				Cliente  → P95 %d ms · máx %d ms · mediana %d ms
				Despacho → P95 %d ms · máx %d ms · mediana %d ms
				Umbral de aceptación: P95 < 500 ms
				""".formatted(p95Cliente, Collections.max(cliente95), mediana(cliente95), p95Despacho,
				Collections.max(despacho95), mediana(despacho95)));

		assertThat(p95Cliente).as("P95 del cliente (ms)").isLessThan(500);
		assertThat(p95Despacho).as("P95 del despacho (ms)").isLessThan(500);
	}

	private List<Long> medir(String token, int muestras) throws Exception {
		List<Long> tiempos = new ArrayList<>();
		for (int i = 0; i < muestras; i++) {
			int pagina = Math.floorMod(UUID.randomUUID().hashCode(), 10);
			long inicio = System.nanoTime();
			obtener(token, "/api/expedientes?tamano=100&pagina=" + pagina).andExpect(status().isOk());
			tiempos.add((System.nanoTime() - inicio) / 1_000_000);
		}
		return tiempos;
	}

	private static long p95(List<Long> tiempos) {
		List<Long> orden = new ArrayList<>(tiempos);
		Collections.sort(orden);
		return orden.get((int) Math.ceil(orden.size() * 0.95) - 1);
	}

	private static long mediana(List<Long> tiempos) {
		List<Long> orden = new ArrayList<>(tiempos);
		Collections.sort(orden);
		return orden.get(orden.size() / 2);
	}

}
