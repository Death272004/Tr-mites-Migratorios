package pa.tramitesmigratorios.verificacion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.verificacion.Verificacion.Estado;
import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;
import pa.tramitesmigratorios.verificacion.Verificacion.Modo;
import pa.tramitesmigratorios.verificacion.Verificacion.ResultadoMinimo;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.EstadoTecnico;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Politica;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Respuesta;

/**
 * Pruebas unitarias del ciclo de vida de una verificación y de la matriz de fuentes
 * (TASK-27.1): estados, reintentos con espera exponencial y la regla de que un fallo técnico
 * nunca es un resultado (CP-07).
 */
class VerificacionDominioTest {

	private static final UUID EXPEDIENTE = UUID.randomUUID();
	private static final UUID RESPONSABLE = UUID.randomUUID();
	private static final Instant AHORA = Instant.parse("2026-10-28T12:00:00Z");
	/** Primer intento más dos reintentos, espera base de 100 ms. */
	private static final Politica POLITICA = new Politica(500, 2, 100);

	@Test
	void soloRespondidaYSinResultadoCuentanComoResueltas() {
		for (Estado e : Estado.values()) {
			assertThat(e.resuelta()).as(e.name()).isEqualTo(e == Estado.RESPONDIDA || e == Estado.SIN_RESULTADO);
		}
	}

	@ParameterizedTest
	@EnumSource(EstadoTecnico.class)
	void soloLasRespuestasDeLaFuenteNoSonFallos(EstadoTecnico estado) {
		assertThat(estado.esFallo())
			.isEqualTo(estado != EstadoTecnico.RESPONDIDA && estado != EstadoTecnico.SIN_RESULTADO);
	}

	@Test
	void losEstadosFinalesNoAdmitenTransiciones() {
		assertThat(Verificacion.TRANSICIONES.get(Estado.RESPONDIDA)).isEmpty();
		assertThat(Verificacion.TRANSICIONES.get(Estado.SIN_RESULTADO)).isEmpty();
		assertThat(Verificacion.TRANSICIONES).containsOnlyKeys(Estado.values());
	}

	@Test
	void simuladaRespondidaGuardaSoloElResultadoMinimo() {
		Verificacion v = Verificacion.simulada(EXPEDIENTE, Fuente.TE, "IDENTIDAD", "IDENTIDAD_DEL_TITULAR");
		assertThat(v.getEstado()).isEqualTo(Estado.ENVIADA);
		assertThat(v.getIntentos()).isEqualTo(1);
		v.aplicar(respuesta(EstadoTecnico.RESPONDIDA, ResultadoMinimo.COINCIDE), POLITICA, AHORA);
		assertThat(v.getEstado()).isEqualTo(Estado.RESPONDIDA);
		assertThat(v.getResultadoMinimo()).isEqualTo(ResultadoMinimo.COINCIDE);
		assertThat(v.getReferenciaOrigen()).isEqualTo("REF-1");
		assertThat(v.getUltimoFallo()).isNull();
	}

	@Test
	void sinResultadoDeLaFuenteEsUnResultadoNoUnError() {
		Verificacion v = Verificacion.simulada(EXPEDIENTE, Fuente.REGISTRO_PUBLICO, "INFORMACION_REGISTRAL", "X");
		v.aplicar(respuesta(EstadoTecnico.SIN_RESULTADO, ResultadoMinimo.SIN_RESULTADO), POLITICA, AHORA);
		assertThat(v.getEstado()).isEqualTo(Estado.SIN_RESULTADO);
		assertThat(v.getEstado().resuelta()).isTrue();
	}

	@Test
	void unFalloTecnicoProgramaReintentosConEsperaExponencialYLuegoQuedaEnError() {
		Verificacion v = Verificacion.simulada(EXPEDIENTE, Fuente.CSS, "AFILIACION", "AFILIACION_DEL_TITULAR");

		v.aplicar(respuesta(EstadoTecnico.TIEMPO_AGOTADO, null), POLITICA, AHORA);
		assertThat(v.getEstado()).isEqualTo(Estado.REINTENTO_PROGRAMADO);
		assertThat(v.getResultadoMinimo()).as("un fallo nunca deja resultado").isNull();
		assertThat(v.getUltimoFallo()).isEqualTo("TIEMPO_AGOTADO");
		assertThat(v.getProximoIntento()).isEqualTo(AHORA.plusMillis(100));
		assertThat(v.admiteReintento(POLITICA)).isTrue();

		v.enviar(RESPONSABLE, "corr-2");
		assertThat(v.getIntentos()).isEqualTo(2);
		assertThat(v.getProximoIntento()).isNull();
		v.aplicar(respuesta(EstadoTecnico.LIMITE_EXCEDIDO, null), POLITICA, AHORA);
		assertThat(v.getProximoIntento()).isEqualTo(AHORA.plusMillis(200));

		v.enviar(RESPONSABLE, "corr-3");
		v.aplicar(respuesta(EstadoTecnico.ERROR_TECNICO, null), POLITICA, AHORA);
		assertThat(v.getEstado()).isEqualTo(Estado.ERROR_TECNICO);
		assertThat(v.getEstado().resuelta()).isFalse();
		assertThat(v.admiteReintento(POLITICA)).isFalse();
	}

	@Test
	void agotadosLosReintentosSoloQuedaElRegistroManual() {
		Verificacion v = Verificacion.simulada(EXPEDIENTE, Fuente.TE, "IDENTIDAD", "X");
		Politica sinReintentos = new Politica(500, 0, 100);
		v.aplicar(respuesta(EstadoTecnico.RESPUESTA_INVALIDA, null), sinReintentos, AHORA);
		assertThat(v.getEstado()).isEqualTo(Estado.ERROR_TECNICO);
		assertThatThrownBy(() -> v.enviar(RESPONSABLE, "corr")).isInstanceOf(ErrorApi.class);

		v.registrarManual(new Respuesta(Fuente.TE, null, ResultadoMinimo.NO_COINCIDE, "ACTA-9", AHORA, RESPONSABLE));
		assertThat(v.getEstado()).isEqualTo(Estado.RESPONDIDA);
		assertThat(v.getModo()).isEqualTo(Modo.MANUAL_ASISTIDO);
		assertThat(v.getResponsableId()).isEqualTo(RESPONSABLE);
	}

	@Test
	void manualAsistidaNaceResueltaYNoSePuedeReabrir() {
		Verificacion v = Verificacion.manualAsistida(EXPEDIENTE, Fuente.DOCUMENTO_EXTERIOR, "LEGALIZACION", "X",
				RESPONSABLE, AHORA, ResultadoMinimo.VIGENTE, "APOSTILLA-1");
		assertThat(v.getEstado()).isEqualTo(Estado.RESPONDIDA);
		assertThat(v.getFechaResultado()).isEqualTo(AHORA);
		assertThatThrownBy(() -> v.atender(RESPONSABLE))
			.isInstanceOfSatisfying(ErrorApi.class,
					e -> assertThat(e.codigo()).isEqualTo("TRANSICION_VERIFICACION_NO_PERMITIDA"));
	}

	@Test
	void pendienteSeAtiendeAManoYCambiaDeModo() {
		Verificacion v = Verificacion.pendiente(EXPEDIENTE, Fuente.TE, "IDENTIDAD", Modo.SIMULADO, "X");
		v.atender(RESPONSABLE);
		assertThat(v.getEstado()).isEqualTo(Estado.EN_ATENCION);
		assertThat(v.getModo()).isEqualTo(Modo.MANUAL_ASISTIDO);
		assertThat(v.admiteReintento(POLITICA)).isFalse();
		v.registrarManual(new Respuesta(Fuente.TE, null, ResultadoMinimo.SIN_RESULTADO, null, AHORA, RESPONSABLE));
		assertThat(v.getEstado()).isEqualTo(Estado.SIN_RESULTADO);
	}

	@Test
	void politicaCuentaElPrimerIntentoYAcotaLaEspera() {
		assertThat(POLITICA.intentosMaximos()).isEqualTo(3);
		assertThat(POLITICA.esperaAntesDe(0)).isEqualTo(100);
		assertThat(POLITICA.esperaAntesDe(1)).isEqualTo(100);
		assertThat(POLITICA.esperaAntesDe(3)).isEqualTo(400);
		assertThat(POLITICA.esperaAntesDe(50)).isEqualTo(100L << 10);
	}

	@Test
	void laMatrizDeFuentesExcluyeAlSnmYActivaPorRequisito() {
		assertThat(MatrizFuentes.de(Fuente.SNM)).isEmpty();
		MatrizFuentes.Fila te = MatrizFuentes.de(Fuente.TE).orElseThrow();
		MatrizFuentes.Fila css = MatrizFuentes.de(Fuente.CSS).orElseThrow();
		MatrizFuentes.Fila registro = MatrizFuentes.de(Fuente.REGISTRO_PUBLICO).orElseThrow();
		assertThat(MatrizFuentes.aplica(te, Set.of())).as("TE aplica a todo trámite").isTrue();
		assertThat(MatrizFuentes.aplica(css, Set.of("PASAPORTE"))).isFalse();
		assertThat(MatrizFuentes.aplica(css, Set.of("FICHA_CSS"))).isTrue();
		assertThat(MatrizFuentes.aplica(registro, Set.of("FICHA_CSS", "ANTECEDENTES_PENALES")))
			.as("Registro Público solo se crea a pedido del despacho").isFalse();
	}

	@Test
	void datosSensiblesExigenConsentimientoExpresoYNoSalenDelDespacho() {
		assertThat(MatrizFuentes.de(Fuente.CSS).orElseThrow().consentimiento())
			.isEqualTo(MatrizFuentes.Consentimiento.EXPRESO);
		MatrizFuentes.Fila exterior = MatrizFuentes.de(Fuente.DOCUMENTO_EXTERIOR).orElseThrow();
		assertThat(exterior.consentimiento()).isEqualTo(MatrizFuentes.Consentimiento.EXPRESO);
		assertThat(exterior.camposEnviados()).isEmpty();
		assertThat(exterior.modos()).containsExactly(Modo.MANUAL_ASISTIDO);
		for (MatrizFuentes.Fila f : MatrizFuentes.FILAS) {
			assertThat(f.camposEnviados()).as(f.fuente().name()).doesNotContain("nombre", "nombreDeclarado");
		}
	}

	private static Respuesta respuesta(EstadoTecnico estado, ResultadoMinimo resultado) {
		return new Respuesta(Fuente.TE, estado, resultado, resultado == null ? null : "REF-1", AHORA, null);
	}

}
