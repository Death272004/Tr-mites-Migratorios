package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.Test;

import pa.tramitesmigratorios.expediente.EstadoExpediente;
import pa.tramitesmigratorios.seguridad.Rol;

/**
 * QA · TASK-19.5 (HU-19): recorre la matriz completa de transiciones (10 × 10 estados) contra
 * la especificación, y comprueba el bloqueo de la decisión sin requisitos. Complementa {@link EstadosTest}. CP-04.
 */
class QaTransicionesTest extends PruebaApi {

	/**
	 * Especificación de la cadena (Pantallas_y_Datos_Migracion.md y HU-19 CA-6), escrita aquí de
	 * forma independiente del código para detectar cualquier desviación.
	 */
	private static final Map<String, Set<String>> ESPERADA = Map.of(
			"EN_PREPARACION", Set.of("RECIBIDO", "ARCHIVADO"),
			"RECIBIDO", Set.of("CON_OBSERVACIONES", "EN_ANALISIS", "ARCHIVADO"),
			"CON_OBSERVACIONES", Set.of("EN_ANALISIS", "ARCHIVADO"),
			"EN_ANALISIS", Set.of("CON_OBSERVACIONES", "ADMITIDO", "ARCHIVADO"),
			"ADMITIDO", Set.of("EN_RESOLUCION", "CON_OBSERVACIONES"),
			"EN_RESOLUCION", Set.of("RESUELTO", "ADMITIDO"),
			"RESUELTO", Set.of("NOTIFICADO"),
			"NOTIFICADO", Set.of("ENTREGADO"),
			"ENTREGADO", Set.of("ARCHIVADO"),
			"ARCHIVADO", Set.of());

	private static final Set<String> CON_RESULTADO = Set.of("RESUELTO", "NOTIFICADO", "ENTREGADO");

	/** Expediente con los documentos obligatorios completos, puesto directamente en el estado de origen. */
	private String expedienteEn(String cliente, String estado) throws Exception {
		String id = expediente(cliente, TRAMITE_SIMPLE);
		adjuntar(cliente, id, "PASAPORTE", "p.pdf", "application/pdf", PDF).andExpect(status().isCreated());
		adjuntar(cliente, id, "COMPROBANTE_PAGO", "c.pdf", "application/pdf", PDF).andExpect(status().isCreated());
		jdbc.update("UPDATE expediente SET estado = ?, resultado = ? WHERE id = ?::uuid", estado,
				CON_RESULTADO.contains(estado) ? "APROBADA" : null, id);
		return id;
	}

	@Test
	void cadaParDeEstadosRespondeSegunLaMatriz() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = token(funcionarioCompleto());
		List<String> diferencias = new ArrayList<>();
		int permitidas = 0;
		int rechazadas = 0;

		for (EstadoExpediente origen : EstadoExpediente.values()) {
			for (EstadoExpediente destino : EstadoExpediente.values()) {
				String id = expedienteEn(cliente, origen.name());
				int estado = (destino == EstadoExpediente.RESUELTO
						? resolver(despacho, id, "APROBADA", "Prueba de matriz")
						: cambiarEstado(despacho, despacho, id, destino.name(), "Prueba de matriz"))
					.andReturn()
					.getResponse()
					.getStatus();
				boolean debePermitirse = ESPERADA.get(origen.name()).contains(destino.name());
				String final_ = jdbc.queryForObject("SELECT estado FROM expediente WHERE id = ?::uuid", String.class, id);
				if (debePermitirse && (estado != 200 || !final_.equals(destino.name()))) {
					diferencias.add("%s → %s debía permitirse y respondió %d".formatted(origen, destino, estado));
				}
				if (!debePermitirse && (estado != 409 || !final_.equals(origen.name()))) {
					diferencias.add("%s → %s debía rechazarse (409) y respondió %d, quedó en %s".formatted(origen, destino,
							estado, final_));
				}
				if (debePermitirse) {
					permitidas++;
				}
				else {
					rechazadas++;
				}
			}
		}

		assertThat(diferencias).isEmpty();
		assertThat(permitidas).isEqualTo(17);
		assertThat(rechazadas).isEqualTo(83);
	}

	@Test
	void unRechazoDejaRegistroDeFalloYNoTocaElHistorial() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = token(funcionarioCompleto());
		String id = expedienteEn(cliente, "RECIBIDO");
		long historialAntes = jdbc.queryForObject("SELECT count(*) FROM historial_estado WHERE expediente_id = ?::uuid",
				Long.class, id);

		cambiarEstado(despacho, despacho, id, "ENTREGADO", "Saltarse todo").andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("TRANSICION_NO_PERMITIDA"));

		assertThat(jdbc.queryForObject("SELECT count(*) FROM historial_estado WHERE expediente_id = ?::uuid", Long.class, id))
			.isEqualTo(historialAntes);
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE operacion = 'CAMBIAR_ESTADO' AND recurso = ? AND resultado = 'FALLO'",
				Long.class, "expediente/" + id))
			.isEqualTo(1);
	}

	@Test
	void noSeApruebaNiSeNiegaSinLosRequisitosCompletos() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = token(funcionarioCompleto());
		// En resolución, pero sin ningún documento cargado.
		String id = expediente(cliente, TRAMITE_SIMPLE);
		jdbc.update("UPDATE expediente SET estado = 'EN_RESOLUCION' WHERE id = ?::uuid", id);

		for (String resultado : new String[] { "APROBADA", "NEGADA" }) {
			resolver(despacho, id, resultado, "Decisión sin requisitos").andExpect(status().isConflict())
				.andExpect(jsonPath("$.codigo").value("REQUISITOS_INCOMPLETOS"));
		}
		assertThat(jdbc.queryForObject("SELECT estado FROM expediente WHERE id = ?::uuid", String.class, id))
			.isEqualTo("EN_RESOLUCION");
		assertThat(jdbc.queryForObject("SELECT resultado FROM expediente WHERE id = ?::uuid", String.class, id)).isNull();
	}

	@Test
	void unResultadoInventadoNoSeAcepta() throws Exception {
		String despacho = token(funcionarioCompleto());
		String id = expedienteEn(tokenDe(Rol.SOLICITANTE), "EN_RESOLUCION");

		resolver(despacho, id, "QUIZAS", "Resultado inválido").andExpect(status().isBadRequest());
		assertThat(EnumSet.allOf(EstadoExpediente.Resultado.class)).hasSize(2);
	}

}
