/**
 * Fixture I-09 · Edictos y publicaciones · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-09", "error", {
    meta: { pantalla: "I-09", titulo: "Edictos y publicaciones", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al cargar edictos." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos cargar los edictos del expediente. Intente nuevamente." },
  });
})(window);
