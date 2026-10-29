package pa.tramitesmigratorios.seguridad;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

import pa.tramitesmigratorios.seguridad.MatrizAutorizacion.Regla;

/**
 * Pruebas unitarias de las reglas de permisos (TASK-27.1): matriz rol × endpoint, permisos
 * granulares del usuario y política de contraseñas, sin levantar Spring.
 */
class PermisosDominioTest {

	@Test
	void laMatrizNoTieneReglasDuplicadasYCubreSoloLaApi() {
		Set<String> claves = MatrizAutorizacion.REGLAS.stream()
			.map(r -> r.metodo() + " " + r.ruta())
			.collect(Collectors.toSet());
		assertThat(claves).hasSize(MatrizAutorizacion.REGLAS.size());
		assertThat(MatrizAutorizacion.REGLAS).allSatisfy(r -> {
			assertThat(r.ruta()).startsWith("/api/");
			assertThat(r.roles()).isNotEmpty();
		});
	}

	@Test
	void elAdministradorNoLeeNiDecideExpedientes() {
		assertThat(MatrizAutorizacion.REGLAS.stream().filter(r -> r.ruta().startsWith("/api/expedientes")))
			.allSatisfy(r -> assertThat(r.roles()).doesNotContain(Rol.ADMIN));
	}

	@Test
	void soloElFuncionarioCambiaEstadosYOperaVerificaciones() {
		assertThat(roles(HttpMethod.PATCH, "/api/expedientes/{id}/estado")).containsExactly(Rol.FUNCIONARIO);
		assertThat(MatrizAutorizacion.REGLAS.stream()
			.filter(r -> r.metodo() == HttpMethod.POST && r.ruta().contains("/verificaciones")))
			.isNotEmpty()
			.allSatisfy(r -> assertThat(r.roles()).containsExactly(Rol.FUNCIONARIO));
	}

	@Test
	void soloElClienteCreaExpedientesYSolicitudesArco() {
		assertThat(roles(HttpMethod.POST, "/api/expedientes")).containsExactly(Rol.SOLICITANTE);
		assertThat(roles(HttpMethod.POST, "/api/solicitudes-arco")).containsExactly(Rol.SOLICITANTE);
	}

	@Test
	void laBitacoraEsExclusivaDelAuditor() {
		assertThat(roles(HttpMethod.GET, "/api/auditoria/eventos")).containsExactly(Rol.AUDITOR);
		assertThat(roles(HttpMethod.GET, "/api/auditoria/eventos/exportacion")).containsExactly(Rol.AUDITOR);
	}

	@Test
	void elContenidoDeDocumentosNoLlegaAlAuditor() {
		assertThat(roles(HttpMethod.GET, "/api/expedientes/{id}/documentos/{documentoId}/contenido"))
			.doesNotContain(Rol.AUDITOR, Rol.ADMIN);
	}

	@Test
	void lasFuentesSimuladasSoloLasConsultaElDespacho() {
		assertThat(MatrizAutorizacion.REGLAS.stream().filter(r -> r.ruta().startsWith("/api/mock/")))
			.hasSize(4)
			.allSatisfy(r -> assertThat(r.roles()).containsExactly(Rol.FUNCIONARIO));
	}

	@Test
	void usuarioActualComparaRolYPermisos() {
		UsuarioActual u = new UsuarioActual(UUID.randomUUID(), Rol.FUNCIONARIO, Set.of(Permiso.CONSULTAR), null);
		assertThat(u.es(Rol.SUPERVISOR, Rol.FUNCIONARIO)).isTrue();
		assertThat(u.es(Rol.ADMIN)).isFalse();
		assertThat(u.es()).isFalse();
		assertThat(u.tiene(Permiso.CONSULTAR)).isTrue();
		assertThat(u.tiene(Permiso.RESOLVER)).isFalse();
	}

	@Test
	void contrasenaQueCumpleLaPolitica() {
		assertThat(PoliticaContrasena.incumplimientos("Tramites-2026", "cliente@demo.pa")).isEmpty();
	}

	@Test
	void contrasenaDebilReportaCadaIncumplimiento() {
		assertThat(PoliticaContrasena.incumplimientos("abc", "x@demo.pa")).hasSize(4)
			.anyMatch(f -> f.contains("entre 10 y 72"))
			.anyMatch(f -> f.contains("mayúscula"))
			.anyMatch(f -> f.contains("número"))
			.anyMatch(f -> f.contains("símbolo"));
		assertThat(PoliticaContrasena.incumplimientos(null, null)).isNotEmpty();
		assertThat(PoliticaContrasena.incumplimientos("A".repeat(70) + "a1!", "x@demo.pa"))
			.anyMatch(f -> f.contains("entre 10 y 72"));
	}

	@Test
	void contrasenaNoPuedeContenerElUsuarioDelCorreo() {
		assertThat(PoliticaContrasena.incumplimientos("Carla-2026-Segura", "carla@demo.pa"))
			.containsExactly("No debe contener su correo.");
		assertThat(PoliticaContrasena.incumplimientos("Ana-2026-Segura!", "ana@demo.pa"))
			.as("usuarios de menos de 4 letras no se comparan").isEmpty();
	}

	private static Set<Rol> roles(HttpMethod metodo, String ruta) {
		return MatrizAutorizacion.REGLAS.stream()
			.filter(r -> r.metodo().equals(metodo) && r.ruta().equals(ruta))
			.map(Regla::roles)
			.findFirst()
			.orElseThrow();
	}

}
