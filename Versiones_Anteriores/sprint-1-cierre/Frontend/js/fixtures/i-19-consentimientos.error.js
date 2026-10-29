/**
 * Fixture I-19 · Consentimientos del titular · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-19", "error", {
    meta: { pantalla: "I-19", titulo: "Consentimientos del titular", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al cargar los consentimientos." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos cargar los consentimientos del titular. Intente nuevamente." },
  });
})(window);
