/**
 * Fixture P-15 · Pagos y tasas · escenario de carga.
 * La vista muestra el indicador de carga (sin datos todavía).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-15", "carga", {
    meta: {
      pantalla: "P-15",
      titulo: "Pagos y tasas",
      escenario: "carga",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: null,
  });
})(window);
