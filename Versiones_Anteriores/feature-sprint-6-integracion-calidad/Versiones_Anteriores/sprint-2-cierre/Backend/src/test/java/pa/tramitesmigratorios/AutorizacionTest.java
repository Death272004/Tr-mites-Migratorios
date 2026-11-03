package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import pa.tramitesmigratorios.seguridad.MatrizAutorizacion;
import pa.tramitesmigratorios.seguridad.MatrizAutorizacion.Regla;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/** HU-13: matriz de autorización rol × endpoint, aplicada en el backend. CP-01, CP-03, CP-09. */
class AutorizacionTest extends PruebaApi {

	/** Recorre todas las reglas con todos los roles: permitido y denegado deben coincidir con la matriz. */
	@Test
	void cadaEndpointAceptaSoloLosRolesDeLaMatriz() throws Exception {
		Map<Rol, Usuario> usuarios = new EnumMap<>(Rol.class);
		Map<Rol, String> tokens = new EnumMap<>(Rol.class);
		for (Rol rol : Rol.values()) {
			usuarios.put(rol, rol == Rol.FUNCIONARIO ? funcionarioCompleto() : usuario(rol));
			tokens.put(rol, token(usuarios.get(rol)));
		}
		List<String> diferencias = new ArrayList<>();
		for (Regla regla : MatrizAutorizacion.REGLAS) {
			// Identificadores inexistentes: basta para distinguir "denegado por rol" de cualquier otra respuesta.
			String ruta = regla.ruta().replaceAll("\\{[^}]+}", UUID.randomUUID().toString());
			for (Rol rol : Rol.values()) {
				// Cerrar sesión invalida el token: esa regla se prueba con una sesión aparte.
				String token = ruta.endsWith("/logout") ? token(usuarios.get(rol)) : tokens.get(rol);
				int estado = mvc
					.perform(con(token, request(regla.metodo(), ruta)).contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
					.andReturn()
					.getResponse()
					.getStatus();
				boolean permitido = regla.roles().contains(rol);
				if (estado == 401 || permitido == (estado == 403)) {
					diferencias.add("%s %s como %s respondió %d".formatted(regla.metodo(), regla.ruta(), rol, estado));
				}
			}
			int sinSesion = mvc.perform(request(regla.metodo(), ruta)).andReturn().getResponse().getStatus();
			if (sinSesion != 401) {
				diferencias.add("%s %s sin sesión respondió %d".formatted(regla.metodo(), regla.ruta(), sinSesion));
			}
		}
		assertThat(diferencias).isEmpty();
	}

	@Test
	void elAdministradorNoLeeNiDecideExpedientes() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String admin = tokenDe(Rol.ADMIN);

		obtener(admin, "/api/expedientes").andExpect(status().isForbidden());
		obtener(admin, "/api/expedientes/{id}", id).andExpect(status().isForbidden());
		obtener(admin, "/api/expedientes/{id}/documentos", id).andExpect(status().isForbidden());
		modificar(admin, "/api/expedientes/{id}/estado", "{\"estadoNuevo\":\"EN_ANALISIS\",\"motivo\":\"x\",\"version\":0}", id)
			.andExpect(status().isForbidden());
	}

	@Test
	void unaRutaQueNoEstaEnLaMatrizSeDeniega() throws Exception {
		obtener(tokenDe(Rol.ADMIN), "/api/usuarios").andExpect(status().isForbidden());
		obtener(token(funcionarioCompleto()), "/actuator/env").andExpect(status().isForbidden());
		obtener(null, "/actuator/health").andExpect(status().isOk());
	}

	@Test
	void elPermisoDenegadoDejaEventoDeAuditoria() throws Exception {
		Usuario admin = usuario(Rol.ADMIN);

		obtener(token(admin), "/api/auditoria/eventos").andExpect(status().isForbidden());

		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE actor_id = ? AND operacion = 'ACCESO_DENEGADO' AND resultado = 'DENEGADO' AND recurso = 'GET /api/auditoria/eventos'",
				Long.class, admin.getId()))
			.isEqualTo(1);
	}

	@Test
	void elFuncionarioNecesitaElPermisoGranularDeCadaOperacion() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String soloConsulta = tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR);
		String sinPermisos = tokenDe(Rol.FUNCIONARIO);

		obtener(soloConsulta, "/api/expedientes/{id}", id).andExpect(status().isOk());
		enviar(soloConsulta, "/api/expedientes/{id}/observaciones", "{\"texto\":\"Falta la foto\"}", id)
			.andExpect(status().isForbidden());
		cambiarEstado(soloConsulta, soloConsulta, id, "EN_ANALISIS", "Inicio de revisión").andExpect(status().isForbidden());
		obtener(sinPermisos, "/api/expedientes/{id}", id).andExpect(status().isForbidden());
		obtener(sinPermisos, "/api/expedientes").andExpect(status().isForbidden());
	}

}
