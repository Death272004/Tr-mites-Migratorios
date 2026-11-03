/**
 * Fixture P-13 · Dependientes · escenario de error.
 * Error de servicio, mensaje no técnico (sin datos personales, §2.2).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-13", "error", {
    meta: {
      pantalla: "P-13",
      titulo: "Dependientes",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar la lista de dependientes. Intente nuevamente.",
    },
  });
})(window);
