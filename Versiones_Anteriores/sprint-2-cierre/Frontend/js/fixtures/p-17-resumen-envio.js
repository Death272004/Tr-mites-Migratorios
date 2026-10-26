/**
 * Fixture P-17 · Resumen y envío · escenario base (éxito).
 * El resumen se deriva del borrador: el envelope no transporta datos (data: null).
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-17", "exito", {
    meta: {
      pantalla: "P-17",
      titulo: "Resumen y envío",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: null,
  });
})(window);
