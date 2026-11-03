/**
 * Fixture I-17 · Reportes y tiempos por etapa · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-17", "error", {
    meta: { pantalla: "I-17", titulo: "Reportes y tiempos por etapa", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al generar el reporte." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos generar el reporte. Intente nuevamente." },
  });
})(window);
