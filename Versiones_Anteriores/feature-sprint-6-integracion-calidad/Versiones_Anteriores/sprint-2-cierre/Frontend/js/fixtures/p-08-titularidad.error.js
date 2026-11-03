/**
 * Fixture P-08 · Titularidad y representación · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-08", "error", {
    meta: {
      pantalla: "P-08",
      titulo: "Titularidad y representación",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Error al cargar verificaciones.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar las verificaciones del trámite. Intente nuevamente.",
    },
  });
})(window);
