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
import pa.tramitesmigratorios.comun.Eventos.ConsentimientoRevocado;
import pa.tramitesmigratorios.privacidad.Consentimiento.Estado;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;
import pa.tramitesmigratorios.seguridad.UsuarioActual;
import pa.tramitesmigratorios.seguridad.UsuarioRepo;

/**
 * Consentimiento informado (HU-18b). Además del registro y la revocación, aquí vive la regla
 * de limitación del tratamiento (TASK-18b.2): las operaciones que usan los datos más allá de
 * lo contractual piden un consentimiento vigente, y los datos sensibles uno expreso.
 */
@Service
public class ConsentimientoServicio {

	public record Nuevo(UUID titularId, String finalidad, String alcance, String baseLegal, LocalDate vigenciaHasta,
			boolean expreso) {
	}

	private final ConsentimientoRepo consentimientos;
	private final UsuarioRepo usuarios;
	private final Auditoria auditoria;
	private final ApplicationEventPublisher eventos;
	private final String despacho;

	ConsentimientoServicio(ConsentimientoRepo consentimientos, UsuarioRepo usuarios, Auditoria auditoria,
			ApplicationEventPublisher eventos, @Value("${app.despacho.nombre}") String despacho) {
		this.consentimientos = consentimientos;
		this.usuarios = usuarios;
		this.auditoria = auditoria;
		this.eventos = eventos;
		this.despacho = despacho;
	}

	@Transactional
	public Consentimiento registrar(Nuevo nuevo, UsuarioActual usuario) {
		if (usuario.es(Rol.SOLICITANTE) && !usuario.id().equals(nuevo.titularId())) {
			auditoria.denegado(usuario.id(), "REGISTRAR_CONSENTIMIENTO", "titular/" + nuevo.titularId());
			throw ErrorApi.sinPermiso();
		}
		boolean esCliente = usuarios.findById(nuevo.titularId()).map(Usuario::getRol).filter(Rol.SOLICITANTE::equals).isPresent();
		if (!esCliente) {
			throw ErrorApi.entradaInvalida("titularId", "El titular no es un cliente registrado.");
		}
		if (nuevo.vigenciaHasta() != null && nuevo.vigenciaHasta().isBefore(LocalDate.now())) {
			throw ErrorApi.entradaInvalida("vigenciaHasta", "La vigencia no puede estar en el pasado.");
		}
		Consentimiento consentimiento = consentimientos.save(new Consentimiento(nuevo.titularId(), despacho,
				nuevo.finalidad().trim(), nuevo.alcance().trim(), nuevo.baseLegal().trim(), nuevo.vigenciaHasta(),
				nuevo.expreso(), usuario.id()));
		auditoria.exito(usuario.id(), "REGISTRAR_CONSENTIMIENTO", "consentimiento/" + consentimiento.getId(),
				"finalidad=" + consentimiento.getFinalidad() + "; alcance=" + consentimiento.getAlcance()
						+ "; expreso=" + consentimiento.isExpreso());
		return consentimiento;
	}

	@Transactional(readOnly = true)
	public List<Consentimiento> listar(UUID titularId, Estado estado, UsuarioActual usuario) {
		UUID titular = usuario.es(Rol.SOLICITANTE) ? usuario.id() : titularId;
		if (usuario.es(Rol.SOLICITANTE) && titularId != null && !titularId.equals(usuario.id())) {
			auditoria.denegado(usuario.id(), "CONSULTAR_CONSENTIMIENTOS", "titular/" + titularId);
			throw ErrorApi.sinPermiso();
		}
		List<Consentimiento> resultado = titular != null ? consentimientos.findByTitularIdOrderByFechaDesc(titular)
				: consentimientos.findAllByOrderByFechaDesc();
		auditoria.exito(usuario.id(), "CONSULTAR_CONSENTIMIENTOS", titular != null ? "titular/" + titular : "consentimientos");
		return estado == null ? resultado : resultado.stream().filter(c -> c.getEstado() == estado).toList();
	}

	@Transactional
	public Consentimiento revocar(UUID id, UsuarioActual usuario) {
		Consentimiento consentimiento = consentimientos.findById(id)
			.filter(c -> !usuario.es(Rol.SOLICITANTE) || c.getTitularId().equals(usuario.id()))
			.orElseThrow(ErrorApi::noEncontrado);
		if (consentimiento.getEstado() == Estado.REVOCADO) {
			throw ErrorApi.conflicto("CONSENTIMIENTO_YA_REVOCADO", "El consentimiento ya estaba revocado.");
		}
		consentimiento.revocar();
		auditoria.exito(usuario.id(), "REVOCAR_CONSENTIMIENTO", "consentimiento/" + id,
				"finalidad=" + consentimiento.getFinalidad() + "; alcance=" + consentimiento.getAlcance());
		eventos.publishEvent(new ConsentimientoRevocado(id));
		return consentimiento;
	}

	/** ¿El titular tiene algún consentimiento vigente? Sin él, el tratamiento se limita a lo contractual. */
	@Transactional(readOnly = true)
	public boolean tieneVigente(UUID titularId) {
		LocalDate hoy = LocalDate.now();
		return consentimientos.findByTitularIdOrderByFechaDesc(titularId).stream().anyMatch(c -> c.vigente(hoy));
	}

	/** Para tratamientos que van más allá de lo contractual (p. ej. verificar con fuentes externas). */
	@Transactional(readOnly = true)
	public void exigirVigente(UUID titularId) {
		if (!tieneVigente(titularId)) {
			throw ErrorApi.sinPermiso("CONSENTIMIENTO_REQUERIDO",
					"El titular no tiene un consentimiento informado vigente; el tratamiento se limita a lo contractual.");
		}
	}

	/** Los datos sensibles no se tratan sin consentimiento expreso vigente (HU-18b CA-3). */
	@Transactional(readOnly = true)
	public void exigirExpresoVigente(UUID titularId) {
		LocalDate hoy = LocalDate.now();
		boolean expreso = consentimientos.findByTitularIdOrderByFechaDesc(titularId)
			.stream()
			.anyMatch(c -> c.isExpreso() && c.vigente(hoy));
		if (!expreso) {
			throw ErrorApi.sinPermiso("CONSENTIMIENTO_EXPRESO_REQUERIDO",
					"Este documento contiene datos sensibles y requiere el consentimiento expreso vigente del titular.");
		}
	}

}

interface ConsentimientoRepo extends JpaRepository<Consentimiento, UUID> {

	List<Consentimiento> findByTitularIdOrderByFechaDesc(UUID titularId);

	List<Consentimiento> findAllByOrderByFechaDesc();

}
