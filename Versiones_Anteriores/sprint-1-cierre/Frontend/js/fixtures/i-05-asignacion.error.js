/**
 * Fixture I-05 · Asignación de analista · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-05", "error", {
    meta: { pantalla: "I-05", titulo: "Asignación de analista", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al cargar analistas disponibles." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos cargar los analistas disponibles. Intente nuevamente." },
  });
})(window);
