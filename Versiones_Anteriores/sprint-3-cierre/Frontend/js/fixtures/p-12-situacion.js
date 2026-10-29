/**
 * Fixture P-12 · Situación laboral/económica · escenario base (éxito).
 * Títulos de bloque y opciones de los selects (verbatim de la vista).
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-12", "exito", {
    meta: {
      pantalla: "P-12",
      titulo: "Situación laboral, económica o de vínculos",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: {
      titulos: {
        laboral: "Bloque laboral / entidad contratante",
        economico: "Bloque económico / inversión",
        educativo: "Bloque educativo",
        especial: "Bloque de actividad especial",
        familia: "Bloque de vínculos familiares",
      },
      opciones: {
        tipoContrato: [
          { value: "INDEFINIDO", label: "Indefinido" },
          { value: "DEFINIDO", label: "Definido" },
          { value: "OBRA", label: "Por obra" },
        ],
        tipoInversion: [
          { value: "DPF", label: "Depósito a plazo fijo" },
          { value: "INMUEBLE", label: "Inmueble" },
          { value: "FORESTAL", label: "Inversión forestal" },
          { value: "MACRO", label: "Macro-empresa" },
          { value: "MIXTA", label: "Mixta" },
        ],
        nivel: [
          { value: "SUPERIOR", label: "Superior" },
          { value: "POSGRADO", label: "Posgrado" },
          { value: "TECNICO", label: "Técnico" },
          { value: "SECUNDARIA", label: "Secundaria" },
        ],
        parentesco: [
          { value: "CONYUGE", label: "Cónyuge" },
          { value: "HIJO", label: "Hijo(a)" },
          { value: "PADRE_MADRE", label: "Padre/Madre" },
          { value: "DEPENDIENTE", label: "Dependiente" },
        ],
      },
    },
    error: null,
  });
})(window);
