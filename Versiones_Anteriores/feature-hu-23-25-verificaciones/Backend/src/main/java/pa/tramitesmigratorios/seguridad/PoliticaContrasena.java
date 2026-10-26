package pa.tramitesmigratorios.seguridad;

import java.util.ArrayList;
import java.util.List;

/** Política de complejidad de contraseñas (HU-12 CA-5). */
public final class PoliticaContrasena {

	public static final int LONGITUD_MINIMA = 10;
	// BCrypt solo considera los primeros 72 bytes.
	public static final int LONGITUD_MAXIMA = 72;

	private PoliticaContrasena() {
	}

	/** Devuelve los incumplimientos; vacío si la contraseña cumple la política. */
	public static List<String> incumplimientos(String contrasena, String correo) {
		List<String> faltas = new ArrayList<>();
		String valor = contrasena == null ? "" : contrasena;
		if (valor.length() < LONGITUD_MINIMA || valor.length() > LONGITUD_MAXIMA) {
			faltas.add("Debe tener entre " + LONGITUD_MINIMA + " y " + LONGITUD_MAXIMA + " caracteres.");
		}
		if (valor.chars().noneMatch(Character::isUpperCase)) {
			faltas.add("Debe incluir una letra mayúscula.");
		}
		if (valor.chars().noneMatch(Character::isLowerCase)) {
			faltas.add("Debe incluir una letra minúscula.");
		}
		if (valor.chars().noneMatch(Character::isDigit)) {
			faltas.add("Debe incluir un número.");
		}
		if (valor.chars().allMatch(Character::isLetterOrDigit)) {
			faltas.add("Debe incluir un símbolo.");
		}
		String usuario = correo == null ? "" : correo.split("@")[0].toLowerCase();
		if (usuario.length() >= 4 && valor.toLowerCase().contains(usuario)) {
			faltas.add("No debe contener su correo.");
		}
		return faltas;
	}

}
