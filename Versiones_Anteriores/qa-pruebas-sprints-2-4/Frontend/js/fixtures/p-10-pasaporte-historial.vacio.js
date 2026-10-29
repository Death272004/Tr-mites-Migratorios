/**
 * Fixture P-10 · Pasaporte e historial · escenario vacío.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-10", "vacio", {
    meta: {
      pantalla: "P-10",
      titulo: "Pasaporte e historial migratorio",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Sin historial migratorio.",
    },
    data: { historial: [] },
    error: null,
  });
})(window);
