/**
 * Fixture P-12 · Situación laboral/económica · escenario de error.
 * Error de servicio, mensaje no técnico (sin datos personales, §2.2).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-12", "error", {
    meta: {
      pantalla: "P-12",
      titulo: "Situación laboral, económica o de vínculos",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar la configuración de situación de su trámite. Intente nuevamente.",
    },
  });
})(window);
