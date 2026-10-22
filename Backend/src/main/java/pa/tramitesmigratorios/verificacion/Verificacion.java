package pa.tramitesmigratorios.verificacion;

import static pa.tramitesmigratorios.verificacion.Verificacion.Estado.EN_ATENCION;
import static pa.tramitesmigratorios.verificacion.Verificacion.Estado.ENVIADA;
import static pa.tramitesmigratorios.verificacion.Verificacion.Estado.ERROR_TECNICO;
import static pa.tramitesmigratorios.verificacion.Verificacion.Estado.PENDIENTE;
import static pa.tramitesmigratorios.verificacion.Verificacion.Estado.REINTENTO_PROGRAMADO;
import static pa.tramitesmigratorios.verificacion.Verificacion.Estado.RESPONDIDA;
import static pa.tramitesmigratorios.verificacion.Verificacion.Estado.SIN_RESULTADO;

import java.time.Instant;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Politica;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Respuesta;

/**
 * Verificación documental de un expediente. Solo guarda el resultado mínimo (fuente, fecha,
 * resultado y responsable); nunca una copia del dato institucional (HU-11 CA-6, HU-25 CA-4).
 *
 * El registro manual asistido y el modo simulado producen esta misma entidad, de modo que la
 * interfaz no cambia al alternar de modo (HU-08 CA-8). Sus estados son independientes del
 * estado del expediente y tienen sus propias transiciones (HU-24, TASK-24.1).
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

	/**
	 * Vocabulario cerrado del resultado: impide que en el resultado se escriban datos personales
	 * o copias de la respuesta de la fuente (HU-25 CA-4). Ningún valor representa un fallo técnico.
	 */
	public enum ResultadoMinimo {

		COINCIDE, NO_COINCIDE, VIGENTE, NO_VIGENTE, CON_REGISTROS, SIN_RESULTADO

	}

	/** Transiciones propias de la verificación. RESPONDIDA y SIN_RESULTADO son finales. */
	static final Map<Estado, Set<Estado>> TRANSICIONES = Map.of(
			PENDIENTE, EnumSet.of(EN_ATENCION, ENVIADA, RESPONDIDA, SIN_RESULTADO),
			EN_ATENCION, EnumSet.of(RESPONDIDA, SIN_RESULTADO),
			ENVIADA, EnumSet.of(RESPONDIDA, SIN_RESULTADO, ERROR_TECNICO, REINTENTO_PROGRAMADO),
			REINTENTO_PROGRAMADO, EnumSet.of(ENVIADA, RESPONDIDA, SIN_RESULTADO),
			// Agotados los reintentos, la fuente se coteja a mano; no se vuelve a enviar.
			ERROR_TECNICO, EnumSet.of(RESPONDIDA, SIN_RESULTADO),
			RESPONDIDA, EnumSet.noneOf(Estado.class),
			SIN_RESULTADO, EnumSet.noneOf(Estado.class));

	@Id
	private UUID id;

	@Version
	private long version;

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

	@Enumerated(EnumType.STRING)
	private ResultadoMinimo resultadoMinimo;

	private String referenciaOrigen;

	private UUID responsableId;

	private String nota;

	private int intentos;

	private Instant proximoIntento;

	/** Estado técnico del último intento fallido (TIEMPO_AGOTADO, LIMITE_EXCEDIDO...). */
	private String ultimoFallo;

	private String claveIdempotencia;

	private String correlacionId;

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

	/** Verificación que aplica al trámite y aún nadie atiende (TASK-24.2). */
	public static Verificacion pendiente(UUID expedienteId, Fuente fuente, String tipoVerificacion, Modo modo,
			String finalidad) {
		return new Verificacion(expedienteId, fuente, tipoVerificacion, modo, PENDIENTE, finalidad);
	}

	/** Modo de producción: una persona del despacho cotejó la fuente y registra el resultado. */
	public static Verificacion manualAsistida(UUID expedienteId, Fuente fuente, String tipoVerificacion,
			String finalidad, UUID responsableId, Instant fechaResultado, ResultadoMinimo resultadoMinimo,
			String referenciaOrigen) {
		Verificacion v = pendiente(expedienteId, fuente, tipoVerificacion, Modo.MANUAL_ASISTIDO, finalidad);
		v.registrarManual(new Respuesta(fuente, null, resultadoMinimo, referenciaOrigen, fechaResultado, responsableId));
		return v;
	}

	/** Modo de demostración: la consulta se envía a una fuente simulada y el resultado llega después. */
	public static Verificacion simulada(UUID expedienteId, Fuente fuente, String tipoVerificacion, String finalidad) {
		Verificacion v = new Verificacion(expedienteId, fuente, tipoVerificacion, Modo.SIMULADO, ENVIADA, finalidad);
		v.intentos = 1;
		return v;
	}

	/** Una persona del despacho toma la verificación para cotejarla a mano. */
	public void atender(UUID responsableId) {
		pasarA(EN_ATENCION);
		this.modo = Modo.MANUAL_ASISTIDO;
		this.responsableId = responsableId;
	}

	/** Registro manual asistido sobre una verificación existente; también resuelve una con error técnico. */
	public void registrarManual(Respuesta respuesta) {
		pasarA(respuesta.resultado() == ResultadoMinimo.SIN_RESULTADO ? SIN_RESULTADO : RESPONDIDA);
		this.modo = Modo.MANUAL_ASISTIDO;
		this.responsableId = respuesta.responsableId();
		this.fechaResultado = respuesta.fecha();
		this.resultadoMinimo = respuesta.resultado();
		this.referenciaOrigen = respuesta.referencia();
		this.proximoIntento = null;
	}

	/** Envío a la fuente simulada: cuenta un intento y deja la correlación técnica. */
	public void enviar(UUID responsableId, String correlacionId) {
		pasarA(ENVIADA);
		this.modo = Modo.SIMULADO;
		this.responsableId = responsableId;
		this.correlacionId = correlacionId;
		this.intentos++;
		this.proximoIntento = null;
	}

	/**
	 * Aplica la respuesta del adaptador. Un fallo técnico no deja resultado: programa un reintento
	 * con espera exponencial o, agotados los intentos, queda en ERROR_TECNICO (CP-07).
	 */
	public void aplicar(Respuesta respuesta, Politica politica, Instant ahora) {
		if (respuesta.estadoTecnico().esFallo()) {
			this.ultimoFallo = respuesta.estadoTecnico().name();
			if (intentos < politica.intentosMaximos()) {
				pasarA(REINTENTO_PROGRAMADO);
				this.proximoIntento = ahora.plusMillis(politica.esperaAntesDe(intentos));
			}
			else {
				pasarA(ERROR_TECNICO);
			}
			return;
		}
		pasarA(estadoDe(respuesta));
		this.fechaResultado = respuesta.fecha();
		this.resultadoMinimo = respuesta.resultado();
		this.referenciaOrigen = respuesta.referencia();
		this.ultimoFallo = null;
	}

	/** Compatibilidad con las pruebas del Sprint 4: respuesta positiva de la fuente simulada. */
	public void responder(ResultadoMinimo resultado, String referenciaOrigen) {
		pasarA(resultado == ResultadoMinimo.SIN_RESULTADO ? SIN_RESULTADO : RESPONDIDA);
		this.fechaResultado = Instant.now();
		this.resultadoMinimo = resultado;
		this.referenciaOrigen = referenciaOrigen;
	}

	/** El reintento solo aplica al modo simulado y dentro del tope de intentos (HU-24 CA-5). */
	public boolean admiteReintento(Politica politica) {
		return modo == Modo.SIMULADO && estado == REINTENTO_PROGRAMADO && intentos < politica.intentosMaximos();
	}

	public void conClaveIdempotencia(String clave) {
		this.claveIdempotencia = clave;
	}

	public void anotar(String nota) {
		this.nota = nota;
	}

	private static Estado estadoDe(Respuesta respuesta) {
		return respuesta.resultado() == ResultadoMinimo.SIN_RESULTADO ? SIN_RESULTADO : RESPONDIDA;
	}

	private void pasarA(Estado nuevo) {
		if (!TRANSICIONES.get(estado).contains(nuevo)) {
			throw ErrorApi.conflicto("TRANSICION_VERIFICACION_NO_PERMITIDA",
					"Una verificación en estado " + estado + " no puede pasar a " + nuevo + ".");
		}
		this.estado = nuevo;
	}

	public UUID getId() {
		return id;
	}

	public long getVersion() {
		return version;
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

	public ResultadoMinimo getResultadoMinimo() {
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

	public int getIntentos() {
		return intentos;
	}

	public Instant getProximoIntento() {
		return proximoIntento;
	}

	public String getUltimoFallo() {
		return ultimoFallo;
	}

	public String getClaveIdempotencia() {
		return claveIdempotencia;
	}

	public String getCorrelacionId() {
		return correlacionId;
	}

}
