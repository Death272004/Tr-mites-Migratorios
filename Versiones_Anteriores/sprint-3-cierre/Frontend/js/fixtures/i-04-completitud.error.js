/**
 * Fixture I-04 · Recepción y verificación de completitud · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-04", "error", {
    meta: { pantalla: "I-04", titulo: "Recepción y verificación de completitud", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al cargar el expediente." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos cargar el expediente para completitud. Intente nuevamente." },
  });
})(window);
