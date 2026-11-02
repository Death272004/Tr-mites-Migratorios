package pa.tramitesmigratorios.comun;

import java.util.List;

import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Manejador global de excepciones (HU-14): toda respuesta de error usa el mismo cuerpo
 * (código, mensaje seguro y correlación) y nunca expone trazas, esquema ni datos personales.
 */
@RestControllerAdvice
public class ManejadorErrores extends ResponseEntityExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(ManejadorErrores.class);

	@ExceptionHandler(ErrorApi.class)
	ResponseEntity<ErrorRespuesta> errorApi(ErrorApi e) {
		return ResponseEntity.status(e.estado())
			.body(new ErrorRespuesta(e.codigo(), e.getMessage(), Correlacion.actual(), e.errores()));
	}

	@ExceptionHandler(ErrorIntegracion.class)
	ResponseEntity<ErrorRespuesta> errorIntegracion(ErrorIntegracion e) {
		log.warn("Fallo técnico de la fuente {}: {}", e.fuente(), e.tipo());
		return ResponseEntity.status(e.tipo().estado()).body(ErrorRespuesta.de(e.tipo().name(), e.getMessage()));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	ResponseEntity<ErrorRespuesta> restriccion(ConstraintViolationException e) {
		List<ErrorDeCampo> errores = e.getConstraintViolations().stream().map(v -> {
			String ruta = v.getPropertyPath().toString();
			return new ErrorDeCampo(ruta.substring(ruta.lastIndexOf('.') + 1), v.getMessage());
		}).toList();
		return ResponseEntity.badRequest().body(entradaInvalida(errores));
	}

	@ExceptionHandler(ObjectOptimisticLockingFailureException.class)
	ResponseEntity<ErrorRespuesta> concurrencia(ObjectOptimisticLockingFailureException e) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
			.body(ErrorRespuesta.de("VERSION_DESACTUALIZADA",
					"El recurso cambió mientras lo editaba. Vuelva a cargarlo e intente de nuevo."));
	}

	@ExceptionHandler(Exception.class)
	ResponseEntity<ErrorRespuesta> inesperado(Exception e) {
		// La traza queda solo en el registro del servidor, junto a la correlación.
		log.error("Error interno no controlado", e);
		return ResponseEntity.internalServerError()
			.body(ErrorRespuesta.de("ERROR_INTERNO", mensaje(HttpStatus.INTERNAL_SERVER_ERROR)));
	}

	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException e,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		List<ErrorDeCampo> errores = e.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(f -> new ErrorDeCampo(f.getField(), f.getDefaultMessage()))
			.toList();
		return ResponseEntity.badRequest().body(entradaInvalida(errores));
	}

	@Override
	protected ResponseEntity<Object> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		return ResponseEntity.badRequest()
			.body(entradaInvalida(
					List.of(new ErrorDeCampo("archivo", "El archivo supera el tamaño máximo permitido."))));
	}

	/** Errores estándar de Spring MVC (JSON ilegible, parámetro faltante, método no permitido…). */
	@Override
	protected ResponseEntity<Object> handleExceptionInternal(Exception e, Object body, HttpHeaders headers,
			HttpStatusCode status, WebRequest request) {
		HttpStatus estado = HttpStatus.valueOf(status.value());
		if (estado.is5xxServerError()) {
			log.error("Error interno", e);
		}
		return ResponseEntity.status(estado).headers(headers).body(ErrorRespuesta.de(codigo(estado), mensaje(estado)));
	}

	private static ErrorRespuesta entradaInvalida(List<ErrorDeCampo> errores) {
		return new ErrorRespuesta("ENTRADA_INVALIDA", mensaje(HttpStatus.BAD_REQUEST), Correlacion.actual(), errores);
	}

	public static String codigo(HttpStatus estado) {
		return switch (estado) {
			case BAD_REQUEST -> "ENTRADA_INVALIDA";
			case UNAUTHORIZED -> "NO_AUTENTICADO";
			case FORBIDDEN -> "SIN_PERMISO";
			case NOT_FOUND -> "NO_ENCONTRADO";
			case CONFLICT -> "CONFLICTO";
			case METHOD_NOT_ALLOWED -> "METODO_NO_PERMITIDO";
			case UNSUPPORTED_MEDIA_TYPE -> "FORMATO_NO_SOPORTADO";
			default -> estado.is5xxServerError() ? "ERROR_INTERNO" : "SOLICITUD_RECHAZADA";
		};
	}

	public static String mensaje(HttpStatus estado) {
		return switch (estado) {
			case BAD_REQUEST -> "Revise los datos enviados.";
			case UNAUTHORIZED -> "Inicie sesión para continuar.";
			case FORBIDDEN -> "No tiene permiso para realizar esta operación.";
			case NOT_FOUND -> "El recurso solicitado no existe.";
			case CONFLICT -> "La operación no es compatible con el estado actual del recurso.";
			default -> estado.is5xxServerError() ? "Ocurrió un error interno. Intente de nuevo más tarde."
					: "No se pudo procesar la solicitud.";
		};
	}

}
