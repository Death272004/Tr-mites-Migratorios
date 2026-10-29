/**
 * Fixture I-16 · Bitácora de auditoría · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-16", "error", {
    meta: { pantalla: "I-16", titulo: "Bitácora de auditoría", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al consultar la bitácora." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos consultar la bitácora. Intente nuevamente." },
  });
})(window);
