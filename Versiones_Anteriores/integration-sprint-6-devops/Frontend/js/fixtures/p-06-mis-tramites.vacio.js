/**
 * Fixture P-06 · Mis trámites · escenario vacío.
 * El ciudadano no registra expedientes todavía.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-06", "vacio", {
    meta: {
      pantalla: "P-06",
      titulo: "Mis trámites",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Sin trámites: la vista ofrece crear la primera solicitud (P-07).",
    },
    data: { tramites: [] },
    error: null,
  });
})(window);