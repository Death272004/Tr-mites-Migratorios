package pa.tramitesmigratorios.privacidad;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pa.tramitesmigratorios.auditoria.Auditoria;
import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.comun.Eventos.SolicitudArcoActualizada;
import pa.tramitesmigratorios.comun.Eventos.SolicitudArcoRegistrada;
import pa.tramitesmigratorios.privacidad.SolicitudArco.Estado;
import pa.tramitesmigratorios.privacidad.SolicitudArco.Tipo;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;
import pa.tramitesmigratorios.seguridad.UsuarioActual;
import pa.tramitesmigratorios.seguridad.UsuarioRepo;

/** Derechos ARCO (HU-18c): el cliente registra y consulta las suyas; el despacho las atiende. */
@Service
public class SolicitudArcoServicio {

	private final SolicitudArcoRepo solicitudes;
	private final UsuarioRepo usuarios;
	private final Auditoria auditoria;
	private final ApplicationEventPublisher eventos;
	private final int plazoDias;

	SolicitudArcoServicio(SolicitudArcoRepo solicitudes, UsuarioRepo usuarios, Auditoria auditoria,
			ApplicationEventPublisher eventos, @Value("${app.arco.plazo-dias}") int plazoDias) {
		this.solicitudes = solicitudes;
		this.usuarios = usuarios;
		this.auditoria = auditoria;
		this.eventos = eventos;
		this.plazoDias = plazoDias;
	}

	@Transactional
	public SolicitudArco registrar(Tipo tipo, String descripcion, UsuarioActual usuario) {
		SolicitudArco solicitud = solicitudes
			.save(new SolicitudArco(usuario.id(), tipo, descripcion.trim(), LocalDate.now().plusDays(plazoDias)));
		auditoria.exito(usuario.id(), "REGISTRAR_SOLICITUD_ARCO", "solicitud-arco/" + solicitud.getId(),
				"tipo=" + tipo + "; estado=" + solicitud.getEstado());
		eventos.publishEvent(new SolicitudArcoRegistrada(solicitud.getId(), tipo.name()));
		return solicitud;
	}

	@Transactional(readOnly = true)
	public List<SolicitudArco> listar(Estado estado, Boolean fueraDePlazo, UsuarioActual usuario) {
		List<SolicitudArco> base = usuario.es(Rol.SOLICITANTE)
				? solicitudes.findByTitularIdOrderByFechaCreacionDesc(usuario.id())
				: solicitudes.findAllByOrderByFechaCreacionDesc();
		LocalDate hoy = LocalDate.now();
		return base.stream()
			.filter(s -> estado == null || s.getEstado() == estado)
			.filter(s -> fueraDePlazo == null || s.fueraDePlazo(hoy) == fueraDePlazo)
			.toList();
	}

	/** Una solicitud ajena responde igual que una inexistente (titularidad, CP-03). */
	@Transactional(readOnly = true)
	public SolicitudArco obtener(UUID id, UsuarioActual usuario) {
		return solicitudes.findById(id)
			.filter(s -> !usuario.es(Rol.SOLICITANTE) || s.getTitularId().equals(usuario.id()))
			.orElseThrow(ErrorApi::noEncontrado);
	}

	@Transactional
	public SolicitudArco atender(UUID id, Estado nuevo, UUID responsableId, String motivoRechazo,
			UsuarioActual usuario) {
		SolicitudArco solicitud = solicitudes.findById(id).orElseThrow(ErrorApi::noEncontrado);
		if (!solicitud.getEstado().puedePasarA(nuevo)) {
			throw ErrorApi.conflicto("TRANSICION_NO_PERMITIDA",
					"Una solicitud en estado " + solicitud.getEstado() + " no puede pasar a " + nuevo + ".");
		}
		String motivo = motivoRechazo == null || motivoRechazo.isBlank() ? null : motivoRechazo.trim();
		if (nuevo == Estado.RECHAZADA && motivo == null) {
			throw ErrorApi.entradaInvalida("motivoRechazo", "El motivo es obligatorio al rechazar.");
		}
		UUID responsable = responsableId != null ? responsableId
				: solicitud.getResponsableId() != null ? solicitud.getResponsableId() : usuario.id();
		boolean esDelDespacho = usuarios.findById(responsable).map(Usuario::getRol).filter(Rol.FUNCIONARIO::equals).isPresent();
		if (!esDelDespacho) {
			throw ErrorApi.entradaInvalida("responsableId", "El responsable debe ser personal del despacho.");
		}
		solicitud.atender(nuevo, responsable, nuevo == Estado.RECHAZADA ? motivo : null);
		auditoria.exito(usuario.id(), "ATENDER_SOLICITUD_ARCO", "solicitud-arco/" + id,
				"tipo=" + solicitud.getTipo() + "; estado=" + nuevo);
		eventos.publishEvent(new SolicitudArcoActualizada(id, solicitud.getTitularId(), solicitud.getTipo().name(), nuevo.name()));
		return solicitud;
	}

}

interface SolicitudArcoRepo extends JpaRepository<SolicitudArco, UUID> {

	List<SolicitudArco> findByTitularIdOrderByFechaCreacionDesc(UUID titularId);

	List<SolicitudArco> findAllByOrderByFechaCreacionDesc();

}
