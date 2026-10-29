package pa.tramitesmigratorios.seguridad;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import pa.tramitesmigratorios.auditoria.Auditoria;
import pa.tramitesmigratorios.comun.ErrorRespuesta;
import pa.tramitesmigratorios.comun.ManejadorErrores;
import pa.tramitesmigratorios.seguridad.MatrizAutorizacion.Regla;

/**
 * Seguridad de la API (HU-12, HU-13): sesiones por token, sin estado en el servidor web, y
 * autorización por rol aplicada en el backend según {@link MatrizAutorizacion}.
 */
@Configuration
class ConfigSeguridad {

	@Bean
	PasswordEncoder codificador(@Value("${app.seguridad.bcrypt-coste}") int coste) {
		return new BCryptPasswordEncoder(coste);
	}

	@Bean
	SecurityFilterChain cadena(HttpSecurity http, AuthServicio auth, Auditoria auditoria) throws Exception {
		http.csrf(csrf -> csrf.disable())
			.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.formLogin(f -> f.disable())
			.httpBasic(b -> b.disable())
			.logout(l -> l.disable())
			.addFilterBefore(new FiltroToken(auth), UsernamePasswordAuthenticationFilter.class)
			.authorizeHttpRequests(reglas -> {
				reglas.requestMatchers(HttpMethod.GET, "/actuator/health").permitAll();
				reglas.requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/registro",
						"/api/auth/recuperacion", "/api/auth/recuperacion/confirmacion")
					.permitAll();
				for (Regla regla : MatrizAutorizacion.REGLAS) {
					reglas.requestMatchers(regla.metodo(), regla.ruta())
						.hasAnyRole(regla.roles().stream().map(Rol::name).toArray(String[]::new));
				}
				reglas.anyRequest().denyAll();
			})
			.exceptionHandling(e -> e
				.authenticationEntryPoint((request, response, ex) -> responder(response, HttpStatus.UNAUTHORIZED))
				.accessDeniedHandler((request, response, ex) -> {
					Authentication actual = SecurityContextHolder.getContext().getAuthentication();
					if (actual != null && actual.getPrincipal() instanceof UsuarioActual usuario) {
						// Todo permiso denegado deja evento de auditoría (HU-13 CA-6).
						auditoria.denegado(usuario.id(), "ACCESO_DENEGADO",
								request.getMethod() + " " + request.getRequestURI());
					}
					responder(response, HttpStatus.FORBIDDEN);
				}));
		return http.build();
	}

	private static void responder(HttpServletResponse response, HttpStatus estado) throws IOException {
		response.setStatus(estado.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding(StandardCharsets.UTF_8.name());
		response.getWriter()
			.write(ErrorRespuesta.de(ManejadorErrores.codigo(estado), ManejadorErrores.mensaje(estado)).json());
	}

	/** Lee el token del encabezado Authorization. No es un bean para que solo viva en la cadena de seguridad. */
	private static final class FiltroToken extends OncePerRequestFilter {

		private static final String PREFIJO = "Bearer ";

		private final AuthServicio auth;

		FiltroToken(AuthServicio auth) {
			this.auth = auth;
		}

		@Override
		protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
				throws ServletException, IOException {
			String encabezado = request.getHeader(HttpHeaders.AUTHORIZATION);
			if (encabezado != null && encabezado.startsWith(PREFIJO)) {
				auth.autenticar(encabezado.substring(PREFIJO.length()).trim())
					.ifPresent(usuario -> SecurityContextHolder.getContext()
						.setAuthentication(new UsernamePasswordAuthenticationToken(usuario, null,
								List.of(new SimpleGrantedAuthority("ROLE_" + usuario.rol().name())))));
			}
			chain.doFilter(request, response);
		}

	}

}
