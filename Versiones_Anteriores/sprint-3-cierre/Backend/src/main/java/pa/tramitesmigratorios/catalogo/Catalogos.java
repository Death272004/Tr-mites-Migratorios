package pa.tramitesmigratorios.catalogo;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lectura de los catálogos de tipos de trámite, tipos documentales y requisitos (TASK-15.2, TASK-17.1). */
@Service
@Transactional(readOnly = true)
public class Catalogos {

	public record Requisito(String tipoDocumental, String nombre, boolean obligatorio, boolean sensible) {
	}

	public record TramiteConRequisitos(String codigo, String nombre, List<Requisito> requisitos) {
	}

	private final TipoTramiteRepo tramites;
	private final TipoDocumentalRepo documentales;
	private final RequisitoTramiteRepo requisitos;

	Catalogos(TipoTramiteRepo tramites, TipoDocumentalRepo documentales, RequisitoTramiteRepo requisitos) {
		this.tramites = tramites;
		this.documentales = documentales;
		this.requisitos = requisitos;
	}

	public Optional<TipoTramite> tramiteActivo(String codigo) {
		return codigo == null ? Optional.empty() : tramites.findById(codigo).filter(TipoTramite::isActivo);
	}

	public Optional<TipoDocumental> tipoDocumental(String codigo) {
		return codigo == null ? Optional.empty() : documentales.findById(codigo);
	}

	public List<TipoDocumental> tiposDocumentales() {
		return documentales.findAll();
	}

	public List<Requisito> requisitosDe(String tipoTramite) {
		Map<String, TipoDocumental> porCodigo = documentales.findAll()
			.stream()
			.collect(Collectors.toMap(TipoDocumental::getCodigo, Function.identity()));
		return requisitos.findByTipoTramite(tipoTramite).stream().map(r -> {
			TipoDocumental tipo = porCodigo.get(r.getTipoDocumental());
			return new Requisito(tipo.getCodigo(), tipo.getNombre(), r.isObligatorio(), tipo.isSensible());
		}).toList();
	}

	public List<TramiteConRequisitos> tramitesConRequisitos() {
		return tramites.findByActivoTrueOrderByNombre()
			.stream()
			.map(t -> new TramiteConRequisitos(t.getCodigo(), t.getNombre(), requisitosDe(t.getCodigo())))
			.toList();
	}

}

// Spring Data no detecta repositorios anidados: van como tipos de paquete en este archivo.
interface TipoTramiteRepo extends JpaRepository<TipoTramite, String> {

	List<TipoTramite> findByActivoTrueOrderByNombre();

}

interface TipoDocumentalRepo extends JpaRepository<TipoDocumental, String> {
}

interface RequisitoTramiteRepo extends JpaRepository<RequisitoTramite, RequisitoTramite.Clave> {

	List<RequisitoTramite> findByTipoTramite(String tipoTramite);

}
