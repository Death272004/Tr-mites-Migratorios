/**
 * Fixture P-08 · Titularidad y representación · escenario base (éxito).
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-08", "exito", {
    meta: {
      pantalla: "P-08",
      titulo: "Titularidad y representación",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios de demostración. Sin datos reales (Ley 81).",
    },
    data: {
      verificaciones: {
        ruex: {
          value: "Vigente · Registro de Filiación N.º 8-712-3456",
          fuente: "RUEX · SNM",
          fecha: "2026-10-01",
        },
        abogadoIdoneidad: {
          value: "Verificada · Idoneidad vigente",
          fuente: "Colegio de Abogados",
          fecha: "2026-10-01",
        },
      },
    },
    error: null,
  });
})(window);
