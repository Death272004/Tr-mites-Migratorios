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
import pa.tramitesmigratorios.seguridad.AreaInstitucional;
import pa.tramitesmigratorios.seguridad.Usuario.EstadoCuenta;
import pa.tramitesmigratorios.seguridad.Usuario.TipoSolicitante;

/** Autenticación real (HU-12): inicio y cierre de sesión, bloqueo por intentos y cambio de contraseña. */
@Service
public class AuthServicio {

	public record SesionIniciada(String token, long expiraEn, Usuario usuario) {
	}

	private final UsuarioRepo usuarios;
	private final SesionRepo sesiones;
	private final PasswordEncoder codificador;
	private final AprovisionadorBuzon buzones;
	private final Auditoria auditoria;
	private final Duration duracionToken;
	private final int intentosMaximos;
	private final Duration duracionBloqueo;
	private final boolean demoAutocompletado;
	// Se compara contra este hash cuando la cuenta no existe, para no revelarlo por el tiempo de respuesta.
	private final String hashSenuelo;

	AuthServicio(UsuarioRepo usuarios, SesionRepo sesiones, PasswordEncoder codificador,
			AprovisionadorBuzon buzones, Auditoria auditoria,
			@Value("${app.seguridad.token-minutos}") long tokenMinutos,
			@Value("${app.seguridad.intentos-maximos}") int intentosMaximos,
			@Value("${app.seguridad.bloqueo-minutos}") long bloqueoMinutos,
			@Value("${app.demo.autocompletado:false}") boolean demoAutocompletado) {
		this.usuarios = usuarios;
		this.sesiones = sesiones;
		this.codificador = codificador;
		this.buzones = buzones;
		this.auditoria = auditoria;
		this.duracionToken = Duration.ofMinutes(tokenMinutos);
		this.intentosMaximos = intentosMaximos;
		this.duracionBloqueo = Duration.ofMinutes(bloqueoMinutos);
		this.demoAutocompletado = demoAutocompletado;
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

	/**
	 * Inicio de sesión controlado para la demostración local. No devuelve ni recibe contraseñas:
	 * solo funciona cuando DEMO_AUTOCOMPLETAR está habilitado y para cuentas semilla marcadas
	 * como demo_autocompletable por la migración.
	 */
	@Transactional
	public SesionIniciada iniciarSesionDemostracion(Rol rol, TipoSolicitante tipoSolicitante,
			AreaInstitucional areaInstitucional) {
		if (!demoAutocompletado) {
			throw new ErrorApi(HttpStatus.NOT_FOUND, "AUTOCOMPLETADO_NO_DISPONIBLE",
					"El autocompletado de demostración no está habilitado.");
		}
		if (rol == null) {
			throw new ErrorApi(HttpStatus.BAD_REQUEST, "ENTRADA_INVALIDA", "Revise los datos enviados.");
		}

		Optional<Usuario> encontrado;
		AreaInstitucional area = areaInstitucional == null ? AreaInstitucional.BUFETE : areaInstitucional;
		if (rol == Rol.SOLICITANTE) {
			if (tipoSolicitante == null) {
				throw new ErrorApi(HttpStatus.BAD_REQUEST, "TIPO_SOLICITANTE_REQUERIDO",
						"Seleccione el tipo de solicitante.");
			}
			if (area != AreaInstitucional.BUFETE) {
				throw new ErrorApi(HttpStatus.BAD_REQUEST, "AREA_INSTITUCIONAL_NO_APLICA",
						"El área institucional solo aplica a cuentas internas.");
			}
			encontrado = usuarios.findFirstByDemoAutocompletableTrueAndRolAndTipoSolicitanteAndEstadoCuentaOrderByFechaCreacionAsc(
					rol, tipoSolicitante, EstadoCuenta.ACTIVA);
		} else {
			if (tipoSolicitante != null) {
				throw new ErrorApi(HttpStatus.BAD_REQUEST, "TIPO_SOLICITANTE_NO_APLICA",
						"El tipo de solicitante solo aplica a cuentas solicitantes.");
			}
			if (rol == Rol.FUNCIONARIO) {
				encontrado = usuarios.findFirstByDemoAutocompletableTrueAndRolAndAreaInstitucionalAndEstadoCuentaOrderByFechaCreacionAsc(
						rol, area, EstadoCuenta.ACTIVA);
			} else {
				if (area != AreaInstitucional.BUFETE) {
					throw new ErrorApi(HttpStatus.BAD_REQUEST, "AREA_INSTITUCIONAL_NO_APLICA",
							"El área institucional solo aplica a funcionarios.");
				}
				encontrado = usuarios.findFirstByDemoAutocompletableTrueAndRolAndEstadoCuentaOrderByFechaCreacionAsc(
						rol, EstadoCuenta.ACTIVA);
			}
		}

		Usuario usuario = encontrado.orElseThrow(() -> new ErrorApi(HttpStatus.NOT_FOUND,
				"CUENTA_DEMO_NO_DISPONIBLE", "No hay una cuenta demo para esa selección."));
		Instant ahora = Instant.now();
		usuario.registrarAccesoCorrecto();
		usuarios.save(usuario);
		String token = Tokens.nuevo();
		sesiones.save(new Sesion(usuario.getId(), Tokens.hash(token), ahora.plus(duracionToken)));
		auditoria.exito(usuario.getId(), "INICIO_SESION_DEMO", "sesion");
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
				.map(u -> new UsuarioActual(u.getId(), u.getRol(), Set.copyOf(u.getPermisos()), s.getId(),
						u.getAreaInstitucional())));
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
		buzones.sincronizar(usuario.getCorreo(), contrasenaNueva);
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
		buzones.sincronizar(correo, contrasena);
		return usuarios.save(new Usuario(nombre, correo, codificador.encode(contrasena), rol, permisos));
	}

	/** Mensaje genérico: no revela si la cuenta existe, está bloqueada o la contraseña falló (CP-02). */
	private static ErrorApi credencialesInvalidas() {
		return new ErrorApi(HttpStatus.UNAUTHORIZED, "CREDENCIALES_INVALIDAS",
				"Correo o contraseña incorrectos. Tras varios intentos fallidos la cuenta se bloquea temporalmente.");
	}

}
