/**
 * Fixture I-13 · Archivo y reactivación · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-13", "error", {
    meta: { pantalla: "I-13", titulo: "Archivo y reactivación", escenario: "error", esquema: "hu-08/v1", nota: "Conflicto: el expediente ya fue archivado por otro usuario." },
    data: null,
    error: { codigo: "SVC-0409", mensajeUsuario: "El expediente ya fue archivado por otro usuario. La vista conserva el estado original (CP-04)." },
  });
})(window);
