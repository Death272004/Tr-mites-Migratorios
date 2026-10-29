package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;

/** HU-17 y HU-18b: carga validada, descarga protegida y datos sensibles con consentimiento expreso. CP-05, CP-12. */
class DocumentoTest extends PruebaApi {

	private static final byte[] PNG = { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3 };

	@Test
	void unArchivoValidoQuedaVinculadoAlExpedienteYFueraDeLaBase() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);

		MvcResult cargado = adjuntar(cliente, id, "PASAPORTE", "C:\\Users\\yo\\..\\pasaporte.pdf", "application/pdf", PDF)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.expedienteId").value(id))
			.andExpect(jsonPath("$.tipoDocumental").value("PASAPORTE"))
			.andExpect(jsonPath("$.nombreArchivo").value("pasaporte.pdf"))
			.andExpect(jsonPath("$.tipoMime").value("application/pdf"))
			.andExpect(jsonPath("$.tamanoBytes").value(PDF.length))
			.andExpect(jsonPath("$.estadoRevision").value("PENDIENTE"))
			.andExpect(jsonPath("$.avisoDuplicado").value(false))
			.andReturn();
		String documentoId = leer(cargado, "$.id");

		// La respuesta no expone la ubicación del archivo, y el archivo está en el almacén con nombre aleatorio.
		assertThat(cuerpo(cargado)).doesNotContain("ruta").doesNotContain("almacen");
		String referencia = jdbc.queryForObject("SELECT ruta_almacen FROM documento WHERE id = ?::uuid", String.class, documentoId);
		assertThat(referencia).doesNotContain("pasaporte");
		assertThat(Files.readAllBytes(Path.of("target/almacenamiento-pruebas", referencia))).isEqualTo(PDF);
		assertThat(eventos("CARGAR_DOCUMENTO", "documento/" + documentoId)).isEqualTo(1);

		adjuntar(cliente, id, "COMPROBANTE_PAGO", "foto.png", "image/png", PNG).andExpect(status().isCreated());
		obtener(cliente, "/api/expedientes/{id}/documentos", id).andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(2)))
			.andExpect(jsonPath("$[0].id").value(documentoId))
			.andExpect(jsonPath("$[0].avisoDuplicado").doesNotExist());
	}

	@Test
	void seRechazanTipoNoPermitidoContenidoFalsoYTamanoExcedido() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		byte[] ejecutable = "MZ contenido de un programa".getBytes(StandardCharsets.UTF_8);

		adjuntar(cliente, id, "PASAPORTE", "programa.exe", "application/x-msdownload", ejecutable)
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("archivo"));
		// Declara PDF pero el contenido no lo es.
		adjuntar(cliente, id, "PASAPORTE", "falso.pdf", "application/pdf", ejecutable).andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].mensaje").value("El contenido del archivo no corresponde a su tipo."));
		adjuntar(cliente, id, "PASAPORTE", "vacio.pdf", "application/pdf", new byte[0]).andExpect(status().isBadRequest());
		byte[] enorme = new byte[10 * 1024 * 1024 + 1];
		System.arraycopy(PDF, 0, enorme, 0, PDF.length);
		adjuntar(cliente, id, "PASAPORTE", "enorme.pdf", "application/pdf", enorme).andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("archivo"));
		// Tipo documental inexistente o que no corresponde al trámite.
		adjuntar(cliente, id, "NO_EXISTE", "a.pdf", "application/pdf", PDF).andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errores[0].campo").value("tipoDocumental"));
		adjuntar(cliente, id, "FICHA_CSS", "a.pdf", "application/pdf", PDF).andExpect(status().isBadRequest());

		obtener(cliente, "/api/expedientes/{id}/documentos", id).andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void subirUnTipoQueYaTieneDocumentoValidoAvisaDelDuplicado() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		adjuntar(cliente, id, "PASAPORTE", "uno.pdf", "application/pdf", PDF)
			.andExpect(jsonPath("$.avisoDuplicado").value(false));

		adjuntar(cliente, id, "PASAPORTE", "dos.pdf", "application/pdf", PDF).andExpect(status().isCreated())
			.andExpect(jsonPath("$.avisoDuplicado").value(true));
	}

	@Test
	void laDescargaExigePermisoYQuedaEnAuditoria() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String documentoId = leer(adjuntar(cliente, id, "PASAPORTE", "pasaporte.pdf", "application/pdf", PDF).andReturn(), "$.id");
		String url = "/api/expedientes/{id}/documentos/{documentoId}/contenido";

		obtener(cliente, url, id, documentoId).andExpect(status().isOk())
			.andExpect(content().bytes(PDF))
			.andExpect(header().string("Content-Type", "application/octet-stream"))
			.andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")))
			.andExpect(header().string("Cache-Control", "no-store"));
		obtener(tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR), url, id, documentoId).andExpect(status().isOk());

		obtener(null, url, id, documentoId).andExpect(status().isUnauthorized());
		// Otro cliente: como si no existiera. El auditor solo ve metadatos.
		obtener(tokenDe(Rol.SOLICITANTE), url, id, documentoId).andExpect(status().isNotFound());
		String auditor = tokenDe(Rol.AUDITOR);
		obtener(auditor, url, id, documentoId).andExpect(status().isForbidden());
		obtener(auditor, "/api/expedientes/{id}/documentos", id).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)));
		// El documento de un expediente no se descarga a través de otro expediente.
		String otroExpediente = expediente(cliente, TRAMITE_SIMPLE);
		obtener(cliente, url, otroExpediente, documentoId).andExpect(status().isNotFound());

		assertThat(eventos("DESCARGAR_DOCUMENTO", "documento/" + documentoId)).isEqualTo(2);
	}

	@Test
	void unExpedienteArchivadoYaNoAdmiteDocumentos() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String despacho = tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR, Permiso.NOTIFICAR);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		cambiarEstado(despacho, despacho, id, "ARCHIVADO", "El cliente desiste").andExpect(status().isOk());

		adjuntar(cliente, id, "PASAPORTE", "tarde.pdf", "application/pdf", PDF).andExpect(status().isConflict())
			.andExpect(jsonPath("$.codigo").value("EXPEDIENTE_CERRADO"));
	}

	@Test
	void losDatosSensiblesExigenConsentimientoExpresoVigente() throws Exception {
		Usuario titular = usuario(Rol.SOLICITANTE);
		String cliente = token(titular);
		String id = expediente(cliente, "RESIDENCIA_TEMPORAL");
		String consentimiento = """
				{"titularId":"%s","finalidad":"Trámite de residencia temporal","alcance":"Datos de identidad y documentos del trámite",
				 "baseLegal":"Ley 81 de 2019, consentimiento del titular","expreso":%s%s}""";

		// Sin consentimiento: los documentos comunes sí, los sensibles no.
		adjuntar(cliente, id, "PASAPORTE", "pasaporte.pdf", "application/pdf", PDF).andExpect(status().isCreated());
		adjuntar(cliente, id, "CERTIFICADO_SALUD", "salud.pdf", "application/pdf", PDF).andExpect(status().isForbidden())
			.andExpect(jsonPath("$.codigo").value("CONSENTIMIENTO_EXPRESO_REQUERIDO"));

		// Un consentimiento que no es expreso no alcanza para datos sensibles.
		enviar(cliente, "/api/consentimientos", consentimiento.formatted(titular.getId(), false, "")).andExpect(status().isCreated());
		adjuntar(cliente, id, "CERTIFICADO_SALUD", "salud.pdf", "application/pdf", PDF).andExpect(status().isForbidden());

		// Con consentimiento expreso vigente se admite.
		MvcResult expreso = enviar(cliente, "/api/consentimientos", consentimiento.formatted(titular.getId(), true,
				",\"vigenciaHasta\":\"" + LocalDate.now().plusYears(1) + "\""))
			.andExpect(status().isCreated())
			.andReturn();
		adjuntar(cliente, id, "CERTIFICADO_SALUD", "salud.pdf", "application/pdf", PDF).andExpect(status().isCreated());

		// Al revocarlo, vuelve a bloquearse; también para el personal del despacho.
		modificar(cliente, "/api/consentimientos/{id}", "", this.<String>leer(expreso, "$.id")).andExpect(status().isOk());
		adjuntar(cliente, id, "ANTECEDENTES_PENALES", "antecedentes.pdf", "application/pdf", PDF).andExpect(status().isForbidden());
		adjuntar(tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR), id, "ANTECEDENTES_PENALES", "antecedentes.pdf", "application/pdf", PDF)
			.andExpect(status().isForbidden());
		obtener(cliente, "/api/expedientes/{id}/documentos", id).andExpect(jsonPath("$", hasSize(2)));
	}

}
