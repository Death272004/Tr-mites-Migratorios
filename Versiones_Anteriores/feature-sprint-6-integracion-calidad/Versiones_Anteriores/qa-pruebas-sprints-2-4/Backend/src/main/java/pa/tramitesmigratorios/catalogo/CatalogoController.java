package pa.tramitesmigratorios.catalogo;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pa.tramitesmigratorios.catalogo.Catalogos.TramiteConRequisitos;
import pa.tramitesmigratorios.documento.ReglasArchivo;

/** Catálogos de solo lectura para armar el asistente de solicitud (P-07, P-14). */
@RestController
@RequestMapping("/api/catalogos")
class CatalogoController {

	record TipoDocumentalDto(String codigo, String nombre, boolean sensible, List<String> tiposMimePermitidos,
			long tamanoMaximoBytes) {
	}

	private final Catalogos catalogos;
	private final ReglasArchivo reglas;

	CatalogoController(Catalogos catalogos, ReglasArchivo reglas) {
		this.catalogos = catalogos;
		this.reglas = reglas;
	}

	@GetMapping("/tipos-tramite")
	List<TramiteConRequisitos> tiposTramite() {
		return catalogos.tramitesConRequisitos();
	}

	@GetMapping("/tipos-documentales")
	List<TipoDocumentalDto> tiposDocumentales() {
		return catalogos.tiposDocumentales()
			.stream()
			.map(t -> new TipoDocumentalDto(t.getCodigo(), t.getNombre(), t.isSensible(), reglas.tiposMimePermitidos(),
					reglas.tamanoMaximoBytes()))
			.toList();
	}

}
