/**
 * Fixture P-14 · Requisitos y documentos · escenario vacío.
 * Sin requisitos configurados para el trámite.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-14", "vacio", {
    meta: {
      pantalla: "P-14",
      titulo: "Requisitos y documentos",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: {
      requisitosFallback: [],
    },
    error: null,
  });
})(window);
