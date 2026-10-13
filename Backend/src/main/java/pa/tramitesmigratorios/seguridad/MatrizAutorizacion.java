package pa.tramitesmigratorios.seguridad;

import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.PATCH;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import static pa.tramitesmigratorios.seguridad.Rol.AUDITOR;
import static pa.tramitesmigratorios.seguridad.Rol.FUNCIONARIO;
import static pa.tramitesmigratorios.seguridad.Rol.SOLICITANTE;
import static pa.tramitesmigratorios.seguridad.Rol.SUPERVISOR;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpMethod;

/**
 * Matriz rol × endpoint (HU-13, TASK-13.3): la única fuente de las reglas por rol. Coincide
 * con el campo {@code x-roles} de openapi.yaml y con 06-roles-y-accesos.md §6.5. Lo que no
 * aparece aquí se deniega, así que el rol ADMIN no lee ni decide expedientes por defecto.
 * La titularidad y los permisos granulares se comprueban además en cada servicio.
 */
public final class MatrizAutorizacion {

	public record Regla(HttpMethod metodo, String ruta, Set<Rol> roles) {
	}

	private static final Set<Rol> TODOS = EnumSet.allOf(Rol.class);
	private static final Set<Rol> LECTURA_EXPEDIENTE = EnumSet.of(SOLICITANTE, FUNCIONARIO, SUPERVISOR, AUDITOR);
	private static final Set<Rol> CLIENTE_Y_DESPACHO = EnumSet.of(SOLICITANTE, FUNCIONARIO);
	private static final Set<Rol> PRIVACIDAD = EnumSet.of(SOLICITANTE, FUNCIONARIO, AUDITOR);

	public static final List<Regla> REGLAS = List.of(
			new Regla(POST, "/api/auth/logout", TODOS),
			new Regla(PUT, "/api/auth/contrasena", TODOS),
			new Regla(GET, "/api/perfil", TODOS),
			new Regla(PATCH, "/api/perfil", TODOS),
			new Regla(GET, "/api/catalogos/tipos-tramite", TODOS),
			new Regla(GET, "/api/catalogos/tipos-documentales", TODOS),
			new Regla(GET, "/api/expedientes", LECTURA_EXPEDIENTE),
			new Regla(POST, "/api/expedientes", EnumSet.of(SOLICITANTE)),
			new Regla(GET, "/api/expedientes/{id}", LECTURA_EXPEDIENTE),
			new Regla(GET, "/api/expedientes/{id}/documentos", LECTURA_EXPEDIENTE),
			new Regla(POST, "/api/expedientes/{id}/documentos", CLIENTE_Y_DESPACHO),
			new Regla(GET, "/api/expedientes/{id}/documentos/{documentoId}/contenido",
					EnumSet.of(SOLICITANTE, FUNCIONARIO, SUPERVISOR)),
			new Regla(PATCH, "/api/expedientes/{id}/estado", EnumSet.of(FUNCIONARIO)),
			new Regla(GET, "/api/expedientes/{id}/historial", LECTURA_EXPEDIENTE),
			new Regla(GET, "/api/expedientes/{id}/observaciones", LECTURA_EXPEDIENTE),
			new Regla(POST, "/api/expedientes/{id}/observaciones", CLIENTE_Y_DESPACHO),
			new Regla(GET, "/api/consentimientos", PRIVACIDAD),
			new Regla(POST, "/api/consentimientos", CLIENTE_Y_DESPACHO),
			new Regla(PATCH, "/api/consentimientos/{consentimientoId}", CLIENTE_Y_DESPACHO),
			new Regla(GET, "/api/solicitudes-arco", PRIVACIDAD),
			new Regla(POST, "/api/solicitudes-arco", EnumSet.of(SOLICITANTE)),
			new Regla(GET, "/api/solicitudes-arco/{solicitudId}", PRIVACIDAD),
			new Regla(PATCH, "/api/solicitudes-arco/{solicitudId}", EnumSet.of(FUNCIONARIO)),
			new Regla(GET, "/api/notificaciones", CLIENTE_Y_DESPACHO),
			new Regla(PUT, "/api/notificaciones/{notificacionId}/leida", CLIENTE_Y_DESPACHO),
			new Regla(GET, "/api/auditoria/eventos", EnumSet.of(AUDITOR)),
			new Regla(GET, "/api/auditoria/eventos/exportacion", EnumSet.of(AUDITOR)),
			new Regla(GET, "/api/mock/te/personas/{tipoDoc}/{numero}", EnumSet.of(FUNCIONARIO)),
			new Regla(GET, "/api/mock/css/afiliaciones/{idPersona}", EnumSet.of(FUNCIONARIO)),
			new Regla(GET, "/api/mock/registro/consultas/{idPersona}", EnumSet.of(FUNCIONARIO)),
			new Regla(GET, "/api/mock/snm/expedientes/{numero}", EnumSet.of(FUNCIONARIO)));

	private MatrizAutorizacion() {
	}

}
