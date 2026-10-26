package pa.tramitesmigratorios.auditoria;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.comun.Pagina;
import pa.tramitesmigratorios.seguridad.UsuarioActual;

/**
 * Consulta de la bitácora (TASK-22.3). Solo lectura y solo para el rol AUDITOR; no existe
 * ninguna operación de la API que modifique o elimine eventos.
 */
@RestController
@RequestMapping("/api/auditoria/eventos")
class AuditoriaController {

	private static final Sort RECIENTES = Sort.by(Sort.Direction.DESC, "fecha");
	private static final int EXPORTACION_MAXIMA = 10_000;

	record EventoDto(UUID id, UUID actorId, String operacion, String recurso, Instant fecha, String resultado,
			String correlacionId) {

		static EventoDto de(EventoAuditoria e) {
			return new EventoDto(e.getId(), e.getActorId(), e.getOperacion(), e.getRecurso(), e.getFecha(),
					e.getResultado().name(), e.getCorrelacionId());
		}

	}

	private final EventoAuditoriaRepo repo;
	private final Auditoria auditoria;

	AuditoriaController(EventoAuditoriaRepo repo, Auditoria auditoria) {
		this.repo = repo;
		this.auditoria = auditoria;
	}

	@GetMapping
	Pagina<EventoDto> consultar(@RequestParam(required = false) LocalDate fechaDesde,
			@RequestParam(required = false) LocalDate fechaHasta, @RequestParam(required = false) UUID actorId,
			@RequestParam(required = false) String operacion, @RequestParam(required = false) String recurso,
			@RequestParam(required = false) Integer pagina, @RequestParam(required = false) Integer tamano) {
		Page<EventoAuditoria> eventos = repo.findAll(filtro(fechaDesde, fechaHasta, actorId, operacion, recurso),
				Pagina.solicitud(pagina, tamano, RECIENTES));
		return Pagina.de(eventos, EventoDto::de);
	}

	@GetMapping("/exportacion")
	ResponseEntity<byte[]> exportar(@AuthenticationPrincipal UsuarioActual usuario,
			@RequestParam(required = false) LocalDate fechaDesde, @RequestParam(required = false) LocalDate fechaHasta,
			@RequestParam(required = false) UUID actorId, @RequestParam(required = false) String operacion,
			@RequestParam(required = false) String recurso) {
		Page<EventoAuditoria> eventos = repo.findAll(filtro(fechaDesde, fechaHasta, actorId, operacion, recurso),
				PageRequest.of(0, EXPORTACION_MAXIMA, RECIENTES));
		StringBuilder csv = new StringBuilder("id,actorId,operacion,recurso,fecha,resultado,correlacionId\r\n");
		for (EventoAuditoria e : eventos) {
			csv.append(e.getId()).append(',')
				.append(e.getActorId() != null ? e.getActorId() : "").append(',')
				.append(celda(e.getOperacion())).append(',')
				.append(celda(e.getRecurso())).append(',')
				.append(e.getFecha()).append(',')
				.append(e.getResultado()).append(',')
				.append(celda(e.getCorrelacionId())).append("\r\n");
		}
		auditoria.exito(usuario.id(), "EXPORTAR_AUDITORIA", "auditoria/eventos", eventos.getNumberOfElements() + " eventos");
		return ResponseEntity.ok()
			.contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"auditoria.csv\"")
			.body(csv.toString().getBytes(StandardCharsets.UTF_8));
	}

	private static Specification<EventoAuditoria> filtro(LocalDate desde, LocalDate hasta, UUID actorId,
			String operacion, String recurso) {
		if (desde != null && hasta != null && hasta.isBefore(desde)) {
			throw ErrorApi.entradaInvalida("fechaHasta", "No puede ser anterior a fechaDesde.");
		}
		Specification<EventoAuditoria> filtro = Specification.unrestricted();
		if (desde != null) {
			Instant inicio = desde.atStartOfDay().toInstant(ZoneOffset.UTC);
			filtro = filtro.and((r, q, cb) -> cb.greaterThanOrEqualTo(r.get("fecha"), inicio));
		}
		if (hasta != null) {
			Instant fin = hasta.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
			filtro = filtro.and((r, q, cb) -> cb.lessThan(r.get("fecha"), fin));
		}
		if (actorId != null) {
			filtro = filtro.and((r, q, cb) -> cb.equal(r.get("actorId"), actorId));
		}
		if (operacion != null && !operacion.isBlank()) {
			filtro = filtro.and((r, q, cb) -> cb.equal(r.get("operacion"), operacion.trim()));
		}
		if (recurso != null && !recurso.isBlank()) {
			String patron = "%" + recurso.trim().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
			filtro = filtro.and((r, q, cb) -> cb.like(r.get("recurso"), patron, '\\'));
		}
		return filtro;
	}

	/** Entre comillas y sin fórmulas: una hoja de cálculo no debe ejecutar el contenido. */
	private static String celda(String valor) {
		String texto = valor == null ? "" : valor;
		if (!texto.isEmpty() && "=+-@".indexOf(texto.charAt(0)) >= 0) {
			texto = "'" + texto;
		}
		return '"' + texto.replace("\"", "\"\"") + '"';
	}

}
