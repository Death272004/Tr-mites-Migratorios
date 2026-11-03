package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/**
 * QA · TASK-18.4 (HU-18): cada evento genera la notificación correcta, solo para su
 * destinatario, y el texto es una plantilla fija sin datos personales ni contenido del caso. CP-09, CP-11.
 */
class QaNotificacionesTest extends PruebaApi {

	/** Plantillas aceptadas: identificador del expediente o código corto, tipo y estado; nada más. */
	private static final List<Pattern> PLANTILLAS = List.of(
			Pattern.compile("El expediente EXP-\\d{4}-\\d{6} tiene observaciones por atender\\. Revise los requisitos en el portal\\."),
			Pattern.compile("El expediente EXP-\\d{4}-\\d{6} ya tiene una resolución\\. Consulte el resultado en el portal\\."),
			Pattern.compile("El despacho registró una observación en el expediente EXP-\\d{4}-\\d{6}\\."),
			Pattern.compile("Un cliente revocó el consentimiento [0-9a-f]{8}\\. Revise el tratamiento de sus datos\\."),
			Pattern.compile("Nueva solicitud ARCO [0-9a-f]{8} de tipo [A-Z]+ en la bandeja de atención\\."),
			Pattern.compile("Su solicitud ARCO [0-9a-f]{8} de tipo [A-Z]+ pasó a estado [A-Z_]+\\."));

	private static final String SECRETO_OBSERVACION = "pasaporte vencido del señor Quintero";
	private static final String SECRETO_MOTIVO = "antecedentes en Colombia";
	private static final String SECRETO_ARCO = "cambiar mi dirección a Calle 50, edificio Torre Azul";
	private static final String SECRETO_FINALIDAD = "tratamiento por diagnóstico de VIH";

	@Test
	void todosLosEventosGeneranAvisosConPlantillaFijaYSinDatosDelCaso() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		Usuario analista = funcionarioCompleto();
		String despacho = token(analista);
		String id = expediente(cliente, TRAMITE_SIMPLE);

		// Expediente: observación del despacho, observaciones por atender y resolución.
		enviar(despacho, "/api/expedientes/{id}/observaciones", "{\"texto\":\"%s\"}".formatted(SECRETO_OBSERVACION), id)
			.andExpect(status().isCreated());
		cambiarEstado(despacho, despacho, id, "CON_OBSERVACIONES", SECRETO_MOTIVO).andExpect(status().isOk());
		adjuntar(cliente, id, "PASAPORTE", "p.pdf", "application/pdf", PDF).andExpect(status().isCreated());
		adjuntar(cliente, id, "COMPROBANTE_PAGO", "c.pdf", "application/pdf", PDF).andExpect(status().isCreated());
		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", SECRETO_MOTIVO).andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "ADMITIDO", SECRETO_MOTIVO).andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "EN_RESOLUCION", SECRETO_MOTIVO).andExpect(status().isOk());
		resolver(despacho, id, "NEGADA", SECRETO_MOTIVO).andExpect(status().isOk());
		// Privacidad: consentimiento revocado y solicitud ARCO atendida.
		String consentimiento = leer(enviar(cliente, "/api/consentimientos",
				"""
				{"titularId":"%s","finalidad":"%s","alcance":"Historia clínica","baseLegal":"Ley 81 de 2019","expreso":true}"""
					.formatted(titular.getId(), SECRETO_FINALIDAD)).andExpect(status().isCreated()).andReturn(), "$.id");
		modificar(cliente, "/api/consentimientos/{id}", "", consentimiento).andExpect(status().isOk());
		String arco = leer(enviar(cliente, "/api/solicitudes-arco",
				"{\"tipo\":\"RECTIFICACION\",\"descripcion\":\"%s\"}".formatted(SECRETO_ARCO)).andExpect(status().isCreated())
			.andReturn(), "$.id");
		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"EN_ATENCION\"}", arco).andExpect(status().isOk());

		List<Map<String, Object>> delCliente = leer(obtener(cliente, "/api/notificaciones?tamano=100").andReturn(), "$.contenido");
		List<Map<String, Object>> delDespacho = leer(obtener(despacho, "/api/notificaciones?tamano=100").andReturn(),
				"$.contenido");

		assertThat(delCliente).extracting(n -> n.get("tipo"))
			.containsExactlyInAnyOrder("SOLICITUD_ARCO", "DECISION_FINAL", "PENDIENTE_DOCUMENTOS", "OBSERVACION");
		assertThat(delDespacho).extracting(n -> n.get("tipo")).contains("CONSENTIMIENTO_REVOCADO", "SOLICITUD_ARCO");
		for (Map<String, Object> aviso : concatenar(delCliente, delDespacho)) {
			String mensaje = (String) aviso.get("mensaje");
			assertThat(PLANTILLAS).as("plantilla de: " + mensaje).anyMatch(p -> p.matcher(mensaje).matches());
			assertThat(mensaje).doesNotContain(SECRETO_OBSERVACION, SECRETO_MOTIVO, SECRETO_ARCO, SECRETO_FINALIDAD,
					titular.getCorreo(), "NEGADA", "APROBADA");
		}
		// Los avisos del despacho no apuntan al expediente ni al cliente.
		assertThat(delDespacho).allSatisfy(n -> assertThat(n.get("expedienteId")).isNull());
	}

	@Test
	void losCambiosIntermediosNoAvisanYNadieRecibeAvisosAjenos() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String otroCliente = tokenDe(Rol.SOLICITANTE);
		String despacho = token(funcionarioCompleto());
		String id = expediente(cliente, TRAMITE_SIMPLE);

		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", "Inicio").andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "ADMITIDO", "Conforme").andExpect(status().isOk());
		obtener(cliente, "/api/notificaciones").andExpect(jsonPath("$.contenido", hasSize(0)));

		enviar(despacho, "/api/expedientes/{id}/observaciones", "{\"texto\":\"Uno\"}", id).andExpect(status().isCreated());
		obtener(cliente, "/api/notificaciones").andExpect(jsonPath("$.contenido", hasSize(1)));
		obtener(otroCliente, "/api/notificaciones").andExpect(jsonPath("$.contenido", hasSize(0)));
		// La observación que escribe el propio cliente no le genera aviso a él.
		enviar(cliente, "/api/expedientes/{id}/observaciones", "{\"texto\":\"Respuesta\"}", id).andExpect(status().isCreated());
		obtener(cliente, "/api/notificaciones").andExpect(jsonPath("$.contenido", hasSize(1)));
	}

	@Test
	void soloLosFuncionariosActivosRecibenLosAvisosDelDespacho() throws Exception {
		Usuario activo = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR);
		Usuario deshabilitado = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR);
		jdbc.update("UPDATE usuario SET estado_cuenta = 'DESHABILITADA' WHERE id = ?", deshabilitado.getId());
		Usuario supervisor = usuario(Rol.SUPERVISOR);

		String arco = leer(enviar(tokenDe(Rol.SOLICITANTE), "/api/solicitudes-arco",
				"{\"tipo\":\"ACCESO\",\"descripcion\":\"Quiero mis datos\"}").andExpect(status().isCreated()).andReturn(), "$.id");
		String corto = arco.substring(0, 8);

		assertThat(avisosCon(activo, corto)).isEqualTo(1);
		assertThat(avisosCon(deshabilitado, corto)).isZero();
		assertThat(avisosCon(supervisor, corto)).isZero();
	}

	private long avisosCon(Usuario destinatario, String texto) {
		return jdbc.queryForObject("SELECT count(*) FROM notificacion WHERE destinatario_id = ? AND mensaje LIKE ?", Long.class,
				destinatario.getId(), "%" + texto + "%");
	}

	private static <T> List<T> concatenar(List<T> a, List<T> b) {
		return java.util.stream.Stream.concat(a.stream(), b.stream()).toList();
	}

}
