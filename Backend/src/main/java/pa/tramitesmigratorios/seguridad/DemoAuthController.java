package pa.tramitesmigratorios.seguridad;

import jakarta.validation.Valid;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pa.tramitesmigratorios.seguridad.AuthController.DemoAutocompletarSolicitud;
import pa.tramitesmigratorios.seguridad.AuthController.LoginRespuesta;

/**
 * Atajo de demostración local (S-01): solo se registra con el perfil explícito {@code demo}
 * y además requiere {@code DEMO_AUTOCOMPLETAR=true}.
 */
@Profile("demo")
@RestController
@RequestMapping("/api/auth")
class DemoAuthController {

	private final AuthServicio servicio;

	DemoAuthController(AuthServicio servicio) {
		this.servicio = servicio;
	}

	@PostMapping("/autocompletar")
	LoginRespuesta autocompletar(@Valid @RequestBody DemoAutocompletarSolicitud solicitud) {
		return AuthController.respuesta(servicio.iniciarSesionDemostracion(solicitud.rol(),
				solicitud.tipoSolicitante(), solicitud.areaInstitucional()));
	}

}
