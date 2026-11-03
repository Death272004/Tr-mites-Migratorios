package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/** HU-12 (TASK-12.6): autenticación, bloqueo por intentos, cierre de sesión y cambio de contraseña. CP-01, CP-02. */
class AutenticacionTest extends PruebaApi {

	private static String credenciales(String correo, String contrasena) {
		return "{\"correo\":\"%s\",\"contrasena\":\"%s\"}".formatted(correo, contrasena);
	}

	@Test
	void elLoginDevuelveTokenConExpiracionYNuncaElHash() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);

		MvcResult respuesta = enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), CLAVE))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.token").isNotEmpty())
			.andExpect(jsonPath("$.expiraEn").value(3600))
			.andExpect(jsonPath("$.rol").value("SOLICITANTE"))
			.andExpect(jsonPath("$.usuario.permisos", contains("PORTAL")))
			.andExpect(jsonPath("$.usuario.correo").value(cliente.getCorreo()))
			.andExpect(jsonPath("$.usuario.estadoCuenta").value("ACTIVA"))
			.andReturn();

		assertThat(cuerpo(respuesta)).doesNotContain("contrasena").doesNotContain("$2a$");
		String hash = jdbc.queryForObject("SELECT contrasena_hash FROM usuario WHERE id = ?", String.class, cliente.getId());
		assertThat(hash).startsWith("$2").doesNotContain(CLAVE);
		// En la base solo queda el hash del token, nunca el token.
		String token = leer(respuesta, "$.token");
		assertThat(jdbc.queryForObject("SELECT count(*) FROM sesion WHERE token_hash = ?", Long.class, token)).isZero();
	}

	@Test
	void elFalloEsGenericoYNoRevelaSiLaCuentaExiste() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);

		MvcResult claveMala = enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), "Otra-Clave-2026"))
			.andExpect(status().isUnauthorized())
			.andReturn();
		MvcResult cuentaInexistente = enviar(null, "/api/auth/login", credenciales("nadie@prueba.pa", CLAVE))
			.andExpect(status().isUnauthorized())
			.andReturn();

		assertThat(this.<String>leer(claveMala, "$.codigo")).isEqualTo("CREDENCIALES_INVALIDAS");
		assertThat(this.<String>leer(claveMala, "$.mensaje")).isEqualTo(leer(cuentaInexistente, "$.mensaje"));
		assertThat(this.<String>leer(claveMala, "$.codigo")).isEqualTo(leer(cuentaInexistente, "$.codigo"));
	}

	@Test
	void losDatosIncompletosRespondenCuatrocientosConDetallePorCampo() throws Exception {
		enviar(null, "/api/auth/login", "{\"correo\":\"no-es-correo\",\"contrasena\":\"\"}")
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.codigo").value("ENTRADA_INVALIDA"))
			.andExpect(jsonPath("$.errores[?(@.campo == 'correo')]").isNotEmpty())
			.andExpect(jsonPath("$.errores[?(@.campo == 'contrasena')]").isNotEmpty());
	}

	@Test
	void trasVariosIntentosFallidosLaCuentaSeBloqueaTemporalmente() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		// El perfil de pruebas bloquea al tercer intento fallido.
		for (int i = 0; i < 3; i++) {
			enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), "Clave-Erronea-" + i))
				.andExpect(status().isUnauthorized());
		}

		// Ni la contraseña correcta entra mientras dura el bloqueo, y el mensaje sigue siendo genérico.
		enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), CLAVE))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.codigo").value("CREDENCIALES_INVALIDAS"));

		assertThat(jdbc.queryForObject("SELECT bloqueado_hasta > now() FROM usuario WHERE id = ?", Boolean.class,
				cliente.getId()))
			.isTrue();
		// Al vencer el bloqueo, la cuenta vuelve a entrar.
		jdbc.update("UPDATE usuario SET bloqueado_hasta = now() - interval '1 minute' WHERE id = ?", cliente.getId());
		enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), CLAVE)).andExpect(status().isOk());
	}

	@Test
	void sinCredencialesOConTokenInvalidoRespondeNoAutenticado() throws Exception {
		obtener(null, "/api/expedientes").andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"))
			.andExpect(jsonPath("$.correlacionId").isNotEmpty());
		obtener("token-inventado", "/api/expedientes").andExpect(status().isUnauthorized());
	}

	@Test
	void unTokenExpiradoDejaDeServir() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String token = token(cliente);
		obtener(token, "/api/expedientes").andExpect(status().isOk());

		jdbc.update("UPDATE sesion SET expira = now() - interval '1 second' WHERE usuario_id = ?", cliente.getId());

		obtener(token, "/api/expedientes").andExpect(status().isUnauthorized());
	}

	@Test
	void cerrarSesionInvalidaElToken() throws Exception {
		String token = tokenDe(Rol.SOLICITANTE);
		obtener(token, "/api/expedientes").andExpect(status().isOk());

		enviar(token, "/api/auth/logout", "").andExpect(status().isNoContent());

		obtener(token, "/api/expedientes").andExpect(status().isUnauthorized());
	}

	@Test
	void cambiarLaContrasenaExigeLaActualYLaPoliticaDeComplejidad() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String token = token(cliente);
		String otraSesion = token(cliente);
		String nueva = "Nueva-Clave-2027";

		reemplazar(token, "/api/auth/contrasena",
				"{\"contrasenaActual\":\"No-Es-La-Actual-1\",\"contrasenaNueva\":\"%s\"}".formatted(nueva))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("contrasenaActual"));
		reemplazar(token, "/api/auth/contrasena",
				"{\"contrasenaActual\":\"%s\",\"contrasenaNueva\":\"corta\"}".formatted(CLAVE))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("contrasenaNueva"));

		reemplazar(token, "/api/auth/contrasena",
				"{\"contrasenaActual\":\"%s\",\"contrasenaNueva\":\"%s\"}".formatted(CLAVE, nueva))
			.andExpect(status().isNoContent());

		enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), CLAVE)).andExpect(status().isUnauthorized());
		enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), nueva)).andExpect(status().isOk());
		// La sesión que hizo el cambio sigue; las demás quedan revocadas.
		obtener(token, "/api/expedientes").andExpect(status().isOk());
		obtener(otraSesion, "/api/expedientes").andExpect(status().isUnauthorized());
	}

	@Test
	void elAccesoQuedaEnAuditoriaSinContrasenasNiTokens() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String token = token(cliente);
		enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), "Clave-Erronea-9")).andExpect(status().isUnauthorized());
		enviar(token, "/api/auth/logout", "").andExpect(status().isNoContent());

		assertThat(jdbc.queryForList(
				"SELECT operacion || ':' || resultado FROM evento_auditoria WHERE actor_id = ? ORDER BY fecha", String.class,
				cliente.getId()))
			.containsExactly("INICIO_SESION:EXITO", "INICIO_SESION:FALLO", "CIERRE_SESION:EXITO");
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE coalesce(detalle, '') || recurso LIKE ? OR coalesce(detalle, '') || recurso LIKE ?",
				Long.class, "%" + CLAVE + "%", "%" + token + "%"))
			.isZero();
	}

}
