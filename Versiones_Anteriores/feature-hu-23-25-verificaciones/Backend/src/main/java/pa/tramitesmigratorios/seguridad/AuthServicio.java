package pa.tramitesmigratorios.seguridad;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pa.tramitesmigratorios.auditoria.Auditoria;
import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.comun.ErrorDeCampo;
import pa.tramitesmigratorios.seguridad.Usuario.EstadoCuenta;

/** Autenticación real (HU-12): inicio y cierre de sesión, bloqueo por intentos y cambio de contraseña. */
@Service
public class AuthServicio {

	public record SesionIniciada(String token, long expiraEn, Usuario usuario) {
	}

	private final UsuarioRepo usuarios;
	private final SesionRepo sesiones;
	private final PasswordEncoder codificador;
	private final Auditoria auditoria;
	private final Duration duracionToken;
	private final int intentosMaximos;
	private final Duration duracionBloqueo;
	// Se compara contra este hash cuando la cuenta no existe, para no revelarlo por el tiempo de respuesta.
	private final String hashSenuelo;

	AuthServicio(UsuarioRepo usuarios, SesionRepo sesiones, PasswordEncoder codificador, Auditoria auditoria,
			@Value("${app.seguridad.token-minutos}") long tokenMinutos,
			@Value("${app.seguridad.intentos-maximos}") int intentosMaximos,
			@Value("${app.seguridad.bloqueo-minutos}") long bloqueoMinutos) {
		this.usuarios = usuarios;
		this.sesiones = sesiones;
		this.codificador = codificador;
		this.auditoria = auditoria;
		this.duracionToken = Duration.ofMinutes(tokenMinutos);
		this.intentosMaximos = intentosMaximos;
		this.duracionBloqueo = Duration.ofMinutes(bloqueoMinutos);
		this.hashSenuelo = codificador.encode(Tokens.nuevo());
	}

	/**
	 * Sin transacción envolvente a propósito: el conteo de intentos fallidos debe guardarse
	 * aunque la operación termine en error.
	 */
	public SesionIniciada iniciarSesion(String correo, String contrasena) {
		Instant ahora = Instant.now();
		Optional<Usuario> encontrado = usuarios.findByCorreo(Usuario.normalizar(correo));
		if (encontrado.isEmpty()) {
			codificador.matches(contrasena, hashSenuelo);
			auditoria.fallo(null, "INICIO_SESION", "sesion", "Credenciales inválidas");
			throw credencialesInvalidas();
		}
		Usuario usuario = encontrado.get();
		boolean coincide = codificador.matches(contrasena, usuario.getContrasenaHash());
		if (usuario.getEstadoCuenta() != EstadoCuenta.ACTIVA || usuario.bloqueada(ahora)) {
			auditoria.fallo(usuario.getId(), "INICIO_SESION", "sesion", "Cuenta no disponible");
			throw credencialesInvalidas();
		}
		if (!coincide) {
			boolean bloqueo = usuario.registrarIntentoFallido(intentosMaximos, ahora.plus(duracionBloqueo));
			usuarios.save(usuario);
			auditoria.fallo(usuario.getId(), "INICIO_SESION", "sesion",
					bloqueo ? "Cuenta bloqueada temporalmente por intentos fallidos" : "Credenciales inválidas");
			throw credencialesInvalidas();
		}
		usuario.registrarAccesoCorrecto();
		usuarios.save(usuario);
		String token = Tokens.nuevo();
		sesiones.save(new Sesion(usuario.getId(), Tokens.hash(token), ahora.plus(duracionToken)));
		auditoria.exito(usuario.getId(), "INICIO_SESION", "sesion");
		return new SesionIniciada(token, duracionToken.toSeconds(), usuario);
	}

	/** Resuelve el token de una petición; vacío si no existe, expiró, fue revocado o la cuenta no está activa. */
	@Transactional(readOnly = true)
	public Optional<UsuarioActual> autenticar(String token) {
		Instant ahora = Instant.now();
		return sesiones.findByTokenHash(Tokens.hash(token))
			.filter(s -> s.vigente(ahora))
			.flatMap(s -> usuarios.findById(s.getUsuarioId())
				.filter(u -> u.getEstadoCuenta() == EstadoCuenta.ACTIVA)
				.map(u -> new UsuarioActual(u.getId(), u.getRol(), Set.copyOf(u.getPermisos()), s.getId())));
	}

	@Transactional
	public void cerrarSesion(UsuarioActual actual) {
		sesiones.findById(actual.sesionId()).ifPresent(Sesion::revocar);
		auditoria.exito(actual.id(), "CIERRE_SESION", "sesion");
	}

	@Transactional
	public void cambiarContrasena(UsuarioActual actual, String contrasenaActual, String contrasenaNueva) {
		Usuario usuario = usuarios.findById(actual.id()).orElseThrow(ErrorApi::noAutenticado);
		if (!codificador.matches(contrasenaActual, usuario.getContrasenaHash())) {
			auditoria.fallo(actual.id(), "CAMBIO_CONTRASENA", "usuario/" + actual.id(), "Contraseña actual incorrecta");
			throw ErrorApi.entradaInvalida("contrasenaActual", "La contraseña actual no es correcta.");
		}
		List<String> faltas = PoliticaContrasena.incumplimientos(contrasenaNueva, usuario.getCorreo());
		if (codificador.matches(contrasenaNueva, usuario.getContrasenaHash())) {
			faltas.add("Debe ser distinta de la actual.");
		}
		if (!faltas.isEmpty()) {
			throw new ErrorApi(HttpStatus.BAD_REQUEST, "ENTRADA_INVALIDA", "Revise los datos enviados.",
					faltas.stream().map(f -> new ErrorDeCampo("contrasenaNueva", f)).toList());
		}
		usuario.cambiarContrasena(codificador.encode(contrasenaNueva));
		// Las demás sesiones abiertas dejan de servir; la actual continúa.
		sesiones.revocarOtras(usuario.getId(), actual.sesionId());
		auditoria.exito(actual.id(), "CAMBIO_CONTRASENA", "usuario/" + actual.id());
	}

	/** Alta de cuentas para datos de demostración y pruebas; valida la política de contraseñas. */
	@Transactional
	public Usuario crearUsuario(String nombre, String correo, String contrasena, Rol rol, Set<Permiso> permisos) {
		List<String> faltas = PoliticaContrasena.incumplimientos(contrasena, correo);
		if (!faltas.isEmpty()) {
			throw new IllegalArgumentException("La contraseña no cumple la política: " + String.join(" ", faltas));
		}
		return usuarios.save(new Usuario(nombre, correo, codificador.encode(contrasena), rol, permisos));
	}

	/** Mensaje genérico: no revela si la cuenta existe, está bloqueada o la contraseña falló (CP-02). */
	private static ErrorApi credencialesInvalidas() {
		return new ErrorApi(HttpStatus.UNAUTHORIZED, "CREDENCIALES_INVALIDAS",
				"Correo o contraseña incorrectos. Tras varios intentos fallidos la cuenta se bloquea temporalmente.");
	}

}
