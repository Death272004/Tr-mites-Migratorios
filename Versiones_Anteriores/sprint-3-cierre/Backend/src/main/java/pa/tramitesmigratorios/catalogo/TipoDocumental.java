package pa.tramitesmigratorios.catalogo;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tipo_documental")
public class TipoDocumental {

	@Id
	private String codigo;

	private String nombre;

	/** Dato sensible (salud, antecedentes penales): exige consentimiento expreso (HU-18b). */
	private boolean sensible;

	protected TipoDocumental() {
	}

	public String getCodigo() {
		return codigo;
	}

	public String getNombre() {
		return nombre;
	}

	public boolean isSensible() {
		return sensible;
	}

}
