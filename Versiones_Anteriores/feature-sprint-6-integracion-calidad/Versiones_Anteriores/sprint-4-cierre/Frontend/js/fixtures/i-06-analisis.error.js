/**
 * Fixture I-06 · Análisis del expediente · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-06", "error", {
    meta: { pantalla: "I-06", titulo: "Análisis del expediente", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al cargar el expediente y su checklist." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos cargar el expediente para análisis. Intente nuevamente." },
  });
})(window);
