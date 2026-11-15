package pa.tramitesmigratorios.verificacion;

import java.time.Instant;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import pa.tramitesmigratorios.auditoria.Auditoria;
import pa.tramitesmigratorios.catalogo.Catalogos;
import pa.tramitesmigratorios.catalogo.Catalogos.Requisito;
import pa.tramitesmigratorios.comun.Correlacion;
import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.expediente.AccesoExpedientes;
import pa.tramitesmigratorios.expediente.EstadoExpediente;
import pa.tramitesmigratorios.expediente.Expediente;
import pa.tramitesmigratorios.expediente.ExpedienteRepo;
import pa.tramitesmigratorios.fuentes.Escenario;
import pa.tramitesmigratorios.privacidad.ConsentimientoServicio;
import pa.tramitesmigratorios.seguridad.AreaInstitucional;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;
import pa.tramitesmigratorios.seguridad.UsuarioActual;
import pa.tramitesmigratorios.seguridad.PoliticaAreas;
import pa.tramitesmigratorios.seguridad.UsuarioRepo;
import pa.tramitesmigratorios.verificacion.MatrizFuentes.Fila;
import pa.tramitesmigratorios.verificacion.Verificacion.Estado;
import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;
import pa.tramitesmigratorios.verificacion.Verificacion.Modo;
import pa.tramitesmigratorios.verificacion.Verificacion.ResultadoMinimo;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Consulta;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.PuertoFuente;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Respuesta;
import pa.tramitesmigratorios.verificacion.adaptadores.RegistroManualAsistido;

/**
 * Orquestación de verificaciones (HU-24): determina las que aplican al trámite, las registra en
 * modo manual asistido o las envía a la fuente simulada, y gestiona los fallos con reintentos
 * limitados e idempotencia. Antes de emitir o registrar valida permiso, finalidad y
 * consentimiento según la {@link MatrizFuentes} (HU-25).
 *
 * Solo conoce los puertos de {@code adaptadores}; ninguna clase de las fuentes simuladas.
 */
@Service
public class Verificaciones {

	public record Nueva(Fuente fuente, String tipoVerificacion, Modo modo, String finalidad, Instant fechaResultado,
			ResultadoMinimo resultadoMinimo, String referenciaOrigen, String nota) {
	}

	/** {@code repetida} indica que la clave de idempotencia ya se había usado: no se hizo nada nuevo. */
	public record Registro(Verificacion verificacion, boolean repetida) {
	}

	private static final Logger log = LoggerFactory.getLogger(Verificaciones.class);

	/** Con el expediente resuelto o cerrado ya no hay decisión que verificar. */
	private static final Set<EstadoExpediente> CERRADOS = EnumSet.of(EstadoExpediente.RESUELTO,
			EstadoExpediente.NOTIFICADO, EstadoExpediente.ENTREGADO, EstadoExpediente.ARCHIVADO);

	/** Resultados con sentido para cada fuente; el resto se rechaza (minimización, HU-25 CA-3). */
	private static final Map<Fuente, Set<ResultadoMinimo>> RESULTADOS = Map.of(
			Fuente.TE, EnumSet.of(ResultadoMinimo.COINCIDE, ResultadoMinimo.NO_COINCIDE, ResultadoMinimo.SIN_RESULTADO),
			Fuente.CSS, EnumSet.of(ResultadoMinimo.VIGENTE, ResultadoMinimo.NO_VIGENTE, ResultadoMinimo.SIN_RESULTADO),
			Fuente.REGISTRO_PUBLICO, EnumSet.of(ResultadoMinimo.CON_REGISTROS, ResultadoMinimo.SIN_RESULTADO),
			Fuente.DOCUMENTO_EXTERIOR,
			EnumSet.of(ResultadoMinimo.VIGENTE, ResultadoMinimo.NO_VIGENTE, ResultadoMinimo.SIN_RESULTADO));

	private final VerificacionRepo verificaciones;
	private final ExpedienteRepo expedientes;
	private final AccesoExpedientes acceso;
	private final Catalogos catalogos;
	private final ConsentimientoServicio consentimientos;
	private final UsuarioRepo usuarios;
	private final RegistroManualAsistido registroManual;
	private final Map<Fuente, PuertoFuente> puertos;
	private final Auditoria auditoria;
	private final TransactionTemplate transaccion;

	Verificaciones(VerificacionRepo verificaciones, ExpedienteRepo expedientes, AccesoExpedientes acceso,
			Catalogos catalogos, ConsentimientoServicio consentimientos, UsuarioRepo usuarios,
			RegistroManualAsistido registroManual, List<PuertoFuente> puertos, Auditoria auditoria,
			PlatformTransactionManager transacciones) {
		this.verificaciones = verificaciones;
		this.expedientes = expedientes;
		this.acceso = acceso;
		this.catalogos = catalogos;
		this.consentimientos = consentimientos;
		this.usuarios = usuarios;
		this.registroManual = registroManual;
		this.puertos = new EnumMap<>(Fuente.class);
		puertos.forEach(p -> this.puertos.put(p.fuente(), p));
		this.auditoria = auditoria;
		this.transaccion = new TransactionTemplate(transacciones);
	}

	@Transactional(readOnly = true)
	public List<Verificacion> listar(UUID expedienteId, UsuarioActual usuario) {
		acceso.paraLeer(expedienteId, usuario);
		if (!usuario.es(Rol.SOLICITANTE)) {
			auditoria.exito(usuario.id(), "CONSULTAR_VERIFICACIONES", "expediente/" + expedienteId);
		}
		if (PoliticaAreas.esInstitucional(usuario.area())) {
			return verificaciones.findByExpedienteIdAndAsignadoAIdOrderByFechaSolicitud(expedienteId, usuario.id());
		}
		return verificaciones.findByExpedienteIdOrderByFechaSolicitud(expedienteId);
	}

	/**
	 * Crea en PENDIENTE las verificaciones que la matriz exige al tipo de trámite y aún no existen
	 * (TASK-24.2). Repetirla no duplica nada. Nacen en modo manual asistido, el modo de producción.
	 */
	@Transactional
	public List<Verificacion> preparar(UUID expedienteId, UsuarioActual usuario) {
		if (PoliticaAreas.esInstitucional(usuario.area())) {
			throw ErrorApi.sinPermiso("PREPARACION_NO_AUTORIZADA",
					"Las cuentas institucionales solo atienden verificaciones que les fueron asignadas.");
		}
		Expediente expediente = abierto(expedienteId, usuario);
		Set<String> requisitos = catalogos.requisitosDe(expediente.getTipoTramite())
			.stream()
			.map(Requisito::tipoDocumental)
			.collect(Collectors.toSet());
		List<Verificacion> existentes = verificaciones.findByExpedienteId(expedienteId);
		List<Verificacion> nuevas = MatrizFuentes.FILAS.stream()
			.filter(fila -> MatrizFuentes.aplica(fila, requisitos))
			.filter(fila -> existentes.stream().noneMatch(v -> esDeLaFila(v, fila)))
			.map(fila -> Verificacion.pendiente(expedienteId, fila.fuente(), fila.tipoVerificacion(),
					Modo.MANUAL_ASISTIDO, fila.finalidad()))
			.toList();
		List<Verificacion> creadas = verificaciones.saveAll(nuevas);
		auditoria.exito(usuario.id(), "PREPARAR_VERIFICACIONES", "expediente/" + expedienteId,
				"creadas=" + creadas.size());
		return creadas;
	}

	/**
	 * Registra (manual asistido) o envía (simulado) una verificación. Con la misma clave de
	 * idempotencia devuelve la verificación ya registrada sin repetir la operación (CP-08).
	 */
	@Transactional
	public Registro registrar(UUID expedienteId, Nueva nueva, String claveIdempotencia, Escenario escenario,
			UsuarioActual usuario) {
		Expediente expediente = abierto(expedienteId, usuario);
		if (claveIdempotencia != null) {
			Optional<Verificacion> previa = verificaciones.findByExpedienteIdAndClaveIdempotencia(expedienteId,
					claveIdempotencia);
			if (previa.isPresent()) {
				return new Registro(previa.get(), true);
			}
		}
		Fila fila = autorizar(expediente, nueva, usuario);
		boolean institucional = PoliticaAreas.esInstitucional(usuario.area());
		Optional<Verificacion> abierta = verificaciones.findByExpedienteId(expedienteId)
			.stream()
			.filter(v -> esDeLaFila(v, fila) && !v.getEstado().resuelta()
					&& (!institucional || usuario.id().equals(v.getAsignadoAId())))
			.findFirst();
		if (institucional) {
			if (nueva.modo() != Modo.MANUAL_ASISTIDO || abierta.isEmpty()
					|| !usuario.id().equals(abierta.get().getAsignadoAId())) {
				auditoria.denegado(usuario.id(), "REGISTRAR_VERIFICACION", "expediente/" + expedienteId,
						"verificación no asignada o modo no permitido");
				throw ErrorApi.sinPermiso("VERIFICACION_NO_ASIGNADA",
						"Solo puede completar una verificación manual asignada a su cuenta.");
			}
		}
		Verificacion verificacion = abierta.orElseGet(() -> Verificacion.pendiente(expedienteId, fila.fuente(),
				fila.tipoVerificacion(), nueva.modo(), fila.finalidad()));
		if (verificacion.getClaveIdempotencia() == null) {
			verificacion.conClaveIdempotencia(claveIdempotencia);
		}
		if (nueva.nota() != null && !nueva.nota().isBlank()) {
			verificacion.anotar(nueva.nota().trim());
		}
		if (nueva.modo() == Modo.MANUAL_ASISTIDO) {
			if (verificacion.getEstado() == Estado.ENVIADA) {
				throw enCurso();
			}
			validarResultado(fila.fuente(), nueva.resultadoMinimo());
			verificacion.registrarManual(registroManual.registrar(fila.fuente(), nueva.resultadoMinimo(),
					nueva.fechaResultado(), nueva.referenciaOrigen(), usuario.id()));
			verificacion = verificaciones.saveAndFlush(verificacion);
		}
		else {
			if (verificacion.getEstado() != Estado.PENDIENTE) {
				throw enCurso();
			}
			verificacion = enviar(expediente, verificacion, fila, escenario, usuario.id());
		}
		auditoria.exito(usuario.id(), "REGISTRAR_VERIFICACION", "verificacion/" + verificacion.getId(),
				resumen(verificacion));
		return new Registro(verificacion, false);
	}

	/** Respuesta a una petición repetida que llegó a la vez que la original (carrera en la clave). */
	@Transactional(readOnly = true)
	public Optional<Verificacion> porClave(UUID expedienteId, String claveIdempotencia, UsuarioActual usuario) {
		acceso.paraLeer(expedienteId, usuario);
		return verificaciones.findByExpedienteIdAndClaveIdempotencia(expedienteId, claveIdempotencia);
	}

	/**
	 * Asigna una verificación de RP, CSS o TE al pasante de la institución correspondiente.
	 * Solo el personal BUFETE con permiso de observación puede hacer la asignación.
	 */
	@Transactional
	public Verificacion asignar(UUID expedienteId, UUID verificacionId, UUID asignadoAId, UsuarioActual actor) {
		if (!actor.es(Rol.FUNCIONARIO) || PoliticaAreas.esInstitucional(actor.area())
				|| !actor.tiene(Permiso.OBSERVAR)) {
			auditoria.denegado(actor.id(), "ASIGNAR_VERIFICACION", "verificacion/" + verificacionId);
			throw ErrorApi.sinPermiso("ASIGNACION_NO_AUTORIZADA",
					"Solo el personal del bufete puede asignar verificaciones.");
		}
		acceso.paraOperar(expedienteId, actor, Permiso.OBSERVAR);
		Verificacion verificacion = verificaciones.findByIdAndExpedienteId(verificacionId, expedienteId)
				.orElseThrow(ErrorApi::noEncontrado);
		AreaInstitucional areaRequerida = PoliticaAreas.areaParaFuente(verificacion.getFuente());
		Usuario destino = usuarios.findById(asignadoAId).orElseThrow(ErrorApi::noEncontrado);
		if (destino.getRol() != Rol.FUNCIONARIO || destino.getEstadoCuenta() != Usuario.EstadoCuenta.ACTIVA
				|| areaRequerida == null || destino.getAreaInstitucional() != areaRequerida) {
			auditoria.denegado(actor.id(), "ASIGNAR_VERIFICACION", "verificacion/" + verificacionId,
					"área de destino no corresponde a la fuente");
			throw ErrorApi.entradaInvalida("asignadoAId",
					"La verificación solo puede asignarse a un pasante del área correspondiente.");
		}
		verificacion.asignarA(destino.getId());
		verificacion = verificaciones.saveAndFlush(verificacion);
		auditoria.exito(actor.id(), "ASIGNAR_VERIFICACION", "verificacion/" + verificacionId,
				"asignadoA=" + destino.getId());
		return verificacion;
	}

	/** Una persona del despacho toma una verificación pendiente para cotejarla a mano. */
	@Transactional
	public Verificacion atender(UUID expedienteId, UUID verificacionId, UsuarioActual usuario) {
		abierto(expedienteId, usuario);
		Verificacion verificacion = verificaciones.findByIdAndExpedienteId(verificacionId, expedienteId)
			.orElseThrow(ErrorApi::noEncontrado);
		verificarAsignacion(verificacion, usuario);
		verificacion.atender(usuario.id());
		verificacion = verificaciones.saveAndFlush(verificacion);
		auditoria.exito(usuario.id(), "ATENDER_VERIFICACION", "verificacion/" + verificacionId, resumen(verificacion));
		return verificacion;
	}

	/** Reintento a pedido del despacho; solo en modo simulado, en REINTENTO_PROGRAMADO y dentro del tope. */
	@Transactional
	public Verificacion reintentar(UUID expedienteId, UUID verificacionId, Escenario escenario, UsuarioActual usuario) {
		if (PoliticaAreas.esInstitucional(usuario.area())) {
			throw ErrorApi.sinPermiso("REINTENTO_NO_AUTORIZADO",
					"Los pasantes institucionales registran el resultado manual de la fuente asignada.");
		}
		Expediente expediente = abierto(expedienteId, usuario);
		Verificacion verificacion = verificaciones.findByIdAndExpedienteId(verificacionId, expedienteId)
			.orElseThrow(ErrorApi::noEncontrado);
		Fila fila = MatrizFuentes.de(verificacion.getFuente()).orElseThrow(ErrorApi::sinPermiso);
		PuertoFuente puerto = puerto(fila.fuente());
		if (!verificacion.admiteReintento(puerto.politica())) {
			throw ErrorApi.conflicto("REINTENTO_NO_PERMITIDO",
					"Esta verificación no admite reintento. Si la fuente no responde, regístrela en modo manual asistido.");
		}
		exigirConsentimiento(expediente, fila, usuario.id());
		verificacion = enviar(expediente, verificacion, fila, escenario, usuario.id());
		auditoria.exito(usuario.id(), "REINTENTAR_VERIFICACION", "verificacion/" + verificacionId,
				resumen(verificacion));
		return verificacion;
	}

	/**
	 * Ejecuta los reintentos programados ya vencidos, cada uno en su propia transacción: el fallo
	 * de uno no detiene a los demás. Devuelve cuántos se procesaron.
	 */
	public int procesarReintentosVencidos(Instant ahora) {
		List<UUID> vencidas = verificaciones
			.findTop50ByEstadoAndProximoIntentoLessThanEqualOrderByProximoIntento(Estado.REINTENTO_PROGRAMADO, ahora)
			.stream()
			.map(Verificacion::getId)
			.toList();
		int procesadas = 0;
		for (UUID id : vencidas) {
			try {
				transaccion.executeWithoutResult(estado -> reintentoProgramado(id));
				procesadas++;
			}
			catch (RuntimeException e) {
				// Otra instancia lo tomó, o el consentimiento ya no está vigente: sin datos personales en el log.
				log.warn("No se ejecutó el reintento programado de la verificación {}: {}", id,
						e.getClass().getSimpleName());
			}
		}
		return procesadas;
	}

	private void reintentoProgramado(UUID id) {
		Verificacion verificacion = verificaciones.findById(id).orElseThrow(ErrorApi::noEncontrado);
		Fila fila = MatrizFuentes.de(verificacion.getFuente()).orElseThrow(ErrorApi::sinPermiso);
		PuertoFuente puerto = puerto(fila.fuente());
		if (!verificacion.admiteReintento(puerto.politica())) {
			return;
		}
		Expediente expediente = expedientes.findById(verificacion.getExpedienteId()).orElseThrow(ErrorApi::noEncontrado);
		exigirConsentimiento(expediente, fila, null);
		Verificacion enviada = enviar(expediente, verificacion, fila, Escenario.OK, verificacion.getResponsableId());
		auditoria.exito(null, "REINTENTO_PROGRAMADO_VERIFICACION", "verificacion/" + id, resumen(enviada));
	}

	/**
	 * Envía la consulta con solo los campos autorizados por la matriz (HU-25 CA-3) y aplica la
	 * respuesta. La verificación queda ENVIADA en la base antes de llamar a la fuente, así un
	 * duplicado concurrente choca con la clave de idempotencia o con la versión. Devuelve la
	 * instancia gestionada.
	 */
	private Verificacion enviar(Expediente expediente, Verificacion verificacion, Fila fila, Escenario escenario,
			UUID responsableId) {
		PuertoFuente puerto = puerto(fila.fuente());
		Consulta consulta = consultaMinima(expediente, fila, escenario);
		verificacion.enviar(responsableId, consulta.correlacion());
		Verificacion enviada = verificaciones.saveAndFlush(verificacion);
		Respuesta respuesta = puerto.consultar(consulta);
		enviada.aplicar(respuesta, puerto.politica(), Instant.now());
		return verificaciones.saveAndFlush(enviada);
	}

	private Consulta consultaMinima(Expediente expediente, Fila fila, Escenario escenario) {
		Usuario titular = usuarios.findById(expediente.getSolicitanteId()).orElseThrow(ErrorApi::noEncontrado);
		if (titular.getTipoDocumento() == null || titular.getNumeroDocumento() == null) {
			throw ErrorApi.conflicto("DOCUMENTO_DEL_TITULAR_FALTANTE",
					"El titular no tiene un documento de identidad registrado; la verificación debe hacerse en modo manual asistido.");
		}
		List<String> campos = fila.camposEnviados();
		return new Consulta(campos.contains("tipoDocumento") ? titular.getTipoDocumento().name() : null,
				campos.contains("numeroDocumento") ? titular.getNumeroDocumento() : null, titular.getNombre(),
				Correlacion.actualONueva(), escenario != null ? escenario : Escenario.OK);
	}

	/** Permiso, fuente, finalidad, modo y consentimiento antes de emitir o registrar (HU-25 CA-2). */
	private Fila autorizar(Expediente expediente, Nueva nueva, UsuarioActual usuario) {
		String recurso = "expediente/" + expediente.getId();
		Fila fila = MatrizFuentes.de(nueva.fuente()).orElse(null);
		if (!PoliticaAreas.permiteFuente(usuario.area(), nueva.fuente())) {
			auditoria.denegado(usuario.id(), "REGISTRAR_VERIFICACION", recurso,
					"fuente fuera del área institucional");
			throw ErrorApi.sinPermiso("FUENTE_FUERA_DE_AREA",
					"Su cuenta solo puede atender verificaciones de su área institucional.");
		}
		if (fila == null) {
			auditoria.denegado(usuario.id(), "REGISTRAR_VERIFICACION", recurso, "fuente=" + nueva.fuente() + " fuera de la matriz");
			throw ErrorApi.sinPermiso("FUENTE_NO_AUTORIZADA",
					"La fuente no está en la matriz de fuentes y finalidad del despacho.");
		}
		if (!fila.finalidad().equals(nueva.finalidad().trim())) {
			auditoria.denegado(usuario.id(), "REGISTRAR_VERIFICACION", recurso, "finalidad no autorizada para " + fila.fuente());
			throw ErrorApi.sinPermiso("FINALIDAD_NO_AUTORIZADA",
					"La finalidad indicada no está autorizada para esa fuente en la matriz de fuentes y finalidad.");
		}
		if (!fila.tipoVerificacion().equals(nueva.tipoVerificacion().trim())) {
			throw ErrorApi.entradaInvalida("tipoVerificacion",
					"Para " + fila.fuente() + " el tipo de verificación es " + fila.tipoVerificacion() + ".");
		}
		if (!fila.modos().contains(nueva.modo())) {
			throw ErrorApi.entradaInvalida("modo", "La fuente " + fila.fuente() + " solo admite " + fila.modos() + ".");
		}
		exigirConsentimiento(expediente, fila, usuario.id());
		return fila;
	}

	private void exigirConsentimiento(Expediente expediente, Fila fila, UUID actorId) {
		try {
			if (fila.consentimiento() == MatrizFuentes.Consentimiento.EXPRESO) {
				consentimientos.exigirExpresoVigente(expediente.getSolicitanteId());
			}
			else {
				consentimientos.exigirVigente(expediente.getSolicitanteId());
			}
		}
		catch (ErrorApi e) {
			auditoria.denegado(actorId, "REGISTRAR_VERIFICACION", "expediente/" + expediente.getId(),
					e.codigo() + " para " + fila.fuente());
			throw e;
		}
	}

	private static void validarResultado(Fuente fuente, ResultadoMinimo resultado) {
		if (resultado != null && !RESULTADOS.getOrDefault(fuente, Set.of()).contains(resultado)) {
			throw ErrorApi.entradaInvalida("resultadoMinimo",
					"Para " + fuente + " el resultado debe ser uno de " + RESULTADOS.get(fuente) + ".");
		}
	}

	private void verificarAsignacion(Verificacion verificacion, UsuarioActual usuario) {
		if (PoliticaAreas.esInstitucional(usuario.area())
				&& !usuario.id().equals(verificacion.getAsignadoAId())) {
			auditoria.denegado(usuario.id(), "ACCESO_DENEGADO", "verificacion/" + verificacion.getId(),
					"verificación no asignada");
			throw ErrorApi.sinPermiso("VERIFICACION_NO_ASIGNADA",
					"La verificación no está asignada a su cuenta.");
		}
		if (PoliticaAreas.esInstitucional(usuario.area())
				&& !PoliticaAreas.permiteFuente(usuario.area(), verificacion.getFuente())) {
			auditoria.denegado(usuario.id(), "ACCESO_DENEGADO", "verificacion/" + verificacion.getId(),
					"fuente fuera del área");
			throw ErrorApi.sinPermiso("FUENTE_FUERA_DE_AREA",
					"Su cuenta solo puede atender verificaciones de su área institucional.");
		}
	}

	private Expediente abierto(UUID expedienteId, UsuarioActual usuario) {
		Expediente expediente = acceso.paraOperar(expedienteId, usuario, Permiso.VERIFICAR);
		if (CERRADOS.contains(expediente.getEstado())) {
			throw ErrorApi.conflicto("EXPEDIENTE_CERRADO",
					"El expediente está en " + expediente.getEstado() + "; ya no admite verificaciones.");
		}
		return expediente;
	}

	private PuertoFuente puerto(Fuente fuente) {
		PuertoFuente puerto = puertos.get(fuente);
		if (puerto == null) {
			throw ErrorApi.entradaInvalida("modo", "La fuente " + fuente + " no tiene modo simulado.");
		}
		return puerto;
	}

	private static boolean esDeLaFila(Verificacion v, Fila fila) {
		return v.getFuente() == fila.fuente() && v.getTipoVerificacion().equals(fila.tipoVerificacion());
	}

	private static ErrorApi enCurso() {
		return ErrorApi.conflicto("VERIFICACION_EN_CURSO",
				"Ya hay una verificación de esa fuente en curso para el expediente. Consulte su estado o reinténtela.");
	}

	/** Detalle de auditoría: identificadores y estados, ningún dato del titular. */
	private static String resumen(Verificacion v) {
		return "expediente=" + v.getExpedienteId() + "; fuente=" + v.getFuente() + "; modo=" + v.getModo()
				+ "; estado=" + v.getEstado() + "; intentos=" + v.getIntentos();
	}

}
