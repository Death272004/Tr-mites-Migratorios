package pa.tramitesmigratorios;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;

/**
 * QA · TASK-21.3 (HU-21): autorización del historial por rol y proyección por rol (el cliente
 * no ve las notas internas del despacho). Complementa {@link EstadosTest}. CP-03, CP-09.
 */
class QaHistorialTest extends PruebaApi {

	private static final String NOTA_INTERNA = "Nota interna: revisar con el jefe de área";
	private static final String MOTIVO_CLIENTE = "Falta el comprobante de pago";

	@Test
	void cadaRolVeElHistorialSegunLaMatrizYSuProyeccion() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = token(funcionarioCompleto());
		String id = expediente(cliente, TRAMITE_SIMPLE);
		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", NOTA_INTERNA).andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "CON_OBSERVACIONES", MOTIVO_CLIENTE).andExpect(status().isOk());
		String url = "/api/expedientes/{id}/historial";

		// Cliente titular: todos los cambios, sin la nota interna.
		obtener(cliente, url, id).andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(3)))
			.andExpect(jsonPath("$[1].estadoNuevo").value("EN_ANALISIS"))
			.andExpect(jsonPath("$[1].motivo").doesNotExist())
			.andExpect(jsonPath("$[2].motivo").value(MOTIVO_CLIENTE));
		// Personal autorizado: todo, con la nota interna.
		for (String interno : new String[] { tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR), tokenDe(Rol.SUPERVISOR),
				tokenDe(Rol.AUDITOR) }) {
			obtener(interno, url, id).andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)))
				.andExpect(jsonPath("$[1].motivo").value(NOTA_INTERNA));
		}
		// Sin acceso.
		obtener(tokenDe(Rol.SOLICITANTE), url, id).andExpect(status().isNotFound());
		obtener(tokenDe(Rol.FUNCIONARIO), url, id).andExpect(status().isForbidden());
		obtener(tokenDe(Rol.ADMIN), url, id).andExpect(status().isForbidden());
		obtener(null, url, id).andExpect(status().isUnauthorized());
	}

	@Test
	void elHistorialDeUnExpedienteInexistenteOMalFormadoNoRevelaNada() throws Exception {
		String despacho = tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR);

		obtener(despacho, "/api/expedientes/{id}/historial", UUID.randomUUID()).andExpect(status().isNotFound())
			.andExpect(jsonPath("$.codigo").value("NO_ENCONTRADO"));
		obtener(despacho, "/api/expedientes/{id}/historial", "1 OR 1=1").andExpect(status().isBadRequest());
	}

	@Test
	void elHistorialNoSePuedeEscribirNiBorrarPorLaApi() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = token(funcionarioCompleto());
		String id = expediente(cliente, TRAMITE_SIMPLE);

		for (String token : new String[] { cliente, despacho, tokenDe(Rol.ADMIN), tokenDe(Rol.AUDITOR) }) {
			enviar(token, "/api/expedientes/{id}/historial", "{\"estadoNuevo\":\"RESUELTO\"}", id)
				.andExpect(status().isForbidden());
			modificar(token, "/api/expedientes/{id}/historial", "{}", id).andExpect(status().isForbidden());
		}
		obtener(cliente, "/api/expedientes/{id}/historial", id).andExpect(jsonPath("$", hasSize(1)));
	}

}
