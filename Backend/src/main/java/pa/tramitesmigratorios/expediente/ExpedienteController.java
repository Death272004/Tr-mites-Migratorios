package pa.tramitesmigratorios.expediente;

import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.data.domain.Sort;
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

import pa.tramitesmigratorios.comun.Pagina;
import pa.tramitesmigratorios.expediente.ExpedienteServicio.Filtro;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.UsuarioActual;

@RestController
@RequestMapping("/api/expedientes")
class ExpedienteController {

	/** Proyección mínima: identificadores, tipo, estado y fechas; ningún dato personal. */
	record ExpedienteDto(UUID id, String numero, UUID solicitanteId, String tipoTramite, EstadoExpediente estado,
			Instant fechaCreacion, Instant fechaActualizacion, long version) {

		static ExpedienteDto de(Expediente e) {
			return new ExpedienteDto(e.getId(), e.getNumero(), e.getSolicitanteId(), e.getTipoTramite(), e.getEstado(),
					e.getFechaCreacion(), e.getFechaActualizacion(), e.getVersion());
		}

	}

	record ExpedienteNuevo(@NotBlank(message = "El tipo de trámite es obligatorio.") String tipoTramite,
			UUID titularId) {
	}

	record CambioEstadoSolicitud(@NotNull(message = "El estado nuevo es obligatorio.") EstadoExpediente estadoNuevo,
			@NotBlank(message = "El motivo es obligatorio.") @Size(max = 500,
					message = "Máximo 500 caracteres.") String motivo,
			@NotNull(message = "La versión es obligatoria.") Long version) {
	}

	record HistorialDto(EstadoExpediente estadoAnterior, EstadoExpediente estadoNuevo, UUID usuarioId, Instant fecha,
			String motivo) {
	}

	record ObservacionNueva(@NotBlank(message = "El texto es obligatorio.") @Size(max = 2000,
			message = "Máximo 2000 caracteres.") String texto) {
	}

	record ObservacionDto(UUID id, UUID expedienteId, UUID autorId, Instant fecha, String texto) {

		static ObservacionDto de(Observacion o) {
			return new ObservacionDto(o.getId(), o.getExpedienteId(), o.getAutorId(), o.getFecha(), o.getTexto());
		}

	}

	/** Cambios cuyo motivo va dirigido al cliente; el resto son notas internas del despacho. */
	private static final Set<EstadoExpediente> MOTIVO_VISIBLE_AL_CLIENTE = EnumSet.of(
			EstadoExpediente.PRESENTADO, EstadoExpediente.PENDIENTE_DOCUMENTOS, EstadoExpediente.OBSERVADO,
			EstadoExpediente.APROBADO, EstadoExpediente.DENEGADO, EstadoExpediente.CANCELADO);

	private final ExpedienteServicio servicio;
	private final Transiciones transiciones;

	ExpedienteController(ExpedienteServicio servicio, Transiciones transiciones) {
		this.servicio = servicio;
		this.transiciones = transiciones;
	}

	@GetMapping
	Pagina<ExpedienteDto> listar(@AuthenticationPrincipal UsuarioActual usuario,
			@RequestParam(required = false) EstadoExpediente estado, @RequestParam(required = false) String tipoTramite,
			@RequestParam(required = false) LocalDate fechaDesde, @RequestParam(required = false) LocalDate fechaHasta,
			@RequestParam(required = false) Integer pagina, @RequestParam(required = false) Integer tamano) {
		return Pagina.de(
				servicio.listar(new Filtro(estado, tipoTramite, fechaDesde, fechaHasta),
						Pagina.solicitud(pagina, tamano, Sort.by(Sort.Direction.DESC, "fechaCreacion")), usuario),
				ExpedienteDto::de);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	ExpedienteDto crear(@AuthenticationPrincipal UsuarioActual usuario, @Valid @RequestBody ExpedienteNuevo nuevo) {
		return ExpedienteDto.de(servicio.crear(nuevo.tipoTramite(), nuevo.titularId(), usuario));
	}

	@GetMapping("/{id}")
	ExpedienteDto obtener(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id) {
		return ExpedienteDto.de(servicio.obtener(id, usuario));
	}

	@PatchMapping("/{id}/estado")
	ExpedienteDto cambiarEstado(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id,
			@Valid @RequestBody CambioEstadoSolicitud cambio) {
		return ExpedienteDto
			.de(transiciones.cambiar(id, cambio.estadoNuevo(), cambio.motivo(), cambio.version(), usuario));
	}

	/**
	 * Historial en orden. Proyección por rol (HU-21 CA-4): el cliente ve todos los cambios, pero
	 * el motivo solo cuando va dirigido a él; las notas internas del despacho no se le muestran.
	 */
	@GetMapping("/{id}/historial")
	List<HistorialDto> historial(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id) {
		boolean esCliente = usuario.es(Rol.SOLICITANTE);
		return servicio.historial(id, usuario)
			.stream()
			.map(h -> new HistorialDto(h.getEstadoAnterior(), h.getEstadoNuevo(), h.getUsuarioId(), h.getFecha(),
					!esCliente || MOTIVO_VISIBLE_AL_CLIENTE.contains(h.getEstadoNuevo()) ? h.getMotivo() : null))
			.toList();
	}

	@GetMapping("/{id}/observaciones")
	List<ObservacionDto> observaciones(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id) {
		return servicio.observaciones(id, usuario).stream().map(ObservacionDto::de).toList();
	}

	@PostMapping("/{id}/observaciones")
	@ResponseStatus(HttpStatus.CREATED)
	ObservacionDto observar(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id,
			@Valid @RequestBody ObservacionNueva nueva) {
		return ObservacionDto.de(servicio.observar(id, nueva.texto(), usuario));
	}

}
