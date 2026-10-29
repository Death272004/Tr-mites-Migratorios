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

import pa.tramitesmigratorios.privacidad.Consentimiento.Estado;
import pa.tramitesmigratorios.seguridad.UsuarioActual;

@RestController
@RequestMapping("/api/consentimientos")
class ConsentimientoController {

	record ConsentimientoNuevo(@NotNull(message = "El titular es obligatorio.") UUID titularId,
			@NotBlank(message = "La finalidad es obligatoria.") @Size(max = 300,
					message = "Máximo 300 caracteres.") String finalidad,
			@NotBlank(message = "El alcance es obligatorio.") @Size(max = 500,
					message = "Máximo 500 caracteres.") String alcance,
			@NotBlank(message = "La base legal es obligatoria.") @Size(max = 300,
					message = "Máximo 300 caracteres.") String baseLegal,
			LocalDate vigenciaHasta, @NotNull(message = "Indique si el consentimiento es expreso.") Boolean expreso) {
	}

	record ConsentimientoDto(UUID id, UUID titularId, String responsable, String finalidad, String alcance,
			String baseLegal, Instant fecha, LocalDate vigenciaHasta, Estado estado, boolean expreso,
			Instant fechaRevocacion) {

		static ConsentimientoDto de(Consentimiento c) {
			return new ConsentimientoDto(c.getId(), c.getTitularId(), c.getResponsable(), c.getFinalidad(),
					c.getAlcance(), c.getBaseLegal(), c.getFecha(), c.getVigenciaHasta(), c.getEstado(), c.isExpreso(),
					c.getFechaRevocacion());
		}

	}

	private final ConsentimientoServicio servicio;

	ConsentimientoController(ConsentimientoServicio servicio) {
		this.servicio = servicio;
	}

	@GetMapping
	List<ConsentimientoDto> listar(@AuthenticationPrincipal UsuarioActual usuario,
			@RequestParam(required = false) UUID titularId, @RequestParam(required = false) Estado estado) {
		return servicio.listar(titularId, estado, usuario).stream().map(ConsentimientoDto::de).toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	ConsentimientoDto registrar(@AuthenticationPrincipal UsuarioActual usuario,
			@Valid @RequestBody ConsentimientoNuevo nuevo) {
		return ConsentimientoDto.de(servicio.registrar(new ConsentimientoServicio.Nuevo(nuevo.titularId(),
				nuevo.finalidad(), nuevo.alcance(), nuevo.baseLegal(), nuevo.vigenciaHasta(), nuevo.expreso()),
				usuario));
	}

	@PatchMapping("/{consentimientoId}")
	ConsentimientoDto revocar(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID consentimientoId) {
		return ConsentimientoDto.de(servicio.revocar(consentimientoId, usuario));
	}

}
