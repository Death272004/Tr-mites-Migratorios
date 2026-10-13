package pa.tramitesmigratorios;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

import com.jayway.jsonpath.JsonPath;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.AbstractMockHttpServletRequestBuilder;

import pa.tramitesmigratorios.seguridad.AuthServicio;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/**
 * Base de las pruebas de integración: la aplicación completa sobre un PostgreSQL real
 * (Testcontainers) y peticiones HTTP con sesiones reales. Cada prueba crea sus propios
 * usuarios, con datos ficticios, para no depender del orden de ejecución.
 */
@Import({ TestcontainersConfiguration.class, BuzonPrueba.class })
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
abstract class PruebaApi {

	static final String CLAVE = "Prueba-Segura-2026";
	static final byte[] PDF = "%PDF-1.4\ncontenido ficticio de prueba\n%%EOF".getBytes(StandardCharsets.UTF_8);
	/** Trámite cuyos documentos obligatorios (PASAPORTE y COMPROBANTE_PAGO) no son sensibles. */
	static final String TRAMITE_SIMPLE = "PRORROGA_ESTADIA";

	@Autowired
	MockMvc mvc;

	@Autowired
	AuthServicio auth;

	@Autowired
	JdbcTemplate jdbc;

	@Autowired
	BuzonPrueba.Buzon buzon;

	Usuario usuario(Rol rol, Permiso... permisos) {
		Set<Permiso> conjunto = permisos.length == 0 ? Set.of() : EnumSet.copyOf(Set.of(permisos));
		String correo = rol.name().toLowerCase() + "-" + UUID.randomUUID() + "@prueba.pa";
		return auth.crearUsuario("Usuario ficticio", correo, CLAVE, rol, conjunto);
	}

	Usuario funcionarioCompleto() {
		return usuario(Rol.FUNCIONARIO, Rol.FUNCIONARIO.permisosBase().toArray(Permiso[]::new));
	}

	String token(Usuario usuario) {
		return auth.iniciarSesion(usuario.getCorreo(), CLAVE).token();
	}

	String tokenDe(Rol rol, Permiso... permisos) {
		return token(usuario(rol, permisos));
	}

	static <B extends AbstractMockHttpServletRequestBuilder<B>> B con(String token, B peticion) {
		return token == null ? peticion : peticion.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
	}

	ResultActions obtener(String token, String url, Object... variables) throws Exception {
		return mvc.perform(con(token, get(url, variables)));
	}

	ResultActions enviar(String token, String url, String json, Object... variables) throws Exception {
		return mvc.perform(con(token, post(url, variables)).contentType(MediaType.APPLICATION_JSON).content(json));
	}

	ResultActions modificar(String token, String url, String json, Object... variables) throws Exception {
		return mvc.perform(con(token, patch(url, variables)).contentType(MediaType.APPLICATION_JSON).content(json));
	}

	ResultActions reemplazar(String token, String url, String json, Object... variables) throws Exception {
		return mvc.perform(con(token, put(url, variables)).contentType(MediaType.APPLICATION_JSON).content(json));
	}

	ResultActions adjuntar(String token, String expedienteId, String tipoDocumental, String nombre, String mime,
			byte[] contenido) throws Exception {
		return mvc.perform(con(token, multipart("/api/expedientes/{id}/documentos", expedienteId)
			.file(new MockMultipartFile("archivo", nombre, mime, contenido))
			.param("tipoDocumental", tipoDocumental)));
	}

	static String cuerpo(MvcResult resultado) throws Exception {
		return resultado.getResponse().getContentAsString(StandardCharsets.UTF_8);
	}

	static <T> T leer(MvcResult resultado, String ruta) throws Exception {
		return JsonPath.read(cuerpo(resultado), ruta);
	}

	/** Crea un expediente del trámite indicado y devuelve su id. */
	String expediente(String tokenSolicitante, String tipoTramite) throws Exception {
		MvcResult creado = enviar(tokenSolicitante, "/api/expedientes", "{\"tipoTramite\":\"" + tipoTramite + "\"}")
			.andExpect(status().isCreated())
			.andReturn();
		return leer(creado, "$.id");
	}

	/** Cambia el estado leyendo antes la versión actual; devuelve el resultado para comprobarlo. */
	ResultActions cambiarEstado(String tokenFuncionario, String tokenLectura, String expedienteId, String estado,
			String motivo) throws Exception {
		Integer version = leer(obtener(tokenLectura, "/api/expedientes/{id}", expedienteId).andReturn(), "$.version");
		return modificar(tokenFuncionario, "/api/expedientes/{id}/estado",
				"{\"estadoNuevo\":\"%s\",\"motivo\":\"%s\",\"version\":%d}".formatted(estado, motivo, version),
				expedienteId);
	}

	/** Pasa el expediente a RESUELTO con el resultado indicado (APROBADA o NEGADA). */
	ResultActions resolver(String tokenFuncionario, String expedienteId, String resultado, String motivo)
			throws Exception {
		Integer version = leer(obtener(tokenFuncionario, "/api/expedientes/{id}", expedienteId).andReturn(), "$.version");
		return modificar(tokenFuncionario, "/api/expedientes/{id}/estado",
				"{\"estadoNuevo\":\"RESUELTO\",\"resultado\":\"%s\",\"motivo\":\"%s\",\"version\":%d}"
					.formatted(resultado, motivo, version),
				expedienteId);
	}

	long eventos(String operacion, String recurso) {
		return jdbc.queryForObject("SELECT count(*) FROM evento_auditoria WHERE operacion = ? AND recurso = ?",
				Long.class, operacion, recurso);
	}

}
