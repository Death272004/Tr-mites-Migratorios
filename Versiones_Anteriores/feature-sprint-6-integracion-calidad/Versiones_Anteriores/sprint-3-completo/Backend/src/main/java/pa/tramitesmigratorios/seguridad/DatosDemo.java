package pa.tramitesmigratorios.seguridad;

import java.util.EnumSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Usuarios de demostración por rol (HU-11 CA-4). Solo se crean si DEMO_USUARIOS=true y con la
 * contraseña de DEMO_CONTRASENA: ninguna contraseña vive en el código ni en las migraciones.
 * Todos los datos son ficticios.
 */
@Component
@ConditionalOnProperty(name = "app.demo.usuarios", havingValue = "true")
class DatosDemo implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(DatosDemo.class);

	private final UsuarioRepo usuarios;
	private final RepresentacionRepo representaciones;
	private final AuthServicio auth;
	private final String contrasena;

	DatosDemo(UsuarioRepo usuarios, RepresentacionRepo representaciones, AuthServicio auth,
			@Value("${app.demo.contrasena:}") String contrasena) {
		this.usuarios = usuarios;
		this.representaciones = representaciones;
		this.auth = auth;
		this.contrasena = contrasena;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (usuarios.existsByCorreo("cliente@demo.pa")) {
			return;
		}
		if (contrasena.isBlank()) {
			throw new IllegalStateException("DEMO_USUARIOS=true exige definir DEMO_CONTRASENA.");
		}
		Usuario cliente = crear("Carla Cliente (ficticia)", "cliente@demo.pa", Rol.SOLICITANTE, Set.of());
		crear("Tomás Titular (ficticio)", "cliente2@demo.pa", Rol.SOLICITANTE, Set.of());
		Usuario abogado = crear("Ana Abogada (ficticia)", "abogado@demo.pa", Rol.SOLICITANTE, Set.of());
		representaciones.save(new Representacion(abogado.getId(), cliente.getId(), "PODER_NOTARIADO"));
		crear("Rita Recepción (ficticia)", "recepcion@demo.pa", Rol.FUNCIONARIO,
				EnumSet.of(Permiso.CONSULTAR, Permiso.VERIFICAR, Permiso.OBSERVAR));
		crear("Andrés Analista (ficticio)", "analista@demo.pa", Rol.FUNCIONARIO,
				EnumSet.of(Permiso.CONSULTAR, Permiso.VERIFICAR, Permiso.OBSERVAR));
		crear("Rosa Resolutora (ficticia)", "resolutor@demo.pa", Rol.FUNCIONARIO,
				EnumSet.of(Permiso.CONSULTAR, Permiso.VERIFICAR, Permiso.RESOLVER, Permiso.NOTIFICAR));
		crear("Sara Supervisora (ficticia)", "supervisor@demo.pa", Rol.SUPERVISOR, Set.of());
		crear("Aurelio Auditor (ficticio)", "auditor@demo.pa", Rol.AUDITOR, Set.of());
		crear("Alma Administradora (ficticia)", "admin@demo.pa", Rol.ADMIN, Set.of());
		log.info("Usuarios de demostración creados (un usuario por rol, dominio demo.pa).");
	}

	private Usuario crear(String nombre, String correo, Rol rol, Set<Permiso> permisos) {
		return auth.crearUsuario(nombre, correo, contrasena, rol, permisos);
	}

}
