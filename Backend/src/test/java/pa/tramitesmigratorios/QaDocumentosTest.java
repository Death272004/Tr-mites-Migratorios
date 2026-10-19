package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;

/**
 * QA · TASK-17.5 (HU-17): carga de archivos válidos, inválidos y en el límite de tamaño;
 * nombres maliciosos; descargas no autorizadas por rol. Complementa {@link DocumentoTest}. CP-05, CP-12.
 */
class QaDocumentosTest extends PruebaApi {

	private static final byte[] JPG = { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10, 'J', 'F', 'I', 'F' };
	private static final byte[] PNG = { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3 };
	private static final long LIMITE = 10L * 1024 * 1024;

	private static byte[] pdfDe(long bytes) {
		byte[] contenido = new byte[(int) bytes];
		System.arraycopy(PDF, 0, contenido, 0, PDF.length);
		return contenido;
	}

	@Test
	void seAceptanLosTresFormatosPermitidosYJustoElTamanoMaximo() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);

		adjuntar(cliente, id, "PASAPORTE", "pasaporte.jpg", "image/jpeg", JPG).andExpect(status().isCreated());
		adjuntar(cliente, id, "PASAPORTE", "pasaporte.png", "image/png", PNG).andExpect(status().isCreated());
		adjuntar(cliente, id, "COMPROBANTE_PAGO", "limite.pdf", "application/pdf", pdfDe(LIMITE))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.tamanoBytes").value(LIMITE));
		adjuntar(cliente, id, "COMPROBANTE_PAGO", "excede.pdf", "application/pdf", pdfDe(LIMITE + 1))
			.andExpect(status().isBadRequest());

		obtener(cliente, "/api/expedientes/{id}/documentos", id).andExpect(jsonPath("$", hasSize(3)));
	}

	@Test
	void seRechazanContenidosQueNoCorrespondenAlTipoDeclarado() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		byte[] html = "<html><script>alert(1)</script></html>".getBytes();

		adjuntar(cliente, id, "PASAPORTE", "foto.pdf", "application/pdf", PNG).andExpect(status().isBadRequest());
		adjuntar(cliente, id, "PASAPORTE", "doc.png", "image/png", PDF).andExpect(status().isBadRequest());
		adjuntar(cliente, id, "PASAPORTE", "pagina.html", "text/html", html).andExpect(status().isBadRequest());
		adjuntar(cliente, id, "PASAPORTE", "pagina.pdf", "application/pdf", html).andExpect(status().isBadRequest());
		adjuntar(cliente, id, "PASAPORTE", "sin-tipo.pdf", null, PDF).andExpect(status().isBadRequest());
		adjuntar(cliente, id, "PASAPORTE", "imagen.svg", "image/svg+xml", "<svg onload=alert(1)>".getBytes())
			.andExpect(status().isBadRequest());

		obtener(cliente, "/api/expedientes/{id}/documentos", id).andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void losNombresMaliciososSeNeutralizanYNoSalenDelAlmacen() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);

		MvcResult traversal = adjuntar(cliente, id, "PASAPORTE", "../../../../etc/passwd.pdf", "application/pdf", PDF)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.nombreArchivo").value("passwd.pdf"))
			.andReturn();
		String ruta = jdbc.queryForObject("SELECT ruta_almacen FROM documento WHERE id = ?::uuid", String.class,
				(String) leer(traversal, "$.id"));
		assertThat(ruta).doesNotContain("..").doesNotContain("/etc");
		assertThat(Path.of("target/almacenamiento-pruebas").resolve(ruta).normalize())
			.startsWith(Path.of("target/almacenamiento-pruebas").normalize());
		assertThat(Files.exists(Path.of("target/almacenamiento-pruebas", ruta))).isTrue();

		MvcResult cabecera = adjuntar(cliente, id, "COMPROBANTE_PAGO", "pago\r\nX-Inyectado: si\".pdf", "application/pdf", PDF)
			.andExpect(status().isCreated())
			.andReturn();
		String documentoId = leer(cabecera, "$.id");
		MvcResult descarga = obtener(cliente, "/api/expedientes/{id}/documentos/{d}/contenido", id, documentoId)
			.andExpect(status().isOk())
			.andReturn();
		assertThat(descarga.getResponse().getHeader("X-Inyectado")).isNull();
		assertThat(descarga.getResponse().getHeader("Content-Disposition")).doesNotContain("\r").doesNotContain("\n");
		assertThat(descarga.getResponse().getHeader("X-Content-Type-Options")).as("nosniff en la descarga").isEqualTo("nosniff");
	}

	@Test
	void lasDescargasNoAutorizadasSeBloqueanYLasPermitidasFuncionan() throws Exception {
		String cliente = tokenDe(Rol.SOLICITANTE);
		String id = expediente(cliente, TRAMITE_SIMPLE);
		String documentoId = leer(adjuntar(cliente, id, "PASAPORTE", "p.pdf", "application/pdf", PDF).andReturn(), "$.id");
		String url = "/api/expedientes/{id}/documentos/{d}/contenido";

		obtener(tokenDe(Rol.SUPERVISOR), url, id, documentoId).andExpect(status().isOk());
		obtener(tokenDe(Rol.FUNCIONARIO, Permiso.CONSULTAR), url, id, documentoId).andExpect(status().isOk());
		obtener(tokenDe(Rol.ADMIN), url, id, documentoId).andExpect(status().isForbidden());
		obtener(tokenDe(Rol.AUDITOR), url, id, documentoId).andExpect(status().isForbidden());
		obtener(tokenDe(Rol.SOLICITANTE), url, id, documentoId).andExpect(status().isNotFound());
		obtener(null, url, id, documentoId).andExpect(status().isUnauthorized());
		obtener("token-inventado", url, id, documentoId).andExpect(status().isUnauthorized());
		obtener(cliente, url, id, UUID.randomUUID()).andExpect(status().isNotFound());
		obtener(cliente, url, id, "no-es-uuid").andExpect(status().isBadRequest());

		// Ningún intento fallido dejó una descarga registrada como exitosa.
		assertThat(jdbc.queryForObject(
				"SELECT count(*) FROM evento_auditoria WHERE operacion = 'DESCARGAR_DOCUMENTO' AND recurso = ? AND resultado = 'EXITO'",
				Long.class, "documento/" + documentoId))
			.isEqualTo(2);
	}

	@Test
	void unClienteNoSubeDocumentosAUnExpedienteAjeno() throws Exception {
		String id = expediente(tokenDe(Rol.SOLICITANTE), TRAMITE_SIMPLE);

		adjuntar(tokenDe(Rol.SOLICITANTE), id, "PASAPORTE", "intruso.pdf", "application/pdf", PDF)
			.andExpect(status().isNotFound());
		adjuntar(tokenDe(Rol.SOLICITANTE), UUID.randomUUID().toString(), "PASAPORTE", "x.pdf", "application/pdf", PDF)
			.andExpect(status().isNotFound());
		assertThat(jdbc.queryForObject("SELECT count(*) FROM documento WHERE expediente_id = ?::uuid", Long.class, id)).isZero();
	}

}
