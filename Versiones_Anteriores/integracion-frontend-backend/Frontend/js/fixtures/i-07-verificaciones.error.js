/**
 * Fixture I-07 · Panel de verificación interoperable · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-07", "error", {
    meta: { pantalla: "I-07", titulo: "Panel de verificación interoperable", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al cargar las verificaciones del expediente." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos cargar las verificaciones del expediente. Intente nuevamente." },
  });
})(window);
