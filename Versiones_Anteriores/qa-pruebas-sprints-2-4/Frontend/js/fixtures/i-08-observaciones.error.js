/**
 * Fixture I-08 · Emisión y atención de observaciones · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-08", "error", {
    meta: { pantalla: "I-08", titulo: "Emisión y atención de observaciones", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al cargar observaciones del expediente." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos cargar las observaciones del expediente. Intente nuevamente." },
  });
})(window);
