package pa.tramitesmigratorios.expediente;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.ADMITIDO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.ARCHIVADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.CON_OBSERVACIONES;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.ENTREGADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.EN_ANALISIS;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.EN_PREPARACION;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.EN_RESOLUCION;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.NOTIFICADO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.RECIBIDO;
import static pa.tramitesmigratorios.expediente.EstadoExpediente.RESUELTO;

import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;

import pa.tramitesmigratorios.auditoria.Auditoria;
import pa.tramitesmigratorios.catalogo.Catalogos;
import pa.tramitesmigratorios.catalogo.Catalogos.Requisito;
import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.comun.Eventos.EstadoCambiado;
import pa.tramitesmigratorios.documento.DocumentoRepo;
import pa.tramitesmigratorios.expediente.EstadoExpediente.Resultado;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.UsuarioActual;
import pa.tramitesmigratorios.verificacion.Verificacion;
import pa.tramitesmigratorios.verificacion.Verificacion.Fuente;
import pa.tramitesmigratorios.verificacion.VerificacionRepo;

/**
 * Pruebas unitarias de la máquina de estados del expediente (TASK-27.1): matriz, permisos por
 * etapa, versión, prerrequisitos de la resolución y acceso por rol, sin Spring ni base de datos.
 */
class TransicionesUnitTest {

	private static final String TRAMITE = "RESIDENCIA_TEMPORAL";

	private final ExpedienteRepo expedientes = mock(ExpedienteRepo.class);
	private final HistorialEstadoRepo historial = mock(HistorialEstadoRepo.class);
	private final Catalogos catalogos = mock(Catalogos.class);
	private final DocumentoRepo documentos = mock(DocumentoRepo.class);
	private final VerificacionRepo verificaciones = mock(VerificacionRepo.class);
	private final Auditoria auditoria = mock(Auditoria.class);
	private final ApplicationEventPublisher eventos = mock(ApplicationEventPublisher.class);

	private Transiciones transiciones;

	private final UsuarioActual resolutor = funcionario(Permiso.CONSULTAR, Permiso.RESOLVER, Permiso.OBSERVAR,
			Permiso.NOTIFICAR);

	@BeforeEach
	void preparar() {
		AccesoExpedientes acceso = new AccesoExpedientes(expedientes, auditoria);
		transiciones = new Transiciones(expedientes, historial, acceso, catalogos, documentos, verificaciones,
				auditoria, eventos);
		when(catalogos.requisitosDe(TRAMITE)).thenReturn(List.of(new Requisito("PASAPORTE", "Pasaporte", true, false),
				new Requisito("FOTO", "Foto", false, false)));
		when(documentos.tiposCubiertos(any())).thenReturn(Set.of("PASAPORTE"));
		when(verificaciones.findByExpedienteId(any())).thenReturn(List.of());
	}

	@Test
	void laMatrizRecorreElFlujoCompletoHastaArchivar() {
		EstadoExpediente[] camino = { EN_PREPARACION, RECIBIDO, EN_ANALISIS, ADMITIDO, EN_RESOLUCION, RESUELTO,
				NOTIFICADO, ENTREGADO, ARCHIVADO };
		for (int i = 0; i + 1 < camino.length; i++) {
			assertThat(Transiciones.permitidas(TRAMITE, camino[i])).contains(camino[i + 1]);
		}
		assertThat(Transiciones.permitidas(TRAMITE, ARCHIVADO)).isEmpty();
	}

	@Test
	void noSePuedeSaltarEtapasNiRetrocederDesdeUnaResolucion() {
		assertThat(Transiciones.permitidas(TRAMITE, RECIBIDO)).doesNotContain(RESUELTO, ADMITIDO, EN_RESOLUCION);
		assertThat(Transiciones.permitidas(TRAMITE, RESUELTO)).containsExactly(NOTIFICADO);
		assertThat(Transiciones.permitidas(TRAMITE, NOTIFICADO)).containsExactly(ENTREGADO);
	}

	@Test
	void unTramiteDesconocidoUsaLaMatrizAprobada() {
		assertThat(Transiciones.permitidas("OTRO", RECIBIDO)).isEqualTo(Transiciones.MATRIZ.get(RECIBIDO));
		assertThat(Transiciones.POR_TRAMITE).containsKeys("RESIDENCIA_TEMPORAL", "RESIDENCIA_PERMANENTE",
				"PRORROGA_ESTADIA", "NATURALIZACION");
	}

	@ParameterizedTest
	@EnumSource(EstadoExpediente.class)
	void cadaEstadoExigeElPermisoDeSuEtapa(EstadoExpediente estado) {
		Permiso esperado = switch (estado) {
			case EN_PREPARACION, RECIBIDO, CON_OBSERVACIONES, EN_ANALISIS, ADMITIDO -> Permiso.OBSERVAR;
			case EN_RESOLUCION, RESUELTO -> Permiso.RESOLVER;
			case NOTIFICADO, ENTREGADO, ARCHIVADO -> Permiso.NOTIFICAR;
		};
		assertThat(Transiciones.permisoPara(estado)).isEqualTo(esperado);
	}

	@Test
	void estadosTerminalesNoAdmitenMasDocumentos() {
		assertThat(EnumSet.allOf(EstadoExpediente.class).stream().filter(EstadoExpediente::esTerminal))
			.containsExactlyInAnyOrder(RESUELTO, NOTIFICADO, ENTREGADO, ARCHIVADO);
	}

	@Test
	void cambioValidoGuardaHistorialAuditaYPublicaElEvento() {
		Expediente e = expediente(RECIBIDO);
		Expediente r = transiciones.cambiar(e.getId(), EN_ANALISIS, null, "  revisión inicial ", 0, resolutor);
		assertThat(r.getEstado()).isEqualTo(EN_ANALISIS);
		verify(expedientes).saveAndFlush(e);
		verify(historial).save(any(HistorialEstado.class));
		verify(auditoria).exito(eq(resolutor.id()), eq("CAMBIAR_ESTADO"), anyString(), eq("RECIBIDO -> EN_ANALISIS"));
		verify(eventos).publishEvent(any(EstadoCambiado.class));
	}

	@Test
	void transicionFueraDeLaMatrizResponde409YConservaElEstado() {
		Expediente e = expediente(RECIBIDO);
		assertThatThrownBy(() -> transiciones.cambiar(e.getId(), NOTIFICADO, null, "x", 0, resolutor))
			.isInstanceOfSatisfying(ErrorApi.class, err -> {
				assertThat(err.estado()).isEqualTo(HttpStatus.CONFLICT);
				assertThat(err.codigo()).isEqualTo("TRANSICION_NO_PERMITIDA");
			});
		assertThat(e.getEstado()).isEqualTo(RECIBIDO);
		verify(auditoria).fallo(eq(resolutor.id()), eq("CAMBIAR_ESTADO"), anyString(), anyString());
		verify(historial, never()).save(any());
	}

	@Test
	void versionDesactualizadaResponde409() {
		Expediente e = expediente(RECIBIDO);
		assertThatThrownBy(() -> transiciones.cambiar(e.getId(), EN_ANALISIS, null, "x", 7, resolutor))
			.isInstanceOfSatisfying(ErrorApi.class, err -> assertThat(err.codigo()).isEqualTo("VERSION_DESACTUALIZADA"));
		assertThat(e.getEstado()).isEqualTo(RECIBIDO);
	}

	@Test
	void resolverSinResultadoEsEntradaInvalida() {
		Expediente e = expediente(EN_RESOLUCION);
		assertThatThrownBy(() -> transiciones.cambiar(e.getId(), RESUELTO, null, "x", 0, resolutor))
			.isInstanceOfSatisfying(ErrorApi.class, err -> assertThat(err.estado()).isEqualTo(HttpStatus.BAD_REQUEST));
	}

	@Test
	void resolverGuardaElResultado() {
		Expediente e = expediente(EN_RESOLUCION);
		transiciones.cambiar(e.getId(), RESUELTO, Resultado.NEGADA, "x", 0, resolutor);
		assertThat(e.getResultado()).isEqualTo(Resultado.NEGADA);
	}

	@Test
	void pasarAResolucionExigeDocumentosObligatoriosYVerificacionesResueltas() {
		Expediente e = expediente(ADMITIDO);
		when(documentos.tiposCubiertos(e.getId())).thenReturn(Set.of());
		when(verificaciones.findByExpedienteId(e.getId()))
			.thenReturn(List.of(Verificacion.simulada(e.getId(), Fuente.TE, "IDENTIDAD", "IDENTIDAD_DEL_TITULAR")));
		assertThatThrownBy(() -> transiciones.cambiar(e.getId(), EN_RESOLUCION, null, "x", 0, resolutor))
			.isInstanceOfSatisfying(ErrorApi.class, err -> {
				assertThat(err.codigo()).isEqualTo("REQUISITOS_INCOMPLETOS");
				assertThat(err.getMessage()).contains("PASAPORTE").contains("1 verificación").doesNotContain("FOTO");
			});
		assertThat(e.getEstado()).isEqualTo(ADMITIDO);
	}

	@Test
	void funcionarioSinElPermisoDeLaEtapaRecibe403() {
		Expediente e = expediente(EN_RESOLUCION);
		UsuarioActual analista = funcionario(Permiso.CONSULTAR, Permiso.VERIFICAR, Permiso.OBSERVAR);
		assertThatThrownBy(() -> transiciones.cambiar(e.getId(), RESUELTO, Resultado.APROBADA, "x", 0, analista))
			.isInstanceOfSatisfying(ErrorApi.class, err -> assertThat(err.estado()).isEqualTo(HttpStatus.FORBIDDEN));
		verify(auditoria).denegado(eq(analista.id()), eq("ACCESO_DENEGADO"), anyString());
	}

	@Test
	void accesoDeLecturaPorRol() {
		Expediente e = expediente(RECIBIDO);
		AccesoExpedientes acceso = new AccesoExpedientes(expedientes, auditoria);
		assertThat(acceso.paraLeer(e.getId(), usuario(Rol.SUPERVISOR))).isSameAs(e);
		assertThat(acceso.paraLeer(e.getId(), usuario(Rol.AUDITOR))).isSameAs(e);
		assertThat(acceso.paraLeer(e.getId(), new UsuarioActual(e.getSolicitanteId(), Rol.SOLICITANTE, Set.of(), null)))
			.isSameAs(e);
		assertThatThrownBy(() -> acceso.paraLeer(e.getId(), usuario(Rol.ADMIN)))
			.isInstanceOfSatisfying(ErrorApi.class, err -> assertThat(err.estado()).isEqualTo(HttpStatus.FORBIDDEN));
		assertThatThrownBy(() -> acceso.paraLeer(e.getId(), funcionario()))
			.isInstanceOfSatisfying(ErrorApi.class, err -> assertThat(err.estado()).isEqualTo(HttpStatus.FORBIDDEN));
	}

	@Test
	void unExpedienteAjenoRespondeComoInexistenteAlSolicitante() {
		Expediente e = expediente(RECIBIDO);
		AccesoExpedientes acceso = new AccesoExpedientes(expedientes, auditoria);
		UsuarioActual otro = usuario(Rol.SOLICITANTE);
		assertThatThrownBy(() -> acceso.paraLeer(e.getId(), otro))
			.isInstanceOfSatisfying(ErrorApi.class, err -> assertThat(err.estado()).isEqualTo(HttpStatus.NOT_FOUND));
		verify(auditoria).denegado(eq(otro.id()), eq("ACCESO_DENEGADO"), anyString());
		assertThatThrownBy(() -> acceso.paraLeer(UUID.randomUUID(), otro))
			.isInstanceOfSatisfying(ErrorApi.class, err -> assertThat(err.estado()).isEqualTo(HttpStatus.NOT_FOUND));
	}

	@Test
	void elRepresentanteQuePresentoTambienEsTitularDelAcceso() {
		UUID titular = UUID.randomUUID();
		UUID abogado = UUID.randomUUID();
		Expediente e = new Expediente("EXP-2", titular, abogado, TRAMITE, RECIBIDO);
		assertThat(e.perteneceA(titular)).isTrue();
		assertThat(e.perteneceA(abogado)).isTrue();
		assertThat(e.perteneceA(UUID.randomUUID())).isFalse();
	}

	private Expediente expediente(EstadoExpediente estado) {
		Expediente e = new Expediente("EXP-1", UUID.randomUUID(), UUID.randomUUID(), TRAMITE, estado);
		when(expedientes.findById(e.getId())).thenReturn(Optional.of(e));
		return e;
	}

	private static UsuarioActual funcionario(Permiso... permisos) {
		Set<Permiso> set = permisos.length == 0 ? EnumSet.noneOf(Permiso.class) : EnumSet.of(permisos[0], permisos);
		return new UsuarioActual(UUID.randomUUID(), Rol.FUNCIONARIO, set, UUID.randomUUID());
	}

	private static UsuarioActual usuario(Rol rol) {
		return new UsuarioActual(UUID.randomUUID(), rol, Set.of(), UUID.randomUUID());
	}

}
