/**
 * Fixture I-02 · Tablero de gestión · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-02", "error", {
    meta: { pantalla: "I-02", titulo: "Tablero de gestión", escenario: "error", esquema: "hu-08/v1", nota: "Fallo del servicio de indicadores." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos cargar los indicadores del tablero. Intente nuevamente." },
  });
})(window);
