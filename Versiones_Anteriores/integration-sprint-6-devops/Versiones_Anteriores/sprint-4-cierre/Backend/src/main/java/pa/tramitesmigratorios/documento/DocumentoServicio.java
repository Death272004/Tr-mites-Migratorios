package pa.tramitesmigratorios.documento;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import pa.tramitesmigratorios.auditoria.Auditoria;
import pa.tramitesmigratorios.catalogo.Catalogos;
import pa.tramitesmigratorios.catalogo.TipoDocumental;
import pa.tramitesmigratorios.comun.ErrorApi;
import pa.tramitesmigratorios.documento.Documento.EstadoRevision;
import pa.tramitesmigratorios.expediente.AccesoExpedientes;
import pa.tramitesmigratorios.expediente.Expediente;
import pa.tramitesmigratorios.privacidad.ConsentimientoServicio;
import pa.tramitesmigratorios.seguridad.Permiso;
import pa.tramitesmigratorios.seguridad.UsuarioActual;

/** Gestión documental protegida (HU-17): carga validada, listado de metadatos y descarga con permiso. */
@Service
public class DocumentoServicio {

	public record Cargado(Documento documento, boolean duplicado) {
	}

	public record Contenido(Documento documento, byte[] bytes) {
	}

	private final DocumentoRepo documentos;
	private final AccesoExpedientes acceso;
	private final Catalogos catalogos;
	private final ReglasArchivo reglas;
	private final AlmacenArchivos almacen;
	private final ConsentimientoServicio consentimientos;
	private final Auditoria auditoria;

	DocumentoServicio(DocumentoRepo documentos, AccesoExpedientes acceso, Catalogos catalogos, ReglasArchivo reglas,
			AlmacenArchivos almacen, ConsentimientoServicio consentimientos, Auditoria auditoria) {
		this.documentos = documentos;
		this.acceso = acceso;
		this.catalogos = catalogos;
		this.reglas = reglas;
		this.almacen = almacen;
		this.consentimientos = consentimientos;
		this.auditoria = auditoria;
	}

	@Transactional
	public Cargado adjuntar(UUID expedienteId, String tipoDocumental, MultipartFile archivo, UsuarioActual usuario) {
		Expediente expediente = acceso.paraOperar(expedienteId, usuario, Permiso.CONSULTAR);
		if (expediente.getEstado().esTerminal()) {
			throw ErrorApi.conflicto("EXPEDIENTE_CERRADO", "El expediente ya no admite documentos.");
		}
		TipoDocumental tipo = catalogos.tipoDocumental(tipoDocumental)
			.filter(t -> catalogos.requisitosDe(expediente.getTipoTramite())
				.stream()
				.anyMatch(r -> r.tipoDocumental().equals(t.getCodigo())))
			.orElseThrow(() -> ErrorApi.entradaInvalida("tipoDocumental",
					"El tipo documental no corresponde a este trámite."));
		byte[] contenido = bytes(archivo);
		reglas.validar(archivo.getContentType(), contenido);
		if (tipo.isSensible()) {
			try {
				consentimientos.exigirExpresoVigente(expediente.getSolicitanteId());
			}
			catch (ErrorApi e) {
				auditoria.denegado(usuario.id(), "CARGAR_DOCUMENTO", "expediente/" + expedienteId,
						"Dato sensible sin consentimiento expreso vigente");
				throw e;
			}
		}
		boolean duplicado = documentos.existsByExpedienteIdAndTipoDocumentalAndEstadoRevisionNot(expedienteId,
				tipo.getCodigo(), EstadoRevision.RECHAZADO);
		String referencia = almacen.guardar(contenido);
		try {
			Documento documento = documentos.saveAndFlush(new Documento(expedienteId, tipo.getCodigo(),
					nombreSeguro(archivo.getOriginalFilename()), archivo.getContentType(), contenido.length,
					sha256(contenido), referencia, usuario.id()));
			auditoria.exito(usuario.id(), "CARGAR_DOCUMENTO", "documento/" + documento.getId(), "tipo=" + tipo.getCodigo());
			return new Cargado(documento, duplicado);
		}
		catch (RuntimeException e) {
			almacen.eliminar(referencia);
			throw e;
		}
	}

	@Transactional(readOnly = true)
	public List<Documento> listar(UUID expedienteId, UsuarioActual usuario) {
		acceso.paraLeer(expedienteId, usuario);
		return documentos.findByExpedienteIdOrderByFechaCarga(expedienteId);
	}

	@Transactional(readOnly = true)
	public Contenido descargar(UUID expedienteId, UUID documentoId, UsuarioActual usuario) {
		acceso.paraLeer(expedienteId, usuario);
		Documento documento = documentos.findByIdAndExpedienteId(documentoId, expedienteId)
			.orElseThrow(ErrorApi::noEncontrado);
		byte[] bytes = almacen.leer(documento.getRutaAlmacen());
		auditoria.exito(usuario.id(), "DESCARGAR_DOCUMENTO", "documento/" + documentoId);
		return new Contenido(documento, bytes);
	}

	private static byte[] bytes(MultipartFile archivo) {
		try {
			return archivo.getBytes();
		}
		catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}

	/** Solo el nombre, sin rutas ni caracteres de control; se usa como etiqueta, nunca como ruta. */
	static String nombreSeguro(String original) {
		String nombre = original == null ? "" : original.replace('\\', '/');
		nombre = nombre.substring(nombre.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}\"<>:|?*]", "_").trim();
		if (nombre.isEmpty()) {
			nombre = "documento";
		}
		return nombre.length() > 255 ? nombre.substring(nombre.length() - 255) : nombre;
	}

	private static String sha256(byte[] contenido) {
		try {
			return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(contenido));
		}
		catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException(e);
		}
	}

}
