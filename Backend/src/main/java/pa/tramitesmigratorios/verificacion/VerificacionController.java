package pa.tramitesmigratorios.verificacion;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.fuentes.Escenario;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.UsuarioActual;
import pa.tramitesmigratorios.verificacion.MatrizFuentes.Consentimiento;
import pa.tramitesmigratorios.verificacion.MatrizFuentes.Fila;
import pa.tramitesmigratorios.verificacion.Verificacion.Estado;
import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;
import pa.tramitesmigratorios.verificacion.Verificacion.Modo;
import pa.tramitesmigratorios.verificacion.Verificacion.ResultadoMinimo;
import pa.tramitesmigratorios.verificacion.Verificaciones.Nueva;
import pa.tramitesmigratorios.verificacion.Verificaciones.Registro;

/** Verificaciones del expediente (HU-24, HU-26) y matriz de fuentes y finalidad (HU-25). */
@RestController
class VerificacionController {

	static final String IDEMPOTENCIA = "Idempotency-Key";
	static final String REPETIDA = "Idempotent-Replayed";
	private static final Pattern CLAVE_VALIDA = Pattern.compile("[A-Za-z0-9_-]{8,80}");

	/** Resultado mínimo y datos técnicos; nunca la respuesta de la fuente ni datos del titular. */
	record VerificacionDto(UUID id, UUID expedienteId, Fuente fuente, String tipoVerificacion, Modo modo,
			Estado estado, String finalidad, Instant fechaSolicitud, Instant fechaResultado,
			ResultadoMinimo resultadoMinimo, String referenciaOrigen, UUID responsableId, String nota,
			Integer intentos, Instant proximoIntento, String ultimoFallo, String correlacionId) {

		static VerificacionDto de(Verificacion v) {
			return new VerificacionDto(v.getId(), v.getExpedienteId(), v.getFuente(), v.getTipoVerificacion(),
					v.getModo(), v.getEstado(), v.getFinalidad(), v.getFechaSolicitud(), v.getFechaResultado(),
					v.getResultadoMinimo(), v.getReferenciaOrigen(), v.getResponsableId(), v.getNota(), v.getIntentos(),
					v.getProximoIntento(), v.getUltimoFallo(), v.getCorrelacionId());
		}

		/**
		 * Vista del cliente (HU-26 CA-5): solo si la verificación está pendiente o completada. No ve
		 * el resultado, el responsable, los fallos técnicos ni las notas internas.
		 */
		static VerificacionDto paraCliente(Verificacion v) {
			Estado agregado = v.getEstado().resuelta() ? Estado.RESPONDIDA : Estado.PENDIENTE;
			return new VerificacionDto(v.getId(), v.getExpedienteId(), v.getFuente(), v.getTipoVerificacion(),
					v.getModo(), agregado, null, v.getFechaSolicitud(), v.getEstado().resuelta() ? v.getFechaResultado() : null,
					null, null, null, null, null, null, null, null);
		}

	}

	record VerificacionNueva(@NotNull(message = "La fuente es obligatoria.") Fuente fuente,
			@NotBlank(message = "El tipo de verificación es obligatorio.") String tipoVerificacion,
			@NotNull(message = "El modo es obligatorio.") Modo modo,
			@NotBlank(message = "La finalidad es obligatoria.") String finalidad, Instant fechaResultado,
			ResultadoMinimo resultadoMinimo,
			@Size(max = 120, message = "Máximo 120 caracteres.") String referenciaOrigen,
			@Size(max = 500, message = "Máximo 500 caracteres.") String nota) {
	}

	record FilaMatrizDto(Fuente fuente, String tipoVerificacion, String finalidad, String descripcion,
			String baseLegal, String responsable, Consentimiento consentimiento, Set<Modo> modos,
			List<String> camposEnviados, String seGuarda) {

		static FilaMatrizDto de(Fila f) {
			return new FilaMatrizDto(f.fuente(), f.tipoVerificacion(), f.finalidad(), f.descripcion(), f.baseLegal(),
					f.responsable(), f.consentimiento(), f.modos(), f.camposEnviados(), f.seGuarda());
		}

	}

	private final Verificaciones servicio;

	VerificacionController(Verificaciones servicio) {
		this.servicio = servicio;
	}

	@GetMapping("/api/verificaciones/matriz")
	List<FilaMatrizDto> matriz() {
		return MatrizFuentes.FILAS.stream().map(FilaMatrizDto::de).toList();
	}

	@GetMapping("/api/expedientes/{id}/verificaciones")
	List<VerificacionDto> listar(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id) {
		boolean esCliente = usuario.es(Rol.SOLICITANTE);
		return servicio.listar(id, usuario)
			.stream()
			.map(esCliente ? VerificacionDto::paraCliente : VerificacionDto::de)
			.toList();
	}

	/**
	 * 201 con la verificación registrada. Si la clave de idempotencia ya se usó responde 200 con
	 * la misma verificación y el encabezado {@code Idempotent-Replayed: true}, sin repetir nada.
	 */
	@PostMapping("/api/expedientes/{id}/verificaciones")
	ResponseEntity<VerificacionDto> registrar(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id,
			@RequestHeader(value = IDEMPOTENCIA, required = false) String clave,
			@RequestHeader(value = "X-Scenario", required = false) String escenario,
			@Valid @RequestBody VerificacionNueva nueva) {
		if (clave != null && !CLAVE_VALIDA.matcher(clave).matches()) {
			throw ErrorApi.entradaInvalida(IDEMPOTENCIA, "Entre 8 y 80 letras, números, guiones o guiones bajos.");
		}
		Nueva datos = new Nueva(nueva.fuente(), nueva.tipoVerificacion(), nueva.modo(), nueva.finalidad(),
				nueva.fechaResultado(), nueva.resultadoMinimo(), nueva.referenciaOrigen(), nueva.nota());
		Registro registro;
		try {
			registro = servicio.registrar(id, datos, clave, Escenario.de(escenario), usuario);
		}
		catch (DataIntegrityViolationException e) {
			// Dos peticiones con la misma clave a la vez: la segunda devuelve lo que registró la primera.
			if (clave == null) {
				throw e;
			}
			registro = servicio.porClave(id, clave, usuario).map(v -> new Registro(v, true)).orElseThrow(() -> e);
		}
		if (registro.repetida()) {
			return ResponseEntity.ok().header(REPETIDA, "true").body(VerificacionDto.de(registro.verificacion()));
		}
		return ResponseEntity.status(HttpStatus.CREATED).body(VerificacionDto.de(registro.verificacion()));
	}

	@PostMapping("/api/expedientes/{id}/verificaciones/preparacion")
	@ResponseStatus(HttpStatus.CREATED)
	List<VerificacionDto> preparar(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id) {
		return servicio.preparar(id, usuario).stream().map(VerificacionDto::de).toList();
	}

	@PostMapping("/api/expedientes/{id}/verificaciones/{verificacionId}/atencion")
	VerificacionDto atender(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id,
			@PathVariable UUID verificacionId) {
		return VerificacionDto.de(servicio.atender(id, verificacionId, usuario));
	}

	@PostMapping("/api/expedientes/{id}/verificaciones/{verificacionId}/reintento")
	VerificacionDto reintentar(@AuthenticationPrincipal UsuarioActual usuario, @PathVariable UUID id,
			@PathVariable UUID verificacionId, @RequestHeader(value = "X-Scenario", required = false) String escenario) {
		return VerificacionDto.de(servicio.reintentar(id, verificacionId, Escenario.de(escenario), usuario));
	}

}
