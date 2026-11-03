package pa.tramitesmigratorios.seguridad;

import java.util.Set;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
import pa.tramitesmigratorios.seguridad.CuentaServicio.DatosRegistro;
import pa.tramitesmigratorios.seguridad.Usuario.TipoDocumento;

@RestController
@RequestMapping("/api/auth")
class AuthController {

	record LoginSolicitud(@NotBlank(message = "El correo es obligatorio.") @Email(
			message = "El correo no tiene un formato válido.") String correo,
			@NotBlank(message = "La contraseña es obligatoria.") @Size(max = 200,
					message = "La contraseña es demasiado larga.") String contrasena) {
	}

	record UsuarioDto(UUID id, String nombre, String correo, Rol rol, Set<Permiso> permisos,
			Usuario.EstadoCuenta estadoCuenta) {
	}

	record LoginRespuesta(String token, long expiraEn, Rol rol, UsuarioDto usuario) {
	}

	record CambioContrasenaSolicitud(@NotBlank(message = "La contraseña actual es obligatoria.") String contrasenaActual,
			@NotBlank(message = "La contraseña nueva es obligatoria.") String contrasenaNueva) {
	}

	record RegistroSolicitud(@NotNull(message = "El tipo de documento es obligatorio.") TipoDocumento tipoDocumento,
			@NotBlank(message = "El número de documento es obligatorio.") @Pattern(regexp = "[A-Za-z0-9-]{4,40}",
					message = "El número de documento solo admite letras, números y guiones (4 a 40).") String numeroDocumento,
			@NotBlank(message = "El nombre es obligatorio.") @Size(max = 120,
					message = "El nombre es demasiado largo.") String nombre,
			@NotBlank(message = "La nacionalidad es obligatoria.") @Pattern(regexp = "[A-Z]{2}",
					message = "La nacionalidad es un código de país de dos letras.") String nacionalidad,
			@NotBlank(message = "El correo es obligatorio.") @Email(
					message = "El correo no tiene un formato válido.") @Size(max = 160,
							message = "El correo es demasiado largo.") String correo,
			@NotBlank(message = "El teléfono es obligatorio.") @Pattern(regexp = PerfilController.TELEFONO,
					message = PerfilController.TELEFONO_MENSAJE) String telefono,
			@NotBlank(message = "El país de residencia es obligatorio.") @Pattern(regexp = "[A-Z]{2}",
					message = "El país de residencia es un código de país de dos letras.") String paisResidencia,
			@NotBlank(message = "La contraseña es obligatoria.") @Size(max = 200,
					message = "La contraseña es demasiado larga.") String contrasena,
			@NotNull(message = "Debe aceptar los términos y la autorización de tratamiento de datos.") @AssertTrue(
					message = "Debe aceptar los términos y la autorización de tratamiento de datos.") Boolean aceptaTratamientoDatos) {
	}

	record RecuperacionSolicitud(@NotBlank(message = "El correo es obligatorio.") @Email(
			message = "El correo no tiene un formato válido.") String correo) {
	}

	record RecuperacionConfirmacion(@NotBlank(message = "El token del enlace es obligatorio.") @Size(max = 200,
			message = "El token del enlace no es válido.") String token,
			@NotBlank(message = "La contraseña nueva es obligatoria.") @Size(max = 200,
					message = "La contraseña es demasiado larga.") String contrasenaNueva) {
	}

	private final AuthServicio servicio;
	private final CuentaServicio cuentas;

	AuthController(AuthServicio servicio, CuentaServicio cuentas) {
		this.servicio = servicio;
		this.cuentas = cuentas;
	}

	@PostMapping("/login")
	LoginRespuesta iniciarSesion(@Valid @RequestBody LoginSolicitud solicitud) {
		SesionIniciada sesion = servicio.iniciarSesion(solicitud.correo(), solicitud.contrasena());
		Usuario u = sesion.usuario();
		return new LoginRespuesta(sesion.token(), sesion.expiraEn(), u.getRol(),
				new UsuarioDto(u.getId(), u.getNombre(), u.getCorreo(), u.getRol(), u.getPermisos(),
						u.getEstadoCuenta()));
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

	@PostMapping("/registro")
	@ResponseStatus(HttpStatus.CREATED)
	UsuarioDto registrar(@Valid @RequestBody RegistroSolicitud solicitud, HttpServletRequest peticion) {
		Usuario u = cuentas.registrar(new DatosRegistro(solicitud.tipoDocumento(), solicitud.numeroDocumento(),
				solicitud.nombre(), solicitud.nacionalidad(), solicitud.correo(), solicitud.telefono(),
				solicitud.paisResidencia(), solicitud.contrasena()), peticion.getRemoteAddr());
		return new UsuarioDto(u.getId(), u.getNombre(), u.getCorreo(), u.getRol(), u.getPermisos(),
				u.getEstadoCuenta());
	}

	/** Responde igual exista o no la cuenta (CP-02). */
	@PostMapping("/recuperacion")
	@ResponseStatus(HttpStatus.ACCEPTED)
	void solicitarRecuperacion(@Valid @RequestBody RecuperacionSolicitud solicitud) {
		cuentas.solicitarRecuperacion(solicitud.correo());
	}

	@PostMapping("/recuperacion/confirmacion")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void confirmarRecuperacion(@Valid @RequestBody RecuperacionConfirmacion solicitud) {
		cuentas.confirmarRecuperacion(solicitud.token(), solicitud.contrasenaNueva());
	}

}
