package pa.tramitesmigratorios.auditoria;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import pa.tramitesmigratorios.auditoria.EventoAuditoria.Resultado;
import pa.tramitesmigratorios.comun.Correlacion;

/**
 * Registro de eventos de auditoría (HU-22, TASK-22.2). Escribe en su propia transacción y
 * nunca interrumpe la operación principal: si el registro falla, queda en el log del servidor.
 */
@Service
public class Auditoria {

	private static final Logger log = LoggerFactory.getLogger(Auditoria.class);
	private static final int DETALLE_MAXIMO = 300;
	private static final int RECURSO_MAXIMO = 160;

	private final EventoAuditoriaRepo repo;
	private final TransactionTemplate transaccionPropia;

	Auditoria(EventoAuditoriaRepo repo, PlatformTransactionManager transacciones) {
		this.repo = repo;
		this.transaccionPropia = new TransactionTemplate(transacciones);
		this.transaccionPropia.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
	}

	public void exito(UUID actorId, String operacion, String recurso) {
		registrar(actorId, operacion, recurso, Resultado.EXITO, null);
	}

	public void exito(UUID actorId, String operacion, String recurso, String detalle) {
		registrar(actorId, operacion, recurso, Resultado.EXITO, detalle);
	}

	public void denegado(UUID actorId, String operacion, String recurso) {
		registrar(actorId, operacion, recurso, Resultado.DENEGADO, null);
	}

	public void denegado(UUID actorId, String operacion, String recurso, String detalle) {
		registrar(actorId, operacion, recurso, Resultado.DENEGADO, detalle);
	}

	public void fallo(UUID actorId, String operacion, String recurso, String detalle) {
		registrar(actorId, operacion, recurso, Resultado.FALLO, detalle);
	}

	private void registrar(UUID actorId, String operacion, String recurso, Resultado resultado, String detalle) {
		EventoAuditoria evento = new EventoAuditoria(actorId, operacion, recortar(recurso, RECURSO_MAXIMO), resultado,
				Correlacion.actual(), recortar(detalle, DETALLE_MAXIMO));
		try {
			transaccionPropia.executeWithoutResult(estado -> repo.save(evento));
		}
		catch (RuntimeException e) {
			log.error("No se pudo registrar el evento de auditoría {} sobre {}", operacion, recurso, e);
		}
	}

	private static String recortar(String texto, int maximo) {
		return texto != null && texto.length() > maximo ? texto.substring(0, maximo) : texto;
	}

}
