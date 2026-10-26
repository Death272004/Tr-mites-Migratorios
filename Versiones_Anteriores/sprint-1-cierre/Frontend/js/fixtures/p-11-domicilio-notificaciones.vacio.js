/**
 * Fixture P-11 · Domicilio y notificaciones · escenario vacío.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-11", "vacio", {
    meta: {
      pantalla: "P-11",
      titulo: "Domicilio y notificaciones",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Sin datos de notificación.",
    },
    data: { notificaciones: null },
    error: null,
  });
})(window);
