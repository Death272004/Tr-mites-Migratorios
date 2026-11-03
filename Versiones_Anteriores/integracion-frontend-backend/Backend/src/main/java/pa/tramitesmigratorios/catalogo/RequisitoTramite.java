package pa.tramitesmigratorios.catalogo;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

/** Documento que un tipo de trámite exige o admite. */
@Entity
@IdClass(RequisitoTramite.Clave.class)
@Table(name = "requisito_tramite")
public class RequisitoTramite {

	public static class Clave implements Serializable {

		private String tipoTramite;

		private String tipoDocumental;

		public Clave() {
		}

		@Override
		public boolean equals(Object o) {
			return o instanceof Clave otra && Objects.equals(tipoTramite, otra.tipoTramite)
					&& Objects.equals(tipoDocumental, otra.tipoDocumental);
		}

		@Override
		public int hashCode() {
			return Objects.hash(tipoTramite, tipoDocumental);
		}

	}

	@Id
	private String tipoTramite;

	@Id
	private String tipoDocumental;

	private boolean obligatorio;

	protected RequisitoTramite() {
	}

	public String getTipoTramite() {
		return tipoTramite;
	}

	public String getTipoDocumental() {
		return tipoDocumental;
	}

	public boolean isObligatorio() {
		return obligatorio;
	}

}
