package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/** HU-12 (TASK-12.5): registro de cuenta (P-02), recuperación de contraseña (P-04) y perfil (P-05). CP-02. */
class CuentaTest extends PruebaApi {

	private static String correoNuevo() {
		return "registro-" + UUID.randomUUID() + "@prueba.pa";
	}

	private static String documentoNuevo() {
		return "PA" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
	}

	private static String registro(String correo, String documento, String contrasena, boolean acepta) {
		return """
				{"tipoDocumento":"PASAPORTE","numeroDocumento":"%s","nombre":"Persona Ficticia",
				 "nacionalidad":"CO","correo":"%s","telefono":"+507 6000-0000","paisResidencia":"PA",
				 "contrasena":"%s","aceptaTratamientoDatos":%s}"""
			.formatted(documento, correo, contrasena, acepta);
	}

	private static String credenciales(String correo, String contrasena) {
		return "{\"correo\":\"%s\",\"contrasena\":\"%s\"}".formatted(correo, contrasena);
	}

	private String iniciarSesion(String correo, String contrasena) throws Exception {
		return leer(enviar(null, "/api/auth/login", credenciales(correo, contrasena)).andExpect(status().isOk())
			.andReturn(), "$.token");
	}

	@Test
	void elRegistroCreaUnaCuentaDeSolicitanteQuePuedeEntrarYVerSuPerfil() throws Exception {
		String correo = correoNuevo();
		String documento = documentoNuevo();

		MvcResult creada = enviar(null, "/api/auth/registro", registro(correo, documento, CLAVE, true))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.id").isNotEmpty())
			.andExpect(jsonPath("$.correo").value(correo))
			.andExpect(jsonPath("$.rol").value("SOLICITANTE"))
			.andExpect(jsonPath("$.estadoCuenta").value("ACTIVA"))
			.andReturn();

		assertThat(cuerpo(creada)).doesNotContain("contrasena").doesNotContain("$2a$");
		String id = leer(creada, "$.id");
		assertThat(eventos("REGISTRO_CUENTA", "usuario/" + id)).isEqualTo(1);
		assertThat(jdbc.queryForObject("SELECT terminos_aceptados IS NOT NULL FROM usuario WHERE correo = ?",
				Boolean.class, correo))
			.isTrue();

		String token = iniciarSesion(correo, CLAVE);
		obtener(token, "/api/perfil").andExpect(status().isOk())
			.andExpect(jsonPath("$.nombre").value("Persona Ficticia"))
			.andExpect(jsonPath("$.tipoDocumento").value("PASAPORTE"))
			.andExpect(jsonPath("$.numeroDocumento").value(documento))
			.andExpect(jsonPath("$.nacionalidad").value("CO"))
			.andExpect(jsonPath("$.paisResidencia").value("PA"))
			.andExpect(jsonPath("$.telefono").value("+507 6000-0000"))
			.andExpect(jsonPath("$.idiomaNotificacion").value("ES"))
			.andExpect(jsonPath("$.medioNotificacion").value("CORREO"));
	}

	@Test
	void elRegistroRechazaCorreoODocumentoRepetidos() throws Exception {
		String correo = correoNuevo();
		String documento = documentoNuevo();
		enviar(null, "/api/auth/registro", registro(correo, documento, CLAVE, true)).andExpect(status().isCreated());

		enviar(null, "/api/auth/registro", registro(correo.toUpperCase(), documentoNuevo(), CLAVE, true))
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("CORREO_YA_REGISTRADO"));
		enviar(null, "/api/auth/registro", registro(correoNuevo(), documento.toLowerCase(), CLAVE, true))
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("DOCUMENTO_YA_REGISTRADO"));
	}

	@Test
	void elRegistroExigeAceptarElTratamientoDeDatosYUnaContrasenaSegura() throws Exception {
		enviar(null, "/api/auth/registro", registro(correoNuevo(), documentoNuevo(), CLAVE, false))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[?(@.campo == 'aceptaTratamientoDatos')]").isNotEmpty());
		enviar(null, "/api/auth/registro", registro(correoNuevo(), documentoNuevo(), "corta", true))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("contrasena"));
		enviar(null, "/api/auth/registro", "{\"correo\":\"no-es-correo\"}").andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[?(@.campo == 'correo')]").isNotEmpty())
			.andExpect(jsonPath("$.errores[?(@.campo == 'numeroDocumento')]").isNotEmpty());
	}

	@Test
	void elRegistroPublicoNuncaCreaCuentasDelPersonal() throws Exception {
		String correo = correoNuevo();
		String conRol = registro(correo, documentoNuevo(), CLAVE, true).replaceFirst("\\{",
				"{\"rol\":\"ADMIN\",\"permisos\":[\"ADMINISTRAR\"],");

		enviar(null, "/api/auth/registro", conRol);

		assertThat(jdbc.queryForObject("SELECT count(*) FROM usuario WHERE correo = ? AND rol <> 'SOLICITANTE'",
				Long.class, correo))
			.isZero();
	}

	@Test
	void laRecuperacionRespondeIgualExistaONoLaCuenta() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String inexistente = correoNuevo();

		MvcResult conCuenta = enviar(null, "/api/auth/recuperacion", "{\"correo\":\"%s\"}".formatted(cliente.getCorreo()))
			.andExpect(status().isAccepted())
			.andReturn();
		MvcResult sinCuenta = enviar(null, "/api/auth/recuperacion", "{\"correo\":\"%s\"}".formatted(inexistente))
			.andExpect(status().isAccepted())
			.andReturn();

		assertThat(cuerpo(conCuenta)).isEqualTo(cuerpo(sinCuenta)).isEmpty();
		assertThat(buzon.tokenDe(cliente.getCorreo())).isNotBlank();
		assertThat(buzon.tokenDe(inexistente)).isNull();
		// En la base solo queda el hash del token, nunca el token.
		assertThat(jdbc.queryForObject("SELECT count(*) FROM recuperacion_contrasena WHERE token_hash = ?", Long.class,
				buzon.tokenDe(cliente.getCorreo())))
			.isZero();
	}

	@Test
	void elEnlaceDeRecuperacionCambiaLaContrasenaUnaSolaVezYCierraLasSesiones() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String sesionAnterior = token(cliente);
		String nueva = "Nueva-Clave-2027";
		enviar(null, "/api/auth/recuperacion", "{\"correo\":\"%s\"}".formatted(cliente.getCorreo()))
			.andExpect(status().isAccepted());
		String enlace = buzon.tokenDe(cliente.getCorreo());

		// Una contraseña débil se rechaza sin consumir el enlace.
		enviar(null, "/api/auth/recuperacion/confirmacion",
				"{\"token\":\"%s\",\"contrasenaNueva\":\"corta\"}".formatted(enlace))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("contrasenaNueva"));
		enviar(null, "/api/auth/recuperacion/confirmacion",
				"{\"token\":\"%s\",\"contrasenaNueva\":\"%s\"}".formatted(enlace, nueva))
			.andExpect(status().isNoContent());

		enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), CLAVE)).andExpect(status().isUnauthorized());
		iniciarSesion(cliente.getCorreo(), nueva);
		obtener(sesionAnterior, "/api/expedientes").andExpect(status().isUnauthorized());
		enviar(null, "/api/auth/recuperacion/confirmacion",
				"{\"token\":\"%s\",\"contrasenaNueva\":\"Otra-Clave-2028\"}".formatted(enlace))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.codigo").value("ENLACE_INVALIDO"));
	}

	@Test
	void unEnlaceVencidoInventadoOReemplazadoNoSirve() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String solicitud = "{\"correo\":\"%s\"}".formatted(cliente.getCorreo());
		String confirmacion = "{\"token\":\"%s\",\"contrasenaNueva\":\"Nueva-Clave-2027\"}";

		enviar(null, "/api/auth/recuperacion/confirmacion", confirmacion.formatted("token-inventado"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.codigo").value("ENLACE_INVALIDO"));

		enviar(null, "/api/auth/recuperacion", solicitud).andExpect(status().isAccepted());
		String primero = buzon.tokenDe(cliente.getCorreo());
		enviar(null, "/api/auth/recuperacion", solicitud).andExpect(status().isAccepted());
		String segundo = buzon.tokenDe(cliente.getCorreo());
		// Pedir otro enlace anula el anterior.
		enviar(null, "/api/auth/recuperacion/confirmacion", confirmacion.formatted(primero))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.codigo").value("ENLACE_INVALIDO"));

		jdbc.update("UPDATE recuperacion_contrasena SET expira = now() - interval '1 second' WHERE usuario_id = ?",
				cliente.getId());
		enviar(null, "/api/auth/recuperacion/confirmacion", confirmacion.formatted(segundo))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.codigo").value("ENLACE_INVALIDO"));
		iniciarSesion(cliente.getCorreo(), CLAVE);
	}

	@Test
	void laRecuperacionLevantaElBloqueoPorIntentos() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		// El perfil de pruebas bloquea al tercer intento fallido.
		for (int i = 0; i < 3; i++) {
			enviar(null, "/api/auth/login", credenciales(cliente.getCorreo(), "Clave-Erronea-" + i))
				.andExpect(status().isUnauthorized());
		}
		enviar(null, "/api/auth/recuperacion", "{\"correo\":\"%s\"}".formatted(cliente.getCorreo()))
			.andExpect(status().isAccepted());

		enviar(null, "/api/auth/recuperacion/confirmacion", "{\"token\":\"%s\",\"contrasenaNueva\":\"Nueva-Clave-2027\"}"
			.formatted(buzon.tokenDe(cliente.getCorreo())))
			.andExpect(status().isNoContent());

		iniciarSesion(cliente.getCorreo(), "Nueva-Clave-2027");
	}

	@Test
	void elPerfilSoloPermiteCambiarLosDatosDeContacto() throws Exception {
		Usuario cliente = usuario(Rol.SOLICITANTE);
		String token = token(cliente);

		modificar(token, "/api/perfil",
				"{\"telefono\":\"+507 6111-2222\",\"idiomaNotificacion\":\"EN\",\"medioNotificacion\":\"SMS\",\"nombre\":\"Otro Nombre\",\"correo\":\"otro@prueba.pa\"}")
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.telefono").value("+507 6111-2222"))
			.andExpect(jsonPath("$.idiomaNotificacion").value("EN"))
			.andExpect(jsonPath("$.medioNotificacion").value("SMS"));

		obtener(token, "/api/perfil").andExpect(status().isOk())
			.andExpect(jsonPath("$.id").value(cliente.getId().toString()))
			.andExpect(jsonPath("$.nombre").value("Usuario ficticio"))
			.andExpect(jsonPath("$.correo").value(cliente.getCorreo()))
			.andExpect(jsonPath("$.telefono").value("+507 6111-2222"));
		assertThat(eventos("ACTUALIZACION_PERFIL", "usuario/" + cliente.getId())).isEqualTo(1);

		modificar(token, "/api/perfil", "{\"telefono\":\"abc\"}").andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("telefono"));
		obtener(null, "/api/perfil").andExpect(status().isUnauthorized());
	}

}
