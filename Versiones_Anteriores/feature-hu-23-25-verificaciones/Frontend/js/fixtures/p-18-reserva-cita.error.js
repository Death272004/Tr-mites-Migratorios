/**
 * Fixture P-18 · Reserva de cita · escenario de error.
 * Error de servicio, mensaje no técnico (sin datos personales, §2.2).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-18", "error", {
    meta: {
      pantalla: "P-18",
      titulo: "Reserva de cita",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar la agenda de citas. Intente nuevamente.",
    },
  });
})(window);
