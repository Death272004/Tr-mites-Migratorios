package pa.tramitesmigratorios.comun;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Asigna a cada petición un identificador de correlación que aparece en la respuesta, en el
 * cuerpo de los errores y en los registros del servidor (HU-14 CA-5).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class Correlacion extends OncePerRequestFilter {

	public static final String ENCABEZADO = "X-Correlation-Id";
	private static final String CLAVE = "correlacionId";
	private static final Pattern VALIDO = Pattern.compile("[A-Za-z0-9-]{8,64}");

	public static String actual() {
		String id = MDC.get(CLAVE);
		return id != null ? id : "sin-correlacion";
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String recibido = request.getHeader(ENCABEZADO);
		String id = recibido != null && VALIDO.matcher(recibido).matches() ? recibido : UUID.randomUUID().toString();
		MDC.put(CLAVE, id);
		response.setHeader(ENCABEZADO, id);
		try {
			chain.doFilter(request, response);
		}
		finally {
			MDC.remove(CLAVE);
		}
	}

}
