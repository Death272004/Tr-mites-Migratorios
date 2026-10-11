package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.PoliticaContrasena;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/** HU-14 y HU-11 (TASK-11.5): cuerpo de error uniforme, e integridad y datos semilla del modelo. CP-11. */
class ErroresYModeloTest extends PruebaApi {

	@Test
	void todoErrorUsaElMismoCuerpoConCorrelacionYSinDetallesTecnicos() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		List<MvcResult> errores = List.of(
				enviar(cliente, "/api/expedientes", "{json roto").andExpect(status().isBadRequest()).andReturn(),
				obtener(null, "/api/expedientes").andExpect(status().isUnauthorized()).andReturn(),
				obtener(cliente, "/api/auditoria/eventos").andExpect(status().isForbidden()).andReturn(),
				obtener(cliente, "/api/expedientes/{id}", UUID.randomUUID()).andExpect(status().isNotFound()).andReturn(),
				obtener(cliente, "/api/expedientes/{id}", "no-es-uuid").andExpect(status().isBadRequest()).andReturn(),
				mvc.perform(con(cliente, get("/api/expedientes")).header("X-Correlation-Id", "peticion-de-prueba-0001")
					.param("tamano", "0")).andExpect(status().isBadRequest()).andReturn());

		for (MvcResult error : errores) {
			String cuerpo = cuerpo(error);
			assertThat(this.<String>leer(error, "$.codigo")).isNotBlank();
			assertThat(this.<String>leer(error, "$.mensaje")).isNotBlank();
			// La correlación del cuerpo es la misma del encabezado de la respuesta.
			assertThat(this.<String>leer(error, "$.correlacionId")).isEqualTo(error.getResponse().getHeader("X-Correlation-Id"));
			assertThat(cuerpo).doesNotContain("Exception")
				.doesNotContain("org.springframework")
				.doesNotContain("pa.tramitesmigratorios")
				.doesNotContain("SQL")
				.doesNotContain("\tat ");
		}
		assertThat(this.<String>leer(errores.get(5), "$.correlacionId")).isEqualTo("peticion-de-prueba-0001");
	}

	@Test
	void unaCorrelacionRecibidaConFormatoExtranoSeSustituye() throws Exception {
		MvcResult respuesta = mvc.perform(get("/api/expedientes").header("X-Correlation-Id", "\"},{\"inyectado\":\"si"))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.inyectado").doesNotExist())
			.andReturn();

		assertThat(respuesta.getResponse().getHeader("X-Correlation-Id")).matches("[0-9a-f-]{36}");
	}

	@Test
	void lasMigracionesDejanLosDatosSemillaYLosIndicesDeListado() {
		assertThat(jdbc.queryForObject("SELECT count(*) FROM rol", Long.class)).isEqualTo(5);
		assertThat(jdbc.queryForObject("SELECT count(*) FROM permiso", Long.class)).isEqualTo(9);
		assertThat(jdbc.queryForObject("SELECT count(*) FROM tipo_tramite WHERE activo", Long.class)).isEqualTo(4);
		assertThat(jdbc.queryForObject("SELECT count(*) FROM tipo_documental", Long.class)).isEqualTo(8);
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM tipo_tramite t WHERE NOT EXISTS (SELECT 1 FROM requisito_tramite r WHERE r.tipo_tramite = t.codigo AND r.obligatorio)",
				Long.class))
			.as("trámites sin requisitos obligatorios")
			.isZero();
		assertThat(jdbc.queryForList("SELECT indexname FROM pg_indexes WHERE tablename = 'expediente'", String.class))
			.contains("expediente_solicitante_estado", "expediente_estado_fecha", "expediente_creado_por");
		// Ninguna contraseña en las migraciones: los usuarios de demostración no vienen sembrados.
		assertThat(jdbc.queryForObject("SELECT count(*) FROM usuario WHERE correo LIKE '%@demo.pa'", Long.class)).isZero();
	}

	@Test
	void laBaseDeDatosImponeLaIntegridad() {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		UUID id = cliente.getId();

		// Correo único y en minúsculas.
		assertThatThrownBy(() -> jdbc.update(
				"INSERT INTO usuario (id, nombre, correo, contrasena_hash, rol) VALUES (gen_random_uuid(), 'x', ?, 'x', 'SOLICITANTE')",
				cliente.getCorreo()))
			.isInstanceOf(DataIntegrityViolationException.class);
		assertThatThrownBy(() -> jdbc.update(
				"INSERT INTO usuario (id, nombre, correo, contrasena_hash, rol) VALUES (gen_random_uuid(), 'x', 'MAYUS@prueba.pa', 'x', 'SOLICITANTE')"))
			.isInstanceOf(DataIntegrityViolationException.class);
		// Rol, tipo de trámite y estado deben existir.
		assertThatThrownBy(() -> jdbc.update(
				"INSERT INTO usuario (id, nombre, correo, contrasena_hash, rol) VALUES (gen_random_uuid(), 'x', ?, 'x', 'JEFE')",
				UUID.randomUUID() + "@prueba.pa"))
			.isInstanceOf(DataIntegrityViolationException.class);
		String expediente = "INSERT INTO expediente (id, numero, solicitante_id, creado_por_id, tipo_tramite, estado) VALUES (gen_random_uuid(), ?, ?, ?, ?, ?)";
		assertThatThrownBy(() -> jdbc.update(expediente, "X-" + UUID.randomUUID().toString().substring(0, 8), id, id, "NO_EXISTE", "RECIBIDO"))
			.isInstanceOf(DataIntegrityViolationException.class);
		assertThatThrownBy(() -> jdbc.update(expediente, "X-" + UUID.randomUUID().toString().substring(0, 8), id, id, "NATURALIZACION", "VOLANDO"))
			.isInstanceOf(DataIntegrityViolationException.class);
		assertThatThrownBy(() -> jdbc.update(expediente, "X-" + UUID.randomUUID().toString().substring(0, 8), UUID.randomUUID(), id, "NATURALIZACION", "RECIBIDO"))
			.isInstanceOf(DataIntegrityViolationException.class);
		// Un usuario con expedientes no se puede borrar (eliminación restringida).
		jdbc.update(expediente, "X-" + UUID.randomUUID().toString().substring(0, 8), id, id, "NATURALIZACION", "RECIBIDO");
		assertThatThrownBy(() -> jdbc.update("DELETE FROM usuario WHERE id = ?", id))
			.isInstanceOf(DataIntegrityViolationException.class);
		// Un rechazo ARCO exige motivo y una revocación exige fecha.
		assertThatThrownBy(() -> jdbc.update(
				"INSERT INTO solicitud_arco (id, titular_id, tipo, descripcion, estado, plazo_atencion) VALUES (gen_random_uuid(), ?, 'ACCESO', 'x', 'RECHAZADA', current_date)",
				id))
			.isInstanceOf(DataIntegrityViolationException.class);
		assertThatThrownBy(() -> jdbc.update(
				"INSERT INTO consentimiento (id, titular_id, responsable, finalidad, alcance, base_legal, estado, registrado_por_id) VALUES (gen_random_uuid(), ?, 'x', 'x', 'x', 'x', 'REVOCADO', ?)",
				id, id))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void laPoliticaDeContrasenasExigeLongitudYVariedad() {
		assertThat(PoliticaContrasena.incumplimientos(CLAVE, "persona@prueba.pa")).isEmpty();
		assertThat(PoliticaContrasena.incumplimientos("corta", "persona@prueba.pa")).hasSize(4);
		assertThat(PoliticaContrasena.incumplimientos("todoenminusculas-2026", null)).containsExactly("Debe incluir una letra mayúscula.");
		assertThat(PoliticaContrasena.incumplimientos("SinNumeros-NiNada", null)).containsExactly("Debe incluir un número.");
		assertThat(PoliticaContrasena.incumplimientos("SinSimbolos2026abc", null)).containsExactly("Debe incluir un símbolo.");
		assertThat(PoliticaContrasena.incumplimientos("Persona-Segura-2026", "persona@prueba.pa")).containsExactly("No debe contener su correo.");
	}

}
