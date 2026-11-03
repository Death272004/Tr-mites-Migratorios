/**
 * Fixture P-16 · Declaración y firma · escenario vacío.
 * El formulario es fijo: el vacío renderiza el formulario normal (sin datos).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-16", "vacio", {
    meta: {
      pantalla: "P-16",
      titulo: "Declaración y firma",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: null,
  });
})(window);
