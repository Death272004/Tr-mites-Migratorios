package pa.tramitesmigratorios.expediente;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.criteria.Root;

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
import pa.tramitesmigratorios.seguridad.PoliticaAreas;
import pa.tramitesmigratorios.seguridad.RepresentacionRepo;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.Usuario;
import pa.tramitesmigratorios.seguridad.Usuario.TipoSolicitante;
import pa.tramitesmigratorios.seguridad.UsuarioActual;
import pa.tramitesmigratorios.seguridad.UsuarioRepo;
import pa.tramitesmigratorios.verificacion.Verificacion;
import pa.tramitesmigratorios.verificacion.VerificacionRepo;

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
	private final VerificacionRepo verificaciones;
	private final UsuarioRepo usuarios;

	ExpedienteServicio(ExpedienteRepo expedientes, HistorialEstadoRepo historial, ObservacionRepo observaciones,
			AccesoExpedientes acceso, Catalogos catalogos, RepresentacionRepo representaciones, Auditoria auditoria,
			ApplicationEventPublisher eventos, VerificacionRepo verificaciones, UsuarioRepo usuarios) {
		this.expedientes = expedientes;
		this.historial = historial;
		this.observaciones = observaciones;
		this.acceso = acceso;
		this.catalogos = catalogos;
		this.representaciones = representaciones;
		this.auditoria = auditoria;
		this.eventos = eventos;
		this.verificaciones = verificaciones;
		this.usuarios = usuarios;
	}

	/**
	 * Crea el expediente a nombre del usuario autenticado. Solo puede indicarse otro titular si
	 * existe una representación acreditada vigente (P-08); de lo contrario se rechaza (CP-03).
	 * La solicitud se envía al final del asistente (P-17), así que nace en RECIBIDO.
	 */
	@Transactional
	public Expediente crear(String tipoTramite, UUID titularId, UsuarioActual usuario) {
		return crear(tipoTramite, titularId, Map.of(), usuario);
	}

	@Transactional
	public Expediente crear(String tipoTramite, UUID titularId, Map<String, Object> datosSolicitud,
			UsuarioActual usuario) {
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
		Map<String, Object> datosNormalizados = validarTitularidadDatos(titular, datosSolicitud, usuario);
		String numero = "EXP-%d-%06d".formatted(Year.now().getValue(), expedientes.siguienteNumero());
		Expediente expediente = expedientes
			.save(new Expediente(numero, titular, usuario.id(), tipo, EstadoExpediente.RECIBIDO, datosNormalizados));
		historial.save(new HistorialEstado(expediente.getId(), null, EstadoExpediente.RECIBIDO, usuario.id(),
				"Presentación de la solicitud"));
		auditoria.exito(usuario.id(), "CREAR_EXPEDIENTE", "expediente/" + expediente.getId(), "tipoTramite=" + tipo);
		return expediente;
	}


	private Map<String, Object> validarTitularidadDatos(UUID titular, Map<String, Object> datosSolicitud,
			UsuarioActual usuario) {
		if (!titular.equals(usuario.id()) || datosSolicitud == null || usuario.rol() == Rol.FUNCIONARIO) {
			return datosSolicitud;
		}
		Object raw = datosSolicitud.get("datosPersonales");
		if (!(raw instanceof Map<?, ?> personales)) {
			return datosSolicitud;
		}
		Usuario cuenta = usuarios.findById(usuario.id()).orElse(null);
		if (cuenta == null || cuenta.getTipoSolicitante() == TipoSolicitante.PASANTE_BUFETE) {
			return datosSolicitud;
		}

		String nombres = texto(personales.get("nombres"));
		String primerApellido = texto(personales.get("primerApellido"));
		String segundoApellido = texto(personales.get("segundoApellido"));
		String apellidos = primerApellido.isEmpty() && segundoApellido.isEmpty()
				? texto(personales.get("apellidos"))
				: (primerApellido + " " + segundoApellido).trim();
		String capturado = normalizar((nombres + " " + apellidos).trim());
		String nombreCuenta = normalizar(nombreCompletoCuenta(cuenta));
		if (capturado.isBlank() || (!nombreCuenta.isBlank() && !coincideNombreExacto(capturado, nombreCuenta))) {
			rechazarTitularidad(usuario);
		}

		validarCampoIdentidad(personales, "fechaNacimiento",
				cuenta.getFechaNacimiento() == null ? null : cuenta.getFechaNacimiento().toString(), false, usuario);
		validarCampoIdentidad(personales, "nacionalidad", cuenta.getNacionalidad(), false, usuario);
		validarCampoIdentidad(personales, "sexo", cuenta.getSexo(), false, usuario);
		validarCampoIdentidad(personales, "lugarNacimiento", cuenta.getLugarNacimiento(), true, usuario);
		validarCampoIdentidad(personales, "numeroDocumento", cuenta.getNumeroDocumento(), false, usuario);
		validarCampoIdentidad(personales, "tipoDocumento",
				cuenta.getTipoDocumento() == null ? null : cuenta.getTipoDocumento().name(), false, usuario);

		Map<String, Object> copia = new HashMap<>(datosSolicitud);
		Map<String, Object> personalesCopia = new HashMap<>();
		for (Map.Entry<?, ?> entry : personales.entrySet()) {
			if (entry.getKey() != null) {
				personalesCopia.put(String.valueOf(entry.getKey()), entry.getValue());
			}
		}
		if (cuenta.getFechaNacimiento() != null) {
			personalesCopia.put("fechaNacimiento", cuenta.getFechaNacimiento().toString());
		}
		if (cuenta.getNacionalidad() != null && !cuenta.getNacionalidad().isBlank()) {
			personalesCopia.put("nacionalidad", cuenta.getNacionalidad());
		}
		if (cuenta.getSexo() != null && !cuenta.getSexo().isBlank()) {
			personalesCopia.put("sexo", cuenta.getSexo());
		}
		if (cuenta.getLugarNacimiento() != null && !cuenta.getLugarNacimiento().isBlank()) {
			personalesCopia.put("lugarNacimiento", cuenta.getLugarNacimiento());
		}
		if (cuenta.getNumeroDocumento() != null && !cuenta.getNumeroDocumento().isBlank()) {
			personalesCopia.put("numeroDocumento", cuenta.getNumeroDocumento());
		}
		if (cuenta.getTipoDocumento() != null) {
			personalesCopia.put("tipoDocumento", cuenta.getTipoDocumento().name());
		}
		copia.put("datosPersonales", personalesCopia);
		return copia;
	}

	private void validarCampoIdentidad(Map<?, ?> personales, String campo, String esperado, boolean normalizarTexto,
			UsuarioActual usuario) {
		if (esperado == null || esperado.isBlank() || !personales.containsKey(campo)) {
			return;
		}
		String recibido = texto(personales.get(campo));
		boolean igual = normalizarTexto
				? normalizar(recibido).equals(normalizar(esperado))
				: recibido.equalsIgnoreCase(esperado.trim());
		if (recibido.isBlank() || !igual) {
			rechazarTitularidad(usuario);
		}
	}

	private void rechazarTitularidad(UsuarioActual usuario) {
		auditoria.denegado(usuario.id(), "CREAR_EXPEDIENTE", "titular/datos-inconsistentes");
		throw ErrorApi.entradaInvalida("datosPersonales",
				"Los datos del titular deben coincidir con la cuenta autenticada.");
	}

	private static String nombreCompletoCuenta(Usuario cuenta) {
		if (cuenta.getPrimerNombre() != null && !cuenta.getPrimerNombre().isBlank()
				&& cuenta.getPrimerApellido() != null && !cuenta.getPrimerApellido().isBlank()) {
			return String.join(" ", java.util.stream.Stream.of(cuenta.getPrimerNombre(), cuenta.getSegundoNombre(),
					cuenta.getPrimerApellido(), cuenta.getSegundoApellido())
				.filter(v -> v != null && !v.isBlank())
				.map(String::trim)
				.toList());
		}
		return cuenta.getNombre() == null ? "" : cuenta.getNombre();
	}

	private static String texto(Object valor) {
		return valor == null ? "" : String.valueOf(valor).trim();
	}

	private static String normalizar(String valor) {
		return java.text.Normalizer.normalize(valor == null ? "" : valor, java.text.Normalizer.Form.NFD)
			.replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9 ]", " ")
			.replaceAll("\\s+", " ").trim();
	}

	private static boolean coincideNombreExacto(String capturado, String cuenta) {
		List<String> tokensCapturados = Arrays.stream(capturado.split(" "))
			.filter(s -> !s.isBlank())
			.sorted()
			.toList();
		List<String> tokensCuenta = Arrays.stream(cuenta.split(" "))
			.filter(s -> !s.isBlank())
			.sorted()
			.toList();
		return tokensCapturados.equals(tokensCuenta);
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
				if (!PoliticaAreas.esInstitucional(usuario.area())) {
					yield Specification.unrestricted();
				}
				yield (r, q, cb) -> {
					var sub = q.subquery(UUID.class);
					Root<Verificacion> v = sub.from(Verificacion.class);
					sub.select(v.get("id")).where(
							cb.equal(v.get("expedienteId"), r.get("id")),
							cb.equal(v.get("asignadoAId"), usuario.id()));
					return cb.exists(sub);
				};
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
