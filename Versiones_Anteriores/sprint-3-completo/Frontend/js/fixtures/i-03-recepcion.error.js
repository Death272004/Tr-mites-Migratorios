/**
 * Fixture I-03 · Bandeja de recepción · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-03", "error", {
    meta: { pantalla: "I-03", titulo: "Bandeja de recepción", escenario: "error", esquema: "hu-08/v1", nota: "Fallo del servicio de citas." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos cargar la cola de recepción. Intente nuevamente." },
  });
})(window);
