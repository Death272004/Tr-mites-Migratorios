/**
 * Fixture P-07 · Nueva solicitud · escenario de carga.
 * La vista muestra el indicador de carga del catálogo.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-07", "carga", {
    meta: {
      pantalla: "P-07",
      titulo: "Nueva solicitud",
      escenario: "carga",
      esquema: "hu-08/v1",
      nota: "Carga simulada con 700 ms en el MVP.",
    },
    data: null,
    error: null,
  });
})(window);