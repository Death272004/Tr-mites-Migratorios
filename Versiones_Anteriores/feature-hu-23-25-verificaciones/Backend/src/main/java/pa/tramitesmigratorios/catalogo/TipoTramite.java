package pa.tramitesmigratorios.catalogo;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tipo_tramite")
public class TipoTramite {

	@Id
	private String codigo;

	private String nombre;

	private boolean activo;

	protected TipoTramite() {
	}

	public String getCodigo() {
		return codigo;
	}

	public String getNombre() {
		return nombre;
	}

	public boolean isActivo() {
		return activo;
	}

}
