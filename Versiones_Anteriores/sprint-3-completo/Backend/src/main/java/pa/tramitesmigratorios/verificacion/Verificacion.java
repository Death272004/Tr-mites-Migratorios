package pa.tramitesmigratorios.verificacion;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Verificación documental de un expediente. Solo guarda el resultado mínimo (fuente, fecha,
 * resultado y responsable); nunca una copia del dato institucional (HU-11 CA-6).
 *
 * El registro manual asistido y el modo simulado producen esta misma entidad, de modo que la
 * interfaz no cambia al alternar de modo (HU-08 CA-8). Los endpoints llegan con la HU-24.
 */
@Entity
@Table(name = "verificacion")
public class Verificacion {

	public enum Fuente {

		TE, CSS, REGISTRO_PUBLICO, SNM, DOCUMENTO_EXTERIOR

	}

	public enum Modo {

		MANUAL_ASISTIDO, SIMULADO

	}

	public enum Estado {

		PENDIENTE, EN_ATENCION, ENVIADA, RESPONDIDA, SIN_RESULTADO, ERROR_TECNICO, REINTENTO_PROGRAMADO;

		/** La verificación ya tiene resultado; un error técnico nunca cuenta como resultado. */
		public boolean resuelta() {
			return this == RESPONDIDA || this == SIN_RESULTADO;
		}

	}

	@Id
	private UUID id;

	private UUID expedienteId;

	@Enumerated(EnumType.STRING)
	private Fuente fuente;

	private String tipoVerificacion;

	@Enumerated(EnumType.STRING)
	private Modo modo;

	@Enumerated(EnumType.STRING)
	private Estado estado;

	private String finalidad;

	private Instant fechaSolicitud;

	private Instant fechaResultado;

	private String resultadoMinimo;

	private String referenciaOrigen;

	private UUID responsableId;

	private String nota;

	protected Verificacion() {
	}

	private Verificacion(UUID expedienteId, Fuente fuente, String tipoVerificacion, Modo modo, Estado estado,
			String finalidad) {
		this.id = UUID.randomUUID();
		this.expedienteId = expedienteId;
		this.fuente = fuente;
		this.tipoVerificacion = tipoVerificacion;
		this.modo = modo;
		this.estado = estado;
		this.finalidad = finalidad;
		this.fechaSolicitud = Instant.now();
	}

	/** Modo de producción: una persona del despacho cotejó la fuente y registra el resultado. */
	public static Verificacion manualAsistida(UUID expedienteId, Fuente fuente, String tipoVerificacion,
			String finalidad, UUID responsableId, Instant fechaResultado, String resultadoMinimo,
			String referenciaOrigen) {
		Verificacion v = new Verificacion(expedienteId, fuente, tipoVerificacion, Modo.MANUAL_ASISTIDO,
				Estado.RESPONDIDA, finalidad);
		v.responsableId = responsableId;
		v.fechaResultado = fechaResultado;
		v.resultadoMinimo = resultadoMinimo;
		v.referenciaOrigen = referenciaOrigen;
		return v;
	}

	/** Modo de demostración: la consulta se envía a una fuente simulada y el resultado llega después. */
	public static Verificacion simulada(UUID expedienteId, Fuente fuente, String tipoVerificacion, String finalidad) {
		return new Verificacion(expedienteId, fuente, tipoVerificacion, Modo.SIMULADO, Estado.ENVIADA, finalidad);
	}

	public void responder(String resultadoMinimo, String referenciaOrigen) {
		this.estado = Estado.RESPONDIDA;
		this.fechaResultado = Instant.now();
		this.resultadoMinimo = resultadoMinimo;
		this.referenciaOrigen = referenciaOrigen;
	}

	public void marcar(Estado estado) {
		this.estado = estado;
	}

	public UUID getId() {
		return id;
	}

	public UUID getExpedienteId() {
		return expedienteId;
	}

	public Fuente getFuente() {
		return fuente;
	}

	public String getTipoVerificacion() {
		return tipoVerificacion;
	}

	public Modo getModo() {
		return modo;
	}

	public Estado getEstado() {
		return estado;
	}

	public String getFinalidad() {
		return finalidad;
	}

	public Instant getFechaSolicitud() {
		return fechaSolicitud;
	}

	public Instant getFechaResultado() {
		return fechaResultado;
	}

	public String getResultadoMinimo() {
		return resultadoMinimo;
	}

	public String getReferenciaOrigen() {
		return referenciaOrigen;
	}

	public UUID getResponsableId() {
		return responsableId;
	}

	public String getNota() {
		return nota;
	}

}
