package pa.tramitesmigratorios.documento;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import pa.tramitesmigratorios.comun.ErrorApi;

/**
 * Reglas de los archivos que se pueden adjuntar (TASK-17.1): tipos permitidos, tamaño máximo
 * y comprobación de que el contenido corresponde al tipo declarado (CP-05).
 */
@Component
public class ReglasArchivo {

	/** Tipo MIME permitido y la firma con la que debe empezar el contenido. */
	private static final Map<String, byte[]> FIRMAS = Map.of(
			"application/pdf", new byte[] { '%', 'P', 'D', 'F', '-' },
			"image/jpeg", new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF },
			"image/png", new byte[] { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A });

	private final long tamanoMaximoBytes;

	ReglasArchivo(@Value("${app.documentos.tamano-maximo-bytes}") long tamanoMaximoBytes) {
		this.tamanoMaximoBytes = tamanoMaximoBytes;
	}

	public List<String> tiposMimePermitidos() {
		return FIRMAS.keySet().stream().sorted().toList();
	}

	public long tamanoMaximoBytes() {
		return tamanoMaximoBytes;
	}

	void validar(String tipoMime, byte[] contenido) {
		if (contenido.length == 0) {
			throw ErrorApi.entradaInvalida("archivo", "El archivo está vacío.");
		}
		if (contenido.length > tamanoMaximoBytes) {
			throw ErrorApi.entradaInvalida("archivo",
					"El archivo supera el tamaño máximo de " + tamanoMaximoBytes / (1024 * 1024) + " MB.");
		}
		byte[] firma = tipoMime == null ? null : FIRMAS.get(tipoMime);
		if (firma == null) {
			throw ErrorApi.entradaInvalida("archivo", "Tipo de archivo no permitido. Use PDF, JPG o PNG.");
		}
		if (!empiezaCon(contenido, firma)) {
			throw ErrorApi.entradaInvalida("archivo", "El contenido del archivo no corresponde a su tipo.");
		}
	}

	private static boolean empiezaCon(byte[] contenido, byte[] firma) {
		if (contenido.length < firma.length) {
			return false;
		}
		for (int i = 0; i < firma.length; i++) {
			if (contenido[i] != firma[i]) {
				return false;
			}
		}
		return true;
	}

}
