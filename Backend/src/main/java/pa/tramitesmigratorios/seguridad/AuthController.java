package pa.tramitesmigratorios.seguridad;

import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import pa.tramitesmigratorios.seguridad.AuthServicio.SesionIniciada;

@RestController
@RequestMapping("/api/auth")
class AuthController {

	record LoginSolicitud(@NotBlank(message = "El correo es obligatorio.") @Email(
			message = "El correo no tiene un formato válido.") String correo,
			@NotBlank(message = "La contraseña es obligatoria.") @Size(max = 200,
					message = "La contraseña es demasiado larga.") String contrasena) {
	}

	record UsuarioDto(UUID id, String nombre, String correo, Rol rol, Usuario.EstadoCuenta estadoCuenta) {
	}

	record LoginRespuesta(String token, long expiraEn, Rol rol, UsuarioDto usuario) {
	}

	record CambioContrasenaSolicitud(@NotBlank(message = "La contraseña actual es obligatoria.") String contrasenaActual,
			@NotBlank(message = "La contraseña nueva es obligatoria.") String contrasenaNueva) {
	}

	private final AuthServicio servicio;

	AuthController(AuthServicio servicio) {
		this.servicio = servicio;
	}

	@PostMapping("/login")
	LoginRespuesta iniciarSesion(@Valid @RequestBody LoginSolicitud solicitud) {
		SesionIniciada sesion = servicio.iniciarSesion(solicitud.correo(), solicitud.contrasena());
		Usuario u = sesion.usuario();
		return new LoginRespuesta(sesion.token(), sesion.expiraEn(), u.getRol(),
				new UsuarioDto(u.getId(), u.getNombre(), u.getCorreo(), u.getRol(), u.getEstadoCuenta()));
	}

	@PostMapping("/logout")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void cerrarSesion(@AuthenticationPrincipal UsuarioActual usuario) {
		servicio.cerrarSesion(usuario);
	}

	@PutMapping("/contrasena")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void cambiarContrasena(@AuthenticationPrincipal UsuarioActual usuario,
			@Valid @RequestBody CambioContrasenaSolicitud solicitud) {
		servicio.cambiarContrasena(usuario, solicitud.contrasenaActual(), solicitud.contrasenaNueva());
	}

}
