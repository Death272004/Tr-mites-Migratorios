package pa.tramitesmigratorios.verificacion;

import java.time.Instant;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Ejecuta los reintentos programados de las verificaciones simuladas (HU-24, TASK-24.3). Se
 * apaga con {@code app.verificaciones.reintentos-automaticos=false}; las pruebas lo apagan y
 * llaman a {@link Verificaciones#procesarReintentosVencidos} directamente.
 */
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "app.verificaciones.reintentos-automaticos", havingValue = "true")
class ReintentosProgramados {

	private final Verificaciones verificaciones;

	ReintentosProgramados(Verificaciones verificaciones) {
		this.verificaciones = verificaciones;
	}

	@Scheduled(fixedDelayString = "${app.verificaciones.intervalo-reintentos-ms}")
	void ejecutar() {
		verificaciones.procesarReintentosVencidos(Instant.now());
	}

}
