package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;
import pa.tramitesmigratorios.verificacion.Verificacion;
import pa.tramitesmigratorios.verificacion.VerificacionRepo;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.EstadoTecnico;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Politica;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Respuesta;

/** HU-19, HU-20 y HU-21: máquina de estados, observaciones e historial. CP-04, CP-09. */
class EstadosTest extends PruebaApi {

	@Autowired
	VerificacionRepo verificaciones;

	private String estado(String token, String id) throws Exception {
		return leer(obtener(token, "/api/expedientes/{id}", id).andReturn(), "$.estado");
	}

	private void completarDocumentos(String cliente, String id) throws Exception {
		adjuntar(cliente, id, "PASAPORTE", "pasaporte.pdf", "application/pdf", PDF).andExpect(status().isCreated());
		adjuntar(cliente, id, "COMPROBANTE_PAGO", "pago.pdf", "application/pdf", PDF).andExpect(status().isCreated());
	}

	@Test
	void elRecorridoCompletoHastaLaDecisionDejaHistorialYAvisos() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		Usuario resolutor = funcionarioCompleto();
		String despacho = token(resolutor);
		String id = expediente(cliente, TRAMITE_SIMPLE);

		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", "Nota interna de reparto").andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("EN_ANALISIS"))
			.andExpect(jsonPath("$.resultado").doesNotExist())
			.andExpect(jsonPath("$.version").value(1));
		cambiarEstado(despacho, despacho, id, "CON_OBSERVACIONES", "Falta el comprobante de pago").andExpect(status().isOk());
		completarDocumentos(cliente, id);
		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", "Documentos recibidos").andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "ADMITIDO", "Solicitud conforme").andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "EN_RESOLUCION", "Requisitos completos").andExpect(status().isOk());
		resolver(despacho, id, "APROBADA", "Cumple los requisitos del trámite").andExpect(status().isOk())
			.andExpect(jsonPath("$.estado").value("RESUELTO"))
			.andExpect(jsonPath("$.resultado").value("APROBADA"));

		// Historial en orden, con autor, estados y motivo.
		obtener(despacho, "/api/expedientes/{id}/historial", id).andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(7)))
			.andExpect(jsonPath("$[1].estadoAnterior").value("RECIBIDO"))
			.andExpect(jsonPath("$[1].estadoNuevo").value("EN_ANALISIS"))
			.andExpect(jsonPath("$[1].usuarioId").value(resolutor.getId().toString()))
			.andExpect(jsonPath("$[1].motivo").value("Nota interna de reparto"))
			.andExpect(jsonPath("$[6].estadoNuevo").value("RESUELTO"));
		// El cliente ve los mismos cambios, pero no las notas internas del despacho.
		obtener(cliente, "/api/expedientes/{id}/historial", id).andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(7)))
			.andExpect(jsonPath("$[1].motivo").doesNotExist())
			.andExpect(jsonPath("$[2].motivo").value("Falta el comprobante de pago"))
			.andExpect(jsonPath("$[6].motivo").value("Cumple los requisitos del trámite"));

		// Avisos al titular: observaciones por atender y resolución, sin datos del caso.
		obtener(cliente, "/api/notificaciones").andExpect(status().isOk())
			.andExpect(jsonPath("$.contenido", hasSize(2)))
			.andExpect(jsonPath("$.contenido[0].tipo").value("DECISION_FINAL"))
			.andExpect(jsonPath("$.contenido[0].expedienteId").value(id))
			.andExpect(jsonPath("$.contenido[0].leida").value(false))
			.andExpect(jsonPath("$.contenido[1].tipo").value("PENDIENTE_DOCUMENTOS"));
		assertThat(cuerpo(obtener(cliente, "/api/notificaciones").andReturn()))
			.doesNotContain("Cumple los requisitos")
			.doesNotContain("APROBADA")
			.doesNotContain(titular.getCorreo());
		assertThat(eventos("CAMBIAR_ESTADO", "expediente/" + id)).isEqualTo(6);
	}

	@Test
	void unaTransicionNoPermitidaRespondeConflictoYConservaElEstado() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = token(funcionarioCompleto());
		String id = expediente(cliente, TRAMITE_SIMPLE);

		resolver(despacho, id, "APROBADA", "Intento de saltarse el proceso").andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("TRANSICION_NO_PERMITIDA"));
		cambiarEstado(despacho, despacho, id, "RECIBIDO", "Mismo estado").andExpect(status().isConflict());

		assertThat(estado(cliente, id)).isEqualTo("RECIBIDO");
		obtener(cliente, "/api/expedientes/{id}/historial", id).andExpect(jsonPath("$", hasSize(1)));
	}

	@Test
	void elMotivoLaVersionElEstadoYElResultadoSonObligatorios() throws Exception {
		String despacho = token(funcionarioCompleto());
		String id = expediente(tokenDe(Rol.SOLICITANTE), TRAMITE_SIMPLE);

		modificar(despacho, "/api/expedientes/{id}/estado", "{\"estadoNuevo\":\"EN_ANALISIS\",\"motivo\":\"  \",\"version\":0}", id)
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("motivo"));
		modificar(despacho, "/api/expedientes/{id}/estado", "{\"estadoNuevo\":\"EN_ANALISIS\",\"motivo\":\"Inicio\"}", id)
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("version"));
		modificar(despacho, "/api/expedientes/{id}/estado", "{\"estadoNuevo\":\"VOLANDO\",\"motivo\":\"Inicio\",\"version\":0}", id)
			.andExpect(status().isBadRequest());
		// RESUELTO siempre lleva su resultado: APROBADA o NEGADA.
		cambiarEstado(despacho, despacho, id, "RESUELTO", "Sin resultado").andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("resultado"));
	}

	@Test
	void cadaEtapaExigeAlFuncionarioElPermisoQueLeCorresponde() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String cambio = "{\"estadoNuevo\":\"EN_ANALISIS\",\"motivo\":\"Inicio\",\"version\":0}";

		modificar(cliente, "/api/expedientes/{id}/estado", cambio, id).andExpect(status().isForbidden());
		modificar(tokenDe(Rol.SUPERVISOR), "/api/expedientes/{id}/estado", cambio, id).andExpect(status().isForbidden());
		// El análisis es de quien observa: el resolutor no lo inicia y el analista no resuelve ni archiva.
		String resolutor = tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.RESOLVER, Permiso.NOTIFICAR);
		String analista = tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.OBSERVAR);
		modificar(resolutor, "/api/expedientes/{id}/estado", cambio, id).andExpect(status().isForbidden());
		assertThat(estado(cliente, id)).isEqualTo("RECIBIDO");
		modificar(analista, "/api/expedientes/{id}/estado", cambio, id).andExpect(status().isOk());
		cambiarEstado(analista, analista, id, "EN_RESOLUCION", "Sin permiso").andExpect(status().isForbidden());
		cambiarEstado(analista, analista, id, "ARCHIVADO", "Sin permiso").andExpect(status().isForbidden());

		assertThat(estado(cliente, id)).isEqualTo("EN_ANALISIS");
	}

	@Test
	void noSeLlegaALaDecisionSinRequisitosCompletosNiVerificacionesResueltas() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = token(funcionarioCompleto());
		String id = expediente(cliente, TRAMITE_SIMPLE);
		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", "Inicio").andExpect(status().isOk());
		cambiarEstado(despacho, despacho, id, "ADMITIDO", "Conforme").andExpect(status().isOk());

		// Faltan los documentos obligatorios.
		cambiarEstado(despacho, despacho, id, "EN_RESOLUCION", "Listo").andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("REQUISITOS_INCOMPLETOS"))
			.andExpect(jsonPath("$.mensaje", containsString("COMPROBANTE_PAGO, PASAPORTE")));

		// Con documentos completos, una verificación sin respuesta también bloquea.
		completarDocumentos(cliente, id);
		Verificacion pendiente = verificaciones.save(Verificacion.simulada(UUID.fromString(id),
				Verificacion.Fuente.TE, "IDENTIDAD", "Verificar identidad del titular"));
		cambiarEstado(despacho, despacho, id, "EN_RESOLUCION", "Listo").andExpect(status().isConflict())
			.andExpect(jsonPath("$.mensaje", containsString("1 verificación(es) sin respuesta")));
		// Un error técnico no cuenta como resultado.
		pendiente.aplicar(new Respuesta(Verificacion.Fuente.TE, EstadoTecnico.ERROR_TECNICO, null, null, Instant.now(), null),
				new Politica(1000, 0, 0), Instant.now());
		pendiente = verificaciones.save(pendiente);
		assertThat(pendiente.getEstado()).isEqualTo(Verificacion.Estado.ERROR_TECNICO);
		cambiarEstado(despacho, despacho, id, "EN_RESOLUCION", "Listo").andExpect(status().isConflict());
		assertThat(estado(cliente, id)).isEqualTo("ADMITIDO");

		pendiente.registrarManual(new Respuesta(Verificacion.Fuente.TE, EstadoTecnico.RESPONDIDA,
				Verificacion.ResultadoMinimo.COINCIDE, "Consulta pública TE", Instant.now(), UUID.randomUUID()));
		verificaciones.save(pendiente);
		cambiarEstado(despacho, despacho, id, "EN_RESOLUCION", "Listo").andExpect(status().isOk());
		resolver(despacho, id, "NEGADA", "No cumple el requisito de estadía").andExpect(status().isOk())
			.andExpect(jsonPath("$.resultado").value("NEGADA"));
		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", "Reabrir").andExpect(status().isConflict());
	}

	@Test
	void unaVersionDesactualizadaRespondeConflicto() throws Exception {
		String despacho = token(funcionarioCompleto());
		String id = expediente(tokenDe(Rol.SOLICITANTE), TRAMITE_SIMPLE);
		cambiarEstado(despacho, despacho, id, "EN_ANALISIS", "Inicio").andExpect(status().isOk());

		// Otra persona tenía cargada la versión 0.
		modificar(despacho, "/api/expedientes/{id}/estado", "{\"estadoNuevo\":\"ARCHIVADO\",\"motivo\":\"Desiste\",\"version\":0}", id)
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("VERSION_DESACTUALIZADA"));

		assertThat(estado(despacho, id)).isEqualTo("EN_ANALISIS");
	}

	@Test
	void dosCambiosSimultaneosNoSePisan() throws Exception {
		String despacho = token(funcionarioCompleto());
		String id = expediente(tokenDe(Rol.SOLICITANTE), TRAMITE_SIMPLE);
		Callable<Integer> aRevision = () -> modificar(despacho, "/api/expedientes/{id}/estado",
				"{\"estadoNuevo\":\"EN_ANALISIS\",\"motivo\":\"Inicio\",\"version\":0}", id)
			.andReturn()
			.getResponse()
			.getStatus();
		Callable<Integer> aCancelado = () -> modificar(despacho, "/api/expedientes/{id}/estado",
				"{\"estadoNuevo\":\"ARCHIVADO\",\"motivo\":\"Desiste\",\"version\":0}", id)
			.andReturn()
			.getResponse()
			.getStatus();

		ExecutorService hilos = Executors.newFixedThreadPool(2);
		List<Future<Integer>> respuestas;
		try {
			respuestas = hilos.invokeAll(List.of(aRevision, aCancelado));
		}
		finally {
			hilos.shutdown();
		}

		// Exactamente uno gana; el otro recibe 409 y no deja rastro en el historial.
		assertThat(List.of(respuestas.get(0).get(), respuestas.get(1).get())).containsExactlyInAnyOrder(200, 409);
		obtener(despacho, "/api/expedientes/{id}/historial", id).andExpect(jsonPath("$", hasSize(2)));
		assertThat(jdbc.queryForObject("SELECT version FROM expediente WHERE id = ?::uuid", Long.class, id)).isEqualTo(1);
	}

	@Test
	void lasObservacionesNoCambianElEstadoYAvisanAlCliente() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		Usuario analista = usuario(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.OBSERVAR);
		String despacho = token(analista);
		String id = expediente(cliente, TRAMITE_SIMPLE);

		enviar(despacho, "/api/expedientes/{id}/observaciones", "{\"texto\":\"La foto del pasaporte está borrosa.\"}", id)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.autorId").value(analista.getId().toString()))
			.andExpect(jsonPath("$.expedienteId").value(id));
		enviar(cliente, "/api/expedientes/{id}/observaciones", "{\"texto\":\"Subo una foto nueva hoy.\"}", id)
			.andExpect(status().isCreated());
		enviar(despacho, "/api/expedientes/{id}/observaciones", "{\"texto\":\"   \"}", id)
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("texto"));

		obtener(cliente, "/api/expedientes/{id}/observaciones", id).andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(2)))
			.andExpect(jsonPath("$[0].texto").value("La foto del pasaporte está borrosa."))
			.andExpect(jsonPath("$[1].autorId").value(titular.getId().toString()));
		assertThat(estado(cliente, id)).isEqualTo("RECIBIDO");
		assertThat(eventos("REGISTRAR_OBSERVACION", "expediente/" + id)).isEqualTo(2);
		// Solo la observación del despacho avisa al cliente, y el aviso no copia el texto.
		obtener(cliente, "/api/notificaciones").andExpect(jsonPath("$.contenido", hasSize(1)))
			.andExpect(jsonPath("$.contenido[0].tipo").value("OBSERVACION"));
		assertThat(cuerpo(obtener(cliente, "/api/notificaciones").andReturn())).doesNotContain("borrosa");

		// Otro cliente no puede leer ni escribir en este expediente.
		String ajeno = tokenDe(Rol.SOLICITANTE);
		obtener(ajeno, "/api/expedientes/{id}/observaciones", id).andExpect(status().isNotFound());
		enviar(ajeno, "/api/expedientes/{id}/observaciones", "{\"texto\":\"Hola\"}", id).andExpect(status().isNotFound());
	}

}
