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
import pa.tramitesmigratorios.seguridad.Usuario.Idioma;
import pa.tramitesmigratorios.seguridad.Usuario.MedioNotificacion;
import pa.tramitesmigratorios.seguridad.Usuario.TipoDocumento;

/**
 * Cuenta del portal del cliente: registro (P-02), recuperación de contraseña (P-04) y perfil
 * (P-05). Completa la HU-12 para que el Frontend conecte esas pantallas (TASK-12.5).
 */
@Service
public class CuentaServicio {

	public record DatosRegistro(TipoDocumento tipoDocumento, String numeroDocumento, String nombre,
			String nacionalidad, String correo, String telefono, String paisResidencia, String contrasena) {
	}

	private final UsuarioRepo usuarios;
	private final SesionRepo sesiones;
	private final RecuperacionContrasenaRepo recuperaciones;
	private final PasswordEncoder codificador;
	private final Correo correo;
	private final Auditoria auditoria;
	private final Duration duracionEnlace;

	CuentaServicio(UsuarioRepo usuarios, SesionRepo sesiones, RecuperacionContrasenaRepo recuperaciones,
			PasswordEncoder codificador, Correo correo, Auditoria auditoria,
			@Value("${app.seguridad.recuperacion-minutos}") long recuperacionMinutos) {
		this.usuarios = usuarios;
		this.sesiones = sesiones;
		this.recuperaciones = recuperaciones;
		this.codificador = codificador;
		this.correo = correo;
		this.auditoria = auditoria;
		this.duracionEnlace = Duration.ofMinutes(recuperacionMinutos);
	}

	/** El registro público solo crea cuentas SOLICITANTE; el rol nunca llega en la petición. */
	@Transactional
	public Usuario registrar(DatosRegistro datos, String ip) {
		List<String> faltas = PoliticaContrasena.incumplimientos(datos.contrasena(), datos.correo());
		if (!faltas.isEmpty()) {
			throw contrasenaInvalida("contrasena", faltas);
		}
		if (usuarios.existsByCorreo(Usuario.normalizar(datos.correo()))) {
			auditoria.fallo(null, "REGISTRO_CUENTA", "usuario", "Correo ya registrado");
			throw ErrorApi.conflicto("CORREO_YA_REGISTRADO", "Ya existe una cuenta con ese correo.");
		}
		if (usuarios.existsByTipoDocumentoAndNumeroDocumento(datos.tipoDocumento(),
				Usuario.normalizarDocumento(datos.numeroDocumento()))) {
			auditoria.fallo(null, "REGISTRO_CUENTA", "usuario", "Documento ya registrado");
			throw ErrorApi.conflicto("DOCUMENTO_YA_REGISTRADO", "Ya existe una cuenta con ese documento.");
		}
		Usuario usuario = new Usuario(datos.nombre().trim(), datos.correo(), codificador.encode(datos.contrasena()),
				Rol.SOLICITANTE, Set.of());
		usuario.completarRegistro(datos.tipoDocumento(), datos.numeroDocumento(), datos.nacionalidad(),
				datos.paisResidencia(), datos.telefono(), ip);
		usuarios.save(usuario);
		auditoria.exito(usuario.getId(), "REGISTRO_CUENTA", "usuario/" + usuario.getId());
		return usuario;
	}

	/**
	 * No informa al llamador si la cuenta existe: el controlador responde siempre lo mismo.
	 * Cada solicitud anula los enlaces anteriores de la cuenta.
	 */
	@Transactional
	public void solicitarRecuperacion(String correoSolicitado) {
		Optional<Usuario> encontrado = usuarios.findByCorreo(Usuario.normalizar(correoSolicitado))
			.filter(u -> u.getEstadoCuenta() == EstadoCuenta.ACTIVA);
		if (encontrado.isEmpty()) {
			auditoria.fallo(null, "RECUPERACION_SOLICITADA", "usuario", "Cuenta no disponible");
			return;
		}
		Usuario usuario = encontrado.get();
		recuperaciones.anularPendientes(usuario.getId());
		String token = Tokens.nuevo();
		Instant expira = Instant.now().plus(duracionEnlace);
		recuperaciones.save(new RecuperacionContrasena(usuario.getId(), Tokens.hash(token), expira));
		correo.enviarRecuperacion(usuario.getCorreo(), token, expira);
		auditoria.exito(usuario.getId(), "RECUPERACION_SOLICITADA", "usuario/" + usuario.getId());
	}

	@Transactional
	public void confirmarRecuperacion(String token, String contrasenaNueva) {
		Instant ahora = Instant.now();
		Optional<RecuperacionContrasena> enlace = recuperaciones.findByTokenHash(Tokens.hash(token))
			.filter(r -> r.vigente(ahora));
		Optional<Usuario> titular = enlace.flatMap(r -> usuarios.findById(r.getUsuarioId()))
			.filter(u -> u.getEstadoCuenta() == EstadoCuenta.ACTIVA);
		if (titular.isEmpty()) {
			auditoria.fallo(null, "RECUPERACION_CONFIRMADA", "usuario", "Enlace inválido o vencido");
			throw new ErrorApi(HttpStatus.BAD_REQUEST, "ENLACE_INVALIDO",
					"El enlace de recuperación no es válido o ya venció. Solicite uno nuevo.");
		}
		Usuario usuario = titular.get();
		List<String> faltas = PoliticaContrasena.incumplimientos(contrasenaNueva, usuario.getCorreo());
		if (codificador.matches(contrasenaNueva, usuario.getContrasenaHash())) {
			faltas.add("Debe ser distinta de la actual.");
		}
		if (!faltas.isEmpty()) {
			// El enlace no se consume: el titular puede reintentar con otra contraseña.
			throw contrasenaInvalida("contrasenaNueva", faltas);
		}
		usuario.cambiarContrasena(codificador.encode(contrasenaNueva));
		// Quien recupera la contraseña también sale del bloqueo temporal por intentos.
		usuario.registrarAccesoCorrecto();
		enlace.get().usar();
		sesiones.revocarTodas(usuario.getId());
		auditoria.exito(usuario.getId(), "RECUPERACION_CONFIRMADA", "usuario/" + usuario.getId());
	}

	@Transactional(readOnly = true)
	public Usuario perfil(UsuarioActual actual) {
		return usuarios.findById(actual.id()).orElseThrow(ErrorApi::noAutenticado);
	}

	/** Nombre, documento y correo no se cambian desde el perfil. */
	@Transactional
	public Usuario actualizarPerfil(UsuarioActual actual, String telefono, Idioma idiomaNotificacion,
			MedioNotificacion medioNotificacion) {
		Usuario usuario = usuarios.findById(actual.id()).orElseThrow(ErrorApi::noAutenticado);
		usuario.actualizarContacto(telefono, idiomaNotificacion, medioNotificacion);
		auditoria.exito(actual.id(), "ACTUALIZACION_PERFIL", "usuario/" + actual.id());
		return usuario;
	}

	private static ErrorApi contrasenaInvalida(String campo, List<String> faltas) {
		return new ErrorApi(HttpStatus.BAD_REQUEST, "ENTRADA_INVALIDA", "Revise los datos enviados.",
				faltas.stream().map(f -> new ErrorDeCampo(campo, f)).toList());
	}

}
