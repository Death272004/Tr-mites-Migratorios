/**
 * Fixture P-14 · Requisitos y documentos · escenario base (éxito).
 * Los requisitos reales provienen de P-07 (CATALOGO / Art. 28); este fixture
 * solo aporta el respaldo cuando el catálogo no arroja requisitos.
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-14", "exito", {
    meta: {
      pantalla: "P-14",
      titulo: "Requisitos y documentos",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: {
      requisitosFallback: [
        "Documento de identidad",
        "Comprobante de domicilio",
        "Documento de respaldo del trámite",
      ],
    },
    error: null,
  });
})(window);
