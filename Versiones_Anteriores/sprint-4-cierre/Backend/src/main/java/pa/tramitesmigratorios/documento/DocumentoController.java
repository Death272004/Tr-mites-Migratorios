package pa.tramitesmigratorios.documento;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import pa.tramitesmigratorios.documento.DocumentoServicio.Cargado;
import pa.tramitesmigratorios.documento.DocumentoServicio.Contenido;
import pa.tramitesmigratorios.seguridad.UsuarioActual;

@RestController
@RequestMapping("/api/expedientes/{id}/documentos")
class DocumentoController {

	record DocumentoDto(UUID id, UUID expedienteId, String tipoDocumental, String nombreArchivo, String tipoMime,
			long tamanoBytes, Instant fechaCarga, String estadoRevision, Boolean avisoDuplicado) {

		static DocumentoDto de(Documento d, Boolean avisoDuplicado) {
			return new DocumentoDto(d.getId(), d.getExpedienteId(), d.getTipoDocumental(), d.getNombreArchivo(),
					d.getTipoMime(), d.getTamanoBytes(), d.getFechaCarga(), d.getEstadoRevision().name(),
					avisoDuplicado);
		}

	}

	private final DocumentoServicio servicio;

	DocumentoController(DocumentoServicio servicio) {
		this.servicio = servicio;
	}

	@GetMapping
	List<DocumentoDto> listar(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id) {
		return servicio.listar(id, usuario).stream().map(d -> DocumentoDto.de(d, null)).toList();
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	DocumentoDto adjuntar(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id,
			@RequestParam MultipartFile archivo, @RequestParam String tipoDocumental) {
		Cargado cargado = servicio.adjuntar(id, tipoDocumental, archivo, usuario);
		return DocumentoDto.de(cargado.documento(), cargado.duplicado());
	}

	/** El archivo se entrega como descarga; nunca hay un enlace público al almacén. */
	@GetMapping("/{documentoId}/contenido")
	ResponseEntity<byte[]> descargar(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id,
			@PathVariable UUID documentoId) {
		Contenido contenido = servicio.descargar(id, documentoId, usuario);
		return ResponseEntity.ok()
			.contentType(MediaType.APPLICATION_OCTET_STREAM)
			.header(HttpHeaders.CONTENT_DISPOSITION,
					ContentDisposition.attachment()
						.filename(contenido.documento().getNombreArchivo(), StandardCharsets.UTF_8)
						.build()
						.toString())
			.header(HttpHeaders.CACHE_CONTROL, "no-store")
			.body(contenido.bytes());
	}

}
