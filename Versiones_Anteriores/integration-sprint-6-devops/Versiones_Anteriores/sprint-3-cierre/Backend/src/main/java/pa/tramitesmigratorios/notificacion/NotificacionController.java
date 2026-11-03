package pa.tramitesmigratorios.notificacion;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.comun.Pagina;
import pa.tramitesmigratorios.notificacion.Notificacion.Tipo;
import pa.tramitesmigratorios.seguridad.UsuarioActual;

/** Notificaciones del usuario autenticado: cada quien ve y marca solo las suyas. */
@RestController
@RequestMapping("/api/notificaciones")
class NotificacionController {

	record NotificacionDto(UUID id, UUID destinatarioId, UUID expedienteId, Tipo tipo, String mensaje, Instant fecha,
			boolean leida) {

		static NotificacionDto de(Notificacion n) {
			return new NotificacionDto(n.getId(), n.getDestinatarioId(), n.getExpedienteId(), n.getTipo(),
					n.getMensaje(), n.getFecha(), n.isLeida());
		}

	}

	private final NotificacionRepo notificaciones;

	NotificacionController(NotificacionRepo notificaciones) {
		this.notificaciones = notificaciones;
	}

	@GetMapping
	Pagina<NotificacionDto> listar(@AuthenticationPrincipal UsuarioActual usuario,
			@RequestParam(required = false) Boolean leida, @RequestParam(required = false) Integer pagina,
			@RequestParam(required = false) Integer tamano) {
		Pageable solicitud = Pagina.solicitud(pagina, tamano, Sort.by(Sort.Direction.DESC, "fecha"));
		Page<Notificacion> resultado = leida == null ? notificaciones.findByDestinatarioId(usuario.id(), solicitud)
				: notificaciones.findByDestinatarioIdAndLeida(usuario.id(), leida, solicitud);
		return Pagina.de(resultado, NotificacionDto::de);
	}

	/** Idempotente: marcar dos veces deja el mismo estado y no genera eventos (HU-18 CA-5). */
	@PutMapping("/{notificacionId}/leida")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void marcarLeida(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID notificacionId) {
		Notificacion notificacion = notificaciones.findByIdAndDestinatarioId(notificacionId, usuario.id())
			.orElseThrow(ErrorApi::noEncontrado);
		notificacion.marcarLeida();
		notificaciones.save(notificacion);
	}

}

interface NotificacionRepo extends JpaRepository<Notificacion, UUID> {

	Page<Notificacion> findByDestinatarioId(UUID destinatarioId, Pageable pagina);

	Page<Notificacion> findByDestinatarioIdAndLeida(UUID destinatarioId, boolean leida, Pageable pagina);

	Optional<Notificacion> findByIdAndDestinatarioId(UUID id, UUID destinatarioId);

}
