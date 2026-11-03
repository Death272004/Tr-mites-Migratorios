package pa.tramitesmigratorios.expediente;

import java.util.UUID;

import org.springframework.stereotype.Component;

import pa.tramitesmigratorios.auditoria.Auditoria;
import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.Rol;
import pa.tramitesmigratorios.seguridad.UsuarioActual;

/**
 * Verificación de titularidad y ámbito sobre un expediente (HU-13, TASK-13.2). Es el único
 * punto por el que los servicios obtienen un expediente a partir de su identificador.
 *
 * El ámbito del personal es el despacho completo: el producto se instala para un solo bufete.
 */
@Component
public class AccesoExpedientes {

	private final ExpedienteRepo expedientes;
	private final Auditoria auditoria;

	AccesoExpedientes(ExpedienteRepo expedientes, Auditoria auditoria) {
		this.expedientes = expedientes;
		this.auditoria = auditoria;
	}

	/**
	 * Devuelve el expediente si el usuario puede leerlo. Un expediente ajeno responde igual que
	 * uno inexistente (404), para no revelar que existe (CP-03); el intento queda en auditoría.
	 */
	public Expediente paraLeer(UUID id, UsuarioActual usuario) {
		Expediente expediente = expedientes.findById(id).orElseThrow(ErrorApi::noEncontrado);
		boolean permitido = switch (usuario.rol()) {
			case SOLICITANTE -> expediente.perteneceA(usuario.id());
			case FUNCIONARIO -> usuario.tiene(Permiso.CONSULTAR);
			case SUPERVISOR, AUDITOR -> true;
			case ADMIN -> false;
		};
		if (!permitido) {
			auditoria.denegado(usuario.id(), "ACCESO_DENEGADO", "expediente/" + id);
			throw usuario.es(Rol.SOLICITANTE) ? ErrorApi.noEncontrado() : ErrorApi.sinPermiso();
		}
		return expediente;
	}

	/** Además de poder leerlo, el funcionario necesita el permiso granular indicado. */
	public Expediente paraOperar(UUID id, UsuarioActual usuario, Permiso permisoDelDespacho) {
		Expediente expediente = paraLeer(id, usuario);
		if (usuario.es(Rol.FUNCIONARIO) && !usuario.tiene(permisoDelDespacho)) {
			auditoria.denegado(usuario.id(), "ACCESO_DENEGADO", "expediente/" + id + " (" + permisoDelDespacho + ")");
			throw ErrorApi.sinPermiso();
		}
		return expediente;
	}

}
