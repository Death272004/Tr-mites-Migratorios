/**
 * Fixture P-17 · Resumen y envío · escenario de error.
 * Error de servicio, mensaje no técnico (sin datos personales, §2.2).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-17", "error", {
    meta: {
      pantalla: "P-17",
      titulo: "Resumen y envío",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar el resumen de su solicitud. Intente nuevamente.",
    },
  });
})(window);
