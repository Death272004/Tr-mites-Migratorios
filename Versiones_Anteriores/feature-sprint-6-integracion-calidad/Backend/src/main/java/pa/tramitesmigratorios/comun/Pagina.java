package pa.tramitesmigratorios.comun;

import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/** Respuesta paginada del contrato: {@code contenido} y {@code paginacion}. */
public record Pagina<T>(List<T> contenido, Paginacion paginacion) {

	public static final int TAMANO_MAXIMO = 100;

	public record Paginacion(int pagina, int tamano, long totalElementos, int totalPaginas) {
	}

	public static <E, T> Pagina<T> de(Page<E> page, Function<E, T> aDto) {
		return new Pagina<>(page.getContent().stream().map(aDto).toList(),
				new Paginacion(page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages()));
	}

	public static Pageable solicitud(Integer pagina, Integer tamano, Sort orden) {
		int p = pagina != null ? pagina : 0;
		int t = tamano != null ? tamano : 20;
		if (p < 0) {
			throw ErrorApi.entradaInvalida("pagina", "Debe ser 0 o mayor.");
		}
		if (t < 1 || t > TAMANO_MAXIMO) {
			throw ErrorApi.entradaInvalida("tamano", "Debe estar entre 1 y " + TAMANO_MAXIMO + ".");
		}
		return PageRequest.of(p, t, orden);
	}

}
