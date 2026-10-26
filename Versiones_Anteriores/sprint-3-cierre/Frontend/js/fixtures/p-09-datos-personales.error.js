/**
 * Fixture P-09 · Datos personales · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-09", "error", {
    meta: {
      pantalla: "P-09",
      titulo: "Datos personales",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Error al cargar datos personales.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar sus datos personales. Intente nuevamente.",
    },
  });
})(window);
