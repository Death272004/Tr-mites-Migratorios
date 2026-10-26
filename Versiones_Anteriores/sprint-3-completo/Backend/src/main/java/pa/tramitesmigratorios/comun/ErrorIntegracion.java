package pa.tramitesmigratorios.comun;

import org.springframework.http.HttpStatus;

/**
 * Fallo técnico de una fuente externa o de su adaptador (HU-14 CA-4). Se distingue de un
 * resultado de verificación: un error técnico nunca equivale a un resultado negativo.
 */
public class ErrorIntegracion extends RuntimeException {

	public enum Tipo {

		ERROR_TECNICO(HttpStatus.INTERNAL_SERVER_ERROR,
				"La fuente de verificación tuvo un fallo técnico. Intente de nuevo."),
		TIEMPO_AGOTADO(HttpStatus.GATEWAY_TIMEOUT,
				"La fuente de verificación no respondió a tiempo. Intente de nuevo."),
		LIMITE_EXCEDIDO(HttpStatus.TOO_MANY_REQUESTS,
				"Se alcanzó el límite de consultas de la fuente. Intente más tarde.");

		private final HttpStatus estado;
		private final String mensaje;

		Tipo(HttpStatus estado, String mensaje) {
			this.estado = estado;
			this.mensaje = mensaje;
		}

		public HttpStatus estado() {
			return estado;
		}

	}

	private final Tipo tipo;
	private final String fuente;

	public ErrorIntegracion(Tipo tipo, String fuente) {
		super(tipo.mensaje);
		this.tipo = tipo;
		this.fuente = fuente;
	}

	public Tipo tipo() {
		return tipo;
	}

	public String fuente() {
		return fuente;
	}

}
