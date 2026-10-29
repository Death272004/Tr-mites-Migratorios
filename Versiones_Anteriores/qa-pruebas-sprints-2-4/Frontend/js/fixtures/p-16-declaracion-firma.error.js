/**
 * Fixture P-16 · Declaración y firma · escenario de error.
 * Error de servicio, mensaje no técnico (sin datos personales, §2.2).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-16", "error", {
    meta: {
      pantalla: "P-16",
      titulo: "Declaración y firma",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar la declaración y firma. Intente nuevamente.",
    },
  });
})(window);
