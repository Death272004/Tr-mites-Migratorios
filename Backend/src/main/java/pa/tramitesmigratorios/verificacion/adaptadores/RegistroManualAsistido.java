package pa.tramitesmigratorios.verificacion.adaptadores;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Component;

import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;
import pa.tramitesmigratorios.verificacion.Verificacion.ResultadoMinimo;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.EstadoTecnico;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Respuesta;

/**
 * Modo de producción (HU-23 CA-1): una persona del despacho cotejó la fuente por la vía oficial y
 * registra lo que encontró. Traduce ese registro a la misma {@link Respuesta} que un adaptador
 * simulado, de modo que ambos modos producen la misma verificación.
 */
@Component
public class RegistroManualAsistido {

	private static final int REFERENCIA_MAXIMA = 120;

	private final Clock reloj;

	RegistroManualAsistido() {
		this(Clock.systemUTC());
	}

	public RegistroManualAsistido(Clock reloj) {
		this.reloj = reloj;
	}

	public Respuesta registrar(Fuente fuente, ResultadoMinimo resultado, Instant fechaResultado, String referencia,
			UUID responsableId) {
		if (responsableId == null) {
			throw ErrorApi.entradaInvalida("responsableId", "La verificación manual exige un responsable del despacho.");
		}
		if (resultado == null) {
			throw ErrorApi.entradaInvalida("resultadoMinimo", "Indique el resultado del cotejo.");
		}
		if (fechaResultado == null) {
			throw ErrorApi.entradaInvalida("fechaResultado", "Indique la fecha en que se cotejó la fuente.");
		}
		if (fechaResultado.isAfter(Instant.now(reloj))) {
			throw ErrorApi.entradaInvalida("fechaResultado", "La fecha del cotejo no puede estar en el futuro.");
		}
		String limpia = referencia == null || referencia.isBlank() ? null : referencia.trim();
		if (limpia != null && limpia.length() > REFERENCIA_MAXIMA) {
			throw ErrorApi.entradaInvalida("referenciaOrigen", "Máximo " + REFERENCIA_MAXIMA + " caracteres.");
		}
		EstadoTecnico estado = resultado == ResultadoMinimo.SIN_RESULTADO ? EstadoTecnico.SIN_RESULTADO
				: EstadoTecnico.RESPONDIDA;
		return new Respuesta(fuente, estado, resultado, limpia, fechaResultado, responsableId);
	}

}
