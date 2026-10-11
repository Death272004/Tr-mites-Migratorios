package pa.tramitesmigratorios.expediente;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pa.tramitesmigratorios.auditoria.Auditoria;
import pa.tramitesmigratorios.catalogo.Catalogos;
import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.comun.Eventos.ObservacionDelDespacho;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.RepresentacionRepo;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.UsuarioActual;

/** Registro, consulta, historial y observaciones de expedientes (HU-15, HU-16, HU-20, HU-21). */
@Service
public class ExpedienteServicio {

	public record Filtro(EstadoExpediente estado, String tipoTramite, LocalDate fechaDesde, LocalDate fechaHasta) {
	}

	private final ExpedienteRepo expedientes;
	private final HistorialEstadoRepo historial;
	private final ObservacionRepo observaciones;
	private final AccesoExpedientes acceso;
	private final Catalogos catalogos;
	private final RepresentacionRepo representaciones;
	private final Auditoria auditoria;
	private final ApplicationEventPublisher eventos;

	ExpedienteServicio(ExpedienteRepo expedientes, HistorialEstadoRepo historial, ObservacionRepo observaciones,
			AccesoExpedientes acceso, Catalogos catalogos, RepresentacionRepo representaciones, Auditoria auditoria,
			ApplicationEventPublisher eventos) {
		this.expedientes = expedientes;
		this.historial = historial;
		this.observaciones = observaciones;
		this.acceso = acceso;
		this.catalogos = catalogos;
		this.representaciones = representaciones;
		this.auditoria = auditoria;
		this.eventos = eventos;
	}

	/**
	 * Crea el expediente a nombre del usuario autenticado. Solo puede indicarse otro titular si
	 * existe una representación acreditada vigente (P-08); de lo contrario se rechaza (CP-03).
	 * La solicitud se envía al final del asistente (P-17), así que nace en PRESENTADO.
	 */
	@Transactional
	public Expediente crear(String tipoTramite, UUID titularId, UsuarioActual usuario) {
		String tipo = catalogos.tramiteActivo(tipoTramite)
			.orElseThrow(() -> ErrorApi.entradaInvalida("tipoTramite", "El tipo de trámite no existe en el catálogo."))
			.getCodigo();
		UUID titular = titularId != null ? titularId : usuario.id();
		if (!titular.equals(usuario.id())
				&& !representaciones.existsByRepresentanteIdAndTitularIdAndVigenteTrue(usuario.id(), titular)) {
			auditoria.denegado(usuario.id(), "CREAR_EXPEDIENTE", "titular/" + titular);
			throw ErrorApi.sinPermiso("SIN_REPRESENTACION",
					"No tiene una representación acreditada para presentar en nombre de ese titular.");
		}
		String numero = "EXP-%d-%06d".formatted(Year.now().getValue(), expedientes.siguienteNumero());
		Expediente expediente = expedientes
			.save(new Expediente(numero, titular, usuario.id(), tipo, EstadoExpediente.PRESENTADO));
		historial.save(new HistorialEstado(expediente.getId(), null, EstadoExpediente.PRESENTADO, usuario.id(),
				"Presentación de la solicitud"));
		auditoria.exito(usuario.id(), "CREAR_EXPEDIENTE", "expediente/" + expediente.getId(), "tipoTramite=" + tipo);
		return expediente;
	}

	/** Solo los expedientes accesibles al usuario según su rol y la titularidad (HU-16 CA-1). */
	@Transactional(readOnly = true)
	public Page<Expediente> listar(Filtro filtro, Pageable pagina, UsuarioActual usuario) {
		if (filtro.fechaDesde() != null && filtro.fechaHasta() != null
				&& filtro.fechaHasta().isBefore(filtro.fechaDesde())) {
			throw ErrorApi.entradaInvalida("fechaHasta", "No puede ser anterior a fechaDesde.");
		}
		Specification<Expediente> criterio = switch (usuario.rol()) {
			case SOLICITANTE -> (r, q, cb) -> cb.or(cb.equal(r.get("solicitanteId"), usuario.id()),
					cb.equal(r.get("creadoPorId"), usuario.id()));
			case FUNCIONARIO -> {
				if (!usuario.tiene(Permiso.CONSULTAR)) {
					auditoria.denegado(usuario.id(), "ACCESO_DENEGADO", "expedientes");
					throw ErrorApi.sinPermiso();
				}
				yield Specification.unrestricted();
			}
			case SUPERVISOR, AUDITOR -> Specification.unrestricted();
			case ADMIN -> throw ErrorApi.sinPermiso();
		};
		if (filtro.estado() != null) {
			criterio = criterio.and((r, q, cb) -> cb.equal(r.get("estado"), filtro.estado()));
		}
		if (filtro.tipoTramite() != null && !filtro.tipoTramite().isBlank()) {
			criterio = criterio.and((r, q, cb) -> cb.equal(r.get("tipoTramite"), filtro.tipoTramite().trim()));
		}
		if (filtro.fechaDesde() != null) {
			Instant inicio = filtro.fechaDesde().atStartOfDay().toInstant(ZoneOffset.UTC);
			criterio = criterio.and((r, q, cb) -> cb.greaterThanOrEqualTo(r.get("fechaCreacion"), inicio));
		}
		if (filtro.fechaHasta() != null) {
			Instant fin = filtro.fechaHasta().plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
			criterio = criterio.and((r, q, cb) -> cb.lessThan(r.get("fechaCreacion"), fin));
		}
		Page<Expediente> resultado = expedientes.findAll(criterio, pagina);
		if (!usuario.es(Rol.SOLICITANTE)) {
			// La consulta de expedientes de terceros es sensible y queda en auditoría (HU-16 CA-6).
			auditoria.exito(usuario.id(), "CONSULTAR_EXPEDIENTES", "expedientes");
		}
		return resultado;
	}

	@Transactional(readOnly = true)
	public Expediente obtener(UUID id, UsuarioActual usuario) {
		Expediente expediente = acceso.paraLeer(id, usuario);
		if (!usuario.es(Rol.SOLICITANTE)) {
			auditoria.exito(usuario.id(), "CONSULTAR_EXPEDIENTE", "expediente/" + id);
		}
		return expediente;
	}

	@Transactional(readOnly = true)
	public List<HistorialEstado> historial(UUID id, UsuarioActual usuario) {
		acceso.paraLeer(id, usuario);
		return historial.findByExpedienteIdOrderByFecha(id);
	}

	@Transactional(readOnly = true)
	public List<Observacion> observaciones(UUID id, UsuarioActual usuario) {
		acceso.paraLeer(id, usuario);
		return observaciones.findByExpedienteIdOrderByFecha(id);
	}

	/** El despacho observa (permiso OBSERVAR) y el cliente responde en sus expedientes. No cambia el estado. */
	@Transactional
	public Observacion observar(UUID id, String texto, UsuarioActual usuario) {
		Expediente expediente = acceso.paraOperar(id, usuario, Permiso.OBSERVAR);
		Observacion observacion = observaciones.save(new Observacion(id, usuario.id(), texto.trim()));
		auditoria.exito(usuario.id(), "REGISTRAR_OBSERVACION", "expediente/" + id);
		if (usuario.es(Rol.FUNCIONARIO)) {
			eventos.publishEvent(new ObservacionDelDespacho(id, expediente.getNumero(), expediente.getSolicitanteId()));
		}
		return observacion;
	}

}
