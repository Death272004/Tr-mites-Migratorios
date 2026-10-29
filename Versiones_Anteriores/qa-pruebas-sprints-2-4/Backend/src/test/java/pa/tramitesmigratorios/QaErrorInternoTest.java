package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.catalogo.Catalogos;
import pa.tramitesmigratorios.seguridad.Rol;

/**
 * QA · TASK-14.4 (HU-14): un error inesperado del servidor (5xx genérico) responde con el
 * mensaje seguro, aunque la excepción original traiga SQL, rutas o datos personales. CP-11.
 */
class QaErrorInternoTest extends PruebaApi {

	@MockitoBean
	Catalogos catalogos;

	@Test
	void unaExcepcionNoControladaSeConvierteEn500SinFiltrarSuContenido() throws Exception {
		when(catalogos.tramitesConRequisitos()).thenThrow(new IllegalStateException(
				"SELECT * FROM usuario WHERE correo = 'persona.real@correo.pa' -- C:\\app\\secretos\\db.properties"));

		MvcResult respuesta = obtener(tokenDe(Rol.SOLICITANTE), "/api/catalogos/tipos-tramite")
			.andExpect(status().isInternalServerError())
			.andExpect(jsonPath("$.codigo").value("ERROR_INTERNO"))
			.andExpect(jsonPath("$.mensaje").value("Ocurrió un error interno. Intente de nuevo más tarde."))
			.andExpect(jsonPath("$.correlacionId").isNotEmpty())
			.andReturn();

		assertThat(cuerpo(respuesta)).doesNotContain("SELECT")
			.doesNotContain("persona.real@correo.pa")
			.doesNotContain("secretos")
			.doesNotContain("IllegalStateException")
			.doesNotContain("\tat ");
	}

}
