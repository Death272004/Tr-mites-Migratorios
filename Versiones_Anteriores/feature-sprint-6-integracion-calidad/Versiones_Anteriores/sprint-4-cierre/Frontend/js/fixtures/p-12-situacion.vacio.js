/**
 * Fixture P-12 · Situación laboral/económica · escenario vacío.
 * Sin bloques de situación configurados para el trámite.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-12", "vacio", {
    meta: {
      pantalla: "P-12",
      titulo: "Situación laboral, económica o de vínculos",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: {
      titulos: null,
      opciones: null,
    },
    error: null,
  });
})(window);
