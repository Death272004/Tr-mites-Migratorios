package pa.tramitesmigratorios.verificacion.adaptadores;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import jakarta.annotation.PreDestroy;

import org.springframework.stereotype.Component;

/**
 * Hilos de las consultas a fuentes: permiten cortar la espera al vencer el timeout (HU-23 CA-4).
 * No se expone como bean {@code Executor} para no desplazar al ejecutor por defecto de Spring Boot.
 */
@Component
public class EjecutorFuentes {

	private final ExecutorService hilos = nuevo();

	ExecutorService hilos() {
		return hilos;
	}

	@PreDestroy
	void cerrar() {
		hilos.shutdownNow();
	}

	/** También lo usan las pruebas de contrato, que construyen los adaptadores sin Spring. */
	public static ExecutorService nuevo() {
		AtomicInteger contador = new AtomicInteger();
		return Executors.newCachedThreadPool(tarea -> {
			Thread hilo = new Thread(tarea, "fuente-" + contador.incrementAndGet());
			hilo.setDaemon(true);
			return hilo;
		});
	}

}
