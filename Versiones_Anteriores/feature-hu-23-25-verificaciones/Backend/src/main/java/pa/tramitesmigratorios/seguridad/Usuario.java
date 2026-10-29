package pa.tramitesmigratorios.seguridad;

import java.time.Instant;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuario")
public class Usuario {

	public enum EstadoCuenta {

		ACTIVA, BLOQUEADA, DESHABILITADA

	}

	public enum TipoDocumento {

		PASAPORTE, CEDULA_E, CARNE

	}

	public enum Idioma {

		ES, EN

	}

	public enum MedioNotificacion {

		CORREO, SMS, PUSH

	}

	@Id
	private UUID id;

	private String nombre;

	private String correo;

	private String contrasenaHash;

	@Enumerated(EnumType.STRING)
	private Rol rol;

	@Enumerated(EnumType.STRING)
	private EstadoCuenta estadoCuenta;

	private int intentosFallidos;

	private Instant bloqueadoHasta;

	private Instant fechaCreacion;

	@Enumerated(EnumType.STRING)
	private TipoDocumento tipoDocumento;

	private String numeroDocumento;

	private String nacionalidad;

	private String paisResidencia;

	private String telefono;

	@Enumerated(EnumType.STRING)
	private Idioma idiomaNotificacion;

	@Enumerated(EnumType.STRING)
	private MedioNotificacion medioNotificacion;

	private Instant terminosAceptados;

	private String terminosIp;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "usuario_permiso", joinColumns = @JoinColumn(name = "usuario_id"))
	@Column(name = "permiso")
	@Enumerated(EnumType.STRING)
	private Set<Permiso> permisos = EnumSet.noneOf(Permiso.class);

	protected Usuario() {
	}

	public Usuario(String nombre, String correo, String contrasenaHash, Rol rol, Set<Permiso> permisos) {
		this.id = UUID.randomUUID();
		this.nombre = nombre;
		this.correo = normalizar(correo);
		this.contrasenaHash = contrasenaHash;
		this.rol = rol;
		this.estadoCuenta = EstadoCuenta.ACTIVA;
		this.fechaCreacion = Instant.now();
		this.idiomaNotificacion = Idioma.ES;
		this.medioNotificacion = MedioNotificacion.CORREO;
		// Solo el FUNCIONARIO recibe permisos a medida; los demás roles llevan los fijos de su rol.
		this.permisos.addAll(rol == Rol.FUNCIONARIO ? permisos : rol.permisosBase());
	}

	public static String normalizar(String correo) {
		return correo == null ? "" : correo.trim().toLowerCase(Locale.ROOT);
	}

	public boolean bloqueada(Instant ahora) {
		return bloqueadoHasta != null && bloqueadoHasta.isAfter(ahora);
	}

	/** Devuelve verdadero si este fallo dejó la cuenta bloqueada. */
	boolean registrarIntentoFallido(int maximo, Instant bloqueoHasta) {
		intentosFallidos++;
		if (intentosFallidos >= maximo) {
			intentosFallidos = 0;
			bloqueadoHasta = bloqueoHasta;
			return true;
		}
		return false;
	}

	void registrarAccesoCorrecto() {
		intentosFallidos = 0;
		bloqueadoHasta = null;
	}

	void cambiarContrasena(String nuevoHash) {
		this.contrasenaHash = nuevoHash;
	}

	public void deshabilitar() {
		this.estadoCuenta = EstadoCuenta.DESHABILITADA;
	}

	public static String normalizarDocumento(String numero) {
		return numero == null ? "" : numero.trim().toUpperCase(Locale.ROOT);
	}

	/** Datos que el cliente declara al registrarse en el portal (P-02), con la aceptación de términos. */
	void completarRegistro(TipoDocumento tipoDocumento, String numeroDocumento, String nacionalidad,
			String paisResidencia, String telefono, String ipAceptacion) {
		this.tipoDocumento = tipoDocumento;
		this.numeroDocumento = normalizarDocumento(numeroDocumento);
		this.nacionalidad = nacionalidad;
		this.paisResidencia = paisResidencia;
		this.telefono = telefono.trim();
		this.terminosAceptados = Instant.now();
		this.terminosIp = ipAceptacion;
	}

	/** Datos de contacto editables desde el perfil (P-05); lo que llega nulo se conserva. */
	void actualizarContacto(String telefono, Idioma idiomaNotificacion, MedioNotificacion medioNotificacion) {
		if (telefono != null) {
			this.telefono = telefono.trim();
		}
		if (idiomaNotificacion != null) {
			this.idiomaNotificacion = idiomaNotificacion;
		}
		if (medioNotificacion != null) {
			this.medioNotificacion = medioNotificacion;
		}
	}

	public UUID getId() {
		return id;
	}

	public String getNombre() {
		return nombre;
	}

	public String getCorreo() {
		return correo;
	}

	String getContrasenaHash() {
		return contrasenaHash;
	}

	public Rol getRol() {
		return rol;
	}

	public EstadoCuenta getEstadoCuenta() {
		return estadoCuenta;
	}

	public Set<Permiso> getPermisos() {
		return permisos;
	}

	public TipoDocumento getTipoDocumento() {
		return tipoDocumento;
	}

	public String getNumeroDocumento() {
		return numeroDocumento;
	}

	public String getNacionalidad() {
		return nacionalidad;
	}

	public String getPaisResidencia() {
		return paisResidencia;
	}

	public String getTelefono() {
		return telefono;
	}

	public Idioma getIdiomaNotificacion() {
		return idiomaNotificacion;
	}

	public MedioNotificacion getMedioNotificacion() {
		return medioNotificacion;
	}

}
