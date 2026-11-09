package pa.tramitesmigratorios.seguridad;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import pa.tramitesmigratorios.comun.ErrorApi;

/** Sincroniza las credenciales del portal con el buzón institucional local. */
@Service
public class AprovisionadorBuzon {

	private final boolean habilitado;
	private final RestClient cliente;

	AprovisionadorBuzon(@Value("${app.correo.aprovisionamiento.habilitado:false}") boolean habilitado,
			@Value("${app.correo.aprovisionamiento.url:http://mail-provisioner:8080}") String url,
			@Value("${app.correo.aprovisionamiento.token:local-disabled}") String token) {
		this.habilitado = habilitado;
		HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
		JdkClientHttpRequestFactory peticiones = new JdkClientHttpRequestFactory(http);
		peticiones.setReadTimeout(Duration.ofSeconds(8));
		this.cliente = RestClient.builder()
			.baseUrl(url)
			.defaultHeader("X-Provisioner-Token", token)
			.requestFactory(peticiones)
			.build();
	}

	/** Crea el buzón si no existe o actualiza su contraseña si ya estaba aprovisionado. */
	public void sincronizar(String correo, String contrasena) {
		if (!habilitado) {
			return;
		}
		try {
			cliente.post()
				.uri("/accounts")
				.body(Map.of("correo", Usuario.normalizar(correo), "contrasena", contrasena))
				.retrieve()
				.toBodilessEntity();
		} catch (RestClientResponseException | ResourceAccessException error) {
			throw new ErrorApi(HttpStatus.SERVICE_UNAVAILABLE, "BUZON_NO_DISPONIBLE",
					"No fue posible preparar el correo institucional. Inténtelo nuevamente.");
		}
	}
}
