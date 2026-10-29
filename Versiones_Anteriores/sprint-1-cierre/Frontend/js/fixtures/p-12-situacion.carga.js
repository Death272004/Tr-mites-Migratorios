/**
 * Fixture P-12 · Situación laboral/económica · escenario de carga.
 * La vista muestra el indicador de carga (sin datos todavía).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-12", "carga", {
    meta: {
      pantalla: "P-12",
      titulo: "Situación laboral, económica o de vínculos",
      escenario: "carga",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: null,
  });
})(window);
