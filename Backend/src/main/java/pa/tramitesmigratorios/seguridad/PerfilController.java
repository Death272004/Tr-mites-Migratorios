package pa.tramitesmigratorios.seguridad;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pa.tramitesmigratorios.seguridad.Usuario.Idioma;
import pa.tramitesmigratorios.seguridad.Usuario.MedioNotificacion;
import pa.tramitesmigratorios.seguridad.Usuario.TipoDocumento;
import pa.tramitesmigratorios.seguridad.Usuario.TipoSolicitante;

/** Perfil del usuario autenticado (P-05): siempre el propio, nunca el de otra cuenta. */
@RestController
@RequestMapping("/api/perfil")
class PerfilController {

	static final String TELEFONO = "\\+?[0-9][0-9 ()-]{6,28}";
	static final String TELEFONO_MENSAJE = "El teléfono lleva código de país y número (7 a 30 caracteres).";

	record PerfilDto(UUID id, String nombre, String correo, Rol rol, TipoDocumento tipoDocumento,
			TipoSolicitante tipoSolicitante, String numeroDocumento, String nacionalidad, String paisResidencia,
			String telefono, String primerNombre, String segundoNombre, String primerApellido, String segundoApellido,
			LocalDate fechaNacimiento, String sexo, String estadoCivil, String lugarNacimiento,
			Idioma idiomaNotificacion, MedioNotificacion medioNotificacion, AreaInstitucional areaInstitucional) {

		static PerfilDto de(Usuario u) {
			return new PerfilDto(u.getId(), u.getNombre(), u.getCorreo(), u.getRol(), u.getTipoDocumento(),
					u.getTipoSolicitante(), u.getNumeroDocumento(), u.getNacionalidad(), u.getPaisResidencia(),
					u.getTelefono(), u.getPrimerNombre(), u.getSegundoNombre(), u.getPrimerApellido(),
					u.getSegundoApellido(), u.getFechaNacimiento(), u.getSexo(), u.getEstadoCivil(),
					u.getLugarNacimiento(), u.getIdiomaNotificacion(), u.getMedioNotificacion(),
					u.getAreaInstitucional());
		}

	}

	record PerfilCambio(@Pattern(regexp = TELEFONO, message = TELEFONO_MENSAJE) String telefono,
			Idioma idiomaNotificacion, MedioNotificacion medioNotificacion) {
	}

	private final CuentaServicio cuentas;

	PerfilController(CuentaServicio cuentas) {
		this.cuentas = cuentas;
	}

	@GetMapping
	PerfilDto consultar(@AuthenticationPrincipal UsuarioActual usuario) {
		return PerfilDto.de(cuentas.perfil(usuario));
	}

	@PatchMapping
	PerfilDto actualizar(@AuthenticationPrincipal UsuarioActual usuario, @Valid @RequestBody PerfilCambio cambio) {
		return PerfilDto.de(cuentas.actualizarPerfil(usuario, cambio.telefono(), cambio.idiomaNotificacion(),
				cambio.medioNotificacion()));
	}

}
