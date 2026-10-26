package pa.tramitesmigratorios.comun;

import java.util.List;

import org.springframework.http.HttpStatus;

/**
 * Error de negocio con su código HTTP y un mensaje seguro para el usuario (HU-14).
 * El mensaje nunca lleva datos personales ni detalles técnicos.
 */
public class ErrorApi extends RuntimeException {

	private final HttpStatus estado;
	private final String codigo;
	private final List<ErrorDeCampo> errores;

	public ErrorApi(HttpStatus estado, String codigo, String mensaje) {
		this(estado, codigo, mensaje, null);
	}

	public ErrorApi(HttpStatus estado, String codigo, String mensaje, List<ErrorDeCampo> errores) {
		super(mensaje);
		this.estado = estado;
		this.codigo = codigo;
		this.errores = errores;
	}

	public static ErrorApi entradaInvalida(String campo, String mensaje) {
		return new ErrorApi(HttpStatus.BAD_REQUEST, "ENTRADA_INVALIDA", "Revise los datos enviados.",
				List.of(new ErrorDeCampo(campo, mensaje)));
	}

	public static ErrorApi noAutenticado() {
		return new ErrorApi(HttpStatus.UNAUTHORIZED, "NO_AUTENTICADO", "Inicie sesión para continuar.");
	}

	public static ErrorApi sinPermiso() {
		return sinPermiso("SIN_PERMISO", "No tiene permiso para realizar esta operación.");
	}

	public static ErrorApi sinPermiso(String codigo, String mensaje) {
		return new ErrorApi(HttpStatus.FORBIDDEN, codigo, mensaje);
	}

	/** También se usa cuando el recurso existe pero no debe revelarse al usuario (CP-03). */
	public static ErrorApi noEncontrado() {
		return new ErrorApi(HttpStatus.NOT_FOUND, "NO_ENCONTRADO", "El recurso solicitado no existe.");
	}

	public static ErrorApi conflicto(String codigo, String mensaje) {
		return new ErrorApi(HttpStatus.CONFLICT, codigo, mensaje);
	}

	public HttpStatus estado() {
		return estado;
	}

	public String codigo() {
		return codigo;
	}

	public List<ErrorDeCampo> errores() {
		return errores;
	}

}
