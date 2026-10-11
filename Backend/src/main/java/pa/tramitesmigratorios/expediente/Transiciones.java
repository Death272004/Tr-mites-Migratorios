package pa.tramitesmigratorios.expediente;

import static pa.tramitesmigratorios.expediente.EstadoExpediente.APROBADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.BORRADOR;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.CANCELADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.CERRADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.DENEGADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.EN_REVISION;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.EN_VALIDACION;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.LISTO_DECISION;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.OBSERVADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.PENDIENTE_DOCUMENTOS;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.PRESENTADO;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pa.tramitesmigratorios.auditoria.Auditoria;
import pa.tramitesmigratorios.catalogo.Catalogos;
import pa.tramitesmigratorios.catalogo.Catalogos.Requisito;
import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.comun.Eventos.EstadoCambiado;
import pa.tramitesmigratorios.documento.DocumentoRepo;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.UsuarioActual;
import pa.tramitesmigratorios.verificacion.VerificacionRepo;

/**
 * Máquina de estados del expediente (HU-19, TASK-19.2 y TASK-19.3). Toda transición se valida
 * aquí, en el backend: matriz permitida, prerrequisitos de la decisión, motivo y versión.
 */
@Service
public class Transiciones {

	/**
	 * Matriz por defecto. La matriz definitiva por tipo de trámite la define el PO (TASK-19.1);
	 * cuando exista, se agrega una entrada por código de trámite en {@link #POR_TRAMITE}.
	 */
	static final Map<EstadoExpediente, Set<EstadoExpediente>> MATRIZ = Map.of(
			BORRADOR, EnumSet.of(PRESENTADO, CANCELADO),
			PRESENTADO, EnumSet.of(EN_REVISION, CANCELADO),
			EN_REVISION, EnumSet.of(PENDIENTE_DOCUMENTOS, OBSERVADO, EN_VALIDACION, CANCELADO),
			PENDIENTE_DOCUMENTOS, EnumSet.of(EN_REVISION, CANCELADO),
			OBSERVADO, EnumSet.of(EN_REVISION, CANCELADO),
			EN_VALIDACION, EnumSet.of(LISTO_DECISION, PENDIENTE_DOCUMENTOS, OBSERVADO),
			LISTO_DECISION, EnumSet.of(APROBADO, DENEGADO, EN_VALIDACION),
			APROBADO, EnumSet.of(CERRADO),
			DENEGADO, EnumSet.of(CERRADO));

	static final Map<String, Map<EstadoExpediente, Set<EstadoExpediente>>> POR_TRAMITE = Map.of();

	private final ExpedienteRepo expedientes;
	private final HistorialEstadoRepo historial;
	private final AccesoExpedientes acceso;
	private final Catalogos catalogos;
	private final DocumentoRepo documentos;
	private final VerificacionRepo verificaciones;
	private final Auditoria auditoria;
	private final ApplicationEventPublisher eventos;

	Transiciones(ExpedienteRepo expedientes, HistorialEstadoRepo historial, AccesoExpedientes acceso,
			Catalogos catalogos, DocumentoRepo documentos, VerificacionRepo verificaciones, Auditoria auditoria,
			ApplicationEventPublisher eventos) {
		this.expedientes = expedientes;
		this.historial = historial;
		this.acceso = acceso;
		this.catalogos = catalogos;
		this.documentos = documentos;
		this.verificaciones = verificaciones;
		this.auditoria = auditoria;
		this.eventos = eventos;
	}

	static Set<EstadoExpediente> permitidas(String tipoTramite, EstadoExpediente desde) {
		return POR_TRAMITE.getOrDefault(tipoTramite, MATRIZ).getOrDefault(desde, Set.of());
	}

	/**
	 * Cambia el estado. Si algo no se cumple, responde 409 y el expediente conserva su estado
	 * original (CP-04). La versión evita que dos cambios simultáneos se pisen (CA-5).
	 */
	@Transactional
	public Expediente cambiar(UUID id, EstadoExpediente nuevo, String motivo, long versionLeida,
			UsuarioActual usuario) {
		Expediente expediente = acceso.paraOperar(id, usuario, Permiso.RESOLVER);
		EstadoExpediente anterior = expediente.getEstado();
		if (expediente.getVersion() != versionLeida) {
			throw ErrorApi.conflicto("VERSION_DESACTUALIZADA",
					"El expediente cambió mientras lo revisaba. Vuelva a cargarlo e intente de nuevo.");
		}
		if (!permitidas(expediente.getTipoTramite(), anterior).contains(nuevo)) {
			auditoria.fallo(usuario.id(), "CAMBIAR_ESTADO", "expediente/" + id, anterior + " -> " + nuevo + " no permitida");
			throw ErrorApi.conflicto("TRANSICION_NO_PERMITIDA",
					"Un expediente en estado " + anterior + " no puede pasar a " + nuevo + ".");
		}
		if (nuevo == LISTO_DECISION || nuevo.esDecision()) {
			List<String> faltantes = prerrequisitosFaltantes(expediente);
			if (!faltantes.isEmpty()) {
				auditoria.fallo(usuario.id(), "CAMBIAR_ESTADO", "expediente/" + id, "Requisitos incompletos para " + nuevo);
				throw ErrorApi.conflicto("REQUISITOS_INCOMPLETOS",
						"No se puede pasar a " + nuevo + ": " + String.join("; ", faltantes) + ".");
			}
		}
		expediente.cambiarEstado(nuevo);
		// Fuerza la comprobación de versión ahora: si otro cambio ganó, falla antes de dejar historial.
		expedientes.saveAndFlush(expediente);
		historial.save(new HistorialEstado(id, anterior, nuevo, usuario.id(), motivo.trim()));
		auditoria.exito(usuario.id(), "CAMBIAR_ESTADO", "expediente/" + id, anterior + " -> " + nuevo);
		eventos.publishEvent(new EstadoCambiado(id, expediente.getNumero(), expediente.getSolicitanteId(), nuevo.name()));
		return expediente;
	}

	/** Controles previos a la decisión (CA-3): requisitos obligatorios completos y verificaciones resueltas. */
	private List<String> prerrequisitosFaltantes(Expediente expediente) {
		Set<String> cubiertos = documentos.tiposCubiertos(expediente.getId());
		List<String> sinDocumento = catalogos.requisitosDe(expediente.getTipoTramite())
			.stream()
			.filter(Requisito::obligatorio)
			.map(Requisito::tipoDocumental)
			.filter(tipo -> !cubiertos.contains(tipo))
			.sorted()
			.toList();
		long sinResolver = verificaciones.findByExpedienteId(expediente.getId())
			.stream()
			.filter(v -> !v.getEstado().resuelta())
			.count();
		List<String> faltantes = new ArrayList<>();
		if (!sinDocumento.isEmpty()) {
			faltantes.add("faltan documentos obligatorios (" + String.join(", ", sinDocumento) + ")");
		}
		if (sinResolver > 0) {
			faltantes.add("hay " + sinResolver + " verificación(es) sin respuesta");
		}
		return faltantes;
	}

}
