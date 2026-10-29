package pa.tramitesmigratorios;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import pa.tramitesmigratorios.seguridad.Correo;

/** Sustituye la salida de correo por un buzón en memoria, para leer en las pruebas el token enviado. */
@TestConfiguration(proxyBeanMethods = false)
class BuzonPrueba {

	static final class Buzon implements Correo {

		private final Map<String, String> tokens = new ConcurrentHashMap<>();

		@Override
		public void enviarRecuperacion(String destinatario, String token, Instant expira) {
			tokens.put(destinatario, token);
		}

		/** Último token de recuperación enviado a ese correo; nulo si no se envió ninguno. */
		String tokenDe(String destinatario) {
			return tokens.get(destinatario);
		}

	}

	@Bean
	@Primary
	Buzon buzon() {
		return new Buzon();
	}

}
