package pa.tramitesmigratorios.documento;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Almacén protegido de archivos: un directorio del servidor que ningún servicio web publica.
 * Los archivos se guardan con un nombre aleatorio, nunca con el nombre que envió el usuario,
 * y solo se entregan por el endpoint de descarga, que verifica el permiso (HU-17 CA-2).
 */
@Component
class AlmacenArchivos {

	private final Path directorio;

	AlmacenArchivos(@Value("${app.documentos.directorio}") String directorio) {
		this.directorio = Path.of(directorio).toAbsolutePath().normalize();
	}

	/** Guarda el contenido y devuelve la referencia interna. */
	String guardar(byte[] contenido) {
		String referencia = UUID.randomUUID().toString();
		try {
			Files.createDirectories(directorio);
			Files.write(directorio.resolve(referencia), contenido, StandardOpenOption.CREATE_NEW);
		}
		catch (IOException e) {
			throw new UncheckedIOException(e);
		}
		return referencia;
	}

	byte[] leer(String referencia) {
		Path archivo = directorio.resolve(referencia).normalize();
		if (!archivo.startsWith(directorio)) {
			throw new IllegalArgumentException("Referencia de archivo fuera del almacén");
		}
		try {
			return Files.readAllBytes(archivo);
		}
		catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}

	void eliminar(String referencia) {
		try {
			Files.deleteIfExists(directorio.resolve(referencia));
		}
		catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}

}
