/**
 * Fixture P-15 · Pagos y tasas · escenario de error.
 * Error de servicio, mensaje no técnico (sin datos personales, §2.2).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-15", "error", {
    meta: {
      pantalla: "P-15",
      titulo: "Pagos y tasas",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar las tasas y medios de pago. Intente nuevamente.",
    },
  });
})(window);
