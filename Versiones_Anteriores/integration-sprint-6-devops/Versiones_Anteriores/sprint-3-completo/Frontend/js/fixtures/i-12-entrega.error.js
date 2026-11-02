/**
 * Fixture I-12 · Entrega en ventanilla · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-12", "error", {
    meta: { pantalla: "I-12", titulo: "Entrega en ventanilla", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al registrar la entrega." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos registrar la entrega. Intente nuevamente." },
  });
})(window);
