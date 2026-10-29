package pa.tramitesmigratorios.privacidad;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import pa.tramitesmigratorios.privacidad.SolicitudArco.Estado;
import pa.tramitesmigratorios.privacidad.SolicitudArco.Tipo;
import pa.tramitesmigratorios.seguridad.UsuarioActual;

@RestController
@RequestMapping("/api/solicitudes-arco")
class SolicitudArcoController {

	record SolicitudArcoNueva(@NotNull(message = "El tipo es obligatorio.") Tipo tipo,
			@NotBlank(message = "La descripción es obligatoria.") @Size(max = 2000,
					message = "Máximo 2000 caracteres.") String descripcion) {
	}

	record AtencionSolicitudArco(@NotNull(message = "El estado es obligatorio.") Estado estado, UUID responsableId,
			@Size(max = 500, message = "Máximo 500 caracteres.") String motivoRechazo) {
	}

	record SolicitudArcoDto(UUID id, UUID titularId, Tipo tipo, String descripcion, Instant fechaCreacion,
			Estado estado, UUID responsableId, LocalDate plazoAtencion, boolean fueraDePlazo, String motivoRechazo) {

		static SolicitudArcoDto de(SolicitudArco s) {
			return new SolicitudArcoDto(s.getId(), s.getTitularId(), s.getTipo(), s.getDescripcion(),
					s.getFechaCreacion(), s.getEstado(), s.getResponsableId(), s.getPlazoAtencion(),
					s.fueraDePlazo(LocalDate.now()), s.getMotivoRechazo());
		}

	}

	private final SolicitudArcoServicio servicio;

	SolicitudArcoController(SolicitudArcoServicio servicio) {
		this.servicio = servicio;
	}

	@GetMapping
	List<SolicitudArcoDto> listar(@AuthenticationPrincipal UsuarioActual usuario,
			@RequestParam(required = false) Estado estado, @RequestParam(required = false) Boolean fueraDePlazo) {
		return servicio.listar(estado, fueraDePlazo, usuario).stream().map(SolicitudArcoDto::de).toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	SolicitudArcoDto registrar(@AuthenticationPrincipal UsuarioActual usuario,
			@Valid @RequestBody SolicitudArcoNueva nueva) {
		return SolicitudArcoDto.de(servicio.registrar(nueva.tipo(), nueva.descripcion(), usuario));
	}

	@GetMapping("/{solicitudId}")
	SolicitudArcoDto obtener(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID solicitudId) {
		return SolicitudArcoDto.de(servicio.obtener(solicitudId, usuario));
	}

	@PatchMapping("/{solicitudId}")
	SolicitudArcoDto atender(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID solicitudId,
			@Valid @RequestBody AtencionSolicitudArco atencion) {
		return SolicitudArcoDto
			.de(servicio.atender(solicitudId, atencion.estado(), atencion.responsableId(), atencion.motivoRechazo(), usuario));
	}

}
