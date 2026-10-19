package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/** HU-18b y HU-18c: consentimiento informado y derechos ARCO (Ley 81 de 2019). CP-03, CP-09, CP-11. */
class PrivacidadTest extends PruebaApi {

	private static String consentimiento(Usuario titular, boolean expreso) {
		return """
				{"titularId":"%s","finalidad":"Trámite de prórroga de estadía","alcance":"Identidad, pasaporte y comprobantes",
				 "baseLegal":"Ley 81 de 2019, art. 6","expreso":%s}""".formatted(titular.getId(), expreso);
	}

	@Test
	void elConsentimientoSeRegistraSeConsultaYSeRevocaConservandoLaEvidencia() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		Usuario recepcion = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR);

		MvcResult registrado = enviar(cliente, "/api/consentimientos", consentimiento(titular, false))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.titularId").value(titular.getId().toString()))
			.andExpect(jsonPath("$.responsable").value("Bufete de demostración"))
			.andExpect(jsonPath("$.finalidad").value("Trámite de prórroga de estadía"))
			.andExpect(jsonPath("$.baseLegal").isNotEmpty())
			.andExpect(jsonPath("$.fecha").isNotEmpty())
			.andExpect(jsonPath("$.estado").value("VIGENTE"))
			.andExpect(jsonPath("$.expreso").value(false))
			.andReturn();
		String id = leer(registrado, "$.id");

		obtener(cliente, "/api/consentimientos").andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)));
		obtener(token(recepcion), "/api/consentimientos?titularId=" + titular.getId()).andExpect(jsonPath("$", hasSize(1)));

		modificar(cliente, "/api/consentimientos/{id}", "", id).andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("REVOCADO"))
			.andExpect(jsonPath("$.fechaRevocacion").isNotEmpty())
			// La evidencia histórica se conserva.
			.andExpect(jsonPath("$.finalidad").value("Trámite de prórroga de estadía"));
		modificar(cliente, "/api/consentimientos/{id}", "", id).andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("CONSENTIMIENTO_YA_REVOCADO"));
		obtener(cliente, "/api/consentimientos?estado=VIGENTE").andExpect(jsonPath("$", hasSize(0)));
		obtener(cliente, "/api/consentimientos?estado=REVOCADO").andExpect(jsonPath("$", hasSize(1)));

		// La revocación avisa al despacho, sin datos del cliente.
		MvcResult avisos = obtener(token(recepcion), "/api/notificaciones").andExpect(status().isOk()).andReturn();
		assertThat(cuerpo(avisos)).contains("CONSENTIMIENTO_REVOCADO").doesNotContain(titular.getCorreo()).doesNotContain("prórroga");
		// Alta, consulta y revocación quedan en auditoría con finalidad y alcance.
		assertThat(eventos("REGISTRAR_CONSENTIMIENTO", "consentimiento/" + id)).isEqualTo(1);
		assertThat(eventos("REVOCAR_CONSENTIMIENTO", "consentimiento/" + id)).isEqualTo(1);
		assertThat(eventos("CONSULTAR_CONSENTIMIENTOS", "titular/" + titular.getId())).isEqualTo(4);
		assertThat(jdbc.queryForObject(
				"SELECT detalle FROM evento_auditoria WHERE operacion = 'REGISTRAR_CONSENTIMIENTO' AND recurso = ?", String.class,
				"consentimiento/" + id))
			.contains("finalidad=Trámite de prórroga de estadía")
			.contains("alcance=Identidad, pasaporte y comprobantes");
	}

	@Test
	void unClienteNoRegistraNiConsultaNiRevocaConsentimientosAjenos() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String ajeno = tokenDe(Rol.SOLICITANTE);
		String id = leer(enviar(token(titular), "/api/consentimientos", consentimiento(titular, true)).andReturn(), "$.id");

		enviar(ajeno, "/api/consentimientos", consentimiento(titular, true)).andExpect(status().isForbidden());
		obtener(ajeno, "/api/consentimientos?titularId=" + titular.getId()).andExpect(status().isForbidden());
		obtener(ajeno, "/api/consentimientos").andExpect(jsonPath("$", hasSize(0)));
		modificar(ajeno, "/api/consentimientos/{id}", "", id).andExpect(status().isNotFound());
	}

	@Test
	void elConsentimientoValidaSusCamposYQueElTitularSeaUnCliente() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		Usuario recepcion = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR);

		enviar(token(titular), "/api/consentimientos", "{\"titularId\":\"%s\",\"finalidad\":\" \",\"expreso\":true}".formatted(titular.getId()))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores", hasSize(3)));
		enviar(token(titular), "/api/consentimientos", consentimiento(titular, true).replace("}", ",\"vigenciaHasta\":\"2020-01-01\"}"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("vigenciaHasta"));
		// El despacho puede registrarlo en nombre del cliente, pero no para un usuario interno.
		enviar(token(recepcion), "/api/consentimientos", consentimiento(titular, false)).andExpect(status().isCreated());
		enviar(token(recepcion), "/api/consentimientos", consentimiento(recepcion, false)).andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("titularId"));
	}

	@Test
	void laSolicitudArcoSigueSuCicloYElClienteSoloVeLasSuyas() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		Usuario analista = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR);
		String despacho = token(analista);

		MvcResult creada = enviar(cliente, "/api/solicitudes-arco",
				"{\"tipo\":\"RECTIFICACION\",\"descripcion\":\"Mi segundo apellido está mal escrito: Peres en vez de Pérez.\"}")
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.tipo").value("RECTIFICACION"))
			.andExpect(jsonPath("$.estado").value("RECIBIDA"))
			.andExpect(jsonPath("$.titularId").value(titular.getId().toString()))
			.andExpect(jsonPath("$.plazoAtencion").isNotEmpty())
			.andExpect(jsonPath("$.fueraDePlazo").value(false))
			.andReturn();
		String id = leer(creada, "$.id");

		// Titularidad: otro cliente no la ve ni en el listado ni por identificador.
		String ajeno = tokenDe(Rol.SOLICITANTE);
		obtener(ajeno, "/api/solicitudes-arco").andExpect(jsonPath("$", hasSize(0)));
		obtener(ajeno, "/api/solicitudes-arco/{id}", id).andExpect(status().isNotFound());
		obtener(cliente, "/api/solicitudes-arco/{id}", id).andExpect(status().isOk());
		// El cliente no atiende su propia solicitud.
		modificar(cliente, "/api/solicitudes-arco/{id}", "{\"estado\":\"ATENDIDA\"}", id).andExpect(status().isForbidden());

		// El despacho la recibe en su bandeja y la atiende en orden.
		obtener(despacho, "/api/solicitudes-arco?estado=RECIBIDA").andExpect(status().isOk())
			.andExpect(jsonPath("$[?(@.id == '%s')]".formatted(id)).isNotEmpty());
		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"ATENDIDA\"}", id).andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("TRANSICION_NO_PERMITIDA"));
		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"EN_ATENCION\"}", id).andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("EN_ATENCION"))
			.andExpect(jsonPath("$.responsableId").value(analista.getId().toString()));
		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"RECHAZADA\"}", id).andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("motivoRechazo"));
		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"EN_ATENCION\",\"responsableId\":\"%s\"}".formatted(titular.getId()), id)
			.andExpect(status().isConflict());
		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"ATENDIDA\"}", id).andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("ATENDIDA"));
		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"RECHAZADA\",\"motivoRechazo\":\"Tarde\"}", id)
			.andExpect(status().isConflict());

		// Avisos sin datos personales: solo identificador corto, tipo y estado.
		String avisosCliente = cuerpo(obtener(cliente, "/api/notificaciones").andReturn());
		assertThat(avisosCliente).contains("SOLICITUD_ARCO", "RECTIFICACION", "ATENDIDA", id.substring(0, 8))
			.doesNotContain("Pérez")
			.doesNotContain("apellido");
		assertThat(cuerpo(obtener(despacho, "/api/notificaciones").andReturn())).contains("Nueva solicitud ARCO")
			.doesNotContain("apellido");
		assertThat(eventos("REGISTRAR_SOLICITUD_ARCO", "solicitud-arco/" + id)).isEqualTo(1);
		assertThat(eventos("ATENDER_SOLICITUD_ARCO", "solicitud-arco/" + id)).isEqualTo(2);
	}

	@Test
	void elRechazoExigeMotivoYElVencimientoSoloEsUnaAlerta() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR);
		String id = leer(enviar(cliente, "/api/solicitudes-arco", "{\"tipo\":\"CANCELACION\",\"descripcion\":\"Solicito eliminar mis datos.\"}")
			.andReturn(), "$.id");

		// Vence el plazo: se marca la alerta, pero el estado de atención no cambia.
		jdbc.update("UPDATE solicitud_arco SET plazo_atencion = current_date - 1 WHERE id = ?::uuid", id);
		obtener(cliente, "/api/solicitudes-arco/{id}", id).andExpect(jsonPath("$.fueraDePlazo").value(true))
			.andExpect(jsonPath("$.estado").value("RECIBIDA"));
		obtener(despacho, "/api/solicitudes-arco?fueraDePlazo=true")
			.andExpect(jsonPath("$[?(@.id == '%s')]".formatted(id)).isNotEmpty());
		obtener(despacho, "/api/solicitudes-arco?fueraDePlazo=false")
			.andExpect(jsonPath("$[?(@.id == '%s')]".formatted(id)).isEmpty());

		modificar(despacho, "/api/solicitudes-arco/{id}", "{\"estado\":\"EN_ATENCION\"}", id).andExpect(status().isOk());
		modificar(despacho, "/api/solicitudes-arco/{id}",
				"{\"estado\":\"RECHAZADA\",\"motivoRechazo\":\"Existe una obligación legal de conservación.\"}", id)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.motivoRechazo").value("Existe una obligación legal de conservación."))
			// Cerrada la atención, deja de estar fuera de plazo.
			.andExpect(jsonPath("$.fueraDePlazo").value(false));

		enviar(cliente, "/api/solicitudes-arco", "{\"tipo\":\"BORRAR\",\"descripcion\":\"x\"}").andExpect(status().isBadRequest());
		enviar(cliente, "/api/solicitudes-arco", "{\"tipo\":\"ACCESO\",\"descripcion\":\"\"}").andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("descripcion"));
	}

}
