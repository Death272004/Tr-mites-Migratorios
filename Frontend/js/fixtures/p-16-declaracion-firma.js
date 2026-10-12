/**
 * Fixture P-16 · Declaración y firma · escenario base (éxito).
 * Formulario fijo: el envelope no transporta datos (data: null).
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-16", "exito", {
    meta: {
      pantalla: "P-16",
      titulo: "Declaración y firma",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: null,
  });
})(window);
