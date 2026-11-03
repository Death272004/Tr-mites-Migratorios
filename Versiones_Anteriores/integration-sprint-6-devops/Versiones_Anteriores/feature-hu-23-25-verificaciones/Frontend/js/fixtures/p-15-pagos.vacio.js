/**
 * Fixture P-15 · Pagos y tasas · escenario vacío.
 * Sin tasas disponibles para el trámite.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-15", "vacio", {
    meta: {
      pantalla: "P-15",
      titulo: "Pagos y tasas",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: {
      tasas: null,
    },
    error: null,
  });
})(window);
