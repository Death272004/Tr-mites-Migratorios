/**
 * Fixture P-13 · Dependientes · escenario vacío.
 * El vacío natural es cero dependientes: el formulario sin tarjetas.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-13", "vacio", {
    meta: {
      pantalla: "P-13",
      titulo: "Dependientes",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: null,
  });
})(window);
