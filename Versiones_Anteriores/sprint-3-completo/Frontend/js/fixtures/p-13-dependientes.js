/**
 * Fixture P-13 · Dependientes · escenario base (éxito).
 * La fuente de datos es el borrador (`draft.dependientes`); el envelope no
 * transporta dependientes, solo el sobre común de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-13", "exito", {
    meta: {
      pantalla: "P-13",
      titulo: "Dependientes",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: null,
  });
})(window);
