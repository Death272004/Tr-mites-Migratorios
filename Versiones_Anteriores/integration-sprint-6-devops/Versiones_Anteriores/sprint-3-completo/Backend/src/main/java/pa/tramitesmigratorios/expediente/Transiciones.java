package pa.tramitesmigratorios.expediente;

import static pa.tramitesmigratorios.expediente.EstadoExpediente.ADMITIDO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.ARCHIVADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.CON_OBSERVACIONES;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.ENTREGADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.EN_ANALISIS;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.EN_PREPARACION;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.EN_RESOLUCION;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.NOTIFICADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.RECIBIDO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.RESUELTO;

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
import pa.tramitesmigratorios.expediente.EstadoExpediente.Resultado;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.UsuarioActual;
import pa.tramitesmigratorios.verificacion.VerificacionRepo;

/**
 * Máquina de estados del expediente (HU-19, TASK-19.2 y TASK-19.3). Toda transición se valida
 * aquí, en el backend: permiso de la etapa, matriz permitida, prerrequisitos de la resolución,
 * motivo y versión.
 */
@Service
public class Transiciones {

	/**
	 * Matriz por defecto. La matriz definitiva por tipo de trámite la define el PO (TASK-19.1);
	 * cuando exista, se agrega una entrada por código de trámite en {@link #POR_TRAMITE}.
	 */
	static final Map<EstadoExpediente, Set<EstadoExpediente>> MATRIZ = Map.of(
			EN_PREPARACION, EnumSet.of(RECIBIDO, ARCHIVADO),
			RECIBIDO, EnumSet.of(CON_OBSERVACIONES, EN_ANALISIS, ARCHIVADO),
			CON_OBSERVACIONES, EnumSet.of(EN_ANALISIS, ARCHIVADO),
			EN_ANALISIS, EnumSet.of(CON_OBSERVACIONES, ADMITIDO, ARCHIVADO),
			ADMITIDO, EnumSet.of(EN_RESOLUCION, CON_OBSERVACIONES),
			EN_RESOLUCION, EnumSet.of(RESUELTO, ADMITIDO),
			RESUELTO, EnumSet.of(NOTIFICADO),
			NOTIFICADO, EnumSet.of(ENTREGADO),
			ENTREGADO, EnumSet.of(ARCHIVADO));

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
	 * Permiso que exige llegar a cada estado, el mismo que pide el Frontend en la pantalla de la
	 * etapa: recepción y análisis observan (I-04, I-06, I-08), la resolución resuelve (I-10) y la
	 * notificación, la entrega y el archivo notifican (I-11, I-12, I-13).
	 */
	static Permiso permisoPara(EstadoExpediente nuevo) {
		return switch (nuevo) {
			case EN_PREPARACION, RECIBIDO, CON_OBSERVACIONES, EN_ANALISIS, ADMITIDO -> Permiso.OBSERVAR;
			case EN_RESOLUCION, RESUELTO -> Permiso.RESOLVER;
			case NOTIFICADO, ENTREGADO, ARCHIVADO -> Permiso.NOTIFICAR;
		};
	}

	/**
	 * Cambia el estado. Si algo no se cumple, responde 409 y el expediente conserva su estado
	 * original (CP-04). La versión evita que dos cambios simultáneos se pisen (CA-5).
	 */
	@Transactional
	public Expediente cambiar(UUID id, EstadoExpediente nuevo, Resultado resultado, String motivo, long versionLeida,
			UsuarioActual usuario) {
		Expediente expediente = acceso.paraOperar(id, usuario, permisoPara(nuevo));
		if (nuevo == RESUELTO && resultado == null) {
			throw ErrorApi.entradaInvalida("resultado", "Indique si la resolución es APROBADA o NEGADA.");
		}
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
		if (nuevo == EN_RESOLUCION || nuevo == RESUELTO) {
			List<String> faltantes = prerrequisitosFaltantes(expediente);
			if (!faltantes.isEmpty()) {
				auditoria.fallo(usuario.id(), "CAMBIAR_ESTADO", "expediente/" + id, "Requisitos incompletos para " + nuevo);
				throw ErrorApi.conflicto("REQUISITOS_INCOMPLETOS",
						"No se puede pasar a " + nuevo + ": " + String.join("; ", faltantes) + ".");
			}
		}
		expediente.cambiarEstado(nuevo, resultado);
		// Fuerza la comprobación de versión ahora: si otro cambio ganó, falla antes de dejar historial.
		expedientes.saveAndFlush(expediente);
		historial.save(new HistorialEstado(id, anterior, nuevo, usuario.id(), motivo.trim()));
		auditoria.exito(usuario.id(), "CAMBIAR_ESTADO", "expediente/" + id, anterior + " -> " + nuevo);
		eventos.publishEvent(new EstadoCambiado(id, expediente.getNumero(), expediente.getSolicitanteId(), nuevo.name()));
		return expediente;
	}

	/** Controles previos a la resolución (CA-3): requisitos obligatorios completos y verificaciones resueltas. */
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
