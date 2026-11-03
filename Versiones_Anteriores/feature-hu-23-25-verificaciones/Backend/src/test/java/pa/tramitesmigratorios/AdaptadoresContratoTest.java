package pa.tramitesmigratorios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutorService;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.fuentes.Escenario;
import pa.tramitesmigratorios.fuentes.Fuentes;
import pa.tramitesmigratorios.fuentes.Fuentes.AfiliacionCss;
import pa.tramitesmigratorios.fuentes.Fuentes.ConsultaRegistro;
import pa.tramitesmigratorios.fuentes.Fuentes.PersonaTe;
import pa.tramitesmigratorios.fuentes.Fuentes.Registro;
import pa.tramitesmigratorios.verificacion.Verificacion;
import pa.tramitesmigratorios.verificacion.Verificacion.Estado;
import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;
import pa.tramitesmigratorios.verificacion.Verificacion.ResultadoMinimo;
import pa.tramitesmigratorios.verificacion.adaptadores.CssSimulado;
import pa.tramitesmigratorios.verificacion.adaptadores.EjecutorFuentes;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Consulta;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.EstadoTecnico;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Politica;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.PuertoFuente;
import pa.tramitesmigratorios.verificacion.adaptadores.Puertos.Respuesta;
import pa.tramitesmigratorios.verificacion.adaptadores.RegistroManualAsistido;
import pa.tramitesmigratorios.verificacion.adaptadores.RegistroPublicoSimulado;
import pa.tramitesmigratorios.verificacion.adaptadores.TeSimulado;

/**
 * HU-23 (TASK-23.5): pruebas de contrato de los adaptadores, sin base de datos. Cada adaptador
 * responde según su contrato en los seis escenarios de las fuentes simuladas (respuesta válida,
 * sin resultado, error técnico, timeout, límite y respuesta incompleta) y el registro manual
 * asistido produce la misma respuesta normalizada. También comprueba la minimización: qué sale
 * hacia la fuente y qué queda en los registros (HU-25). CP-06, CP-07.
 */
@ExtendWith(OutputCaptureExtension.class)
class AdaptadoresContratoTest {

	private static final String NUMERO = "XF0000002";
	private static final String NOMBRE = "Tomás  Titular Ficticio";
	private static final Politica POLITICA = new Politica(150, 2, 1000);
	private static final ExecutorService EJECUTOR = EjecutorFuentes.nuevo();

	/** Fuente simulada en memoria que anota cada argumento que recibe. */
	static final class FuenteDePrueba implements Fuentes.Te, Fuentes.Css, Fuentes.RegistroPublico, Fuentes.Identificacion {

		final List<String> recibido = new ArrayList<>();

		@Override
		public Optional<PersonaTe> persona(String tipoDocumento, String numeroDocumento) {
			recibido.add("te:" + tipoDocumento + "/" + numeroDocumento);
			return NUMERO.equals(numeroDocumento)
					? Optional.of(new PersonaTe(tipoDocumento, numeroDocumento, "Tomas", "Titular Ficticio", "1985-06-30",
							"SIM-TE-0002"))
					: Optional.empty();
		}

		@Override
		public Optional<String> idPersona(String tipoDocumento, String numeroDocumento) {
			recibido.add("id:" + tipoDocumento + "/" + numeroDocumento);
			return NUMERO.equals(numeroDocumento) ? Optional.of("P-0002") : Optional.empty();
		}

		@Override
		public Optional<AfiliacionCss> afiliacion(String idPersona) {
			recibido.add("css:" + idPersona);
			return Optional.of(new AfiliacionCss(idPersona, true, "000-00-0002", 9, "2026-08-20", "SIM-CSS-0002"));
		}

		@Override
		public Optional<ConsultaRegistro> consulta(String idPersona) {
			recibido.add("rp:" + idPersona);
			return Optional.of(new ConsultaRegistro(idPersona,
					List.of(new Registro("finca", "F-000003", "Finca ficticia")), "SIM-RP-0002"));
		}

	}

	@AfterAll
	static void cerrar() {
		EJECUTOR.shutdownNow();
	}

	private static Map<Fuente, PuertoFuente> adaptadores(FuenteDePrueba fuente) {
		return Map.of(Fuente.TE, new TeSimulado(fuente, POLITICA, EJECUTOR), Fuente.CSS,
				new CssSimulado(fuente, fuente, POLITICA, EJECUTOR), Fuente.REGISTRO_PUBLICO,
				new RegistroPublicoSimulado(fuente, fuente, POLITICA, EJECUTOR));
	}

	private static Consulta consulta(Escenario escenario) {
		return new Consulta("PASAPORTE", NUMERO, NOMBRE, "correlacion-prueba-1", escenario);
	}

	@ParameterizedTest
	@EnumSource(value = Fuente.class, names = { "TE", "CSS", "REGISTRO_PUBLICO" })
	void respuestaValidaDaElResultadoMinimoYLaReferencia(Fuente fuente) {
		Respuesta respuesta = adaptadores(new FuenteDePrueba()).get(fuente).consultar(consulta(Escenario.OK));

		assertThat(respuesta.fuente()).isEqualTo(fuente);
		assertThat(respuesta.estadoTecnico()).isEqualTo(EstadoTecnico.RESPONDIDA);
		assertThat(respuesta.resultado()).isEqualTo(switch (fuente) {
			case TE -> ResultadoMinimo.COINCIDE;
			case CSS -> ResultadoMinimo.VIGENTE;
			default -> ResultadoMinimo.CON_REGISTROS;
		});
		assertThat(respuesta.referencia()).startsWith("SIM-");
		assertThat(respuesta.fecha()).isNotNull();
	}

	@ParameterizedTest
	@EnumSource(value = Fuente.class, names = { "TE", "CSS", "REGISTRO_PUBLICO" })
	void sinResultadoEsUnaRespuestaDeLaFuenteNoUnFallo(Fuente fuente) {
		PuertoFuente adaptador = adaptadores(new FuenteDePrueba()).get(fuente);

		for (Respuesta respuesta : List.of(adaptador.consultar(consulta(Escenario.SIN_RESULTADO)),
				adaptador.consultar(new Consulta("PASAPORTE", "XF9999999", NOMBRE, "correlacion-prueba-2", Escenario.OK)))) {
			assertThat(respuesta.estadoTecnico()).isEqualTo(EstadoTecnico.SIN_RESULTADO);
			assertThat(respuesta.estadoTecnico().esFallo()).isFalse();
			assertThat(respuesta.resultado()).isEqualTo(ResultadoMinimo.SIN_RESULTADO);
		}
	}

	/** CP-07: ningún fallo técnico trae resultado, y por tanto nunca equivale a "no coincide". */
	@ParameterizedTest
	@EnumSource(value = Fuente.class, names = { "TE", "CSS", "REGISTRO_PUBLICO" })
	void losFallosTecnicosNoTraenResultado(Fuente fuente) {
		PuertoFuente adaptador = adaptadores(new FuenteDePrueba()).get(fuente);
		Map<Escenario, EstadoTecnico> esperados = Map.of(Escenario.ERROR_TECNICO, EstadoTecnico.ERROR_TECNICO,
				Escenario.RATE_LIMIT, EstadoTecnico.LIMITE_EXCEDIDO, Escenario.DATOS_INCOMPLETOS,
				EstadoTecnico.RESPUESTA_INVALIDA);
		esperados.forEach((escenario, esperado) -> {
			Respuesta respuesta = adaptador.consultar(consulta(escenario));
			assertThat(respuesta.estadoTecnico()).as(escenario.name()).isEqualTo(esperado);
			assertThat(respuesta.estadoTecnico().esFallo()).isTrue();
			assertThat(respuesta.resultado()).as(escenario.name()).isNull();
		});
	}

	@ParameterizedTest
	@EnumSource(value = Fuente.class, names = { "TE", "CSS", "REGISTRO_PUBLICO" })
	void unaFuenteQueNoContestaSeCortaAlVencerElTimeout(Fuente fuente) {
		long inicio = System.nanoTime();
		Respuesta respuesta = adaptadores(new FuenteDePrueba()).get(fuente).consultar(consulta(Escenario.TIMEOUT));
		long transcurridoMs = (System.nanoTime() - inicio) / 1_000_000;

		assertThat(respuesta.estadoTecnico()).isEqualTo(EstadoTecnico.TIEMPO_AGOTADO);
		assertThat(respuesta.resultado()).isNull();
		assertThat(transcurridoMs).isGreaterThanOrEqualTo(POLITICA.timeoutMs()).isLessThan(POLITICA.timeoutMs() + 1000);
	}

	@Test
	void elTeCotejaElNombreEnLocal() {
		PuertoFuente te = adaptadores(new FuenteDePrueba()).get(Fuente.TE);

		assertThat(te.consultar(consulta(Escenario.OK)).resultado()).isEqualTo(ResultadoMinimo.COINCIDE);
		assertThat(te.consultar(new Consulta("PASAPORTE", NUMERO, "Otra Persona", "correlacion-prueba-3", Escenario.OK))
			.resultado()).isEqualTo(ResultadoMinimo.NO_COINCIDE);
	}

	/** HU-25 CA-3: hacia la fuente solo sale el documento; el nombre se coteja en local. */
	@Test
	void haciaLaFuenteSoloSaleElDocumento() {
		FuenteDePrueba fuente = new FuenteDePrueba();
		adaptadores(fuente).values().forEach(a -> a.consultar(consulta(Escenario.OK)));

		assertThat(fuente.recibido).containsExactlyInAnyOrder("te:PASAPORTE/" + NUMERO, "id:PASAPORTE/" + NUMERO,
				"css:P-0002", "id:PASAPORTE/" + NUMERO, "rp:P-0002");
		assertThat(String.join(" ", fuente.recibido)).doesNotContain("Tom", "Titular");
	}

	/** HU-25 CA-5: los registros llevan fuente, correlación y estado; ni documento ni nombre. */
	@Test
	void losRegistrosNoLlevanDatosPersonales(CapturedOutput salida) {
		adaptadores(new FuenteDePrueba()).values().forEach(a -> {
			a.consultar(consulta(Escenario.OK));
			a.consultar(consulta(Escenario.ERROR_TECNICO));
		});

		assertThat(salida.getAll()).contains("correlacion-prueba-1").doesNotContain(NUMERO, "Tom", "P-0002");
		assertThat(consulta(Escenario.OK).toString()).doesNotContain(NUMERO, "Tom");
	}

	/** CA-1: el registro manual asistido produce la misma respuesta normalizada que el modo simulado. */
	@Test
	void elRegistroManualProduceLaMismaRespuestaNormalizada() {
		Instant ahora = Instant.parse("2026-10-22T15:00:00Z");
		RegistroManualAsistido manual = new RegistroManualAsistido(Clock.fixed(ahora, ZoneOffset.UTC));
		UUID responsable = UUID.randomUUID();

		Respuesta registrada = manual.registrar(Fuente.TE, ResultadoMinimo.COINCIDE, ahora.minusSeconds(3600),
				"  Consulta pública TE  ", responsable);
		Respuesta simulada = adaptadores(new FuenteDePrueba()).get(Fuente.TE).consultar(consulta(Escenario.OK));

		assertThat(registrada.estadoTecnico()).isEqualTo(simulada.estadoTecnico());
		assertThat(registrada.resultado()).isEqualTo(simulada.resultado());
		assertThat(registrada.fuente()).isEqualTo(simulada.fuente());
		assertThat(registrada.referencia()).isEqualTo("Consulta pública TE");
		assertThat(registrada.responsableId()).isEqualTo(responsable);
		assertThat(manual.registrar(Fuente.CSS, ResultadoMinimo.SIN_RESULTADO, ahora, null, responsable).estadoTecnico())
			.isEqualTo(EstadoTecnico.SIN_RESULTADO);

		assertThatThrownBy(() -> manual.registrar(Fuente.TE, ResultadoMinimo.COINCIDE, ahora, null, null))
			.isInstanceOf(ErrorApi.class);
		assertThatThrownBy(() -> manual.registrar(Fuente.TE, ResultadoMinimo.COINCIDE, ahora.plusSeconds(60), null,
				responsable))
			.isInstanceOf(ErrorApi.class);
	}

	// ---------- Estados propios de la verificación (TASK-24.1) ----------

	@Test
	void unFalloProgramaReintentosConEsperaYAlAgotarseQuedaEnErrorTecnico() {
		Instant ahora = Instant.parse("2026-10-22T15:00:00Z");
		Verificacion v = Verificacion.pendiente(UUID.randomUUID(), Fuente.TE, "IDENTIDAD", Verificacion.Modo.SIMULADO,
				"IDENTIDAD_DEL_TITULAR");
		Respuesta fallo = new Respuesta(Fuente.TE, EstadoTecnico.TIEMPO_AGOTADO, null, null, ahora, null);

		v.enviar(UUID.randomUUID(), "c-1");
		v.aplicar(fallo, POLITICA, ahora);
		assertThat(v.getEstado()).isEqualTo(Estado.REINTENTO_PROGRAMADO);
		assertThat(v.getProximoIntento()).isEqualTo(ahora.plusMillis(1000));
		assertThat(v.admiteReintento(POLITICA)).isTrue();

		v.enviar(v.getResponsableId(), "c-2");
		v.aplicar(fallo, POLITICA, ahora);
		assertThat(v.getProximoIntento()).as("espera exponencial").isEqualTo(ahora.plusMillis(2000));

		v.enviar(v.getResponsableId(), "c-3");
		v.aplicar(fallo, POLITICA, ahora);
		assertThat(v.getEstado()).isEqualTo(Estado.ERROR_TECNICO);
		assertThat(v.getIntentos()).isEqualTo(POLITICA.intentosMaximos());
		assertThat(v.getResultadoMinimo()).isNull();
		assertThat(v.getUltimoFallo()).isEqualTo("TIEMPO_AGOTADO");
		assertThat(v.admiteReintento(POLITICA)).isFalse();
		assertThatThrownBy(() -> v.enviar(null, "c-4")).isInstanceOf(ErrorApi.class);

		// Agotados los intentos, se coteja a mano.
		v.registrarManual(new Respuesta(Fuente.TE, EstadoTecnico.RESPONDIDA, ResultadoMinimo.COINCIDE, null, ahora,
				UUID.randomUUID()));
		assertThat(v.getEstado()).isEqualTo(Estado.RESPONDIDA);
		assertThat(v.getModo()).isEqualTo(Verificacion.Modo.MANUAL_ASISTIDO);
	}

	@Test
	void unaVerificacionResueltaNoCambiaMas() {
		Verificacion v = Verificacion.manualAsistida(UUID.randomUUID(), Fuente.TE, "IDENTIDAD", "IDENTIDAD_DEL_TITULAR",
				UUID.randomUUID(), Instant.now(), ResultadoMinimo.NO_COINCIDE, null);

		assertThat(v.getEstado()).isEqualTo(Estado.RESPONDIDA);
		assertThatThrownBy(() -> v.enviar(null, "c-1")).isInstanceOf(ErrorApi.class);
		assertThatThrownBy(() -> v.atender(UUID.randomUUID())).isInstanceOf(ErrorApi.class);
	}

}
