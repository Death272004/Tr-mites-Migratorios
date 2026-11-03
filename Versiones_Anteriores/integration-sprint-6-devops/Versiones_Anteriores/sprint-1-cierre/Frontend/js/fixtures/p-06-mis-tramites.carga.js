/**
 * Fixture P-06 · Mis trámites · escenario de carga.
 * La vista muestra el indicador de carga (sin datos todavía).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-06", "carga", {
    meta: {
      pantalla: "P-06",
      titulo: "Mis trámites",
      escenario: "carga",
      esquema: "hu-08/v1",
      nota: "En el MVP la carga se simula con 700 ms; sin red aún no aplica timeouts.",
    },
    data: null,
    error: null,
  });
})(window);